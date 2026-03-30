import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
 import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { LoginData } from '../../models/LoginData.model';
import { email, form, FormField, required } from '@angular/forms/signals';
import { BaseComponent } from '../../../../shared/base/base.component';
 
@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ RouterLink, IconComponent,FormField],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent extends BaseComponent {

  public  loginModel = signal<LoginData>({
    email: '',
    password: '',
    rememberMe: false,
  });

   public loginForm  = form(this.loginModel, (schemaPath) => {
     required(schemaPath.email, {message: 'Email is required'});
     email(schemaPath.email, {message: 'Enter a valid email address'});
    required(schemaPath.password, {message: 'Password is required'});
  });
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly showPassword = signal(false);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  // protected readonly form = this.fb.nonNullable.group({
  //   email: ['', [Validators.required, Validators.email]],
  //   password: ['', [Validators.required, Validators.minLength(6)]],
  //   rememberMe: [false],
  // });

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    // if (this.form.invalid) {
    //   this.form.markAllAsTouched();
    //   return;
    // }

    this.loading.set(true);
    this.errorMessage.set('');
    const formData = this.loginModel()
    var email  = formData.email;
    var  password  = formData.password;
    var  rememberMe  = formData.rememberMe;

    console.log(email);
    console.log(password);
    console.log(rememberMe);

    this.authService.login(email, password).subscribe({
      next: (result) => {
        this.loading.set(false);
        if (result.isSuccess) {
          this.router.navigate(['/home']);
        } else {
          this.errorMessage.set(result.error?.description ?? 'Invalid email or password');
        }
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Something went wrong. Please try again.');
      },
    });
  }
}
