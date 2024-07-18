import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationService } from '@svp-services';
import { Result, StatusCodes } from '@svp-models';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  constructor(private notify: NotificationService, private router: Router) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public handleError<T>() {
    return (error: unknown): Observable<Result<never>> => {
      this.notify.hideLoader();

      const result: Result<never> = new Result();
      result.success = false;

      if (error instanceof HttpErrorResponse) {
        switch (error.status) {
          //Bad Request
          case StatusCodes.BAD_REQUEST: {
            result.title = 'Bad Request';
            result.message = error?.error.message ?? 'An error from the server';

            // only display error pop-up when it is not a validation error
            if (error.error.title !== 'Validation Errors') {
              this.notify.timedErrorMessage(result.message ?? 'An error occurred.');
            } else {
              result.validationErrors = error?.error.validationErrors;
            }

            break;
          }

          // Not Found
          case StatusCodes.NOT_FOUND: {
            result.title = 'Not Found';

            // a specific error was returned from the API
            // return to calling component
            if (error.error) {
              result.message = error.error.message ?? 'The resource you are looking for was not found.';

              break;
            }

            result.message = error?.error ?? 'The resource you are looking for was not found.';
            this.notify.errorMessage(result.title, result.message);
            return of(result);
          }

          //Authentication error
          case StatusCodes.UNAUTHORIZED: {
            result.title = 'Authentication Required';
            result.message = 'Unable to authenticate with the server! Please sign in.';
            this.notify.errorMessage(result.title, result.message);
            this.router.navigate(['auth/sign-in'], {
              state: { clearToken: true },
            });

            break;
          }

          //Authorization error
          case StatusCodes.FORBIDDEN: {
            result.title = 'Forbidden';
            result.message = error?.error.message ?? 'You do not have permission to access this resource';

            break;
          }

          // Internal Server Error
          case StatusCodes.INTERNAL_SERVER_ERROR: {
            result.title = 'Internal Server Error';
            result.message = error?.error?.message ?? error.message;
            this.notify.errorMessage(result.title, result.message);

            return of(result);
          }

          // possibly network error. Show toast
          case 0: {
            result.title = 'Unknown Server Error';
            result.message = 'Something went wrong! Please check your internet connection';
            this.notify.errorMessage(result.title, result.message);

            return of(result);
          }
          default: {
            result.title = 'Unknown Server Error';
            result.message = `Unknown Server Error: ${error.message}`;
            this.notify.errorMessage(result.title, result.message);

            return of(result);
          }
        }

        // Throw other errors to the calling component
        return throwError(result);
      } else {
        result.success = false;
        result.title = 'Client Side Error';
        if (error instanceof HttpErrorResponse) {
          result.message = `Error: ${error.error.message}`;
        }

        this.notify.errorMessage(result.title, result.message);

        return of(result);
      }
    };
  }
}
