import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: 'label[svp-label]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label class="text-gray-900 font-medium dark:text-night-100" for="{{svpFor}}"
      [style.margin-bottom.rem]="marginBottom > 10 ? marginBottom : 34">
      <ng-content></ng-content>
    </label>
  `
})
export class SvpLabelComponent {
  @Input() svpFor = '';
  @Input() marginBottom: number = 0;
}