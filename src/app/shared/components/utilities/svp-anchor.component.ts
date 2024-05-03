import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'a[svp-anchor]',
  standalone: true,
  imports: [RouterModule],
  template: `
    <a class="font-medium text-primary-500 hover:text-primary-400 cursor-pointer" routerLink="{{svpRoute}}"> <ng-content></ng-content> </a>
  `
})
export class SvpAnchorComponent {
  @Input({required: true}) svpRoute: string = '';
}