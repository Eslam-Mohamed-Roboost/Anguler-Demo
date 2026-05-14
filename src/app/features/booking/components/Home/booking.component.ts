import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { form } from '@angular/forms/signals';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { CheckboxComponent } from '../../../../shared/components/checkbox/checkbox.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { CarSelectorComponent } from '../../../../shared/components/car-selector/car-selector.component';
import { MapComponent } from '../../../../shared/components/map/map.component';
import { WeatherWidgetComponent } from '../../../../shared/components/weather-widget/weather-widget.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { JoinUsService } from '../services/join-us.service';
import { BookingFormModel } from '../../models/BookingForm-model';
import { JoinUsFormModel } from '../../models/JoinUsForm-model';
import { WithdrawalFormModel } from '../../models/WithdrawalForm-model';
import { ServicePreferencesModel } from '../../models/ServicePreferences-model';
import { BaseComponent } from '../../../../shared/base/base.component';
import { PasswordInputComponent } from '../../../../shared/components/password-input/password-input.component';
import { AuthService } from '../services/auth.service';
import { AuthService as CoreAuthService } from '../../../../core/services/auth.service';
import { CitiesService } from '../services/cities.service';
import { LoginService } from '../services/login.service';
import { OtpService } from '../services/otp.service';
import { VehicleTypeService } from '../services/vehicle-type.service';
import { TripRequestService } from '../services/trip-request.service';
import { LocationItem, PlaceTypeService, type PlaceType } from '../services/place-type.service';
import { Bank, BankService } from '../services/bank.service';
import { HotelDetailsService } from '../../../hotel-details/services/hotel-details.service';
import { CarOption } from '../../../../shared/components/car-selector/car-selector.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { DriverNoteComponent } from '../driver-note/driver-note.component';
import { NotificationStore } from '../../../../core/stores/notification.store';
import { AppConfigService } from '../../../../core/services/app-config.service';

