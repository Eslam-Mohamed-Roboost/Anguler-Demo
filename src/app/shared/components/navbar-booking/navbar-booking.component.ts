import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { BillingPanelComponent, BillingItem } from '../billing-panel/billing-panel.component';
import { MessagePanelComponent, Message } from '../message-panel/message-panel.component';
import { LanguageService } from '../../../core/services/language.service';
import { Lang } from '../../../core/i18n/translations';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { LoginService } from '../../../features/booking/components/services/login.service';
import { AuthProfile, AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../../features/TripDetails/services/chat.service';
import { BaseComponent } from '../../base/base.component';
import { NotificationsService } from '../../../core/services/notifications.service';
import { ApiService } from '../../../core/services/api.service';
import { NotificationSoundService } from '../../../core/services/notification-sound.service';
import { ThemeService } from '../../../core/services/theme.service';

const NAVBAR_REFRESH_MS = 5_000;

@Component({
  selector: 'app-navbar-booking',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, RouterLink, BillingPanelComponent, MessagePanelComponent, TranslatePipe, ClickOutsideDirective],
  templateUrl: './navbar-booking.component.html',
  host: { class: 'relative z-20 block' },
})
export class NavbarBookingComponent extends BaseComponent implements OnInit {
  private readonly langService = inject(LanguageService);
  private readonly loginService = inject(LoginService);
  private readonly coreAuth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly chatService = inject(ChatService);
  private readonly notifiactionService = inject(NotificationsService);
  private readonly api = inject(ApiService);
  private readonly notificationSound = inject(NotificationSoundService);
  protected readonly themeService = inject(ThemeService);
  /** Logo image source */
  readonly logoSrc = input('assets/booking/logo-lines.png');

  /** Logo alt text */
  readonly logoAlt = input('Lines');

  /** Sign in button text */
  readonly signInText = input('Sign In');

  /** Join us button text */
  readonly joinUsText = input('Join Us Now');

  /** Whether to show the join us button with lightning icon */
  readonly showJoinUsIcon = input(true);

  /** Current language (delegates to LanguageService) */
  readonly lang = this.langService.lang;

  /** Emitted when language changes */
  readonly langChange = output<'en' | 'ar'|'de'>();

  /** Emitted when Sign In is clicked */
  readonly signInClick = output<void>();

  /** Emitted when Join Us is clicked */
  readonly joinUsClick = output<void>();

  /** Whether the user is authenticated */
  readonly isAuthenticated = input(true);

  /** Hotel name to display in profile pill */
  readonly hotelName = input('Salam Hotel');

  /** User name for admin display */
  readonly userName = input('');

  /** User role for admin display */
  readonly userRole = input('');

  readonly currentUserRole = computed(() => {
    const inputRole = this.userRole().trim();
    const authRole = this.coreAuth.userRoles()[0] ?? '';
    const loginRole = this.loginService.isLoggedIn() ? this.loginService.getRole() ?? '' : '';
    const role = inputRole || authRole || loginRole;

    return this.formatRole(role);
  });

  readonly currentUserName = computed(() => {
    const name = this.userName().trim() || this.coreAuth.userName().trim();

    return name || (this.isAdmin() ? '' : this.hotelName().trim()) || 'Account';
  });

  /** Notification counts */
  readonly callCount = signal(3);
  readonly bellCount = signal(3);

  /** Check if user is admin */
  readonly isAdmin = computed(() => {
    const role = this.currentUserRole().toLowerCase();

    return role === 'admin' || role === 'super admin';
  });

  readonly logoLink = computed(() => (this.isAdmin() ? '/hotel-details' : '/home'));

  readonly userImageUrl = computed(() => this.getProfileImageUrl(this.coreAuth.profile()));
  readonly profileImageSrc = computed(() => this.userImageUrl() || this.logoSrc());

  /** Panel states */
  protected readonly messagePanelOpen = signal(false);
  protected readonly billingPanelOpen = signal(false);
  protected readonly profileDropdownOpen = signal(false);
  protected readonly langDropdownOpen = signal(false);

  protected readonly langOptions: { lang: Lang; label: string; flag: string }[] = [
    { lang: 'en', label: 'English',  flag: 'assets/booking/flag-en.svg' },
    { lang: 'ar', label: 'العربية',  flag: 'assets/booking/flag-ar.svg' },
    { lang: 'de', label: 'Deutsch',  flag: 'assets/booking/flag-de.svg' },
  ];

  selectLang(lang: Lang): void {
    this.langService.setLang(lang);
    this.langDropdownOpen.set(false);
    this.langChange.emit(lang);
  }

