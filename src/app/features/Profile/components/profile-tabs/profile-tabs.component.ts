import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
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
import { HotelProfileData, ProfileService } from '../../services/profile.service';
import { NotificationStore } from '../../../../core/stores/notification.store';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { CitiesService } from '../../../booking/components/services/cities.service';
import { Bank, BankService } from '../../../booking/components/services/bank.service';
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
  private readonly bankService = inject(BankService);

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
  private readonly currentHotelProfile = signal<HotelProfileData | null>(null);
  readonly cities = signal<{ id: string; name: string }[]>([]);
  protected readonly banks = signal<Bank[]>([]);
  protected readonly banksLoading = signal(false);
  protected readonly otherBankName = signal('');
  private readonly otherBankOption: Bank = { id: 'Other', name: 'Other' };
  protected readonly bankOptions = computed<Bank[]>(() => {
    const options = this.banks().map((bank) => ({ ...bank, id: bank.name }));
    const hasOther = options.some((bank) => this.isOtherBankValue(bank.id) || this.isOtherBankValue(bank.name));

    return hasOther ? options : [...options, this.otherBankOption];
  });
  protected readonly isOtherBankSelected = computed(() => this.isOtherBankValue(this.withdrawalModel().bankName));
  protected readonly bankNameDisplay = computed(() => {
    const bankName = this.withdrawalModel().bankName;

    return this.isOtherBankValue(bankName) ? this.otherBankName() : bankName;
  });
  protected readonly cityDisplay = computed(() => {
    const cityId = this.hotelInfoModel().city;
    const city = this.cities().find((item) => item.id === cityId);

    return city?.name ?? this.currentHotelProfile()?.cityName ?? cityId;
  });

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
    this.loadBanks();
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
            this.currentHotelProfile.set(result.data);
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
              accountHolderName: result.data.bankAccountHolderName ?? result.data.accountHolderName,
              swiftCode: result.data.bankRoutingNumber ?? '',
            });
            this.syncCustomBankSelection();
          } else {
            this.notifications.showError(result.error?.description ?? 'Failed to load withdrawal details');
          }
        },
        error: () => {
          this.withdrawalLoading.set(false);
        },
      });
  }

  ChangeDiableForHotelInfo(): void {
    this.DisableHotleInfo.set(!this.DisableHotleInfo());
  }

  ChangeDiableForwithdrawal(): void {
    this.Disablewithdrawal.set(!this.Disablewithdrawal());
  }

  protected onOtherBankNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.otherBankName.set(input.value);
  }

  submitChangePassword(): void {
    const { currentPassword, newPassword, confirmPassword } = this.passwordModel();
    console.log('Submitting password change:', { currentPassword, newPassword, confirmPassword });

    if (!currentPassword || !newPassword || !confirmPassword) {
      this.passwordError.set('All password fields are required.');
      return;
    }
    console.log('Submitting password change:', { currentPassword, newPassword, confirmPassword });

    if (newPassword !== confirmPassword) {
      this.passwordError.set('New password and confirmation do not match.');
      return;
    }

    this.passwordLoading.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(false);
    console.log('Submitting password change:', { currentPassword, newPassword, confirmPassword });
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
          console.log(result);
          if (result.isSuccess) {
            this.passwordSuccess.set(true);
            this.passwordModel.set({ currentPassword: '', newPassword: '', confirmPassword: '' });
          } else {
            this.passwordError.set(result.error?.description ?? 'Failed to change password.');
          }
        },
        error: (error: unknown) => {
          this.passwordLoading.set(false);
          this.passwordError.set(this.getErrorMessage(error, 'Failed to change password.'));
        },
      });
  }

  submitHotelInfo(): void {
    const model = this.hotelInfoModel();
    this.hotelInfoLoading.set(true);

    this.profileService
      .updateHotelProfile({
        ...this.emptyHotelProfile(),
        ...this.currentHotelProfile(),
        id: this.currentHotelProfile()?.id ?? '',
        hotelName: model.name,
        address: model.address,
        phoneNumber: model.phone,
        email: model.email,
        cityId: model.city,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.hotelInfoLoading.set(false);
          if (result.isSuccess) {
            if (result.data) {
              this.currentHotelProfile.set(result.data);
            }
            this.notifications.showSuccess('Hotel profile updated successfully');
            this.DisableHotleInfo.set(true);
          } else {
            this.notifications.showError(result.error?.description ?? 'Failed to update hotel profile');
          }
        },
        error: () => {
          this.hotelInfoLoading.set(false);
        },
      });
  }

  submitWithdrawalDetails(): void {
    const model = this.withdrawalModel();
    const bankName = this.isOtherBankValue(model.bankName) ? this.otherBankName().trim() : model.bankName.trim();

    if (!bankName) {
      this.notifications.showError('Please enter the bank name.');
      return;
    }

    this.withdrawalLoading.set(true);

    this.profileService
      .updateWithdrawalDetails({
        bankAccountHolderName: model.accountHolderName,
        bankName,
        bankAccountNumber: model.accountNumber,
        bankRoutingNumber: model.swiftCode?.trim() ?? '',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.withdrawalLoading.set(false);
          if (result.isSuccess) {
            this.notifications.showSuccess('Withdrawal details updated successfully');
            this.withdrawalModel.update((current) => ({ ...current, bankName }));
            this.syncCustomBankSelection();
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
            } else if (currentCity && response.data.items.length > 0) {
              // City id is stale, so keep the form selectable with a valid option.
              this.hotelInfoModel.update(m => ({ ...m, city: response.data!.items[0].id }));
            }
          }
        },
      });
  }

  private loadBanks(): void {
    this.banksLoading.set(true);

    this.bankService.getBanks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.banksLoading.set(false);
          if (response.isSuccess && response.data?.banks) {
            this.banks.set(response.data.banks);
            this.syncCustomBankSelection();
          } else {
            this.notifications.showError(response.error?.description ?? 'Failed to load banks.');
          }
        },
        error: () => {
          this.banksLoading.set(false);
        },
      });
  }

  private syncCustomBankSelection(): void {
    const currentBankName = this.withdrawalModel().bankName.trim();

    if (!currentBankName || this.isOtherBankValue(currentBankName) || this.isKnownBank(currentBankName)) {
      return;
    }

    this.otherBankName.set(currentBankName);
    this.withdrawalModel.update((model) => ({ ...model, bankName: 'Other' }));
  }

  private isKnownBank(value: string): boolean {
    const normalizedValue = this.normalizeBankName(value);

    return this.banks().some((bank) => {
      const normalizedId = this.normalizeBankName(bank.id);
      const normalizedName = this.normalizeBankName(bank.name);

      return normalizedValue === normalizedId || normalizedValue === normalizedName;
    });
  }

  private isOtherBankValue(value: string): boolean {
    const normalizedValue = this.normalizeBankName(value);

    return normalizedValue === 'other' || normalizedValue === 'اخرى' || normalizedValue === 'أخرى' || normalizedValue === 'andere';
  }

  private normalizeBankName(value: string): string {
    return value.trim().toLowerCase();
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) {
      return fallback;
    }

    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error.trim();
    }

    if (error.error && typeof error.error === 'object') {
      const body = error.error as Record<string, unknown>;
      const message = body['message'] ?? body['title'] ?? body['detail'];
      const resultError = body['error'];

      if (typeof message === 'string' && message.trim()) {
        return message.trim();
      }

      if (resultError && typeof resultError === 'object') {
        const description = (resultError as Record<string, unknown>)['description'];
        if (typeof description === 'string' && description.trim()) {
          return description.trim();
        }
      }
    }

    return error.statusText && error.statusText !== 'OK' ? error.statusText : fallback;
  }

  private emptyHotelProfile(): HotelProfileData {
    return {
      id: '',
      hotelName: '',
      address: '',
      phoneNumber: '',
      email: '',
      cityId: '',
      cityName: '',
      locationUrl: '',
      logoUrl: '',
      commissionRate: 0,
      isActive: true,
      isVerified: true,
      code: '',
    };
  }
}
