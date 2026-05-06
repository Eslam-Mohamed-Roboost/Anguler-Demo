import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { PasswordInputComponent } from '../../../../shared/components/password-input/password-input.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { LanguageService } from '../../../../core/services/language.service';
import { form } from '@angular/forms/signals';
import { TabDef } from '../../models/TabDef-mode';
import { HotelInfoModel } from '../../models/HotelInfo-model';
import { PasswordModel } from '../../models/Password-model';
import { WithdrawalModel } from '../../models/Withdrawal-model';
import { ProfileService } from '../../services/profile.service';
import { NotificationStore } from '../../../../core/stores/notification.store';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { CitiesService } from '../../../booking/components/services/cities.service';
import { BaseComponent } from '../../../../shared/base/base.component';

@Component({
  selector: 'app-profile-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputComponent, PasswordInputComponent, TranslatePipe, SelectComponent],
  templateUrl: './profile-tabs.component.html',
  styleUrl: './profile-tabs.component.css',
})
export class ProfileTabsComponent extends BaseComponent implements OnInit {
  private readonly langService = inject(LanguageService);
  private readonly profileService = inject(ProfileService);
  private readonly notifications = inject(NotificationStore);
   private readonly citiesService = inject(CitiesService);

  readonly lang = this.langService.lang;

  protected readonly tabs: TabDef[] = [
    { key: 'hotel-info', label: 'profile.hotelInfo' },
    { key: 'password', label: 'profile.password' },
    { key: 'withdrawal', label: 'profile.withdrawalDetails' },
  ];

  protected readonly activeTab = signal('hotel-info');
  protected readonly DisableHotleInfo = signal(true);
  protected readonly Disablewithdrawal = signal(true);
  protected readonly passwordLoading = signal(false);
  protected readonly passwordError = signal<string | null>(null);
  protected readonly passwordSuccess = signal(false);
  protected readonly hotelInfoLoading = signal(false);
  protected readonly withdrawalLoading = signal(false);
  readonly cities = signal<{ id: string; name: string }[]>([]);

  protected readonly hotelInfoModel = signal<HotelInfoModel>({
    name: '',
    city: '',
    address: '',
    phone: '',
    email: '',
  });

  protected readonly passwordModel = signal<PasswordModel>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  protected readonly withdrawalModel = signal<WithdrawalModel>({
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    swiftCode: '',
  });

  protected readonly hotelFields = form(this.hotelInfoModel);
  protected readonly passwordFields = form(this.passwordModel);
  protected readonly withdrawalFields = form(this.withdrawalModel);

  ngOnInit(): void {
    this.loadHotelProfile();
    this.loadWithdrawalDetails();
    this.loadCities();
  }

  private loadHotelProfile(): void {
    this.hotelInfoLoading.set(true);
    this.profileService
      .getHotelProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.hotelInfoLoading.set(false);
          if (result.isSuccess && result.data) {
            this.hotelInfoModel.set({
              name: result.data.hotelName,
              city: result.data.cityId,
              address: result.data.address,
              phone: result.data.phoneNumber,
              email: result.data.email,
            });
          } else {
            this.notifications.showError(result.error?.description ?? 'Failed to load hotel profile');
          }
        },
        error: () => {
          this.hotelInfoLoading.set(false);
          this.notifications.showError('Failed to load hotel profile');
        },
      });
  }

  private loadWithdrawalDetails(): void {
    this.withdrawalLoading.set(true);
    this.profileService
      .getWithdrawalDetails()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.withdrawalLoading.set(false);
          if (result.isSuccess && result.data) {
            this.withdrawalModel.set({
              bankName: result.data.bankName,
              accountNumber: result.data.bankAccountNumber,
              accountHolderName: result.data.accountHolderName,
              swiftCode: result.data.bankRoutingName,
            });
          } else {
            this.notifications.showError(result.error?.description ?? 'Failed to load withdrawal details');
          }
        },
        error: () => {
          this.withdrawalLoading.set(false);
          this.notifications.showError('Failed to load withdrawal details');
        },
      });
  }

  ChangeDiableForHotelInfo(): void {
    this.DisableHotleInfo.set(!this.DisableHotleInfo());
  }

  ChangeDiableForwithdrawal(): void {
    this.Disablewithdrawal.set(!this.Disablewithdrawal());
  }

  submitChangePassword(): void {
    const { currentPassword, newPassword, confirmPassword } = this.passwordModel();

    if (!currentPassword || !newPassword || !confirmPassword) {
      this.passwordError.set('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      this.passwordError.set('New password and confirmation do not match.');
      return;
    }

    this.passwordLoading.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(false);

    this.profileService
      .changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.passwordLoading.set(false);
          if (result.isSuccess) {
            this.passwordSuccess.set(true);
            this.passwordModel.set({ currentPassword: '', newPassword: '', confirmPassword: '' });
          } else {
            this.passwordError.set(result.error?.description ?? 'Failed to change password.');
          }
        },
        error: () => {
          this.passwordLoading.set(false);
          this.passwordError.set('An unexpected error occurred.');
        },
      });
  }

  submitHotelInfo(): void {
    const model = this.hotelInfoModel();
    this.hotelInfoLoading.set(true);

    this.profileService
      .updateHotelProfile({
        id: '',
        hotelName: model.name,
        address: model.address,
        phoneNumber: model.phone,
        email: model.email,
        cityId: model.city,
        locationUrl: '',
        logoUrl: '',
        commissionRate: 0,
        isActive: true,
        isVerified: true,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.hotelInfoLoading.set(false);
          if (result.isSuccess) {
            this.notifications.showSuccess('Hotel profile updated successfully');
            this.DisableHotleInfo.set(true);
          } else {
            this.notifications.showError(result.error?.description ?? 'Failed to update hotel profile');
          }
        },
        error: () => {
          this.hotelInfoLoading.set(false);
          this.notifications.showError('Failed to update hotel profile');
        },
      });
  }

  submitWithdrawalDetails(): void {
    const model = this.withdrawalModel();
    this.withdrawalLoading.set(true);

    this.profileService
      .updateWithdrawalDetails({
        bankName: model.bankName,
        bankAccountNumber: model.accountNumber,
        bankRoutingNumber: model.swiftCode,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.withdrawalLoading.set(false);
          if (result.isSuccess) {
            this.notifications.showSuccess('Withdrawal details updated successfully');
            this.Disablewithdrawal.set(true);
          } else {
            this.notifications.showError(result.error?.description ?? 'Failed to update withdrawal details');
          }
        },
        error: () => {
          this.withdrawalLoading.set(false);
          this.notifications.showError('Failed to update withdrawal details');
        },
      });
  }
  
  private loadCities(): void {
    this.citiesService.getCities(undefined, 50, 1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data) {
            this.cities.set(response.data.items);
            const currentCity = this.hotelInfoModel().city;
            const cityExists = response.data.items.some(c => c.id === currentCity);

            if (cityExists) {
              // City is valid, keep it
            } else if (response.data.items.length > 0) {
              // City not found or empty, set first city as default
              this.hotelInfoModel.update(m => ({ ...m, city: response.data!.items[0].id }));
            }
          }
        },
        error: () => {
          this.notifications.showError('Failed to load cities');
        },
      });
  }
}
