/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'svp-validation-errors',
  standalone: true,
  template: `
    @if (control && control.invalid && control.touched) {
    <div class="text-sm text-red-700 dark:text-red-400">
      @for(error of getErrors(); track error) {
      <div>{{ error }}</div>
      }
    </div>
    }
  `,
})
export class SvpValidationErrorsComponent {
  @Input({required: true}) control: AbstractControl | null = null;
  @Input() customMessages: { [key: string]: string } = {};

  getErrors(): string[] {
    if (!this.control || !this.control.errors) {
      return [];
    }

    const errors: string[] = [];
    const controlErrors = this.control.errors;

    for (const key of Object.keys(controlErrors)) {
      if (this.customMessages[key]) {
        errors.push(this.customMessages[key]);
      } else {
        const error = controlErrors[key];
        if (typeof error === 'object' && error !== null && 'valid' in error && 'messages' in error) {
          errors.push(...error.messages);
        } else {
          switch (key) {
            case 'required':
              errors.push('This field is required.');
              break;
            case 'minlength':
              errors.push(`Minimum length is ${controlErrors[key].requiredLength}.`);
              break;
            case 'maxlength':
              errors.push(`Maximum length is ${controlErrors[key].requiredLength}.`);
              break;
            case 'email':
              errors.push('Invalid email format.');
              break;
            case 'pattern':
              errors.push('Invalid input format.');
              break;
            case 'min':
              errors.push(`Minimum value is ${controlErrors[key].min}.`);
              break;
            case 'max':
              errors.push(`Maximum value is ${controlErrors[key].max}.`);
              break;
            case 'match':
              errors.push('Values do not match.');
              break;
            case 'requiredTrue':
              errors.push('This field must be true.');
              break;
            case 'url':
              errors.push('Invalid URL format.');
              break;
            case 'maxDecimalPlaces':
              errors.push(`Number cannot have more than ${controlErrors[key].maxDecimalPlaces} decimal places.`);
              break;
            default:
              errors.push('A validation error has occurred.');
              break;
          }
        }
      }
    }

    return errors;
  }
}
