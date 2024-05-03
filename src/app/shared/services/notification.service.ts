import { Injectable } from '@angular/core';
import topbar from 'topbar';
import iziToast, { IziToastSettings } from 'izitoast';
import { ThemeService } from './theme/theme.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private Toast!: any;
  //modalRef!: BsModalRef;

  constructor(private themeService: ThemeService) {
    iziToast.settings({
      theme: this.themeService.isDark ? 'dark' : 'light',
      layout: 2,
      position: 'center',
      timeout: 0,
      overlay: true,
      closeOnEscape: true,
    });
  }

  async showLoader() {
    topbar.show();
  }

  async hideLoader() {
    topbar.hide();
  }

  // #region Centered Messages
  showMessage(title?: string, message?: string): Promise<boolean>;
  showMessage(message?: string): Promise<boolean>;
  
  showMessage(title: string = '', message: string = ''): Promise<boolean> {
    let id: string = this.generateUniqueID();
    iziToast.show({
      id: id,
      title: title,
      message: message,
    });
    
    return new Promise((resolve) => {
      document.addEventListener('iziToast-closed', function(data: any) {
        if (data.detail.id === id) {
          resolve(true);
        }
      })
    });
  }

  successMessage(message?: string): Promise<boolean>;
  successMessage(title?: string, message?: string): Promise<boolean>;

  successMessage(title: string = '', message: string = ''): Promise<boolean> {
    let id: string = this.generateUniqueID();
    iziToast.success({
      id: id,
      title: title,
      message: message,
      color: this.themeService.isDark ? 'rgb(0 151 37)' : 'rgba(166, 239, 184, .9)'
    });
    
    return new Promise((resolve) => {
      document.addEventListener('iziToast-closed', function(data: any) {
        if (data.detail.id === id) {
          resolve(true);
        }
      })
    });
  }

  infoMessage(title?: string, message?: string): Promise<boolean>;
  infoMessage(message?: string): Promise<boolean>;

  infoMessage(title: string = '', message: string = ''): Promise<boolean> {
    let id: string = this.generateUniqueID();
    iziToast.info({
      id: id,
      title: title,
      message: message,
      color: this.themeService.isDark ? 'rgb(1 109 164)' : 'rgba(157, 222, 255, .9)'
    });
    
    return new Promise((resolve) => {
      document.addEventListener('iziToast-closed', function(data: any) {
        if (data.detail.id === id) {
          resolve(true);
        }
      })
    });
  }

  errorMessage(title?: string, message?: string): Promise<boolean>;
  errorMessage(message?: string): Promise<boolean>;

  errorMessage(title: string = '', message: string = ''): Promise<boolean> {
    let id: string = this.generateUniqueID();
    iziToast.error({
      id: id,
      title: title,
      message: message,
      color: this.themeService.isDark ? 'rgb(185 40 50)' : 'rgba(255, 175, 180, .9)'
    });
    
    return new Promise((resolve) => {
      document.addEventListener('iziToast-closed', function(data: any) {
        if (data.detail.id === id) {
          resolve(true);
        }
      })
    });
  }
  // #endregion

  // #region Timed Messages
  timedMessage(title?: string, message?: string): void;
  timedMessage(message?: string): void;
  
  timedMessage(title: string = '', message: string = ''): void {
    iziToast.show({
      title: title,
      message: message,
      position: 'topRight',
      timeout: 5000,
      overlay: false,
      closeOnEscape: true,
    });
  }

  timedSuccessMessage(message?: string): void;
  timedSuccessMessage(title?: string, message?: string): void;

  timedSuccessMessage(title: string = '', message: string = ''): void {
  iziToast.success({
      title: title,
      message: message,
      position: 'topRight',
      timeout: 5000,
      overlay: false,
      closeOnEscape: true,
      color: this.themeService.isDark ? 'rgb(0 151 37)' : 'rgba(166, 239, 184, .9)'
    });
  }

  timedInfoMessage(title?: string, message?: string): void;
  timedInfoMessage(message?: string): void;

  timedInfoMessage(title: string = '', message: string = ''): void {
    iziToast.info({
      title: title,
      message: message,
      position: 'topRight',
      timeout: 5000,
      overlay: false,
      closeOnEscape: true,
      color: this.themeService.isDark ? 'rgb(1 109 164)' : 'rgba(157, 222, 255, .9)'
    });
  }

  timedErrorMessage(title?: string, message?: string): void;
  timedErrorMessage(message?: string): void;

  timedErrorMessage(title: string = '', message: string = ''): void {
    iziToast.error({
      title: title,
      message: message,
      position: 'topRight',
      timeout: 5000,
      overlay: false,
      closeOnEscape: true,
      color: this.themeService.isDark ? 'rgb(185 40 50)' : 'rgba(255, 175, 180, .9)'
    });
  }
  // #endregion

  async confirmDelete(): Promise<boolean> {
    return await this.confirmAction("You won't be able to revert this!", "Confirm Delete?");
  }

  async confirmAction(message: string, title: string = ''): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const options: IziToastSettings = {
        title: title,
        message: message,
        position: 'center',
        layout: 1,
        overlay: true,
        timeout: 0,
        close: false,
        progressBar: false,
        color: this.themeService.isDark ? 'rgb(135 124 0)' : 'rgba(255, 249, 178, .9)',
        buttons: [
          ['<button><b>Yes</b></button>', function (instance, toast) {
              instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
              resolve(true);
          }, true],
          ['<button>No</button>', function (instance, toast) {
              instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
              resolve(false);
          }, false],
      ],
      };

      iziToast.question(options);
    });
  }

  generateUniqueID(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
