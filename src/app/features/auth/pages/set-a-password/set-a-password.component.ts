import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
 import { RouterLink } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { BaseComponent } from '../../../../shared/base/base.component';
import {  form, FormField, required } from '@angular/forms/signals';
import { changePasswordData } from '../../models/change-password.model';

@Component({
  selector: 'app-set-a-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ RouterLink, IconComponent,FormField],
  templateUrl: './set-a-password.component.html',
  styleUrl: './set-a-password.component.css',
})
export class SetAPasswordComponent extends BaseComponent {
  private readonly api = inject(ApiService);
  protected readonly showPassword = signal(false);

  protected readonly loading = signal(false);
  protected readonly submitted = signal(false);
  protected readonly errorMessage = signal('');

  public  ChangePasswordModel = signal<changePasswordData>({
    newPassword: '',
    confirmPassword: ''
  });

  public ChangePasswordForm  = form(this.ChangePasswordModel, (schemaPath) => {
     required(schemaPath.newPassword, {message: 'new Password is required'});
  });

  onSubmit(): void {
    
    const fromModel = this.ChangePasswordModel();

    this.loading.set(true);
    this.errorMessage.set('');

    const  Code  = fromModel.newPassword;
    console.log(Code);
    this.api.post('/auth/forgot-password', { Code }).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
    });
  }


  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

}
