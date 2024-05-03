import { Component, OnInit, inject } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, UserService } from '@svp-api-services';
import { CommonModule } from '@angular/common';
import { SvpButtonModule, SvpFormInputModule, passwordMatchValidator } from '@svp-components';
import { NotificationService } from '@svp-services';
import { AuthDataModel, Result } from '@svp-models';
import { SvpAuthInputComponent } from '../../components/auth-input.component';

@Component({
    selector: 'app-new-password',
    templateUrl: './new-password.component.html',
    styleUrls: ['./new-password.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        AngularSvgIconModule,
        SvpFormInputModule,
        SvpButtonModule,
        SvpAuthInputComponent
    ],
})
export class NewPasswordComponent implements OnInit {
  authService = inject(AuthService);
  userService = inject(UserService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  notify = inject(NotificationService);
 
  isInvitation = false;
  invitationParam = {
    email: '',
    type: '',
    token: ''
  };

  formGroup!: FormGroup;
  passwordStrength: number = 0;
  
  constructor() {
    this.invitationParam.email = this.route.snapshot.params['email'];
    this.invitationParam.token = this.route.snapshot.params['token'];
    
    this.isInvitation = this.router.url.includes('accept-invitation');
    if (this.isInvitation) {      
      this.invitationParam.type = this.route.snapshot.params['type'];
    }

    console.log('--> Invitation Params', this.isInvitation)
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.formGroup = this.fb.group({
      password: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(20)])],
      confirmPassword: ['', Validators.compose([Validators.required])]
    }, {
      validators: passwordMatchValidator('password', 'confirmPassword')
    });
  }

  calculatePasswordStrength(password: string): void {
    this.passwordStrength = this.authService.calculatePasswordStrength(password);
  }

  submit(): void {
    if (!this.formGroup.valid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    if (this.isInvitation) {
      this.setPassword();
    } 
    else {
      this.resetPassword();
    }
  }

  resetPassword(): void {
    throw new Error('Method not implemented.');
  }

  setPassword(): void { 
    const params = Object.assign({}, this.invitationParam, this.formGroup.value);
    console.log('--> Params: ', params);
    this.notify.showLoader();
    this.userService.acceptInvitation(params)
      .subscribe(async (res: Result<AuthDataModel>) => {
        this.notify.hideLoader();
        
        if (res.success) {
          this.notify.timedSuccessMessage('Password set successfully.');

          this.authService.maskUserAsAuthenticated(res.content as AuthDataModel, true);
          this.router.navigate(['dashboard']);
        } else {
          this.notify.errorMessage(res.title, res.message);
        }
      });
  }
}
