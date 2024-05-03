import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationService } from '@svp-services';
import { NavigationUtility } from '../navigation.utility';
import { Result } from '@svp-models';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  constructor(
    private notify: NotificationService,
    private nav: NavigationUtility,
    private router: Router
  ) {}

  public handleError<T>() {
    return (error: unknown): Observable<never> => {
      console.log('--> Error: ', error);
      
      this.notify.hideLoader();

      if (error instanceof HttpErrorResponse) {
          switch (error.status) {
          case 400: //Bad Request
            const msg400: Result<never> = new Result();            
            msg400.success = false;
            msg400.title = 'Bad Request';
            msg400.message = error?.error.message ?? 'An error from the server';
            msg400.path = error.url?.toString();
            
            // only display error pop-up when it is not a validation error
            if (error.error.title !== 'Validation Errors') {
              this.notify.errorMessage(msg400.title, msg400.message);
            }
            else {
              msg400.validationErrors = error?.error.validationErrors;
            }

            return throwError(msg400 as Result<never>);
          case 401: //Authentication error
            let msg401: Result<never> = new Result();
            msg401.success = false;
            msg401.title = 'Authentication Required';
            msg401.message =
              'Unable to authenticate with the server! Please sign in.';
            msg401.path = error.url?.toString();

            this.notify.errorMessage(msg401.title, msg401.message);

            this.router.navigate(['auth/sign-in'], {
              state: { clearToken: true },
            });

            return throwError(msg401);

          case 403: //Authorization error
            let msg403: Result<never> = new Result();
            msg403.success = false;
            msg403.title = 'Privilege Access Required';
            msg403.message = `Access Denied: You do not have enough privilege to view this page!`;
            msg403.path = error.url?.toString();

            this.notify.errorMessage(msg403.title, msg403.message);

            this.nav.back();

            return of(msg403);

          case 500: //Authentication error
            let msg500: Result<never> = new Result();
            msg500.success = false;
            msg500.title = 'Internal Server Error';
            msg500.message = error?.error?.message ?? error.message;
            msg500.path = error.url?.toString();

            this.notify.errorMessage(msg500.title, msg500.message);

            return of(msg500);
          case 0:
            // possibly network error. Show toast
            let msg0: Result<never> = new Result();
            msg0.success = false;
            msg0.title = 'Unknown Server Error';
            msg0.message =
              'Something went wrong! Please check your internet connection';
            msg0.path = error.url?.toString();

            this.notify.errorMessage(msg0.title, msg0.message);

            return of(msg0);
          default: {
            let msg: Result<never> = new Result();
            msg.success = false;
            msg.title = 'Unknown Server Error';
            msg.message = `Unknown Server Error: ${error.message}`;
            msg.path = error.url?.toString();

            this.notify.errorMessage(msg.title, msg.message);

            return of(msg);
          }
        }
      } else {
        let msg: Result<never> = new Result();
        msg.success = false;
        msg.title = 'Client Side Error';
        msg.message = `Error: ${error.error.message}`;
        msg.path = error.url?.toString();

        this.notify.errorMessage(msg.title, msg.message);

        return of(msg);
      }
    };
  }
}