@Component({
  selector: 'app-booking',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IconComponent,
    CheckboxComponent,
    InputComponent,
    SelectComponent,
    CardComponent,
    CarSelectorComponent,
    MapComponent,
    WeatherWidgetComponent,
    ModalComponent,
    PasswordInputComponent,
    DriverNoteComponent,
    TranslatePipe,
],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css',
})
export class BookingComponent extends BaseComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly joinUsService = inject(JoinUsService);
  private readonly authService = inject(AuthService);
  private readonly coreAuth = inject(CoreAuthService);
  private readonly citiesService = inject(CitiesService);
  private readonly loginService = inject(LoginService);
  private readonly otpService = inject(OtpService);
  private readonly vehicleTypeService = inject(VehicleTypeService);
  private readonly tripRequestService = inject(TripRequestService);
  private readonly placeTypeService = inject(PlaceTypeService);
  private readonly bankService = inject(BankService);
  private readonly hotelDetailsService = inject(HotelDetailsService);
  private readonly notifications = inject(NotificationStore);
  private readonly appConfig = inject(AppConfigService);

  // Signals
  readonly carTypes = signal<CarOption[]>([]);
  readonly carTypesLoading = signal(false);
  readonly placeTypes = signal<PlaceType[]>([]);
  readonly placeTypesLoading = signal(false);
  readonly banks = signal<Bank[]>([]);
  readonly banksLoading = signal(false);
  readonly distnationName = signal<string>('');
  readonly driverNoteChecked = signal(false);
  readonly driverNoteText = signal('');
  readonly servicePreferencesLoading = signal(false);
  readonly allServicePreferences = signal<Array<{ serviceId: string; serviceName: string; serviceCode: string }>>([]);
  private vehicleTypesLoaded = false;
  private placeTypesLoaded = false;
  private servicePreferencesLoaded = false;

  constructor() {
    super();
    this.joinUsService.openRequested$
      .pipe(this.takeUntilDestroyed())
      .subscribe(() => this.openJoinModal());

    this.joinUsService.signInRequested$
      .pipe(this.takeUntilDestroyed())
      .subscribe(() => this.signInModalOpen());

    if (isPlatformBrowser(this.platformId) && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          this.mapCenter.set([latitude, longitude]);
          this.weatherLat.set(latitude);
          this.weatherLng.set(longitude);
        },
        () => {
          // Fallback: keep default coordinates
        },
      );
    }

    // Auto-open sign-in modal when redirected here by authGuard (?signin=1)
    this.route.queryParams.pipe(this.takeUntilDestroyed()).subscribe(params => {
      if (params['signin'] === '1') {
        this.signInModalOpen();
        this.router.navigate([], { queryParams: {}, replaceUrl: true });
        return;
      }

      const rescheduleTripRequestId = params['rescheduleTripRequestId'];
      if (rescheduleTripRequestId) {
        const scheduledAt = typeof params['scheduledAt'] === 'string' ? params['scheduledAt'] : null;
        this.openReschedulePickupTime(rescheduleTripRequestId, scheduledAt);
        this.router.navigate([], { queryParams: {}, replaceUrl: true });
      }
    });

    // Load cities on initialization
    this.loadCities();
    this.loadVehicleTypes(50);
    this.loadPlaceTypes();
    this.loadDestinations();
    this.loadBanks();
    this.loadServicePreferences();

    // Auto-select Van when many bags is checked
    effect(() => {
      const manyBagsValue = this.formModel().manyBags;
      const cars = this.carTypes();

      if (manyBagsValue && cars.length > 0) {
        const vanCar = cars.find(c => c.label.toLowerCase().includes('van'));
        if (vanCar && this.selectedCar() !== vanCar.id) {
          this.selectedCar.set(vanCar.id);
        }
      }
    });

    // Sync driver note signals with form model
    effect(() => {
      const checked = this.driverNoteChecked();
      const text = this.driverNoteText();
      this.formModel.update(m => ({ ...m, addDriverNote: checked, driverNote: text }));
    });

    // Auto-select first destination when data loads
    effect(() => {
      const destinations = this.destinationsData();
      if (destinations && destinations.length > 0 && !this.formModel().destination) {
        this.formModel.update(m => ({ ...m, destination: destinations[0].id }));
        this.distnationName.set(destinations[0].name);
      }
    });

    // Auto-select first city in join form when data loads
    effect(() => {
      const cities = this.cities();
      if (cities && cities.length > 0 && !this.joinFormModel().cityId) {
        this.joinFormModel.update(m => ({ ...m, cityId: cities[0].id }));
      }
    });

    // Auto-select first entity type when data loads
    effect(() => {
      const placeTypes = this.placeTypes();
      if (placeTypes && placeTypes.length > 0 && !this.joinFormModel().placeTypeId) {
        this.joinFormModel.update(m => ({ ...m, placeTypeId: placeTypes[0].id }));
      }
    });
  }

  private static readonly fallbackImages: Record<string, string> = {
    classic:  'assets/booking/car-taxi.png',
    sport:    'assets/booking/car-premium.png',
    van:      'assets/booking/car-van.png',
    comfort:  'assets/booking/car-comfort.png',
    pet:      'assets/booking/car-pet.png',
    kids:     'assets/booking/car-kids.png',
  };

  private loadVehicleTypes(km: number): void {
    if (this.vehicleTypesLoaded) return;
    this.vehicleTypesLoaded = true;

    this.carTypesLoading.set(true);
    this.vehicleTypeService.getAll(km).pipe(this.takeUntilDestroyed()).subscribe({
      next: (result) => {
        this.carTypesLoading.set(false);
        if (result.isSuccess && result.data) {
          const options: CarOption[] = result.data.map(v => {
            const key = v.name.toLowerCase().split(' ')[0];
            const image = BookingComponent.fallbackImages[key] ?? 'assets/booking/car-premium.png';
            const price = v.expectedPriceAfterDiscount ?? v.expectedPrice;
            return { id: v.id, label: v.name, image, price, estimatedMinutes: v.estimatedTimeInMinutes };
          });
         
         this.carTypes.set(options.slice(0, 6));
          if (options.length > 0) this.selectedCar.set(options[0].id);
        }
      },
      error: () => this.carTypesLoading.set(false),
    });
  }

  readonly destinations = [
    'Cairo International Airport',
    'Giza Pyramids',
    'Downtown Cairo',
    'Nile City',
    'Cairo Opera House',
    'Khan el-Khalili',
    'Al-Azhar Mosque',
    'Egyptian Museum',
    'Zamalek District',
    'Heliopolis',
  ];
