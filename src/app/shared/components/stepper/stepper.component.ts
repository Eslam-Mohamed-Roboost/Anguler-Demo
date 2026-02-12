/**
 * Multi-step wizard with step indicators and navigation.
 *
 * Usage:
 *   <app-stepper
 *     [steps]="[
 *       { key: 'info', label: 'Basic Info' },
 *       { key: 'details', label: 'Details' },
 *       { key: 'review', label: 'Review' }
 *     ]"
 *     [(activeStep)]="currentStep"
 *   />
 *
 *   @switch (currentStep()) {
 *     @case ('info') { <app-step-info /> }
 *     @case ('details') { <app-step-details /> }
 *     @case ('review') { <app-step-review /> }
 *   }
 *
 *   <div class="flex gap-2 mt-4">
 *     <app-btn (click)="stepper.prev()" [disabled]="stepper.isFirst()">Back</app-btn>
 *     <app-btn (click)="stepper.next()" [disabled]="stepper.isLast()">Next</app-btn>
 *   </div>
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';

export interface StepDef {
  key: string;
  label: string;
  description?: string;
  optional?: boolean;
}

@Component({
  selector: 'app-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.css',
})
export class StepperComponent {
  /** Step definitions */
  readonly steps = input.required<readonly StepDef[]>();

  /** Currently active step key — two-way binding */
  readonly activeStep = model<string>('');

  protected readonly activeIndex = computed(() => {
    const idx = this.steps().findIndex((s) => s.key === this.activeStep());
    return idx >= 0 ? idx : 0;
  });

  /** Whether the current step is the first */
  isFirst(): boolean {
    return this.activeIndex() === 0;
  }

  /** Whether the current step is the last */
  isLast(): boolean {
    return this.activeIndex() === this.steps().length - 1;
  }

  /** Go to the next step */
  next(): void {
    const steps = this.steps();
    const idx = this.activeIndex();
    if (idx < steps.length - 1) {
      this.activeStep.set(steps[idx + 1].key);
    }
  }

  /** Go to the previous step */
  prev(): void {
    const steps = this.steps();
    const idx = this.activeIndex();
    if (idx > 0) {
      this.activeStep.set(steps[idx - 1].key);
    }
  }

  /** Go to a specific step by index */
  goTo(index: number): void {
    const steps = this.steps();
    if (index >= 0 && index < steps.length) {
      this.activeStep.set(steps[index].key);
    }
  }

  protected stepStatus(index: number): 'completed' | 'active' | 'upcoming' {
    const active = this.activeIndex();
    if (index < active) return 'completed';
    if (index === active) return 'active';
    return 'upcoming';
  }

  protected dotClasses(index: number): string {
    const status = this.stepStatus(index);
    const base = 'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors';
    switch (status) {
      case 'completed':
        return `${base} bg-blue-600 text-white`;
      case 'active':
        return `${base} border-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400`;
      default:
        return `${base} border-2 border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500`;
    }
  }

  protected lineClasses(index: number): string {
    return this.stepStatus(index) === 'completed'
      ? 'bg-blue-600 dark:bg-blue-500'
      : 'bg-gray-300 dark:bg-gray-600';
  }
}