  protected toggleLangDropdown(): void {
    this.langDropdownOpen.update(v => !v);
  }

  protected closeLangDropdown(): void {
    this.langDropdownOpen.set(false);
  }

  /** Sample billing data */
 
  /** Default static messages for fallback/loading */
  protected readonly defaultMessages: Message[] = [
    {
      id: '1',
      tripID: 'TRIP-001',
      sender: 'Front Desk',
      content: 'Your room is ready for check-in',
      time: '2 hours ago',
      read: false
    },
    {
      id: '2',
      tripID: 'TRIP-002',
      sender: 'Concierge',
      content: 'Your airport transfer has been confirmed',
      time: '5 hours ago',
      read: false
    },
    {
      id: '3',
      tripID: 'TRIP-003',
      sender: 'Housekeeping',
      content: 'Room cleaning completed',
      time: '1 day ago',
      read: true
    }
  ];

  /** Sample message data */
  protected readonly messages = signal<Message[]>(this.defaultMessages);
  protected readonly messagesLoading = signal(false);
  private dataLoaded = false;
  private profileLoadRequested = false;
  private pollingStarted = false;
  private previousMessageCount: number | null = null;
  private previousBellCount: number | null = null;

  /** Emitted when Trips History is clicked */
  readonly tripsHistoryClick = output<void>();

  /** Emitted when profile is clicked */
  readonly profileClick = output<void>();

  constructor() {
    super();

    effect(() => {
      const authenticated = this.isAuthenticated() || this.coreAuth.isAuthenticated();

      if (!authenticated) {
        this.profileLoadRequested = false;
        this.dataLoaded = false;
        return;
      }

      if (!this.dataLoaded) {
        this.dataLoaded = true;
        this.loadMessages();
        this.notificationCount();
        this.startPolling();
      }

      if (!this.profileLoadRequested) {
        this.profileLoadRequested = true;
        this.loadHotelProfileForNavbar();
      }
    });
  }
 
