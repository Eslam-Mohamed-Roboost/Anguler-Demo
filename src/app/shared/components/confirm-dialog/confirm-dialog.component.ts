// Global confirm dialog — mounted once in AppComponent, driven by ConfirmDialogService
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { BtnComponent } from '../btn/btn.component';
import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent, BtnComponent],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialogComponent {
  protected readonly dialog = inject(ConfirmDialogService);

  protected readonly isOpen = computed(() => this.dialog.state() !== null);
  protected readonly title = computed(() => this.dialog.state()?.title ?? '');
  protected readonly message = computed(() => this.dialog.state()?.message ?? '');
  protected readonly confirmLabel = computed(
    () => this.dialog.state()?.confirmLabel ?? $localize`:@@shared.confirm.ok:Confirm`,
  );
  protected readonly cancelLabel = computed(
    () => this.dialog.state()?.cancelLabel ?? $localize`:@@shared.confirm.cancel:Cancel`,
  );
  protected readonly confirmVariant = computed(
    () => this.dialog.state()?.confirmVariant ?? 'primary',
  );
}
