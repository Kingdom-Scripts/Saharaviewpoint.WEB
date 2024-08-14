import { Injectable } from '@angular/core';
import { LocalStorageUtility } from '@svp-utilities';
import { UserModel } from '@svp-models';
import { AuthRoleData } from '@svp-models';
import { SessionStorageUtility } from '@svp-utilities';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(private localStorageUtil: LocalStorageUtility, private sessionStorageUtil: SessionStorageUtility) {}

  domain: string = 'svp:';

  /**
   * The `storeToken` function stores a token and user roles based on the rememberMe parameter.
   * @param {string} token - A string representing the token that needs to be stored.
   * @param {boolean} rememberMe - The `rememberMe` parameter is a boolean value that indicates whether
   * the user wants to store the token for future sessions. If `rememberMe` is set to `true`, the token
   * will be stored securely for future use, typically in a way that persists even after the user
   * closes the application or browser
   */
  storeToken(token: string, rememberMe: boolean) {
    this.storeValue(`${this.domain}a_token`, token, rememberMe);
    this.setUserRoles(token, rememberMe);
  }

  /**
   * The function `storeRefreshToken` stores a token with an optional rememberMe flag in the browser's
   * storage.
   * @param {string} token - The `token` parameter is a string that represents the refresh token that
   * needs to be stored.
   * @param {boolean} rememberMe - The `rememberMe` parameter is a boolean value that indicates whether
   * the user wants to store the refresh token for future use. If `rememberMe` is set to `true`, the
   * refresh token will be stored securely for a longer period of time, typically beyond the current
   * session.
   */
  storeRefreshToken(token: string, rememberMe: boolean) {
    this.storeValue(`${this.domain}r_token`, token, rememberMe);
  }

  storeUser(user?: UserModel, rememberMe: boolean = false) {
    const stringifiedUser = JSON.stringify(user);
    this.storeValue(`${this.domain}USER`, stringifiedUser, rememberMe);
  }

  /**
   * The function `setUserRoles` decodes a token, extracts user roles, and stores them in local
   * storage.
   * @param {string} token - The `token` parameter in the `setUserRoles` function is a string that
   * represents a user authentication token. This token is typically generated during the user
   * authentication process and contains encoded information about the user, such as their roles and
   * permissions.
   * @param {boolean} rememberMe - The `rememberMe` parameter in the `setUserRoles` function is a
   * boolean value that indicates whether the user wants to persist their roles information beyond the
   * current session.
   */
  private setUserRoles(token: string, rememberMe: boolean) {
    const decoded = JSON.parse(atob(token.split('.')[1]));

    // Extract user roles from the decoded token payload
    const userRoles = {
      SvpAdmin: decoded.role.includes('SvpAdmin'),
      SvpManager: decoded.role.includes('SvpManager'),
      BusinessAdmin: decoded.role.includes('BusinessAdmin'),
      BusinessManager: decoded.role.includes('BusinessManager'),
      BusinessClient: decoded.role.includes('BusinessClient'),
      Client: decoded.role.includes('Client'),
      SuperAdmin: decoded.role.includes('SuperAdmin'),
    } as AuthRoleData;

    // Store the extracted roles in local storage or session storage
    // The key is constructed using the domain and 'ROLES'
    // The value is the stringified userRoles object
    // The rememberMe flag determines whether to use local storage or session storage
    this.storeValue(`${this.domain}ROLES`, JSON.stringify(userRoles), rememberMe);
  }

  /**
   * The `getAccessToken` function returns the access token value stored in the domain followed by
   * 'a_token'.
   * @returns An access token is being returned.
   */
  getAccessToken() {
    return this.getValue(`${this.domain}a_token`) || '';
  }

  /**
   * The `getRefreshToken` function retrieves a refresh token value based on a specified domain.
   * @returns The `getRefreshToken()` function is returning the value stored in the key
   * `${this.domain}r_token`.
   */
  getRefreshToken() {
    return this.getValue(`${this.domain}r_token`);
  }

  /**
   * The `getUser` function retrieves and parses a user object stored in local storage.
   * @returns The `getUser()` function returns the user object parsed from the stored value in the
   * format of a `UserModel`. If the stored value is not found or is invalid, it returns `undefined`.
   */
  getUser() {
    const user = this.getValue(`${this.domain}USER`);
    if (user !== null && user !== undefined) {
      return JSON.parse(user) as UserModel;
    }
    return undefined;
  }

  /**
   * The `clearAuthData` function removes authentication data stored in local storage for a specific
   * domain.
   */
  clearAuthData() {
    this.removeValue(`${this.domain}a_token`);
    this.removeValue(`${this.domain}r_token`);
    this.removeValue(`${this.domain}ROLES`);
  }

  /**
   * The `clearUserData` function removes a specific value associated with the user domain.
   */
  clearUserData() {
    this.removeValue(`${this.domain}USER`);
  }

  /**
   * The function `getUserRoles` retrieves user roles from a specified domain and returns them as a
   * parsed JSON object.
   * @returns The function `getUserRoles()` returns the roles stored in the `${this.domain}ROLES` value
   * as a parsed JSON object. If the roles are not found or are null, the function returns null.
   */
  getUserRoles() {
    const roles = this.getValue(`${this.domain}ROLES`);
    if (roles == null) return null;

    return JSON.parse(roles);
  }

  setSideNavState(state: 'collapsed' | 'expanded') {
    this.localStorageUtil.set(`${this.domain}SIDE_NAV`, state.toString());
  }

  getSideNavState() {
    return this.getValue(`${this.domain}SIDE_NAV`);
  }

  /**
   * The function `storeValue` saves a key-value pair either in local storage or session storage based
   * on the `rememberMe` parameter.
   * @param {string} key - The `key` parameter is a string that represents the identifier for the value
   * being stored.
   * @param {string} value - The `value` parameter in the `storeValue` function represents the value
   * that you want to store in either the local storage or session storage based on the `rememberMe`
   * flag.
   * @param {boolean} rememberMe - The `rememberMe` parameter is a boolean flag that determines whether
   * the value should be stored in local storage (`true`) or session storage (`false`).
   */
  private storeValue(key: string, value: string, rememberMe: boolean): void {
    if (rememberMe) {
      this.localStorageUtil.set(key, value);
    } else {
      this.sessionStorageUtil.set(key, value);
    }
  }

  private getValue(key: string): string | null {
    const data = this.localStorageUtil.get(key);
    return data ?? this.sessionStorageUtil.get(key);
  }

  private removeValue(key: string): void {
    this.localStorageUtil.remove(key);
    this.sessionStorageUtil.remove(key);
  }
}
