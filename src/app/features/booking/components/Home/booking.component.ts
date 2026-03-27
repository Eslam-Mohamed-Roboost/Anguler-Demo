import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
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
import { BaseComponent } from '../../../../shared/base/base.component';
import { PasswordInputComponent } from '../../../../shared/components/password-input/password-input.component';
import { AuthService } from '../services/auth.service';
import { CitiesService } from '../services/cities.service';
import { LoginService } from '../services/login.service';
import { OtpService } from '../services/otp.service';
import { VehicleTypeService } from '../services/vehicle-type.service';
import { TripRequestService } from '../services/trip-request.service';
import { CarOption } from '../../../../shared/components/car-selector/car-selector.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { NotificationStore } from '../../../../core/stores/notification.store';

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
    TranslatePipe,
],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css',
})
export class BookingComponent extends BaseComponent {
  private readonly router = inject(Router);
  private readonly joinUsService = inject(JoinUsService);
  private readonly authService = inject(AuthService);
  private readonly citiesService = inject(CitiesService);
  private readonly loginService = inject(LoginService);
  private readonly otpService = inject(OtpService);
  private readonly vehicleTypeService = inject(VehicleTypeService);
  private readonly tripRequestService = inject(TripRequestService);
  private readonly notifications = inject(NotificationStore);

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

