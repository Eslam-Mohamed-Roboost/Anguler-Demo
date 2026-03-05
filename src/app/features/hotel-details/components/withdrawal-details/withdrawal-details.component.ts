import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { required } from '@angular/forms/signals';
import type { SchemaPathTree } from '@angular/forms/signals';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { BaseFormComponent } from '../../../../shared/base/base-form.component';
import type { WithdrawalFormData } from '../../types/hotel-details.types';

@Component({
  selector: 'app-withdrawal-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, IconComponent, InputComponent],
  templateUrl: './withdrawal-details.component.html',
  styleUrl: './withdrawal-details.component.css',
})
export class WithdrawalDetailsComponent extends BaseFormComponent<WithdrawalFormData> {
  readonly awaitingAmount = input(0);
  readonly settleSubmit = output<WithdrawalFormData>();

  protected readonly amountLabel = computed(() =>
    `${this.awaitingAmount().toLocaleString()} CHF`
  );

  initialValue(): WithdrawalFormData {
    return {
      accountHolderName: '',
      bankName: '',
      iban: '',
      swiftCode: '',
    };
  }

  buildSchema(s: SchemaPathTree<WithdrawalFormData>): void {
    required(s.accountHolderName, { message: 'Account holder name is required' });
    required(s.bankName, { message: 'Bank name is required' });
    required(s.iban, { message: 'IBAN is required' });
    required(s.swiftCode, { message: 'Swift code is required' });
  }

  onSubmit(value: WithdrawalFormData): void {
    this.settleSubmit.emit(value);
  }
}
