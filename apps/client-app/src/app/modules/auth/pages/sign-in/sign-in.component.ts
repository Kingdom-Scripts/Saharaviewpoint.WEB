import { NgClass, NgIf } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { RouterLink, Router, ActivatedRoute } from "@angular/router";
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LoginModel } from "../../../../../../../../libs/shared/models/src/lib/api-input-models/auth/login.model";
import { AuthService } from "../../../../shared/services/auth.service";
import { Result } from "../../../../../../../../libs/shared/models/src/lib/api-response-models/Result";
import { AuthDataModel } from "../../../../../../../../libs/shared/models/src/lib/api-response-models/auth/auth-data.model";
import { NotificationService } from "../../../../shared/services/notification.service";
import { SvpUtilityModule } from "../../../../../../../../libs/shared/components/src/lib/utilities/utility.module";
import { SvpAuthInputComponent } from "../../components/auth-input.component";
import { SvpButtonModule, SvpFormInputModule } from '@svp-components';


@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterLink,
        AngularSvgIconModule,
        NgClass,
        NgIf,
        SvpButtonModule,
        SvpUtilityModule,
        SvpFormInputModule,
        SvpAuthInputComponent
    ],
})
export class SignInComponent implements OnInit {
  loginForm!: FormGroup;
  userLogin!: LoginModel;
  returnUrl!: string;

  constructor(private readonly fb: FormBuilder,
    private route: ActivatedRoute,
    private readonly router: Router,
    private authService: AuthService,
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
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  login() {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.userLogin = Object.assign({}, this.loginForm.value);

    this.notify.showLoader();
    this.authService.login(this.userLogin)
      .subscribe(async (res: Result<AuthDataModel>) => {
        this.notify.hideLoader();
        
        if (res.success) {
          this.notify.timedSuccessMessage(`Welcome back ${res.content?.user.firstName}`);

          this.authService.maskUserAsAuthenticated(res.content as AuthDataModel, this.userLogin.rememberMe);
          this.router.navigate(['dashboard']);
        } else {
          this.notify.errorMessage(res.title, res.message);
        }
      });
  }
}
