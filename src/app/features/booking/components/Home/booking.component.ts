import {
  ChangeDetectionStrategy,
  Component,
  inject,

  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
import { CarType } from '../../models/CarType-model';
import { BaseComponent } from '../../../../shared/base/base.component';
import { SingInFromModel } from '../../models/signInForm-model';
import { PasswordInputComponent } from '../../../../shared/components/password-input/password-input.component';

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
    PasswordInputComponent
],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css',
})
export class BookingComponent extends BaseComponent {
   private readonly joinUsService = inject(JoinUsService);

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
  }

  readonly carTypes: CarType[] = [
    { id: 'premium', label: 'Premium', image: 'assets/booking/car-premium.png' },
    { id: 'van', label: 'Van', image: 'assets/booking/car-van.png' },
    { id: 'comfort', label: 'Comfort', image: 'assets/booking/car-comfort.png' },
    { id: 'pet', label: 'Pet', image: 'assets/booking/car-pet.png' },
    { id: 'taxi', label: 'Taxi', image: 'assets/booking/car-taxi.png' },
    { id: 'kids', label: 'Kids Seat', image: 'assets/booking/car-kids.png' },
  ];

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

  protected readonly selectedCar = signal<string>('premium');

  /* ── Signal Form ──────────────────────────────────────── */
  protected readonly formModel = signal<BookingFormModel>({
    destination: '',
    clientName: '',
    roomNo: '',
    manyBags: true,
  });
  protected readonly f = form(this.formModel);

  protected readonly SignInForm = signal<SingInFromModel>({
    email: '',
    password: '',
  });
  protected readonly SignInFormF = form(this.SignInForm);

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
readonly ShowScheduledRiderModel = signal(false)

  readonly pickupDateOptions: string[] = this.generateDateOptions();
  readonly pickupHourOptions: string[] = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  readonly pickupMinuteOptions: string[] = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  readonly selectedPickupDateIndex = signal(0);
  readonly selectedPickupHourIndex = signal(12);
  readonly selectedPickupMinuteIndex = signal(0);
  readonly cities = [
    'Cairo', 'Alexandria', 'Giza', 'Sharm El Sheikh',
    'Hurghada', 'Luxor', 'Aswan', 'Dahab',
  ];

  readonly banks = [
    'National Bank of Egypt', 'Banque Misr', 'CIB',
    'QNB Alahli', 'HSBC Egypt', 'Arab African International Bank',
    'Banque du Caire', 'Faisal Islamic Bank',
  ];

  protected readonly joinFormModel = signal<JoinUsFormModel>({
    hotelName: '',
    city: '',
    address: '',
    phoneNumber: '',
    email: '',
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
    this.joinStep.set(2);
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

  openVerificationModal(): void {
    this.ColseForgotPasswordMode();
    this.otpDigits.set(['', '', '', '', '', '']);
    this.showVerificationModal.set(true);
  }

  closeVerificationModal(): void {
    this.showVerificationModal.set(false);
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


  openComfirmBookingModel(): void {
    this.ShowComfirmBookingModel.set(true);
  }

  CloseComfirmBookingModel(): void {
    this.ShowComfirmBookingModel.set(false);
  }

  openRideRequestSentModel():void{
      this.ShowRideRequestSentModel.set(true)
  }
  closeRideRequestSentModel():void{
    this.ShowRideRequestSentModel.set(false)
  }

  openPickupTimeModal(): void {
    this.showPickupTimeModal.set(true);
  }

  closePickupTimeModal(): void {
    this.showPickupTimeModal.set(false);
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
}
