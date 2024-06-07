import { Injectable, signal } from '@angular/core';
import { LocalStorageUtility } from '@svp-utilities';
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  public default = 'light';
  public themeChanged = signal(this.theme);
  private _themeKey = 'svp-theme';

  constructor(private localStorage: LocalStorageUtility) {}

  public get theme(): string {
    return this.localStorage.get(this._themeKey) ?? this.default;
  }

  public set theme(value: string) {
    this.localStorage.set(this._themeKey, value);
    this.themeChanged.set(value);
  }

  public get isDark(): boolean {
    return this.theme == 'dark';
  }
}