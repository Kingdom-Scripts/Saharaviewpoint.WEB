import { FormGroup } from "@angular/forms";
import { ValidationErrorModel } from "@svp-models";

export function passwordMatchValidator(controlName: string, matchingControlName: string) {
  return (group: FormGroup) => {
    const password = group.get(controlName)?.value;
    const confirmPassword = group.get(matchingControlName)?.value;

    
    if (password !== confirmPassword) {
      group.get(matchingControlName)?.setErrors({ 
          passwordMatch:  {
            valid: false,
            messages: ['Your passwords do not match.']
        } as ValidationErrorModel
      });
    } else {
      group.get(matchingControlName)?.setErrors(null);
    }
  };
}