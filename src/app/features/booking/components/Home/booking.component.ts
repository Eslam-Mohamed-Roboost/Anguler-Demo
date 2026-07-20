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
import { DistanceInfo, MapsService } from '../services/maps.service';
import { TripRequestService, type CreateTripRequest } from '../services/trip-request.service';
import { LocationItem, PlaceTypeService, type PlaceType } from '../services/place-type.service';
import { Bank, BankService } from '../services/bank.service';
import { HotelDetailsService } from '../../../hotel-details/services/hotel-details.service';
import { CarOption } from '../../../../shared/components/car-selector/car-selector.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { DriverNoteComponent } from '../driver-note/driver-note.component';
import { NotificationStore } from '../../../../core/stores/notification.store';
import { AppConfigService } from '../../../../core/services/app-config.service';
import { LanguageService } from '../../../../core/services/language.service';
import { ImageUploadService } from '../../../../core/services/image-upload.service';
import { of, switchMap } from 'rxjs';
import {
  getGoogleMapsSearchErrorMessage,
  GoogleMapsLoaderService,
  GooglePlaceSuggestion,
  LocationSelection,
} from '../services/google-maps-loader.service';
import { LocationPickerComponent } from '../location-picker/location-picker.component';
import { environment } from '../../../../../environments/environment';

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
    LocationPickerComponent,
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
  private readonly mapsService = inject(MapsService);
  private readonly tripRequestService = inject(TripRequestService);
  private readonly placeTypeService = inject(PlaceTypeService);
  private readonly bankService = inject(BankService);
  private readonly hotelDetailsService = inject(HotelDetailsService);
  private readonly notifications = inject(NotificationStore);
  private readonly appConfig = inject(AppConfigService);
  private readonly languageService = inject(LanguageService);
  private readonly imageUploadService = inject(ImageUploadService);
  private readonly googleMapsLoader = inject(GoogleMapsLoaderService);

  // Signals
  readonly carTypes = signal<CarOption[]>([]);
  readonly carTypesLoading = signal(false);
  readonly placeTypes = signal<PlaceType[]>([]);
  readonly placeTypesLoading = signal(false);
  readonly banks = signal<Bank[]>([]);
  readonly bankOptions = computed<Bank[]>(() =>
    this.banks().map(bank => ({ ...bank, id: bank.name })),
  );
  readonly banksLoading = signal(false);
  readonly otherBankName = signal('');
  readonly savedOtherBankName = signal('');
  readonly distnationName = signal<string>('');
  readonly driverNoteChecked = signal(false);
  readonly driverNoteText = signal('');
  readonly servicePreferencesLoading = signal(false);
  readonly allServicePreferences = signal<Array<{ serviceId: string; serviceName: string; serviceCode: string }>>([]);
  readonly dropOffSearchText = signal('');
  readonly dropOffSuggestions = signal<GooglePlaceSuggestion[]>([]);
  readonly dropOffSuggestionsOpen = signal(false);
  readonly dropOffSuggestionsLoading = signal(false);
  readonly googleDropOffLocation = signal<LocationSelection | null>(null);
  readonly selectedDestination = signal<LocationItem | null>(null);
  readonly joinSelectedLocation = signal<LocationSelection | null>(null);
  readonly distanceInfo = signal<DistanceInfo | null>(null);
  readonly distanceInfoLoading = signal(false);
  private readonly browserLocation = signal<{ lat: number; lng: number } | null>(null);
  private vehicleTypesRequestKey = '';
  private distanceInfoRequestKey = '';
  private dropOffSearchTimer: ReturnType<typeof setTimeout> | null = null;
  private dropOffSearchRequestId = 0;
  private googleSearchLoadFailed = false;
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
          this.browserLocation.set({ lat: latitude, lng: longitude });
        },
        () => {
          // Fallback: keep default coordinates
        },
      );
    }

    effect(() => {
      const location = this.getProfileMapLocation() ?? this.browserLocation();
      if (!location) return;

      this.setMapLocation(location);
    });

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
        this.selectedDestination.set(destinations[0]);
      }
    });

    effect(() => {
      const destination = this.selectedDestination();
      if (!destination) return;

      this.distnationName.set(destination.name);
      this.loadVehicleTypes(50, destination.latitude, destination.longitude);
    });

    // Refresh distance/duration/cost if the confirmation modal is already open.
    effect(() => {
      if (!this.ShowComfirmBookingModel()) return;

      const destination = this.selectedDestination();
      const vehicleId = this.selectedCar();
      if (!destination || !vehicleId) return;

      this.loadDistanceInfo(destination, vehicleId);
    });

    effect(() => {
      if (this.coreAuth.isAuthenticated() && this.destinationsData() === null) {
        this.loadDestinations();
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
    classic:  `${environment.apiUrl}/uploads/vehicle-documents/car-taxi.webp`,
    sport:    `${environment.apiUrl}/uploads/vehicle-documents/car-premium.webp`,
    van:      `${environment.apiUrl}/uploads/vehicle-documents/car-van.webp`,
    comfort:  `${environment.apiUrl}/uploads/vehicle-documents/car-comfort.webp`,
    pet:      `${environment.apiUrl}/uploads/vehicle-documents/car-pet.webp`,
    kids:     `${environment.apiUrl}/uploads/vehicle-documents/car-kids.webp`,
    taxi:     `${environment.apiUrl}/uploads/vehicle-documents/car-taxi.webp`,
    premium:  `${environment.apiUrl}/uploads/vehicle-documents/car-premium.webp`,
  };
  private loadVehicleTypes(km: number, latitude?: number, longitude?: number): void {
    const requestKey = `${km}:${latitude ?? ''}:${longitude ?? ''}`;
    if (this.vehicleTypesRequestKey === requestKey) return;
    this.vehicleTypesRequestKey = requestKey;
    
    this.carTypesLoading.set(true);
    this.vehicleTypeService.getAll(km, latitude, longitude).pipe(this.takeUntilDestroyed()).subscribe({
      next: (result) => {
        this.carTypesLoading.set(false);
        if (result.isSuccess && result.data) {
          const options: CarOption[] = result.data.map(v => {
            const key = v.name.toLowerCase().split(' ')[0];
            const image = BookingComponent.fallbackImages[key] ?? `${environment.apiUrl}/uploads/vehicle-documents/car-taxi.webp`;
            const price = v.expectedPriceAfterDiscount ?? v.expectedPrice;
            return { id: v.id, label: v.name, image, price, estimatedMinutes: v.estimatedTimeInMinutes };
          });
         
         this.carTypes.set(options.slice(0, 6));
          if (options.length > 0) this.selectedCar.set(options[0].id);
        }
      },
      error: () => {
        this.vehicleTypesRequestKey = '';
        this.carTypesLoading.set(false);
      },
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
    const info = this.distanceInfo();
    const totalSeconds = info ? info.durationInSeconds : (this.selectedCarOption()?.estimatedMinutes ?? 0) * 60;
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${h}hr : ${m}min : ${s}sec`;
  });
  readonly tripDistanceLabel = computed(() => {
    const info = this.distanceInfo();
    if (!info) return '—';
    return `${(info.distanceInMeters / 1000).toFixed(1)} km`;
  });
  readonly tripCostLabel = computed(() => {
    const info = this.distanceInfo();
    const cost = info ? info.estimatedCost : this.selectedCarOption()?.price;
    return cost != null ? cost : '—';
  });
  readonly isCarSelectorDisabled = computed(() => this.formModel().manyBags);
  readonly shouldShowManyBagsNotice = computed(() =>
    this.formModel().manyBags || this.selectedCarOption()?.label.toLowerCase().includes('van') === true,
  );

  readonly commissionPercentage = computed(() => this.appConfig.commissionPercentage());
  readonly showLoggedInContact = computed(() =>
    this.coreAuth.isAuthenticated() || this.loginService.isLoggedIn(),
  );

  readonly isCreatingTrip = signal(false);
  readonly isReschedulingTrip = signal(false);
  readonly rescheduleTripRequestId = signal<string | null>(null);
  readonly isRescheduleMode = computed(() => !!this.rescheduleTripRequestId());
  readonly createdTripId = signal<string | null>(null);
  readonly hotelImageSrc = signal<string>('assets/booking/logo-lines.png');
  readonly selectedHotelImageFile = signal<File | null>(null);
  readonly isOtherPlaceTypeSelected = computed(() => {
    const selectedPlaceTypeId = this.joinFormModel().placeTypeId;
    const otherPlaceType = this.placeTypes().find(p => p.name.toLowerCase() === 'other');
    return selectedPlaceTypeId === otherPlaceType?.id && !!otherPlaceType;
  });
  readonly selectedEntityTypeName = computed(() => {
    this.languageService.lang();
    const selectedPlaceTypeId = this.joinFormModel().placeTypeId;
    const selectedPlaceType = this.placeTypes().find(p => p.id === selectedPlaceTypeId);
    const selectedName = selectedPlaceType?.name?.trim() ?? '';

    if (selectedName.toLowerCase() === 'other') {
      return this.savedOtherEntityType() || this.languageService.translate('join.defaultEntityCompany');
    }

    return selectedName || this.languageService.translate('join.defaultEntityHotel');
  });
  readonly entityNameLabel = computed(() =>
    this.formatEntityNameText('join.entityNameLabelTemplate'),
  );
  readonly entityNamePlaceholder = computed(() =>
    this.formatEntityNameText('join.entityNamePlaceholderTemplate'),
  );
  readonly entityPhoneLabel = computed(() =>
    this.formatEntityNameText('join.entityPhoneLabelTemplate'),
  );
  readonly entityPhonePlaceholder = computed(() =>
    this.formatEntityNameText('join.entityPhonePlaceholderTemplate'),
  );
  readonly entityEmailLabel = computed(() =>
    this.formatEntityNameText('join.entityEmailLabelTemplate'),
  );
  readonly isOtherBankSelected = computed(() =>
    this.isOtherBankValue(this.joinFormModel().bankName),
  );

  onHotelImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedHotelImageFile.set(file);
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
    manyBags: false,
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

  protected onOtherBankInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.otherBankName.set(input.value);
  }

  protected saveOtherBankName(): void {
    const bankName = this.otherBankName();

    if (bankName.trim()) {
      this.savedOtherBankName.set(bankName.trim());
      this.otherBankName.set('');
    }
  }

  protected editOtherBankName(): void {
    this.otherBankName.set(this.savedOtherBankName());
    this.savedOtherBankName.set('');
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

  private setMapLocation(location: { lat: number; lng: number }): void {
    this.mapCenter.set([location.lat, location.lng]);
    this.weatherLat.set(location.lat);
    this.weatherLng.set(location.lng);
  }

  protected onDropOffSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value;
    this.dropOffSearchText.set(query);

    if (this.dropOffSearchTimer) {
      clearTimeout(this.dropOffSearchTimer);
    }

    if (query.trim().length < 3) {
      this.dropOffSuggestions.set([]);
      this.dropOffSuggestionsOpen.set(false);
      this.dropOffSuggestionsLoading.set(false);
      this.googleMapsLoader.resetAutocompleteSession();
      return;
    }

    this.dropOffSuggestionsLoading.set(true);
    const requestId = ++this.dropOffSearchRequestId;
    this.dropOffSearchTimer = setTimeout(() => {
      void this.loadDropOffSuggestions(query, requestId);
    }, 500);
  }

  protected onDropOffSearchFocus(): void {
    if (this.dropOffSuggestions().length > 0) {
      this.dropOffSuggestionsOpen.set(true);
    }
  }

  protected onDropOffSearchBlur(): void {
    setTimeout(() => this.dropOffSuggestionsOpen.set(false), 150);
  }

  protected selectDropOffSuggestion(suggestion: GooglePlaceSuggestion): void {
    this.dropOffSuggestionsLoading.set(true);
    void this.googleMapsLoader.resolvePlaceSuggestion(suggestion)
      .then((location) => {
        this.applyDropOffLocation(location);
        this.dropOffSuggestions.set([]);
        this.dropOffSuggestionsOpen.set(false);
      })
      .catch((error) => {
        console.warn('Google Maps place could not be resolved.', error);
        this.showError('Could not read this location. Please choose another result.');
      })
      .finally(() => this.dropOffSuggestionsLoading.set(false));
  }

  protected onJoinLocationChanged(location: LocationSelection): void {
    this.setJoinLocation(location);
  }

  private setJoinLocation(location: LocationSelection): void {
    this.joinSelectedLocation.set(location);
    this.joinFormModel.update((model) => ({
      ...model,
      address: location.address,
      locationUrl: this.googleMapsUrl(location),
      latitude: location.lat,
      longitude: location.lng,
    }));
  }

  private async loadDropOffSuggestions(query: string, requestId: number): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const [lat, lng] = this.mapCenter();
      const suggestions = await this.googleMapsLoader.fetchPlaceSuggestions(query, { lat, lng });
      if (requestId !== this.dropOffSearchRequestId) return;

      this.dropOffSuggestions.set(suggestions);
      this.dropOffSuggestionsOpen.set(suggestions.length > 0);
    } catch (error) {
      console.warn('Google Places search request failed.', error);
      if (!this.googleSearchLoadFailed) {
        this.googleSearchLoadFailed = true;
        this.showError(getGoogleMapsSearchErrorMessage(error));
      }
    } finally {
      if (requestId === this.dropOffSearchRequestId) {
        this.dropOffSuggestionsLoading.set(false);
      }
    }
  }

  private applyDropOffLocation(location: LocationSelection): void {
    const id = `google:${location.placeId ?? `${location.lat},${location.lng}`}`;
    const destination: LocationItem = {
      id,
      name: location.name || location.address,
      latitude: location.lat,
      longitude: location.lng,
    };

    this.googleDropOffLocation.set(location);
    this.dropOffSearchText.set(destination.name);
    this.formModel.update((model) => ({ ...model, destination: id }));
    this.distnationName.set(destination.name);
    this.selectedDestination.set(destination);
    this.loadVehicleTypes(50, destination.latitude, destination.longitude);
  }

  private getOriginCoordinates(): { lat: number; lng: number } {
    const profileLocation = this.getProfileMapLocation();
    if (profileLocation) return profileLocation;

    const [currentLat, currentLng] = this.mapCenter();

    return {
      lat: currentLat,
      lng: currentLng,
    };
  }

  private getProfileMapLocation(): { lat: number; lng: number } | null {
    const configuration = this.coreAuth.profile()?.configuration;
    return this.toMapLocation(configuration?.latitude, configuration?.longitude);
  }

  private toMapLocation(
    lat: number | null | undefined,
    lng: number | null | undefined,
  ): { lat: number; lng: number } | null {
    const isValid =
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      !(lat === 0 && lng === 0);

    return isValid ? { lat, lng } : null;
  }

  private loadDistanceInfo(destination: LocationItem, vehicleId: string): void {
    this.requestDistanceInfo(destination, vehicleId);
  }

  private requestDistanceInfo(
    destination: LocationItem,
    vehicleId: string,
    onValid?: (info: DistanceInfo) => void,
    force = false,
  ): void {
    const origin = this.getOriginCoordinates();
    const requestKey = `${origin.lat}:${origin.lng}:${destination.latitude}:${destination.longitude}:${vehicleId}`;
    if (!force && this.distanceInfoRequestKey === requestKey) {
      const info = this.distanceInfo();
      if (info) {
        onValid?.(info);
      }
      return;
    }

    this.distanceInfoRequestKey = requestKey;

    this.distanceInfoLoading.set(true);
    this.distanceInfo.set(null);
    console.log('Requesting distance info with payload:', {
      originLatitude: origin.lat,
      originLongitude: origin.lng,
      destinationLatitude: destination.latitude,
      destinationLongitude: destination.longitude,
    });
    this.mapsService.getDistanceInfo({
      originLatitude: origin.lat,
      originLongitude: origin.lng,
      destinationLatitude: destination.latitude,
      destinationLongitude: destination.longitude,
      vehicleId,
    }).pipe(this.takeUntilDestroyed()).subscribe({
      next: (result) => {
        this.distanceInfoLoading.set(false);
        if (result.isSuccess && result.data) {
          if (result.data.isValid === false) {
            this.distanceInfo.set(null);
            this.distanceInfoRequestKey = '';
            this.ShowComfirmBookingModel.set(false);
            this.showError(result.data.message || 'This trip is not available for the selected route.');
            return;
          }

          this.distanceInfo.set(result.data);
          onValid?.(result.data);
        } else {
          this.distanceInfoRequestKey = '';
          this.showError(result.error?.description || 'Failed to calculate trip distance. Please try again.');
        }
      },
      error: () => {
        this.distanceInfoLoading.set(false);
        this.distanceInfoRequestKey = '';
        this.showError('Failed to calculate trip distance. Please try again.');
      },
    });
  }

  private openConfirmationAfterDistanceValidation(
    mode: 'booking' | 'scheduled',
    scheduledAt: string | null,
  ): void {
    const destination = this.selectedDestination();
    if (!destination) {
      this.showError('Please select a destination.');
      return;
    }

    const vehicleId = this.selectedCar();
    if (!vehicleId) {
      this.showError('Please select a vehicle type.');
      return;
    }

    this.distnationName.set(destination.name);
    this.requestDistanceInfo(
      destination,
      vehicleId,
      () => {
        this.confirmationMode.set(mode);
        this.scheduledAtToConfirm.set(scheduledAt);
        if (mode === 'scheduled') {
          this.showPickupTimeModal.set(false);
        }
        this.ShowComfirmBookingModel.set(true);
      },
      true,
    );
  }

  private googleMapsUrl(location: LocationSelection): string {
    return `https://www.google.com/maps?q=${location.lat},${location.lng}`;
  }

  private getJoinCoordinates(form: JoinUsFormModel): { latitude: number; longitude: number } {
    const selectedLocation = this.joinSelectedLocation();

    return {
      latitude: this.toCoordinate(selectedLocation?.lat ?? form.latitude),
      longitude: this.toCoordinate(selectedLocation?.lng ?? form.longitude),
    };
  }

  private getJoinLocationUrl(form: JoinUsFormModel): string {
    const locationUrl = form.locationUrl?.trim();
    const selectedLocation = this.joinSelectedLocation();

    return locationUrl || (selectedLocation ? this.googleMapsUrl(selectedLocation) : '');
  }

  private toCoordinate(value: number | undefined): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
  }

  /* ── Join Us Modal ──────────────────────────────────── */
  readonly showJoinModal = signal(false);
  readonly showSiginInModal = signal(false);
  readonly ForgotPasswordMode = signal(false);
  readonly showVerificationModal = signal(false);
  readonly showWelcomeModal = signal(false);
  readonly otpDigits = signal<string[]>(['', '', '', '', '', '']);
  readonly joinStep = signal<1 | 2 | 3 | 4>(1);
  readonly ShowComfirmBookingModel = signal(false);
  readonly ShowRideRequestSentModel = signal(false);
  readonly showPickupTimeModal = signal(false);
readonly ShowScheduledRiderModel = signal(false);
  readonly confirmationMode = signal<'booking' | 'scheduled'>('booking');
  readonly scheduledAtToConfirm = signal<string | null>(null);
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
    latitude: undefined,
    longitude: undefined,
    logoUrl: '',
    placeTypeId: '',
    otherPlaceText: '',
    selectedPreferenceIds: [],
    bankAccountHolderName: '',
    bankName: '',
    bankAccountNumber: '',
    bankRoutingNumber: '',
    note: '',
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

  nextToServicePreferences(): void {
    if (!this.validateStep2()) return;
    this.joinStep.set(3);
  }

  nextToWithdrawal(): void {
    if (!this.validateStep3()) return;
    this.joinStep.set(4);
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
    const selectedLocation = this.joinSelectedLocation();
    const hasCoordinates =
      !!selectedLocation ||
      (typeof form.latitude === 'number' && Number.isFinite(form.latitude) &&
        typeof form.longitude === 'number' && Number.isFinite(form.longitude));

    if (!hasCoordinates) {
      this.showError('Please pick your location on the map.');
      return false;
    }

    return true;
  }

  private validateStep3(): boolean {
    return true;
  }

  private validateStep4(): boolean {
    const form = this.joinFormModel();
    if (!form.bankAccountHolderName?.trim()) {
      this.showError('Please enter the account holder name.');
      return false;
    }
    if (!form.bankName?.trim()) {
      this.showError('Please select a bank.');
      return false;
    }
    if (
      this.isOtherBankValue(form.bankName) &&
      !this.savedOtherBankName().trim() &&
      !this.otherBankName().trim()
    ) {
      this.showError('Please enter the bank name.');
      return false;
    }
    if (!form.bankAccountNumber?.trim()) {
      this.showError('Please enter your IBAN.');
      return false;
    }
    return true;
  }

  prevStep(): void {
    const step = this.joinStep();
    if (step === 4) this.joinStep.set(3);
    else if (step === 3) this.joinStep.set(2);
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
    this.openConfirmationAfterDistanceValidation('booking', null);
  }

  openComfirmBookingModel(): void {
    this.openConfirmationAfterDistanceValidation('booking', null);
  }

  CloseComfirmBookingModel(): void {
    this.ShowComfirmBookingModel.set(false);
    this.scheduledAtToConfirm.set(null);
  }

  confirmBooking(): void {
    const isScheduled = this.confirmationMode() === 'scheduled';
    this.createTrip(isScheduled, isScheduled ? this.scheduledAtToConfirm() : null);
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
      this.closeScheduledRiderModel();
      this.router.navigate(['/TripDetails', tripId]);
    }
  }

  openPickupTimeModal(): void {
    if (!this.coreAuth.isAuthenticated()) {
      this.signInModalOpen();
      return;
    }
    if (!this.selectedDestination()) {
      this.showError('Please select a destination.');
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

    this.openConfirmationAfterDistanceValidation('scheduled', this.getScheduledAt());
  }

  private getScheduledAt(): string {
    const now = new Date();
    const d = new Date(now);
    d.setDate(now.getDate() + this.selectedPickupDateIndex());
    d.setHours(this.selectedPickupHourIndex(), this.selectedPickupMinuteIndex(), 0, 0);
    return d.toISOString();
  }

  private createTrip(isScheduled: boolean, scheduledAt: string | null): void {
    const { clientName, roomNo, addDriverNote, driverNote } = this.formModel();
    const origin = this.getOriginCoordinates();
    const car = this.selectedCarOption();
    const destination = this.selectedDestination();
    if (!destination) {
      this.showError('Please select a destination.');
      return;
    }

    const payload: CreateTripRequest = {
      startLocation: { latitude: origin.lat, longitude: origin.lng, address: 'Current Location', order: 0 },
      endLocations: [{
        latitude: destination.latitude,
        longitude: destination.longitude,
        address: destination.name,
        order: 1,
      }],
      isScheduled,
      scheduledAt,
      vehicleTypeId: this.selectedCar(),
      paymentMethodId: '168ac692-3a98-8cb0-8934-019b1e8abaa8',
      userRewardId: null,
      paymentMethodType: 0,
      roomNumber: parseInt(roomNo, 10) || 0,
      guestName: clientName,
    };

    if (addDriverNote && driverNote.trim()) {
      payload.notes = driverNote.trim();
    }

    this.isCreatingTrip.set(true);
    this.tripRequestService.create(payload).pipe(this.takeUntilDestroyed()).subscribe({
      next: (result) => {
        this.isCreatingTrip.set(false);
        if (result.isSuccess) {
          this.createdTripId.set(result.data as string);
          this.ShowComfirmBookingModel.set(false);
          if (isScheduled) {
            this.ShowScheduledRiderModel.set(true);
          } else {
            this.ShowRideRequestSentModel.set(true);
          }
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
    if (!this.validateStep3()) {
      this.joinStep.set(3);
      return;
    }
    if (!this.validateStep4()) {
      this.joinStep.set(4);
      return;
    }

    const form = this.joinFormModel();

    this.isRegistering.set(true);
    const preferences = this.servicePreferencesModel();
    const allServices = this.allServicePreferences();
    const { latitude, longitude } = this.getJoinCoordinates(form);

    const payload: JoinUsFormModel = {
      ...form,
      locationUrl: this.getJoinLocationUrl(form),
      latitude,
      longitude,
      bankRoutingNumber: form.bankRoutingNumber?.trim() ?? '',
      bankName: this.isOtherBankValue(form.bankName)
        ? this.savedOtherBankName().trim() || this.otherBankName().trim()
        : form.bankName,
      selectedPreferenceIds: allServices
        .filter(service => preferences[service.serviceCode as keyof Omit<ServicePreferencesModel, 'additionalNote'>])
        .map(service => service.serviceId),
    };

    const imageFile = this.selectedHotelImageFile();
    const request$ = (imageFile ? this.imageUploadService.uploadImage(imageFile) : of('')).pipe(
      switchMap((logoUrl) => this.authService.Register({ ...payload, logoUrl })),
    );

       request$.pipe(this.takeUntilDestroyed()).subscribe({
      next: (result) => {
        this.isRegistering.set(false);

        if (result.isSuccess) {
          this.closeJoinModal();
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
            latitude: undefined,
            longitude: undefined,
            logoUrl: '',
            placeTypeId: '',
            otherPlaceText: '',
            selectedPreferenceIds: [],
            bankAccountHolderName: '',
            bankName: '',
            bankAccountNumber: '',
            bankRoutingNumber: '',
            note: '',
          });
          this.otherBankName.set('');
          this.savedOtherBankName.set('');
          this.joinSelectedLocation.set(null);
          this.selectedHotelImageFile.set(null);
          this.hotelImageSrc.set('assets/booking/logo-lines.png');
          
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

  private formatEntityNameText(key: string): string {
    this.languageService.lang();

    return this.languageService
      .translate(key)
      .replace('{entity}', this.selectedEntityTypeName());
  }

  private isOtherBankValue(value: string): boolean {
    const normalizedValue = this.normalizeBankName(value);

    if (!normalizedValue) return false;

    return this.banks().some((bank) => {
      const normalizedId = this.normalizeBankName(bank.id);
      const normalizedName = this.normalizeBankName(bank.name);

      return (
        (normalizedValue === normalizedId || normalizedValue === normalizedName) &&
        (normalizedId === 'other' || normalizedName === 'other' || normalizedName === 'اخرى' || normalizedName === 'أخرى' || normalizedName === 'andere')
      );
    });
  }

  private normalizeBankName(value: string): string {
    return value.trim().toLowerCase();
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
        } else if (this.coreAuth.isAuthenticated()) {
          this.showError(result.error?.description || 'Failed to load destinations.');
        }
      },
      error: () => {
        if (this.coreAuth.isAuthenticated()) {
          this.showError('Failed to load destinations. Please try again later.');
        }
      },
    });
  }
}
