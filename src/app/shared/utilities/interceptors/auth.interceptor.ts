import { HttpRequest, HttpHandlerFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { StorageService } from "@svp-services";

export function authInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  // Inject the current `AuthService` and use it to get an authentication token:
  const authToken = inject(StorageService).getAccessToken();

  // Clone the request to add the authentication header.
  if (authToken) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  }

  return next(request);
}