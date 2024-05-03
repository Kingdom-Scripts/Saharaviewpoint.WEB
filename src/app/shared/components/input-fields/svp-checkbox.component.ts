import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'svp-checkbox',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex items-center justify-between space-x-3" [formGroup]="svpForm">
      <div class="flex items-center mb-2">
        <input id="{{svpId}}" formControlName="{{svpId}}" type="checkbox" />
        <label for="accept-term" class="ml-2 block text-sm text-gray-400 dark:text-night-200">
          {{svpLabel}}
        </label>
      </div>
    </div>
  `
})
export class SvpCheckboxComponent {
  @Input({required: true}) svpId: string = '';
  @Input({required: true}) svpLabel: string = '';
  @Input({required: true}) svpForm!: FormGroup;
}