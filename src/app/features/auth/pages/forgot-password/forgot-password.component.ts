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
import { forgotPasswordData } from '../../models/forgotPassword.model';
import { email, form, FormField, required } from '@angular/forms/signals';

@Component({
  selector: 'app-forgot-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ RouterLink, IconComponent,FormField],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent extends BaseComponent {
  private readonly api = inject(ApiService);

  protected readonly loading = signal(false);
  protected readonly submitted = signal(false);
  protected readonly errorMessage = signal('');

  public  ForgetPasswordModel = signal<forgotPasswordData>({
    email: ''
  });

  public forgotForm  = form(this.ForgetPasswordModel, (schemaPath) => {
     required(schemaPath.email, {message: 'Email is required'});
     email(schemaPath.email, {message: 'Enter a valid email address'});
  });

  onSubmit(): void {
    
    const fromModel = this.ForgetPasswordModel();

    this.loading.set(true);
    this.errorMessage.set('');

    const  email  = fromModel.email;
    console.log(email);
    this.api.post('/auth/forgot-password', { email }).subscribe({
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
}
