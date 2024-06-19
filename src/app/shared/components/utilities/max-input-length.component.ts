import { CommonModule } from '@angular/common';
import { Component, Input, input } from '@angular/core';

@Component({
  selector: 'svp-max-input-length',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="-mt-1 text-primary-500">
      @if (count === 0 && count >= minThreshold()) {
      <small>Max of {{ total | number }} characters</small>
      } @else if (count >= minThreshold() && count <= total) {
      <small class="text-green-500">{{ count | number }}/{{ total | number }}</small>
      } @else if (count > total) {
      <small class="text-red-700">{{ count | number }}/{{ total | number }}</small>
      }
    </span>
  `,
})
export class MaxInputLengthComponent {
  @Input({ required: true }) count: number = 0;
  @Input({ required: true }) total!: number;
  minThreshold = input(0);
}
