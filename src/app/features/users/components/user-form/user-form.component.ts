// User form — extends BaseFormComponent with Signal Forms for create/edit
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { required, email } from '@angular/forms/signals';
import type { SchemaPathTree } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { BaseFormComponent } from '../../../../shared/base/base-form.component';
import { SkeletonFormComponent } from '../../../../shared/components/skeleton/skeleton-form.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { BtnComponent } from '../../../../shared/components/btn/btn.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { NotificationStore } from '../../../../core/stores/notification.store';
import { UserService } from '../../services/user.service';
import type { User } from '../../models/user.model';

@Component({
  selector: 'app-user-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonFormComponent, InputComponent, BtnComponent, IconComponent],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css',
})
export class UserFormComponent extends BaseFormComponent<User> {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationStore);

  readonly id = input<string>();
  readonly isEditMode = computed(() => !!this.id());

  protected readonly editResource = rxResource<User, string | undefined>({
    params: () => this.id(),
    stream: ({ params: id }) => this.userService.getById(id!),
  });

  private readonly patchOnLoad = effect(() => {
    const user = this.editResource.value();
    if (user) {
      this.patchForm(user);
    }
  });

  initialValue(): User {
    return { id: 0, name: '', email: '' };
  }

  buildSchema(s: SchemaPathTree<User>): void {
    required(s.name, {
      message: $localize`:@@validation.nameRequired:Name is required`,
    });
    required(s.email, {
      message: $localize`:@@validation.emailRequired:Email is required`,
    });
    email(s.email, {
      message: $localize`:@@validation.emailInvalid:Enter a valid email`,
    });
  }

  async onSubmit(value: User): Promise<void> {
    if (this.isEditMode()) {
      await firstValueFrom(this.userService.update(value.id, value));
      this.notifications.showSuccess(
        $localize`:@@users.form.updateSuccess:User updated successfully`,
      );
    } else {
      await firstValueFrom(this.userService.create(value));
      this.notifications.showSuccess(
        $localize`:@@users.form.createSuccess:User created successfully`,
      );
    }
    this.router.navigate(['/users']);
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }
}
