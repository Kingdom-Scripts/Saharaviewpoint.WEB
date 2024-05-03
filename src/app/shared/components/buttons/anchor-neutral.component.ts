import { CommonModule } from '@angular/common';
import { Component, Input, booleanAttribute } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'a[svp-neutral]',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <a class="group relative flex justify-center rounded-md border border-transparent bg-gray-900 py-2 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 hover:bg-gray-700 cursor-pointer" [ngClass]="{'w-full': isFullWidth}" routerLink="{{svpRoute}}">
      <span class="group-hover:text-gray-50">
          <i *ngIf="icon" class="{{icon}} mr-2 icon"></i>
          <ng-content></ng-content>
      </span>
    </a> 
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
export class SvpAnchorNeutralButtonComponent {
  @Input({required: true}) svpRoute: string = '';
  @Input() icon!: string;
  @Input({transform: booleanAttribute}) isFullWidth!: boolean;
}