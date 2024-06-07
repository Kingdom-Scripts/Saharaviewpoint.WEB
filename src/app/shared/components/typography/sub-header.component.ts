import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'h1[svp-sub-header], h2[svp-sub-header], h3[svp-sub-header], h4[svp-sub-header], h5[svp-sub-header], h6[svp-sub-header]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 class="text-xl font-semibold text-gray-700 dark:text-night-50"><ng-content></ng-content></h2>
  `
})
export class SvpSubHeaderComponent {}