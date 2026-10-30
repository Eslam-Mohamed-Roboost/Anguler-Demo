import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, output, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import type { TranslationKey } from '../../../../core/i18n/translations';
import { LanguageService } from '../../../../core/services/language.service';
import { NotificationStore } from '../../../../core/stores/notification.store';
import { FeedbackService } from '../../services/feedback.service';
import type { TripDriver } from '../../models/trip-details.model';

const FEEDBACK_TAGS: readonly TranslationKey[] = [
  'tripDetails.tag.politeDriver',
  'tripDetails.tag.luggageHelp',
  'tripDetails.tag.smoothDriving',
  'tripDetails.tag.cleanCar',
  'tripDetails.tag.goodConversation',
  'tripDetails.tag.onTimeArrival',
  'tripDetails.tag.followedRoute',
  'tripDetails.tag.respectful',
  'tripDetails.tag.feltSafe',
];

@Component({
  selector: 'app-rate-trip-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent, IconComponent, TranslatePipe, ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './rate-trip-modal.component.html',
  styleUrl: './rate-trip-modal.component.css',
})
export class RateTripModalComponent {
  private readonly feedbackService = inject(FeedbackService);
  private readonly language = inject(LanguageService);
  private readonly notifications = inject(NotificationStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly open = input.required<boolean>();
  readonly tripId = input.required<string>();
  readonly driver = input<TripDriver | null>(null);

  readonly closed = output<void>();
  readonly submitted = output<number>();

  protected readonly tags = FEEDBACK_TAGS;
  protected readonly stars = [1, 2, 3, 4, 5];
  protected readonly step = signal<'tags' | 'comment'>('tags');
  protected readonly rating = signal(0);
  protected readonly selectedTags = signal<ReadonlySet<TranslationKey>>(new Set());
  protected readonly saving = signal(false);
  protected readonly avatarFailed = signal(false);
  protected readonly driverInitial = computed(() => this.driver()?.fullName?.trim().charAt(0).toUpperCase() || '?');
  protected readonly comment = new FormControl('', { nonNullable: true });
  protected readonly canSubmit = computed(() => this.rating() > 0 && !this.saving());

  private readonly resetOnOpen = effect(() => {
    if (this.open()) {
      this.step.set('tags');
      this.avatarFailed.set(false);
      this.rating.set(0);
      this.selectedTags.set(new Set());
      this.comment.reset('');
    }
  });

  protected setRating(value: number): void {
    this.rating.set(value);
  }

  protected isTagSelected(tag: TranslationKey): boolean {
    return this.selectedTags().has(tag);
  }

  protected toggleTag(tag: TranslationKey): void {
    this.selectedTags.update(current => {
      const next = new Set(current);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }

  protected showComment(): void {
    this.step.set('comment');
  }

  protected showTags(): void {
    this.step.set('tags');
  }

  protected close(): void {
    if (!this.saving()) {
      this.closed.emit();
    }
  }

  protected submit(): void {
    if (!this.canSubmit()) {
      this.notifications.showError(this.language.translate('tripDetails.ratingRequired'));
      return;
    }

    const rating = this.rating();
    const parts = [...this.selectedTags()].map(tag => this.language.translate(tag));
    const text = this.comment.value.trim();
    if (text) parts.push(text);

    this.saving.set(true);
    this.feedbackService
      .submitFeedback(this.tripId(), rating, parts.join(', '))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.saving.set(false);
          if (result.isSuccess) {
            this.notifications.showSuccess(this.language.translate('tripDetails.feedbackThanks'));
            this.submitted.emit(rating);
          } else {
            this.notifications.showError(result.error?.description ?? this.language.translate('tripDetails.feedbackError'));
          }
        },
        error: () => {
          this.saving.set(false);
          this.notifications.showError(this.language.translate('tripDetails.feedbackError'));
        },
      });
  }
}
