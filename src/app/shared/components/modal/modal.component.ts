/**
 * Shared reusable modal — content projection via ng-content.
 *
 * Animated with Angular animations:
 *   - Enter: backdrop fades in + panel scales up
 *   - Leave: backdrop fades out + panel scales down
 */
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  Injector,
  input,
  output,
  viewChild,
} from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
  group,
  query,
} from '@angular/animations';
import { IconComponent } from '../icon/icon.component';

const MODAL_ANIMATION = trigger('modalAnimation', [
  transition(':enter', [
    group([
      query('.modal-backdrop', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      query('.modal-panel', [
        style({ transform: 'scale(0.95) translateY(-10px)', opacity: 0 }),
        animate(
          '200ms cubic-bezier(0, 0, 0.2, 1)',
          style({ transform: 'scale(1) translateY(0)', opacity: 1 }),
        ),
      ]),
    ]),
  ]),
  transition(':leave', [
    group([
      query('.modal-backdrop', [
        animate('150ms ease-in', style({ opacity: 0 })),
      ]),
      query('.modal-panel', [
        animate(
          '150ms cubic-bezier(0.4, 0, 1, 1)',
          style({ transform: 'scale(0.95)', opacity: 0 }),
        ),
      ]),
    ]),
  ]),
]);

@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  animations: [MODAL_ANIMATION],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {
  /** Whether the modal is visible */
  readonly open = input.required<boolean>();

  /** Title displayed in the header — omit for a headerless modal */
  readonly title = input('');

  /** Whether clicking the backdrop closes the modal (default: true) */
  readonly closeOnBackdrop = input(true);

  /** Emitted when the modal requests to close */
  readonly closed = output<void>();

  /** Reference to the dialog panel for focus management */
  protected readonly dialogPanel =
    viewChild<ElementRef<HTMLElement>>('dialogPanel');

  private readonly injector = inject(Injector);

  /** Auto-focus the dialog panel when opened — SSR safe */
  private readonly autoFocus = effect(() => {
    if (this.open()) {
      afterNextRender(
        () => {
          this.dialogPanel()?.nativeElement?.focus();
        },
        { injector: this.injector },
      );
    }
  });

  protected close(): void {
    this.closed.emit();
  }

  protected onBackdropClick(): void {
    if (this.closeOnBackdrop()) {
      this.close();
    }
  }
}
