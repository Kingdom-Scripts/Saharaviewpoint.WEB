import { Component, Input, OnChanges, SimpleChanges, booleanAttribute, input } from "@angular/core";


@Component({
  selector: 'svp-max-input-length',
  standalone: true,
  template: `
    <span class="text-primary-500 -mt-1">
      @if (count == 0 && count >= minThreshold()) {
        <small>Max of {{total}} characters</small>
      } 
      @else if (count >= minThreshold() && count <= total) {
        <small class="text-green-500">{{ count }}/{{total}}</small>
      } 
      @else if (count > total) {
        <small class="text-red-700">{{ count }}/{{total}}</small>
      }
    </span>
  `,
})
export class MaxInputLengthComponent {
  @Input({required: true}) count: number = 0;
  @Input({required: true}) total!: number;
  minThreshold = input(0);
}