  ngOnInit(): void {
    if (!this.isAuthenticated() && !this.coreAuth.isAuthenticated()) return;

    if (!this.dataLoaded) {
      this.dataLoaded = true;
      this.loadMessages();
      this.notificationCount();
      this.startPolling();
    }

    if (!this.profileLoadRequested) {
      this.profileLoadRequested = true;
      this.loadHotelProfileForNavbar();
    }
  }
  protected notificationCount(skipGlobalLoading = false): void {
      this.notifiactionService.UnreadNotificationsCount(skipGlobalLoading)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next:(result)=>{
          if(result.isSuccess){
              this.setBellCount(result.data?.count ?? 0, skipGlobalLoading);
          }else{
              this.bellCount.set(0);
          }
        }
      })
  }
  private loadMessages(showLoading = true, skipGlobalLoading = false): void {
    if (showLoading) this.messagesLoading.set(true);
    this.chatService
      .getSideBarMessages(1, 50, skipGlobalLoading)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (showLoading) this.messagesLoading.set(false);
          if (result.isSuccess && result.data?.messages?.items) {
            this.messages.set(result.data.messages.items);
            this.setMessageCount(result.data.unReadCount, !showLoading);
          }
        },
        error: () => {
          if (showLoading) this.messagesLoading.set(false);
        },
      });

       this.chatService
      .getSideBarMessagesCount(skipGlobalLoading)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (showLoading) this.messagesLoading.set(false);
          if (result.isSuccess && result.data !== undefined) {
            this.setMessageCount(result.data ?? 0, !showLoading);
          }
        },
        error: () => {
          if (showLoading) this.messagesLoading.set(false);
        },
      });
  }

  private startPolling(): void {
    if (this.pollingStarted) return;

    this.pollingStarted = true;
    timer(NAVBAR_REFRESH_MS, NAVBAR_REFRESH_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.isAuthenticated() && !this.coreAuth.isAuthenticated()) return;

        this.loadMessages(false, true);
        this.notificationCount(true);
      });
  }

  protected readonly flagSrc = computed(() => {
    const l = this.lang();
    if (l === 'ar') return 'assets/booking/flag-ar.svg';
    if (l === 'de') return 'assets/booking/flag-de.svg';
    return 'assets/booking/flag-en.svg';
  });

  protected readonly langLabel = computed(() => {
    const l = this.lang();
    if (l === 'ar') return 'العربية';
    if (l === 'de') return 'Deutsch';
    return 'English';
  });

  protected readonly themeLabelKey = computed(() => {
    const theme = this.themeService.theme();
    if (theme === 'light') return 'nav.themeLight';
    if (theme === 'dark') return 'nav.themeDark';
    return 'nav.themeSystem';
  });

  protected readonly themeSwitchClass = computed(() =>
    this.themeService.isDark()
      ? 'border-[#5B738B] bg-[#0C0F13] text-white hover:bg-[#161B21]'
      : 'border-primary bg-panel text-primary hover:bg-success-light',
  );

  /** Handle message panel toggle */
  protected onMessageClick(): void {
    this.notificationSound.unlock();
    const shouldOpen = !this.messagePanelOpen();
    this.messagePanelOpen.set(shouldOpen);
    this.billingPanelOpen.set(false); // Close billing panel when opening message panel

    if (shouldOpen) {
      this.loadMessages(true, true);
    }
  }

  /** Handle billing panel toggle */
  protected onBillingClick(): void {
    this.notificationSound.unlock();
    this.billingPanelOpen.set(!this.billingPanelOpen());
    this.messagePanelOpen.set(false); // Close message panel when opening billing panel
  }

  /** Close all panels */
  protected closeAllPanels(): void {
    this.messagePanelOpen.set(false);
    this.billingPanelOpen.set(false);
  }

  protected toggleProfileDropdown(): void {
    this.profileDropdownOpen.update(v => !v);
  }

  protected closeProfileDropdown(): void {
    this.profileDropdownOpen.set(false);
  }

  protected logout(): void {
    this.loginService.clearSession();
    this.coreAuth.logout();
    this.closeProfileDropdown();
    this.router.navigate(['/home']);
  }

  /** Handle message click */
  protected onMessageItemClick(message: Message): void {
    const updatedMessages = this.messages().map(msg =>
      msg.id === message.id ? { ...msg, read: true } : msg
    );
    this.messages.set(updatedMessages);
    this.setMessageCount(Math.max(0, this.callCount() - 1), false);

    const route = this.messageTripDetailsRoute(message);
    if (!route) return;

    this.closeAllPanels();
    void this.router.navigate(route);
  }

  private messageTripDetailsRoute(message: Message): string[] | null {
    const tripRequestId = this.cleanId(message.tripRequestId);
    if (!tripRequestId) return null;

    if (this.coreAuth.hasRole('hotel')) {
      return ['/hotel-details', 'trip', tripRequestId];
    }

    if (this.coreAuth.hasRole('admin') || this.coreAuth.hasRole('super admin')) {
      return ['/hotel-details', 'trip', tripRequestId];
    }

    return ['/TripDetails', tripRequestId];
  }

  private cleanId(value: string | null | undefined): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  /** Handle billing panel close */
  protected onCloseBillingPanel(): void {
    this.billingPanelOpen.set(false);
  }

  /** Handle pay bill */
  // protected onPayBill(item: BillingItem): void {
  //   console.log('Paying bill:', item);
  //   // Update item status to paid
  //   const updatedItems = this.billingItems().map(billingItem => 
  //     billingItem.id === item.id 
  //       ? { ...billingItem, status: 'paid' as const }
  //       : billingItem
  //   );
  //   this.billingItems.set(updatedItems);
  //   this.bellCount.set(Math.max(0, this.bellCount() - 1));
  // }

  /** Handle view bill */
  protected onViewBill(_item: BillingItem): void {}

  private formatRole(role: string): string {
    const normalizedRole = role.trim().toLowerCase().replace(/[-_]+/g, ' ');

    if (normalizedRole === 'super admin') return 'Super Admin';
    if (normalizedRole === 'admin') return 'Admin';
    if (normalizedRole === 'passenger') return 'Passenger';
    if (normalizedRole === 'hotel') return 'Hotel';

    return role.trim();
  }

  private getProfileImageUrl(profile: AuthProfile | null): string {
    if (!profile) return '';

    return profile.configuration?.logoUrl?.trim() || '';
  }

  private loadHotelProfileForNavbar(): void {
    this.api.get<AuthProfile>('/users/profile')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.isSuccess && result.data) {
            this.coreAuth.setProfile({ ...this.coreAuth.profile(), ...result.data });
          }
        },
      });
  }

  private setMessageCount(count: number, playSound = true): void {
    const unreadCount = Math.max(0, count);
    const previousCount = this.previousMessageCount;
    this.callCount.set(unreadCount);

    if (playSound && previousCount !== null && unreadCount > previousCount) {
      this.notificationSound.play('message');
    }

    this.previousMessageCount = unreadCount;
  }

  private setBellCount(count: number, playSound = true): void {
    const unreadCount = Math.max(0, count);
    const previousCount = this.previousBellCount;
    this.bellCount.set(unreadCount);

    if (playSound && previousCount !== null && unreadCount > previousCount) {
      this.notificationSound.play('notification');
    }

    this.previousBellCount = unreadCount;
  }
}
