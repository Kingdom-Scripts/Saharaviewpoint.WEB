import { FormGroup } from "@angular/forms";
import { ValidationErrorModel } from "@svp-models";

export function mapValidationErrors(form: FormGroup, errors: { [key: string]: string[]} | undefined) {
  if (!errors) {
    return;
  }

  Object.entries(errors).forEach(([key, errorMessages]) => {
    let modelError: ValidationErrorModel = {
      valid: false,
      messages: errorMessages
    };

    let control = form.get(camelizeKey(key));

    if (control) {    
      control.setErrors({apiError: modelError});
    }
    else {
      form.setErrors({apiError: modelError});
    }
  })
}

function camelizeKey(key: string): string {
  return key.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}