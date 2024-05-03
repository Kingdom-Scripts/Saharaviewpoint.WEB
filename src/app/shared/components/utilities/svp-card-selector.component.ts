import { CommonModule } from '@angular/common';
import { Component, Input, booleanAttribute } from '@angular/core';

@Component({
  selector: 'div[svp-card-selector]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex space-x-2 items-center py-1 px-4 rounded-lg border-2 cursor-pointer font-semibold"
        [ngClass]="{
            'bg-primary-400 text-gray-50 border-gray-500 dark:bg-primary-500 dark:text-gray-50 dark:border-gray-400': isActive,
            'bg-transparent text-gray-900/70 border-1 border-gray-400 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300': !isActive,
            }">
        <ng-content></ng-content>
    </div>
  `
})
export class SvpCardSelectorComponent {
  @Input({transform: booleanAttribute}) isActive: boolean = false;
}