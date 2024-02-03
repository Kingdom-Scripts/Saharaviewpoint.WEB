import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'svp-validation-errors',
  standalone: true,
  template: `
    @if (svpControl && svpControl.invalid && svpControl.touched) {
      <div class="text-red-700 dark:text-red-400 text-sm">
        @for(error of getErrors(); track error) {
          <div>{{ error }}</div>
        }
      </div>
    }
  `,
})
export class SvpValidationErrorsComponent {
  @Input() svpControl: AbstractControl | null = null;

  getErrors(): string[] {
    if (!this.svpControl) {
      return [];
    }

    const errors: string[] = [];
    
    for (const key of Object.keys(this.svpControl.errors || {})) {
      switch (key) {
        case 'required':
          errors.push('This field is required.');
          break;
        case 'minlength':
          const minLengthObj: any = this.svpControl.errors?.[key];
          errors.push(`Minimum length is ${minLengthObj.requiredLength}.`);
          break;
        case 'maxlength':
          const maxLengthObj: any = this.svpControl.errors?.[key];
          errors.push(`Maximum length is ${maxLengthObj.requiredLength}.`);
          break;
        case 'email':
          errors.push('Invalid email format.');
          break;
        default:
          const error = this.svpControl.errors?.[key];
          if('valid' in error && 'message' in error) {
            errors.push(error.message);
          } else {
            errors.push('A validation error has occurred.');
          }
          
          break;
      }
    }

    return errors;
  }
}