import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { HotelDetailsService } from '../../../hotel-details/services/hotel-details.service';
import { NotificationStore } from '../../../../core/stores/notification.store';
import { AppConfigService } from '../../../../core/services/app-config.service';

@Component({
  selector: 'app-hotels-commissions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IconComponent, TranslatePipe],
  templateUrl: './hotels-commissions.component.html',
  styleUrl: './hotels-commissions.component.css',
})
export class HotelsCommissionsComponent {
  private readonly hotelService = inject(HotelDetailsService);
  private readonly notifications = inject(NotificationStore);
  private readonly appConfig = inject(AppConfigService);
  private readonly destroyRef = inject(DestroyRef);

  readonly commission = signal<number>(0);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly closeClick = output<void>();

  ngOnInit(): void {
    this.loadCommission();
  }

  private loadCommission(): void {
    this.loading.set(true);
    this.hotelService
      .getGlobalCommission()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(false);
          if (result.isSuccess && result.data !== null && result.data !== undefined) {
            this.commission.set(result.data);
            this.appConfig.setCommissionPercentage(result.data);
          } else {
            this.notifications.showError(result.error?.description ?? 'Failed to load commission.');
          }
        },
        error: () => {
          this.loading.set(false);
          this.notifications.showError('Failed to load commission.');
        },
      });
  }

  saveChanges(): void {
    const newCommission = this.commission();

    if (newCommission < 0 || newCommission > 100) {
      this.notifications.showError('Commission must be between 0 and 100.');
      return;
    }

    this.saving.set(true);
    this.hotelService
      .updateHotelCommission(newCommission)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.saving.set(false);
          if (result.isSuccess) {
            this.appConfig.setCommissionPercentage(newCommission);
            this.notifications.showSuccess('Global commission updated successfully. Changes effective from 12:00 AM.');
            this.closeClick.emit();
          } else {
            this.notifications.showError(result.error?.description ?? 'Failed to update commission.');
          }
        },
        error: () => {
          this.saving.set(false);
          this.notifications.showError('Failed to update global commission.');
        },
      });
  }

  onClose(): void {
    this.closeClick.emit();
  }

  onCommissionChange(event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value);
    if (!isNaN(value)) {
      this.commission.set(value);
    }
  }
}
