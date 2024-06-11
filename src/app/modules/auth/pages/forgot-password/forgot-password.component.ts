import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@svp-api-services';
import { Result } from '@svp-models';
import { NotificationService } from '@svp-services';
import { SvpValidationErrorsComponent } from 'src/app/shared/components/input-fields/svp-validation-errors.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [FormsModule, RouterLink, ReactiveFormsModule, SvpValidationErrorsComponent, CommonModule],
})
export class ForgotPasswordComponent {
  fb = inject(FormBuilder);
  notify = inject(NotificationService);
  authService = inject(AuthService);

  message!: { success: boolean; message: string } | undefined;

  form = this.fb.group({
    email: ['', Validators.compose([Validators.required, Validators.email])],
  });

  submit(): void {
    this.message = undefined;
    
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.notify.showLoader();
    this.authService
      .forgotPassword(this.form.value)
      .subscribe((res: Result<string>) => {
        this.notify.hideLoader();
        if (res.success) {
          this.message = { success: true, message: res.content ?? 'Password reset link sent to your email' };
        } else {
          this.message = { success: false, message: res.message ?? 'An error occurred while processing your request.' };
        }
      });
  }
}
