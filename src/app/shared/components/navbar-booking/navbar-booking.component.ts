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
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { BillingPanelComponent, BillingItem } from '../billing-panel/billing-panel.component';
import { MessagePanelComponent, Message } from '../message-panel/message-panel.component';
import { LanguageService } from '../../../core/services/language.service';
import { Lang } from '../../../core/i18n/translations';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { LoginService } from '../../../features/booking/components/services/login.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../../features/TripDetails/services/chat.service';

@Component({
  selector: 'app-navbar-booking',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, RouterLink, BillingPanelComponent, MessagePanelComponent, TranslatePipe, ClickOutsideDirective],
  templateUrl: './navbar-booking.component.html',
  host: { class: 'relative z-20 block' },
})
export class NavbarBookingComponent implements OnInit {
  private readonly langService = inject(LanguageService);
  private readonly loginService = inject(LoginService);
  private readonly coreAuth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly chatService = inject(ChatService);
  private readonly destroyRef = inject(DestroyRef);

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

  /** Notification counts */
  readonly callCount = signal(3);
  readonly bellCount = signal(3);

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

  /** Emitted when Trips History is clicked */
  readonly tripsHistoryClick = output<void>();

  /** Emitted when profile is clicked */
  readonly profileClick = output<void>();

  ngOnInit(): void {
    if (this.dataLoaded) return;
    this.dataLoaded = true;
    this.loadMessages();
  }

  private loadMessages(): void {
    this.messagesLoading.set(true);
    this.chatService
      .getSideBarMessages(1, 50)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.messagesLoading.set(false);
          if (result.isSuccess && result.data?.messages?.items) {
            this.messages.set(result.data.messages.items);
            this.callCount.set(result.data.messages.items.filter(m => !m.read).length);
          }
        },
        error: () => {
          this.messagesLoading.set(false);
        },
      });
       this.chatService
      .getSideBarMessagesCount()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.messagesLoading.set(false);
          if (result.isSuccess && result.data !== undefined) {
            this.callCount.set(result.data??0);
          }
        },
        error: () => {
          this.messagesLoading.set(false);
        },
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

  /** Handle message panel toggle */
  protected onMessageClick(): void {
    this.messagePanelOpen.set(!this.messagePanelOpen());
    this.billingPanelOpen.set(false); // Close billing panel when opening message panel
  }

  /** Handle billing panel toggle */
  protected onBillingClick(): void {
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
  protected onMessageItemClick(message: any): void {
    // Mark as read
    const updatedMessages = this.messages().map(msg =>
      msg.id === message.id ? { ...msg, read: true } : msg
    );
    this.messages.set(updatedMessages);
    this.callCount.set(Math.max(0, this.callCount() - 1));
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
}
