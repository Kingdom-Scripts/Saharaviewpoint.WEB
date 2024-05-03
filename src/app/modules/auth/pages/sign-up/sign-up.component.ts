import { Component, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { SvpButtonModule, SvpFormInputModule, SvpUtilityModule, passwordMatchValidator } from '@svp-components';
import { Result, AuthDataModel } from '@svp-models';
import { NotificationService } from '@svp-services';
import { AuthService } from '@svp-api-services';
import { SvpAuthInputComponent } from '../../components/auth-input.component';

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        RouterLink,
        NgClass,
        AngularSvgIconModule,
        ReactiveFormsModule,
        SvpUtilityModule,
        SvpButtonModule,
        SvpFormInputModule,
        SvpAuthInputComponent
    ],
})
export class SignUpComponent implements OnInit {
  registerForm!: FormGroup;
  passwordStrength: number = 0;
  
  returnUrl!: string;

  constructor(private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private notify: NotificationService) {
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

  ngOnInit(): void {    
    this.initForm();

    if (history.state.clearToken) {
      this.authService.maskUserAsLoggedOut();
    }

    // redirect to dashboard if user is still logged in
    if (this.authService.IsAuthenticated()) {
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  initForm(): void {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(20)])],
      lastName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(20)])],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      confirmPassword: ['', Validators.compose([Validators.required])],
      acceptTerms: [false, Validators.requiredTrue]
    }, {
      validators: passwordMatchValidator('password', 'confirmPassword')
    });
  }

  async signUp() {
    if (!this.registerForm.valid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const param = Object.assign({}, this.registerForm.value);

    this.notify.showLoader();
    this.authService.signUpClient(param)
      .subscribe(async (res: Result<AuthDataModel>) => {
        this.notify.hideLoader();
        
        if (res.success) {
          this.notify.timedSuccessMessage('Sign up successful.');

          this.authService.maskUserAsAuthenticated(res.content as AuthDataModel, true);
          this.router.navigate(['dashboard']);
        } else {
          this.notify.errorMessage(res.title, res.message);
        }
      });
  }

  calculatePasswordStrength(password: string): void {
    this.passwordStrength = this.authService.calculatePasswordStrength(password);
  }
}