import { Directive, inject, input, TemplateRef } from '@angular/core';

@Directive({ selector: '[headerCellDef]' })
export class HeaderCellDefDirective {
  readonly headerCellDef = input.required<string>();
  readonly templateRef = inject(TemplateRef);
}
