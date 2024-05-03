import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'h1[svp-header], h2[svp-header], h3[svp-header], h4[svp-header], h5[svp-header], h6[svp-header]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="text-3xl font-bold text-gray-800 dark:text-night-50"><ng-content></ng-content></h1>
  `
})
export class SvpHeaderComponent {}