import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaxInputLengthComponent } from '../utilities/max-input-length.component';
import { SvpValidationErrorsComponent } from '../input-fields/svp-validation-errors.component';

@Component({
  selector: 'app-confirm-action',
  standalone: true,
  templateUrl: './confirm-action.component.html',
  imports: [FormsModule, ReactiveFormsModule, MaxInputLengthComponent, SvpValidationErrorsComponent],
})
export class ConfirmActionComponent {
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';

  @Output() onActionConfirmed = new EventEmitter<ConfirmActionResult>();

  fb = inject(FormBuilder);
  result: ConfirmActionResult = { confirmed: false, reason: '' };

  close!: () => void;

  reasonForm!: FormGroup;

  constructor() {
    this.initForms();
  }

  initForms(): void {
    this.reasonForm = this.fb.group({
      reason: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(5000)])],
    });
  }

  confirmAction() {
    if (this.reasonForm.invalid) {
      this.reasonForm.markAllAsTouched();
      return;
    }

    this.result.confirmed = true;
    this.result.reason = this.reasonForm.get('reason')?.value;
    this.onActionConfirmed.emit(this.result);
    this.close();
  }

  cancelAction() {
    this.result.confirmed = false;
    this.result.reason = 'User cancelled action';
    this.onActionConfirmed.emit(this.result);
    this.close();
  }
}

export interface ConfirmActionResult {
  confirmed: boolean;
  reason: string;
}
