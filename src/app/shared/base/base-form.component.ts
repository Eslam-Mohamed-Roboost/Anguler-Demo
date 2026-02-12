// Abstract form component — uses Signal Forms for model + field tree + schema validation
import { signal } from '@angular/core';
import { form, submit } from '@angular/forms/signals';
import type { SchemaPathTree } from '@angular/forms/signals';
import { BaseComponent } from './base.component';

export abstract class BaseFormComponent<T extends object> extends BaseComponent {
  protected readonly model = signal<T>(this.initialValue());
  protected readonly fieldTree = form(this.model, (s) =>
    this.buildSchema(s as SchemaPathTree<T>),
  );
  protected readonly submitLoading = signal(false);

  abstract initialValue(): T;
  abstract buildSchema(schemaPath: SchemaPathTree<T>): void;
  abstract onSubmit(value: T): Promise<void> | void;

  handleSubmit(event: Event): void {
    event.preventDefault();

    submit(this.fieldTree, async () => {
      this.submitLoading.set(true);
      try {
        await this.onSubmit(this.model());
      } finally {
        this.submitLoading.set(false);
      }
    });
  }

  resetForm(): void {
    this.model.set(this.initialValue());
  }

  patchForm(partial: Partial<T>): void {
    this.model.update((m) => ({ ...m, ...partial }));
  }
}
