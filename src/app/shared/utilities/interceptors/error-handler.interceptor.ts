import { HttpRequest, HttpHandlerFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError, Observable, switchMap } from "rxjs";
import { NotificationService } from "@svp-services";
import { ErrorService } from "@svp-utilities";
import { AuthService } from "@svp-api-services";
import { AuthDataModel, Result  } from "@svp-models";
import { Router } from "@angular/router";
import { StorageService } from "@svp-services";

// always call this last in your HTTP Interceptors
export function errorHandlerInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn) {

  // get dependencies
  const errorService = inject(ErrorService);
  const authService = inject(AuthService);
  const storageService: StorageService = inject(StorageService);
  const notify = inject(NotificationService);
  const router = inject(Router);

  // skip if it is loading assets
  if (request.url.includes('assets')) {
    return next(request);
  }

  return next(request).pipe(
    catchError(error => {
      // attempt to refresh token if existing one has expired.
      if (error.status === 401) {
        return authService.refreshToken().pipe(
          switchMap((res: Result<AuthDataModel>) => {
            if (res.success) {
              authService.maskUserAsAuthenticated(res.content as AuthDataModel, true);

              // reset authorization header
              request = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${storageService.getAccessToken()}`
                }
              });

              return resendResult(request, next, errorService);
            } else {
              
              notify.errorMessage('Authentication Required', 'Unable to authenticate with the server! Please sign in again.');
              router.navigate(['auth/sign-in'], {
                state: { clearToken: true }
              });
              return throwError(error);
            }
          })
        );
      } else {
        if (!request.url.includes('refresh-token')) {
          return errorService.handleError()(error);
        }

        // at this stage, it failed while attempting to refresh token
        notify.errorMessage('Authentication Required', 'Unable to authenticate with the server! Please sign in again.');
        router.navigate(['auth/sign-in'], {
          state: { clearToken: true }
        });
        return throwError(error);
      }
    })
  );
}

// resend a request
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resendResult(request: HttpRequest<unknown>, next: HttpHandlerFn, errorService: ErrorService): Observable<any> {

  return next(request).pipe(
    catchError(errorService.handleError())
  );
}

