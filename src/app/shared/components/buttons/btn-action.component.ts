import { CommonModule } from '@angular/common';
import { Component, Input, booleanAttribute } from '@angular/core';

@Component({
  selector: 'button[svp-action]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="relative flex justify-center rounded-md border border-transparent px-2 py-1 text-sm font-medium text-white hover:bg-gray-800 dark:hover:bg-night-900"
      [ngClass]="{
        'w-full': isFullWidth,
        'bg-gray-600': !isActive,
        'bg-gray-800 dark:bg-night-900': isActive
      }">
      <ng-content></ng-content>
    </button>
  `,
})
export class SvpActionButtonComponent {
  @Input({ transform: booleanAttribute }) isFullWidth!: boolean;
  @Input({ transform: booleanAttribute }) isActive!: boolean;
}
