import { Component, signal } from '@angular/core';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { PasswordInputComponent } from '../../../../shared/components/password-input/password-input.component';
import { form } from '@angular/forms/signals';
import {TabDef} from '../../models/TabDef-mode'
import {HotelInfoModel} from '../../models/HotelInfo-model'
import {PasswordModel} from '../../models/Password-model'
import {WithdrawalModel} from '../../models/Withdrawal-model'
@Component({
  selector: 'app-profile-tabs',
  imports: [InputComponent, PasswordInputComponent],
  templateUrl: './profile-tabs.component.html',
  styleUrl: './profile-tabs.component.css',
})
export class ProfileTabsComponent {
  protected readonly tabs: TabDef[] = [
    { key: 'hotel-info', label: 'Hotel Info.' },
    { key: 'password', label: 'Password' },
    { key: 'withdrawal', label: 'Withdrawal Details' }
  ];
  
  protected readonly activeTab = signal('hotel-info');
  protected readonly DisableHotleInfo = signal(true);
  protected readonly Disablewithdrawal = signal(true);


  // Form models
  protected readonly hotelInfoModel = signal<HotelInfoModel>({
    name: 'Salam Hotel',
    city: 'Cairo',
    address: '123 Main Street, Downtown',
    phone: '+20 123 456 7890',
    email: 'info@salamhotel.com'
  });
  
  protected readonly passwordModel = signal<PasswordModel>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  protected readonly withdrawalModel = signal<WithdrawalModel>({
    bankName: 'National Bank of Egypt',
    accountNumber: '**** **** **** 1234',
    accountHolderName: 'Salam Hotel',
    swiftCode: 'NBEGEGCX'
  });
  
  // Form fields for the input components
  protected readonly hotelFields = form(this.hotelInfoModel);
  protected readonly passwordFields = form(this.passwordModel);
  protected readonly withdrawalFields = form(this.withdrawalModel);


  ChangeDiableForHotelInfo():void{
    this.DisableHotleInfo.set(!this.DisableHotleInfo());
  }
  
  ChangeDiableForwithdrawal():void{
    this.Disablewithdrawal.set(!this.Disablewithdrawal());
  }
}