    // Load cities on initialization
    this.loadCities();
    this.loadVehicleTypes(50);
  }

  private static readonly fallbackImages: Record<string, string> = {
    classic:  'assets/booking/car-taxi.png',
    sport:    'assets/booking/car-premium.png',
    van:      'assets/booking/car-van.png',
    comfort:  'assets/booking/car-comfort.png',
    pet:      'assets/booking/car-pet.png',
    kids:     'assets/booking/car-kids.png',
  };

  readonly carTypes = signal<CarOption[]>([]);
  readonly carTypesLoading = signal(false);

  private loadVehicleTypes(km: number): void {
    this.carTypesLoading.set(true);
    this.vehicleTypeService.getAll(km).subscribe({
      next: (result) => {
        this.carTypesLoading.set(false);
        if (result.isSuccess && result.data) {
          const options: CarOption[] = result.data.map(v => {
            const key = v.name.toLowerCase().split(' ')[0];
            const image = BookingComponent.fallbackImages[key] ?? 'assets/booking/car-premium.png';
            const price = v.expectedPriceAfterDiscount ?? v.expectedPrice;
            return { id: v.id, label: v.name, image, price, estimatedMinutes: v.estimatedTimeInMinutes };
          });
          this.carTypes.set(options);
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

  protected readonly selectedCar = signal<string>('');
  readonly selectedCarOption = computed(() =>
    this.carTypes().find(c => c.id === this.selectedCar()) ?? null,
  );
  readonly tripDurationLabel = computed(() => {
    const mins = this.selectedCarOption()?.estimatedMinutes ?? 0;
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}hr : ${m}min : 00sec`;
  });
  readonly isCreatingTrip = signal(false);
  readonly createdTripId = signal<string | null>(null);
  readonly hotelImageSrc = signal<string>('assets/booking/hotel-illustration.png');

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
  });
  protected readonly f = form(this.formModel);

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
  readonly joinStep = signal<1 | 2>(1);
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
  cities: { id: string; name: string }[] = [];
  readonly citiesLoading = signal(false);
  readonly citiesError = signal<string | null>(null);

  private loadCities(): void {
    this.citiesLoading.set(true);
    this.citiesError.set(null);
    
    this.citiesService.getCities(undefined, 50, 1).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.cities = response.data.items;
          console.log('🏙️ Cities loaded successfully:', response.data.items);
        } else {
          this.citiesError.set('Failed to load cities');
          console.error('Cities API error:', response.error);
        }
      },
      error: (error) => {
        this.citiesError.set('Failed to load cities');
        console.error('Cities service error:', error);
      },
      complete: () => {
        this.citiesLoading.set(false);
      }
    });
  }

  readonly banks = [
    'National Bank of Egypt', 'Banque Misr', 'CIB',
    'QNB Alahli', 'HSBC Egypt', 'Arab African International Bank',
    'Banque du Caire', 'Faisal Islamic Bank',
  ];

  protected readonly joinFormModel = signal<JoinUsFormModel>({
    hotelName: '',
    cityId: '',
    address: '',
    phoneNumber: '',
    email: '',
    password:'',
    locationUrl:''
  });
  protected readonly jf = form(this.joinFormModel);

  protected readonly withdrawalFormModel = signal<WithdrawalFormModel>({
    accountHolderName: '',
    bankName: '',
    iban: '',
    swiftCode: '',
  });
  protected readonly wf = form(this.withdrawalFormModel);

  openJoinModal(): void {
    this.joinStep.set(1);
    this.showJoinModal.set(true);
  }

  closeJoinModal(): void {
    this.showJoinModal.set(false);
  }

  nextStep(): void {
    const form = this.joinFormModel();

    if (!form.hotelName || !form.cityId || !form.address || !form.phoneNumber || !form.email || !form.password) {
      this.showError('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      this.showError('Please enter a valid email address.');
      return;
    }

    this.isRegistering.set(true);

    this.authService.Register(form).subscribe({
      next: (result) => {
        this.isRegistering.set(false);
        if (result.isSuccess) {
          this.joinStep.set(2);
        } else {
          this.showError(result.error?.description || 'Registration failed. Please try again.');
        }
      },
      error: () => {
        this.isRegistering.set(false);
        this.showError('An unexpected error occurred. Please try again later.');
      },
    });
  }

  prevStep(): void {
    this.joinStep.set(1);
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
    this.otpService.resend(email).subscribe({
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
    this.otpService.validate(this.otpUserId(), otp).subscribe({
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
    if (newPassword !== confirmPassword) {
      this.showError('Passwords do not match.');
      return;
    }
    this.isResettingPassword.set(true);
    this.otpService.resetPassword(this.otpUserId(), newPassword).subscribe({
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
    if (!this.loginService.isLoggedIn()) {
      this.signInModalOpen();
      return;
    }
    const { destination, clientName, roomNo } = this.formModel();
    if (!destination || !clientName || !roomNo) {
      this.showError('Please fill in destination, client name, and room number.');
      return;
    }
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
    if (!this.loginService.isLoggedIn()) {
      this.signInModalOpen();
      return;
    }
    const { destination, clientName, roomNo } = this.formModel();
    if (!destination || !clientName || !roomNo) {
      this.showError('Please fill in destination, client name, and room number.');
      return;
    }
    this.showPickupTimeModal.set(true);
  }

  closePickupTimeModal(): void {
    this.showPickupTimeModal.set(false);
  }

  confirmScheduledTrip(): void {
    this.closePickupTimeModal();
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
    const { destination, clientName, roomNo } = this.formModel();
    const [lat, lng] = this.mapCenter();
    const car = this.selectedCarOption();

    this.isCreatingTrip.set(true);
    this.tripRequestService.create({
      startLocation: { latitude: lat, longitude: lng, address: 'Current Location', order: 0 },
      endLocations: [{ latitude: 0, longitude: 0, address: destination, order: 1 }],
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
    }).subscribe({
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
  public Regiester(): void {
    console.log('Submitting hotel registration:', this.joinFormModel());
    this.showWelcomeModal.set(true);
    // Basic validation - check all required fields
    const form = this.joinFormModel();
    console.log('Form data for validation:', form);
    
    const requiredFields = ['hotelName', 'cityId', 'address', 'phoneNumber', 'email', 'password'];
    const missingFields = requiredFields.filter(field => !form[field as keyof JoinUsFormModel]);
    
    console.log('Missing fields:', missingFields);
    console.log('Field values:', {
      hotelName: form.hotelName,
      cityId: form.cityId,
      address: form.address,
      phoneNumber: form.phoneNumber,
      email: form.email,
      password: form.password
    });
    
    if (missingFields.length > 0) {
      this.showError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      this.showError('Please enter a valid email address');
      return;
    }

    // Phone validation - more flexible to accept common phone formats
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(form.phoneNumber) || form.phoneNumber.length < 6) {
      this.showError('Please enter a valid phone number (minimum 6 digits)');
      return;
    }

    // City ID validation - should be a valid UUID or select from dropdown
    if (!form.cityId || form.cityId === '') {
      this.showError('Please select a city');
      return;
    }

    this.isRegistering.set(true);
    
    this.authService.Register(form).subscribe({
      next: (result) => {
        this.isRegistering.set(false);
        
        if (result.isSuccess) {
          console.log('Registration successful:', result.data);
          this.showSuccess('Hotel registered successfully! You will be redirected to login.');
          
          // Reset form
          this.joinFormModel.set({
            hotelName: '',
            cityId: '',
            address: '',
            phoneNumber: '',
            email: '',
            password: '',
            locationUrl: ''
          });
          
          // Switch to login tab after successful registration
          setTimeout(() => {
            this.activeTab.set('login');
          }, 2000);
          
        } else {
          console.error('Registration failed:', result.error);
          this.showError(result.error?.description || 'Registration failed. Please try again.');
        }
      },
      error: (err) => {
        this.isRegistering.set(false);
        console.error('Registration error:', err);
        this.showError('An unexpected error occurred. Please try again later.');
      }
    });
  }

  public SignIn(): void {
    const { email, password } = this.signInFormModel();
    console.log('Attempting login with:', { email, password: '********' });
    if (!email || !password) {
      this.showError('Please enter your email and password.');
      return;
    }

    this.isLoggingIn.set(true);

    this.loginService.login({ email, password }).subscribe({
      next: (result) => {
        this.isLoggingIn.set(false);

        if (result.isSuccess && result.data) {
          this.loginService.saveSession(result.data.token, result.data.role);
          this.signInFormModel.set({ email: '', password: '' });
          this.closeSignInModal();
          this.showSuccess('Login successful! Welcome back.');
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
}
