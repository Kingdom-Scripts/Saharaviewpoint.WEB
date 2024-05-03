import { NgModule } from "@angular/core";
import { SvpCheckboxComponent } from "./svp-checkbox.component";
import { SvpValidationErrorsComponent } from "./svp-validation-errors.component";
import { SvpLabelComponent } from "./svp-label.component";
import { SvpFileSelectorComponent } from "./svp-file-selector.component";

@NgModule({
  imports: [
    SvpCheckboxComponent,
    SvpValidationErrorsComponent,
    SvpLabelComponent,
    SvpFileSelectorComponent
  ],
  exports: [
    SvpCheckboxComponent,
    SvpValidationErrorsComponent,
    SvpLabelComponent,
    SvpFileSelectorComponent
  ]
})
export class SvpFormInputModule {}