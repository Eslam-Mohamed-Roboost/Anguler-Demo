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
import { form, FormField, required } from '@angular/forms/signals';
import { verifyCodeData } from '../../models/verify-code.model';

@Component({
  selector: 'app-verify-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ RouterLink, IconComponent,FormField],
  templateUrl: './verify-code.component.html',
  styleUrl: './verify-code.component.css',
})
export class VerifyCodeComponent extends BaseComponent {
  private readonly api = inject(ApiService);

  protected readonly loading = signal(false);
  protected readonly submitted = signal(false);
  protected readonly errorMessage = signal('');

  public  verifyCodeModel = signal<verifyCodeData>({
    code: ''
  });

  public verifyCodeForm  = form(this.verifyCodeModel, (schemaPath) => {
     required(schemaPath.code, {message: 'Code is required'});
  });

  onSubmit(): void {
    
    const fromModel = this.verifyCodeModel();

    this.loading.set(true);
    this.errorMessage.set('');

    const  Code  = fromModel.code;
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

  resend(): void{
         const fromModel = this.verifyCodeModel();

    this.loading.set(true);
    this.errorMessage.set('');

    const  Code  = fromModel.code;
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
}
