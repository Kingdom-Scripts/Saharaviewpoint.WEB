import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'h1[svp-subHeader], h2[svp-subHeader], h3[svp-subHeader], h4[svp-subHeader], h5[svp-subHeader], h6[svp-subHeader]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 class="text-xl font-semibold text-gray-700 dark:text-night-50"><ng-content></ng-content></h2>
  `
})
export class SvpSubHeaderComponent {}