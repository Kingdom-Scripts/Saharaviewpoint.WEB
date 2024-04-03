import { CommonModule } from "@angular/common";
import { Component, EventEmitter, OnInit, Output, inject } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { UserService } from "@svp-api-services";
import { SvpButtonModule, SvpFormInputModule, SvpTypographyModule, mapValidationErrors } from "@svp-components";
import { Result } from "@svp-models";
import { NotificationService } from "@svp-services";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
  selector: 'app-add-pm',
  standalone: true,
  templateUrl: './add-pm.component.html',
  imports: [
    CommonModule,
    SvpButtonModule,
    SvpFormInputModule,
    SvpTypographyModule,
    AngularSvgIconModule,
    ReactiveFormsModule
  ],
})
export class AddPmComponent implements OnInit {
  @Output() exit = new EventEmitter();

  notify = inject(NotificationService);
  formBuilder = inject(FormBuilder);
  userService = inject(UserService);
  
  newPmForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
  }
  
  initForm(): void {
    this.newPmForm = this.formBuilder.group({
      firstName: ['Mordecai', Validators.compose([Validators.required])],
      lastName: ['Project Manager', Validators.compose([Validators.required])],
      email: ['davidire71@gmail.com', Validators.compose([Validators.required, Validators.email])],
      phone: ['09012837845', Validators.compose([Validators.required])],
    });
  }
  
  addNewPM() {
    console.log('Adding project manager');

    if (!this.newPmForm.valid) {
      this.newPmForm.markAllAsTouched();
      return;
    }

    const newPm = this.newPmForm.value;
    console.log('--> Param: ', newPm);

    this.notify.showLoader();
    this.userService.inviteProjectManager(newPm)
      .subscribe({
        next: async (res: Result<string>) => {
          this.notify.hideLoader();
          if (res.success) {
            this.notify.successMessage(res.message);
            this.close();
          } else {
            this.notify.errorMessage(res.message);
          }
        },
        error: async (err: Result<any>) => {
          mapValidationErrors(this.newPmForm, err.validationErrors);
          this.newPmForm.markAllAsTouched();
        }
      });
  }

  close() {
    this.exit.emit();
  }
}