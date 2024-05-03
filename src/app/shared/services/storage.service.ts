import { Injectable } from '@angular/core';
import { LocalStorageUtility } from '@svp-utilities';
import { UserModel } from '@svp-models';
import { AuthRoleData } from '@svp-models';
import { SessionStorageUtility } from '@svp-utilities';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(private localStorageUtil: LocalStorageUtility,
    private sessionStorageUtil: SessionStorageUtility) {}

  domain: string = 'svp:';

  storeToken(token: string, rememberMe: boolean) {
    this.storeValue(`${this.domain}a_token`, token, rememberMe);
    this.setUserRoles(token, rememberMe);
  }

  storeRefreshToken(token: string, rememberMe: boolean) {
    this.storeValue(`${this.domain}r_token`, token, rememberMe);
  }

  storeUser(user?: UserModel, rememberMe: boolean = false) {
    const stringifiedUser = JSON.stringify(user);
    this.storeValue(`${this.domain}USER`, stringifiedUser, rememberMe);
  }

  private setUserRoles(token: string, rememberMe: boolean) {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const userRoles = {
      SvpAdmin: decoded.role.includes('SvpAdmin'),
      SvpManager: decoded.role.includes('SvpManager'),
      BusinessAdmin: decoded.role.includes('BusinessAdmin'),
      BusinessManager: decoded.role.includes('BusinessManager'),
      BusinessClient: decoded.role.includes('BusinessClient'),
      Client: decoded.role.includes('Client'),
      SuperAdmin: decoded.role.includes('SuperAdmin'),
    } as AuthRoleData;

    this.storeValue(`${this.domain}ROLES`, JSON.stringify(userRoles), rememberMe);
  }

  getAccessToken() {
    return this.getValue(`${this.domain}a_token`) || '';
  }

  getRefreshToken() {
    return this.getValue(`${this.domain}r_token`);
  }

  getUser() {
    const user = this.getValue(`${this.domain}USER`);
    if (user !== null && user !== undefined) {
      return JSON.parse(user) as UserModel;
    }
    return undefined;
  }

  clearAuthData() {
    this.removeValue(`${this.domain}a_token`);
    this.removeValue(`${this.domain}r_token`);
    this.removeValue(`${this.domain}ROLES`);
  }

  clearUserData() {
    this.removeValue(`${this.domain}USER`);
  }

  getUserRoles() {
    const roles = this.getValue(`${this.domain}ROLES`);
    if(roles == null) return null;
    return JSON.parse(roles);
  }

  setSideNavState(state: 'collapsed' | 'expanded') {
    this.localStorageUtil.set(`${this.domain}SIDE_NAV`, state.toString());
  }

  getSideNavState() {
    return this.getValue(`${this.domain}SIDE_NAV`);
  }

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
