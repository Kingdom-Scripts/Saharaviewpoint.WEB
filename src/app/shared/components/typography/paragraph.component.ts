import { CommonModule } from '@angular/common';
import { Component, Input, booleanAttribute } from '@angular/core';

@Component({
  selector: 'p[svp-text]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p class="text-base {{color}} dark:{{darkColor}}"
      [ngClass]="{
          'font-bold': bold,
          'font-semibold': medium,
          'italic': italic
        }"
    ><ng-content></ng-content></p>
  `
})
export class SvpParagraphComponent {
  @Input({transform: booleanAttribute}) bold = false;
  @Input({transform: booleanAttribute}) medium = false;
  @Input({transform: booleanAttribute}) italic = false;
  @Input() color = 'text-gray-600';
  @Input() darkColor = 'text-night-100';
}