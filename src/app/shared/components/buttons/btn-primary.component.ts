import { CommonModule } from '@angular/common';
import { Component, Input, booleanAttribute } from '@angular/core';

@Component({
  selector: 'button[svp-primary]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button type="button" class="group relative flex justify-center rounded-md border border-transparent bg-primary-500 py-2 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-primary-700 disabled:hover:bg-primary-700 hover:bg-primary-400 dark:bg-primary-600 dark:text-night-50 dark:hover:bg-primary-700" [ngClass]="{'w-full': isFullWidth}" [disabled]="isDisabled">
        <ng-content></ng-content>
    </button> 
  `,
  styles: [`
    .icon {
      transition: transform 0.3s ease-in-out;
    }

    .group:hover .icon {
      transform: scale(1.1);
    }
  `]
})
export class SvpPrimaryButtonComponent {
  @Input() icon!: string;
  @Input({transform: booleanAttribute}) isFullWidth!: boolean;
  @Input({transform: booleanAttribute}) isDisabled: boolean = false;
}