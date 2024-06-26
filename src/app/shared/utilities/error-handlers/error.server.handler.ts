import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationService } from '@svp-services';
import { NavigationUtility } from '../navigation.utility';
import { Result, StatusCodes } from '@svp-models';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  constructor(
    private notify: NotificationService,
    private nav: NavigationUtility,
    private router: Router
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public handleError<T>() {
    return (error: unknown): Observable<Result<never>> => {      
      this.notify.hideLoader();

      if (error instanceof HttpErrorResponse) {
          switch (error.status) {
          case StatusCodes.BAD_REQUEST: //Bad Request
          {
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
          }
          case StatusCodes.UNAUTHORIZED: //Authentication error
          {
            const msg401: Result<never> = new Result();
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
          }

          case StatusCodes.FORBIDDEN: //Authorization error
          {
            const msg403: Result<never> = error.error;

            return throwError(msg403);
          }
          case StatusCodes.INTERNAL_SERVER_ERROR: //Authentication error
          {
            const msg500: Result<never> = new Result();
            msg500.success = false;
            msg500.title = 'Internal Server Error';
            msg500.message = error?.error?.message ?? error.message;
            msg500.path = error.url?.toString();

            this.notify.errorMessage(msg500.title, msg500.message);

            return of(msg500);
          }
          case 0:
          {
            // possibly network error. Show toast
            const msg0: Result<never> = new Result();
            msg0.success = false;
            msg0.title = 'Unknown Server Error';
            msg0.message =
              'Something went wrong! Please check your internet connection';
            msg0.path = error.url?.toString();

            this.notify.errorMessage(msg0.title, msg0.message);

            return of(msg0);
          }
          default: {
            const msg: Result<never> = new Result();
            msg.success = false;
            msg.title = 'Unknown Server Error';
            msg.message = `Unknown Server Error: ${error.message}`;
            msg.path = error.url?.toString();

            this.notify.errorMessage(msg.title, msg.message);

            return of(msg);
          }
        }
      } else {
        const msg: Result<never> = new Result();
        msg.success = false;
        msg.title = 'Client Side Error';
        if (error instanceof HttpErrorResponse) {
          msg.message = `Error: ${error.error.message}`;
          msg.path = error.url?.toString();
        }

        this.notify.errorMessage(msg.title, msg.message);

        return of(msg);
      }
    };
  }
}
