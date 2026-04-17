import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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

@Component({
  selector: 'app-profile-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputComponent, PasswordInputComponent, TranslatePipe],
  templateUrl: './profile-tabs.component.html',
  styleUrl: './profile-tabs.component.css',
})
export class ProfileTabsComponent {
  private readonly langService = inject(LanguageService);
  private readonly profileService = inject(ProfileService);

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

  protected readonly hotelInfoModel = signal<HotelInfoModel>({
    name: 'Salam Hotel',
    city: 'Cairo',
    address: '123 Main Street, Downtown',
    phone: '+20 123 456 7890',
    email: 'info@salamhotel.com',
  });

  protected readonly passwordModel = signal<PasswordModel>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  protected readonly withdrawalModel = signal<WithdrawalModel>({
    bankName: 'National Bank of Egypt',
    accountNumber: '**** **** **** 1234',
    accountHolderName: 'Salam Hotel',
    swiftCode: 'NBEGEGCX',
  });

  protected readonly hotelFields = form(this.hotelInfoModel);
  protected readonly passwordFields = form(this.passwordModel);
  protected readonly withdrawalFields = form(this.withdrawalModel);

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
}
