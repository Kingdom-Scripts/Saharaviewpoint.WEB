import { CommonModule } from '@angular/common';
import { Component, Input, booleanAttribute } from '@angular/core';

@Component({
  selector: 'button[svp-action]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="relative flex justify-center rounded-md border border-transparent bg-gray-800 py-1 px-2 text-sm font-medium text-white hover:bg-gray-700" [ngClass]="{
        'w-full': isFullWidth
        }">
        <ng-content></ng-content>
    </button> 
  `
})
export class SvpActionButtonComponent {
  @Input({transform: booleanAttribute}) isFullWidth!: boolean;
  @Input({transform: booleanAttribute}) isActive!: boolean;
}