readonly destinationsData = signal<LocationItem[] | null>(null);
  protected readonly selectedCar = signal<string>('');
  protected readonly savedOtherEntityType = signal<string>('');

  readonly selectedCarOption = computed(() =>
    this.carTypes().find(c => c.id === this.selectedCar()) ?? null,
  );
  readonly tripDurationLabel = computed(() => {
    const mins = this.selectedCarOption()?.estimatedMinutes ?? 0;
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}hr : ${m}min : 00sec`;
  });
  readonly isCarSelectorDisabled = computed(() => this.formModel().manyBags);

  readonly commissionPercentage = computed(() => this.appConfig.commissionPercentage());

  readonly isCreatingTrip = signal(false);
  readonly isReschedulingTrip = signal(false);
  readonly rescheduleTripRequestId = signal<string | null>(null);
  readonly isRescheduleMode = computed(() => !!this.rescheduleTripRequestId());
  readonly createdTripId = signal<string | null>(null);
  readonly hotelImageSrc = signal<string>('assets/booking/hotel-illustration.png');
  readonly isOtherPlaceTypeSelected = computed(() => {
    const selectedPlaceTypeId = this.joinFormModel().placeTypeId;
    const otherPlaceType = this.placeTypes().find(p => p.name.toLowerCase() === 'other');
    return selectedPlaceTypeId === otherPlaceType?.id && !!otherPlaceType;
  });
  readonly selectedEntityTypeName = computed(() => {
    const selectedPlaceTypeId = this.joinFormModel().placeTypeId;
    const selectedPlaceType = this.placeTypes().find(p => p.id === selectedPlaceTypeId);
    const selectedName = selectedPlaceType?.name?.trim() ?? '';

    if (selectedName.toLowerCase() === 'other') {
      return this.savedOtherEntityType() || 'Company';
    }

    return selectedName || 'Hotel';
  });
  readonly entityNameLabel = computed(() => `${this.selectedEntityTypeName()} Name`);
  readonly entityNamePlaceholder = computed(() => `Enter ${this.selectedEntityTypeName()} name`);

  onHotelImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => this.hotelImageSrc.set(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  /* ── Signal Form ──────────────────────────────────────── */
  protected readonly formModel = signal<BookingFormModel>({
    destination: '',
    clientName: '',
    roomNo: '',
    manyBags: true,
    addDriverNote: false,
    driverNote: '',
  });
  protected readonly f = form(this.formModel);

  protected saveOtherEntityType(): void {
    const otherType = this.joinFormModel().otherEntityType || '';
    if (otherType && otherType.trim()) {
      this.savedOtherEntityType.set(otherType.trim());
      this.joinFormModel.update(m => ({ ...m, otherEntityType: '', entityType: 'Other' }));
    }
  }

  protected editOtherEntityType(): void {
    this.joinFormModel.update(m => ({ ...m, otherEntityType: this.savedOtherEntityType() }));
    this.savedOtherEntityType.set('');
  }

  protected onOtherEntityTypeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.joinFormModel.update(m => ({ ...m, otherEntityType: input.value }));
  }

  protected readonly signInFormModel = signal({ email: '', password: '' });
  protected readonly SignInFormF = form(this.signInFormModel);

  /* ── Map ───────────────────────────────────────────────── */
  readonly mapCenter = signal<[number, number]>([30.0444, 31.2357]);
  readonly weatherLat = signal(30.0444);
  readonly weatherLng = signal(31.2357);

  onMapCenterChange(center: { lat: number; lng: number }): void {
    this.weatherLat.set(center.lat);
    this.weatherLng.set(center.lng);
  }

  /* ── Join Us Modal ──────────────────────────────────── */
  readonly showJoinModal = signal(false);
  readonly showSiginInModal = signal(false);
  readonly ForgotPasswordMode = signal(false);
  readonly showVerificationModal = signal(false);
  readonly showWelcomeModal = signal(false);
  readonly otpDigits = signal<string[]>(['', '', '', '', '', '']);
  readonly joinStep = signal<1 | 2 | 3>(1);
  readonly ShowComfirmBookingModel = signal(false);
  readonly ShowRideRequestSentModel = signal(false);
  readonly showPickupTimeModal = signal(false);
readonly ShowScheduledRiderModel = signal(false);
readonly activeTab = signal<'login' | 'register'>('register');
  readonly isRegistering = signal(false);
  readonly isLoggingIn = signal(false);
  readonly isSendingOtp = signal(false);
  readonly isValidatingOtp = signal(false);
  readonly isResettingPassword = signal(false);
  readonly otpUserId = signal<string>('');
  readonly showResetPasswordModal = signal(false);
  protected readonly resetPasswordFormModel = signal({ newPassword: '', confirmPassword: '' });
  protected readonly rpf = form(this.resetPasswordFormModel);

  readonly pickupDateOptions: string[] = this.generateDateOptions();
  readonly pickupHourOptions: string[] = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  readonly pickupMinuteOptions: string[] = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  readonly selectedPickupDateIndex = signal(0);
  readonly selectedPickupHourIndex = signal(12);
  readonly selectedPickupMinuteIndex = signal(0);
  readonly cities = signal<{ id: string; name: string }[]>([]);
  readonly citiesLoading = signal(false);
  readonly citiesError = signal<string | null>(null);

  private loadCities(): void {
    this.citiesLoading.set(true);
    this.citiesError.set(null);

    this.citiesService.getCities(undefined, 50, 1)
      .pipe(this.takeUntilDestroyed())
      .subscribe({
        next: (response) => {
          this.citiesLoading.set(false);
          if (response.isSuccess && response.data) {
            this.cities.set(response.data.items);
          } else {
            this.citiesError.set('Failed to load cities');
          }
        },
        error: () => {
          this.citiesLoading.set(false);
          this.citiesError.set('Failed to load cities');
        },
      });
  }

  private loadPlaceTypes(): void {
    if (this.placeTypesLoaded) return;
    this.placeTypesLoaded = true;

    this.placeTypesLoading.set(true);
    this.placeTypeService.getPlaceTypes()
      .pipe(this.takeUntilDestroyed())
      .subscribe({
        next: (response) => {
          this.placeTypesLoading.set(false);
          if (response.isSuccess && response.data) {
            this.placeTypes.set(response.data);
          }
        },
        error: () => this.placeTypesLoading.set(false),
      });
  }

  private loadBanks(): void {
    this.banksLoading.set(true);

    this.bankService.getBanks()
      .pipe(this.takeUntilDestroyed())
      .subscribe({
        next: (response) => {
          this.banksLoading.set(false);
          if (response.isSuccess && response.data?.banks) {
            this.banks.set(response.data.banks);
          } else {
            this.showError(response.error?.description || 'Failed to load banks.');
          }
        },
        error: () => {
          this.banksLoading.set(false);
          this.showError('Failed to load banks.');
        },
      });
  }

  protected readonly joinFormModel = signal<JoinUsFormModel>({
    entityType: 'Hotel',
    otherEntityType: '',
    hotelName: '',
    cityId: '',
    address: '',
    phoneNumber: '',
    email: '',
    password: '',
    locationUrl: '',
    placeTypeId: '',
    otherPlaceText: '',
    selectedPreferenceIds: [],
    bankAccountHolderName: '',
    bankName: '',
    bankAccountNumber: '',
    bankRoutingNumber: ''
  });
  protected readonly jf = form(this.joinFormModel);

  protected readonly withdrawalFormModel = signal<WithdrawalFormModel>({
    accountHolderName: '',
    bankName: '',
    iban: '',
    swiftCode: '',
  });
  protected readonly wf = form(this.withdrawalFormModel);

  protected readonly servicePreferencesModel = signal<ServicePreferencesModel>({
    klimaAnlege: false,
    chauffeurEnglisch: false,
    chauffeurArabisch: false,
    zweiSitzerhoehung: false,
    chauffeureService: false,
    eineSitzerhoehung: false,
    maxicosi: false,
    mitRollator: false,
    mitRollstuhl: false,
    allradantrieb: false,
    nichtraucherChauffeure: false,
    niedertritt: false,
    roemerKing: false,
    additionalNote: '',
  });

  protected readonly leftPreferences = computed(() => {
    const services = this.allServicePreferences();
    const half = Math.ceil(services.length / 2);
    return services.slice(0, half).map(s => ({
      key: s.serviceCode as keyof Omit<ServicePreferencesModel, 'additionalNote'>,
      label: s.serviceName,
      serviceId: s.serviceId,
    }));
  });

  protected readonly rightPreferences = computed(() => {
    const services = this.allServicePreferences();
    const half = Math.ceil(services.length / 2);
    return services.slice(half).map(s => ({
      key: s.serviceCode as keyof Omit<ServicePreferencesModel, 'additionalNote'>,
      label: s.serviceName,
      serviceId: s.serviceId,
    }));
  });

  private loadServicePreferences(): void {
    if (this.servicePreferencesLoaded) return;

    this.servicePreferencesLoading.set(true);
    this.hotelDetailsService
      .getServicePreferences(1, 100)
      .pipe(this.takeUntilDestroyed())
      .subscribe({
        next: (result) => {
          this.servicePreferencesLoading.set(false);
          if (result.isSuccess && result.data?.services?.items) {
            this.allServicePreferences.set(result.data.services.items);
            this.servicePreferencesLoaded = true;
          }
        },
        error: () => {
          this.servicePreferencesLoading.set(false);
          console.warn('Failed to load service preferences');
        },
      });
  }

  togglePreference(key: keyof Omit<ServicePreferencesModel, 'additionalNote'>): void {
    this.servicePreferencesModel.update(prev => ({ ...prev, [key]: !prev[key] }));
  }

  onAdditionalNoteChange(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.servicePreferencesModel.update(prev => ({ ...prev, additionalNote: value }));
  }

  openJoinModal(): void {
    this.joinStep.set(1);
    this.showJoinModal.set(true);
  }

  closeJoinModal(): void {
    this.showJoinModal.set(false);
  }

  nextStep(): void {
    if (!this.validateStep1()) return;
    this.joinStep.set(2);
  }

  nextToWithdrawal(): void {
    if (!this.validateStep2()) return;
    this.joinStep.set(3);
  }

  private validateStep1(): boolean {
    const form = this.joinFormModel();

    if (!form.entityType?.trim()) {
      this.showError('Please select an entity type.');
      return false;
    }
    if (form.entityType === 'Other' && !form.otherEntityType?.trim()) {
      this.showError('Please specify your entity type.');
      return false;
    }
    if (!form.placeTypeId?.trim()) {
      this.showError('Please select a place type.');
      return false;
    }
    if (!form.hotelName?.trim()) {
      this.showError('Please enter the hotel name.');
      return false;
    }
    if (!form.cityId?.trim()) {
      this.showError('Please select a city.');
      return false;
    }
    if (!form.address?.trim()) {
      this.showError('Please enter the address.');
      return false;
    }
    if (!form.phoneNumber?.trim()) {
      this.showError('Please enter the phone number.');
      return false;
    }
    const phoneRegex = /^[+]?[\d\s\-()]{7,20}$/;
    if (!phoneRegex.test(form.phoneNumber)) {
      this.showError('Please enter a valid phone number.');
      return false;
    }
    if (!form.email?.trim()) {
      this.showError('Please enter the email.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      this.showError('Please enter a valid email address.');
      return false;
    }
    if (!form.password?.trim()) {
      this.showError('Please enter a password.');
      return false;
    }
    const passwordError = this.getPasswordValidationError(form.password);
    if (passwordError) {
      this.showError(passwordError);
      return false;
    }
    return true;
  }

  private validateStep2(): boolean {
    const form = this.joinFormModel();
 
    return true;
  }

  private validateStep3(): boolean {
    const form = this.joinFormModel();
    if (!form.bankAccountHolderName?.trim()) {
      this.showError('Please enter the account holder name.');
      return false;
    }
    if (!form.bankName?.trim()) {
      this.showError('Please select a bank.');
      return false;
    }
    if (!form.bankRoutingNumber?.trim()) {
      this.showError('Please enter your IBAN / Swift code.');
      return false;
    }
    return true;
  }

  prevStep(): void {
    const step = this.joinStep();
    if (step === 3) this.joinStep.set(2);
    else this.joinStep.set(1);
  }

  signInModalOpen(): void {
    this.showSiginInModal.set(true);
  }
  closeSignInModal(): void {
    this.showSiginInModal.set(false);
  }

  openForgotPasswordMode(): void {
    this.closeSignInModal();
    this.ForgotPasswordMode.set(true);
  }
  ColseForgotPasswordMode(): void {
    this.ForgotPasswordMode.set(false);
  }

  sendForgotPasswordCode(): void {
    const email = this.signInFormModel().email;
    if (!email) {
      this.showError('Please enter your email address.');
      return;
    }
    this.isSendingOtp.set(true);
    this.otpService.resend(email).pipe(this.takeUntilDestroyed()).subscribe({
      next: (result) => {
        this.isSendingOtp.set(false);
        if (result.isSuccess && result.data) {
          this.otpUserId.set(result.data);
          this.openVerificationModal();
        } else {
          this.showError(result.error?.description || 'Failed to send OTP. Please try again.');
        }
      },
      error: () => {
        this.isSendingOtp.set(false);
        this.showError('An unexpected error occurred. Please try again later.');
      },
    });
  }

  openVerificationModal(): void {
    this.ColseForgotPasswordMode();
    this.otpDigits.set(['', '', '', '', '', '']);
    this.showVerificationModal.set(true);
  }

  closeVerificationModal(): void {
    this.showVerificationModal.set(false);
  }

  verifyOtp(): void {
    const otp = this.otpDigits().join('');
    if (otp.length < 6) {
      this.showError('Please enter all 6 digits of the verification code.');
      return;
    }
    this.isValidatingOtp.set(true);
    this.otpService.validate(this.otpUserId(), otp).pipe(this.takeUntilDestroyed()).subscribe({
      next: (result) => {
        this.isValidatingOtp.set(false);
        if (result.isSuccess && result.data === true) {
          this.closeVerificationModal();
          this.resetPasswordFormModel.set({ newPassword: '', confirmPassword: '' });
          this.showResetPasswordModal.set(true);
        } else {
          this.showError('Invalid verification code. Please try again.');
        }
      },
      error: () => {
        this.isValidatingOtp.set(false);
        this.showError('An unexpected error occurred. Please try again later.');
      },
    });
  }

  closeResetPasswordModal(): void {
    this.showResetPasswordModal.set(false);
  }

  submitResetPassword(): void {
    const { newPassword, confirmPassword } = this.resetPasswordFormModel();
    if (!newPassword) {
      this.showError('Please enter a new password.');
      return;
    }
    const passwordError = this.getPasswordValidationError(newPassword);
    if (passwordError) {
      this.showError(passwordError);
      return;
    }
    if (newPassword !== confirmPassword) {
      this.showError('Passwords do not match.');
      return;
    }
    this.isResettingPassword.set(true);
    this.otpService.resetPassword(this.otpUserId(), newPassword).pipe(this.takeUntilDestroyed()).subscribe({
      next: (result) => {
        this.isResettingPassword.set(false);
        if (result.isSuccess) {
          this.closeResetPasswordModal();
          this.showSuccess('Password reset successfully! Please sign in with your new password.');
          this.signInModalOpen();
        } else {
          this.showError(result.error?.description || 'Failed to reset password. Please try again.');
        }
      },
      error: () => {
        this.isResettingPassword.set(false);
        this.showError('An unexpected error occurred. Please try again later.');
      },
    });
  }

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(0, 1);
    const digits = [...this.otpDigits()];
    digits[index] = value;
    this.otpDigits.set(digits);

    if (value && index < 5) {
      const next = input.parentElement?.querySelectorAll('input')[index + 1];
      next?.focus();
    }
  }

  onOtpKeydown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prev = input.parentElement?.querySelectorAll('input')[index - 1];
      prev?.focus();
    }
  }

  openWelcomeModal(): void {
    this.closeVerificationModal();
    this.showWelcomeModal.set(true);
  }

  closeWelcomeModal(): void {
    this.showWelcomeModal.set(false);
  }


  bookNow(): void {
    if (!this.coreAuth.isAuthenticated()) {
      this.signInModalOpen();
      return;
    }
    const { destination, clientName, roomNo } = this.formModel();
    this.distnationName.set(this.destinationsData()?.find(x => x.id === destination)?.name ?? '');
    // if ( !clientName || !roomNo) {
    //   this.showError('Please fill in destination, client name, and room number.');
    //   return;
    // }
    this.ShowComfirmBookingModel.set(true);
  }

  openComfirmBookingModel(): void {
    this.ShowComfirmBookingModel.set(true);
  }

  CloseComfirmBookingModel(): void {
    this.ShowComfirmBookingModel.set(false);
  }

  confirmBooking(): void {
    this.createTrip(false, null);
  }

  openRideRequestSentModel():void{
      this.ShowRideRequestSentModel.set(true)
  }
  closeRideRequestSentModel():void{
    this.ShowRideRequestSentModel.set(false)
  }

  viewTripDetails(): void {
    const tripId = this.createdTripId();
    if (tripId) {
      this.closeRideRequestSentModel();
      this.router.navigate(['/TripDetails', tripId]);
    }
  }

  openPickupTimeModal(): void {
    if (!this.coreAuth.isAuthenticated()) {
      this.signInModalOpen();
      return;
    }
    const { destination, clientName, roomNo } = this.formModel();
    if (!destination || !clientName || !roomNo) {
      this.showError('Please fill in destination, client name, and room number.');
      return;
    }
    this.showPickupTimeModal.set(true);
    this.syncPickupPickerScroll();
  }

  closePickupTimeModal(): void {
    this.showPickupTimeModal.set(false);
    if (this.isRescheduleMode() && !this.isReschedulingTrip()) {
      this.rescheduleTripRequestId.set(null);
    }
  }

  confirmScheduledTrip(): void {
    if (this.isRescheduleMode()) {
      this.rescheduleTrip();
      return;
    }

    this.showPickupTimeModal.set(false);
    this.createTrip(true, this.getScheduledAt());
  }

  private getScheduledAt(): string {
    const now = new Date();
    const d = new Date(now);
    d.setDate(now.getDate() + this.selectedPickupDateIndex());
    d.setHours(this.selectedPickupHourIndex(), this.selectedPickupMinuteIndex(), 0, 0);
    return d.toISOString();
  }

  private createTrip(isScheduled: boolean, scheduledAt: string | null): void {
    const { destination, clientName, roomNo, addDriverNote, driverNote } = this.formModel();
    const [lat, lng] = this.mapCenter();
    const car = this.selectedCarOption();
    const dist = this.destinationsData()?.find(x => x.id === destination);
    const payload: any = {
      startLocation: { latitude: lat, longitude: lng, address: 'Current Location', order: 0 },
      endLocations: [{ latitude: dist?.latitude, longitude: dist?.longitude, address: dist?.name, order: 1 }],
      isScheduled,
      scheduledAt,
      vehicleTypeId: this.selectedCar(),
      paymentMethodId: '168ac692-3a98-8cb0-8934-019b1e8abaa8',
      estimatedPrice: car?.price ?? 0,
      distance: 50,
      userRewardId: null,
      paymentMethodType: 0,
      roomNumber: parseInt(roomNo, 10) || 0,
      guestName: clientName,
    };

    if (addDriverNote && driverNote) {
      payload.notes = driverNote;
    }

    this.isCreatingTrip.set(true);
    this.tripRequestService.create(payload).pipe(this.takeUntilDestroyed()).subscribe({
      next: (result) => {
        this.isCreatingTrip.set(false);
        if (result.isSuccess) {
          this.createdTripId.set(result.data as string);
          this.ShowComfirmBookingModel.set(false);
          this.ShowRideRequestSentModel.set(true);
        } else {
          this.showError(result.error?.description || 'Failed to create trip. Please try again.');
        }
      },
      error: () => {
        this.isCreatingTrip.set(false);
        this.showError('An unexpected error occurred. Please try again later.');
      },
    });
  }

  private openReschedulePickupTime(tripRequestId: string, scheduledAt: string | null): void {
    this.rescheduleTripRequestId.set(tripRequestId);
    if (scheduledAt) {
      this.setPickupFromDate(new Date(scheduledAt));
    }
    this.showPickupTimeModal.set(true);
    this.syncPickupPickerScroll();
  }

  private setPickupFromDate(date: Date): void {
    if (Number.isNaN(date.getTime())) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    const dayDiff = Math.round((target.getTime() - today.getTime()) / 86_400_000);

    this.selectedPickupDateIndex.set(Math.min(Math.max(dayDiff, 0), this.pickupDateOptions.length - 1));
    this.selectedPickupHourIndex.set(date.getHours());
    this.selectedPickupMinuteIndex.set(date.getMinutes());
  }

  private syncPickupPickerScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    window.setTimeout(() => {
      const itemHeight = 40;
      const columns = Array.from(document.querySelectorAll<HTMLElement>('.pickup-picker-scroll'));
      const [dateColumn, hourColumn, minuteColumn] = columns;

      if (dateColumn) dateColumn.scrollTop = this.selectedPickupDateIndex() * itemHeight;
      if (hourColumn) hourColumn.scrollTop = this.selectedPickupHourIndex() * itemHeight;
      if (minuteColumn) minuteColumn.scrollTop = this.selectedPickupMinuteIndex() * itemHeight;
    });
  }

  private rescheduleTrip(): void {
    const tripRequestId = this.rescheduleTripRequestId();
    if (!tripRequestId || this.isReschedulingTrip()) return;

    this.isReschedulingTrip.set(true);
    this.tripRequestService.rescheduleTrip(tripRequestId, this.getScheduledAt())
      .pipe(this.takeUntilDestroyed())
      .subscribe({
        next: (result) => {
          this.isReschedulingTrip.set(false);
          if (result.isSuccess) {
            this.showPickupTimeModal.set(false);
            this.rescheduleTripRequestId.set(null);
            this.showSuccess('Trip rescheduled successfully.');
            this.router.navigate(['/TripDetails', tripRequestId]);
          } else {
            this.showError(result.error?.description || 'Failed to reschedule trip. Please try again.');
          }
        },
        error: () => {
          this.isReschedulingTrip.set(false);
          this.showError('An unexpected error occurred. Please try again later.');
        },
      });
  }
  openScheduledRiderModel(): void {
    this.ShowScheduledRiderModel.set(true);
  }
  closeScheduledRiderModel(): void {
    this.ShowScheduledRiderModel.set(false);
  }
  onPickerScroll(type: 'date' | 'hour' | 'minute', event: Event): void {
    const container = event.target as HTMLElement;
    const itemHeight = 40;
    const index = Math.round(container.scrollTop / itemHeight);
    if (type === 'date') {
      this.selectedPickupDateIndex.set(Math.min(index, this.pickupDateOptions.length - 1));
    } else if (type === 'hour') {
      this.selectedPickupHourIndex.set(Math.min(index, this.pickupHourOptions.length - 1));
    } else {
      this.selectedPickupMinuteIndex.set(Math.min(index, this.pickupMinuteOptions.length - 1));
    }
  }

  private generateDateOptions(): string[] {
    const options: string[] = [];
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const day = d.getDate();
      const month = d.toLocaleString('en', { month: 'long' }).toLowerCase();
      options.push(`${day} ${month}`);
    }
    return options;
  }
  public Register(): void {
    if (!this.validateStep1()) {
      this.joinStep.set(1);
      return;
    }
    if (!this.validateStep2()) {
      this.joinStep.set(2);
      return;
    }
    if (!this.validateStep3()) return;

    const form = this.joinFormModel();

    this.isRegistering.set(true);
    const preferences = this.servicePreferencesModel();
    const allServices = this.allServicePreferences();

    form.selectedPreferenceIds = allServices
      .filter(service => preferences[service.serviceCode as keyof Omit<ServicePreferencesModel, 'additionalNote'>])
      .map(service => service.serviceId);   
       this.authService.Register(form).pipe(this.takeUntilDestroyed()).subscribe({
      next: (result) => {
        this.isRegistering.set(false);

        if (result.isSuccess) {
          this.showWelcomeModal.set(true);
          this.showSuccess('Hotel registered successfully! You will be redirected to login.');
          
          // Reset form
          this.joinFormModel.set({
            entityType: '',
            hotelName: '',
            cityId: '',
            address: '',
            phoneNumber: '',
            email: '',
            password: '',
            locationUrl: '',
            placeTypeId: '',
            otherPlaceText: '',
            selectedPreferenceIds: [],
            bankAccountHolderName: '',
            bankName: '',
            bankAccountNumber: '',
            bankRoutingNumber: ''
          });
          
          // Switch to login tab after successful registration
          setTimeout(() => {
            this.activeTab.set('login');
          }, 2000);
          
        } else {
          this.showError(result.error?.description || 'Registration failed. Please try again.');
        }
      },
      error: () => {
        this.isRegistering.set(false);
        this.showError('An unexpected error occurred. Please try again later.');
      }
    });
  }

  public SignIn(): void {
    const { email, password } = this.signInFormModel();
    if (!email || !password) {
      this.showError('Please enter your email and password.');
      return;
    }

    this.isLoggingIn.set(true);

    this.loginService.login({ email, password }).pipe(this.takeUntilDestroyed()).subscribe({
      next: (result) => {
        this.isLoggingIn.set(false);

        if (result.isSuccess && result.data) {
          this.loginService.saveSession(result.data.token, result.data.role);
          this.coreAuth.setSession(result.data.token, result.data.role);
          this.coreAuth.refreshProfile();
          this.signInFormModel.set({ email: '', password: '' });
          this.closeSignInModal();
          this.showSuccess('Login successful! Welcome back.');
          const role = result.data.role.toLowerCase();
          if (role === 'admin' || role === 'hotel') {
            this.router.navigate(['/hotel-details']);
          }
        } else {
          this.showError(result.error?.description || 'Login failed. Please check your credentials.');
        }
      },
      error: () => {
        this.isLoggingIn.set(false);
        this.showError('An unexpected error occurred. Please try again later.');
      },
    });
  }

  private showSuccess(message: string): void {
    this.notifications.showSuccess(message);
  }

  private showError(message: string): void {
    this.notifications.showError(message);
  }

  private getPasswordValidationError(password: string): string | null {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }

    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter.';
    }

    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter.';
    }

    if (!/\d/.test(password)) {
      return 'Password must contain at least one digit.';
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return 'Password must contain at least one non-alphanumeric character.';
    }

    return null;
  }

  private loadDestinations(){
      this.placeTypeService.getdestinations()
     .pipe(this.takeUntilDestroyed()).subscribe({
      next: (result) => {
 
        if (result.isSuccess && result.data) {
          this.destinationsData.set(result.data.locations.items?? null)
        } else {
          this.showError(result.error?.description || 'Login failed. Please check your credentials.');
        }
      },
      error: () => {
         this.showError('An unexpected error occurred. Please try again later.');
      },
    });
  }
}
