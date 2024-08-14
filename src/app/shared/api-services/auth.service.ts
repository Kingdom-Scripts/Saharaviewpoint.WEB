/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthDataModel, AuthRoleData, LoginModel, Result } from '@svp-models';
import { NotificationService, StorageService } from '@svp-services';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authState = new BehaviorSubject(false);
  private http = inject(HttpClient);
  private router = inject(Router);
  private storageService = inject(StorageService);
  private notify = inject(NotificationService);

  constructor() {
    this.checkUserData();
  }

  /**
   * The `getUser` function returns the user data retrieved from the storage service.
   * @returns The `getUser()` function is being called to return the user object stored in the
   * `storageService`.
   */
  getUser() {
    return this.storageService.getUser();
  }

  /**
   * The function `checkUserData` updates the authentication state based on the presence of user data.
   */
  checkUserData() {
    const user = this.getUser();
    if (user === undefined || user === null) {
      this.authState.next(false);
    } else {
      this.authState.next(true);
    }
  }

  /**
   * The `IsAuthenticated` function returns the value of the `authState` property.
   * @returns The IsAuthenticated() function is returning the value of this.authState.
   */
  IsAuthenticated() {
    return this.authState.value;
  }

  OnAuthStatusChange() {
    return this.authState.asObservable();
  }

  /**
   * The `logUserOut` function logs the user out by masking them as logged out, navigating to the
   * sign-in page, and displaying loader and error messages as needed.
   * @returns The `logUserOut` function returns nothing explicitly. It performs a series of actions
   * such as checking the user status, showing loaders, logging out the user, and navigating to the
   * sign-in page based on certain conditions.
   */
  async logUserOut() {
    const user = this.getUser();
    if (user === undefined || user === null) {
      this.maskUserAsLoggedOut();
      this.router.navigate(['/auth/sign-in']);
      return;
    }
    await this.notify.showLoader();
    this.logout(user.uid).subscribe(async (res: Result<string>) => {
      if (res.success) {
        await this.notify.hideLoader();
        this.maskUserAsLoggedOut();
        this.router.navigate(['/auth/sign-in']);
      } else {
        this.notify.errorMessage(res.title, res.message);
      }
    });
  }

  /**
   * The function `maskUserAsAuthenticated` sets the user as authenticated by storing authentication
   * data in storage and updating the authentication state.
   * @param {AuthDataModel} authData - The `authData` parameter is of type `AuthDataModel`, which
   * contains information such as the user's authentication token, user data, and refresh token.
   * This data is used to authenticate the user and store relevant information for future sessions.
   * @param {boolean} rememberMe - The `rememberMe` parameter is a boolean value that indicates whether
   * the user wants to stay logged in even after closing the browser or app. If `rememberMe` is set to
   * `true`, the authentication tokens will be stored securely for future use, allowing the user to
   * remain logged in for an extended
   */
  maskUserAsAuthenticated(authData: AuthDataModel, rememberMe: boolean) {
    // Clear any existing authentication data
    this.maskUserAsLoggedOut();

    // Store the new authentication data
    this.storageService.storeToken(authData.token, rememberMe);
    this.storageService.storeUser(authData.user, rememberMe);
    this.storageService.storeRefreshToken(authData.refreshToken, rememberMe);

    // Update the authentication state
    this.authState.next(true);
  }

  /**
   * The function `maskUserAsLoggedOut` clears authentication and user data and updates the
   * authentication state to false.
   */
  maskUserAsLoggedOut() {
    this.storageService.clearAuthData();
    this.storageService.clearUserData();

    this.authState.next(false);
  }

  /**
   * The function `userIsInRole` checks if any of the roles in the provided array is present in the
   * user's roles retrieved from storage.
   * @param {string[]} roles - The `roles` parameter in the `userIsInRole` function is an array of
   * strings that represents the roles that you want to check if the user has. The function retrieves
   * the user's roles from the `storageService` and then checks if any of the roles in the provided
   * `roles`
   * @returns The `userIsInRole` function is returning a boolean value. It checks if any of the roles
   * in the provided `roles` array is present in the `userRoles` object obtained from
   * `storageService.getUserRoles()`. If at least one of the roles is found in the `userRoles` object,
   * it returns `true`, otherwise it returns `false`.
   */
  userIsInRole(roles: string[]): boolean {
    const userRoles = this.storageService.getUserRoles() as AuthRoleData;

    // Check if any of the roles in the provided array is present in userRoles
    return roles.some(role => userRoles[role]);
  }

  /**
   * The function `calculatePasswordStrength` calculates the strength of a password based on a set of
   * @param password  The password to be checked for strength based on a set of criteria
   * @returns The strength of the password as a number between 0 and 100.
   * A higher number indicates a stronger password.
   */
  calculatePasswordStrength(password: string): number {
    let passwordStrength = 0;

    // Fluent validations logic
    if (password.length >= 8) {
      passwordStrength += 15; // At least 8 characters
    }

    if (password.length >= 8 && password.length <= 20) {
      passwordStrength += 10; // Not exceeding 20 characters
    }

    if (/[A-Z]/.test(password)) {
      passwordStrength += 15; // Contains at least one uppercase letter
    }

    if (/[a-z]/.test(password)) {
      passwordStrength += 10; // Contains at least one lowercase letter
    }

    if (/[0-9]/.test(password)) {
      passwordStrength += 25; // Contains at least one number
    }

    if (/[!?*.#$()]/.test(password)) {
      passwordStrength += 25; // Contains at least one special character (!?#$*.)
    }

    return passwordStrength;
  }

  login(param: LoginModel): Observable<Result<AuthDataModel>> {
    return this.http.post<Result<AuthDataModel>>('auth/token', param);
  }

  signUpClient(param: any): Observable<Result<AuthDataModel>> {
    return this.http.post<Result<AuthDataModel>>(`auth/sign-up`, param);
  }

  refreshToken() {
    const param = {
      refreshToken: this.storageService.getRefreshToken(),
    };

    return this.http.post<Result<AuthDataModel>>(`auth/refresh-token`, param);
  }

  logout(userReference: string): Observable<Result<string>> {
    return this.http.post<Result<string>>(`auth/${userReference}/logout`, null);
  }

  forgotPassword(param: any): Observable<Result<string>> {
    return this.http.post<Result<string>>(`auth/forgot-password`, param);
  }

  resetPassword(param: any): Observable<Result<AuthDataModel>> {
    return this.http.post<Result<AuthDataModel>>(`auth/reset-password`, param);
  }
}
