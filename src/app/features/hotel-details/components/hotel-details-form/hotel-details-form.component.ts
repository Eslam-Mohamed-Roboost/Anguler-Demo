import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { required, email, pattern } from '@angular/forms/signals';
import type { SchemaPathTree } from '@angular/forms/signals';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { BaseFormComponent } from '../../../../shared/base/base-form.component';
import type { HotelFormData } from '../../types/hotel-details.types';

@Component({
  selector: 'app-hotel-details-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CardComponent, IconComponent, InputComponent],
  templateUrl: './hotel-details-form.component.html',
  styleUrl: './hotel-details-form.component.css',
})
export class HotelDetailsFormComponent extends BaseFormComponent<HotelFormData> {
  initialData = input<Partial<HotelFormData>>();
  loading = input(false);
  formSubmit = output<HotelFormData>();
  formCancel = output<void>();

  constructor() {
    super();
    effect(() => {
      const data = this.initialData();
      if (data) {
        this.patchForm(data);
      }
    });
  }

  initialValue(): HotelFormData {
    return {
      name: '',
      address: '',
      email: '',
      phone: '',
      hotelCode: '',
      joiningDate: '',
    };
  }

  buildSchema(s: SchemaPathTree<HotelFormData>): void {
    required(s.name, { message: 'Hotel name is required' });
    required(s.address, { message: 'Address is required' });
    required(s.email, { message: 'Email is required' });
    email(s.email, { message: 'Enter a valid email address' });
    required(s.phone, { message: 'Phone number is required' });
    pattern(s.phone, /^\+?[\d\s\-()+]+$/, { message: 'Enter a valid phone number' });
  }

  onSubmit(value: HotelFormData): void {
    this.formSubmit.emit(value);
  }

  protected onCancel(): void {
    this.formCancel.emit();
  }
}
