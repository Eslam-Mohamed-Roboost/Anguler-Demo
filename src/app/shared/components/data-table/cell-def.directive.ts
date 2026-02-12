// Structural directive to tag custom cell templates for DataTableComponent
import { Directive, inject, input, TemplateRef } from '@angular/core';

@Directive({ selector: '[cellDef]' })
export class CellDefDirective {
  /** Column key this template renders */
  readonly cellDef = input.required<string>();
  readonly templateRef = inject(TemplateRef);
}
