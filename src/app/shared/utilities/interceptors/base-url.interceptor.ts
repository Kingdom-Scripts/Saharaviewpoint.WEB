import { HttpRequest, HttpHandlerFn } from "@angular/common/http";
import { environment } from "../../../../environments/environment";

export function baseUrlInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  const BASE_PATH = environment.apiUrl;

    request = request.clone({
      headers: request.headers.set('Accept', 'application/json'),
      url: `${ BASE_PATH }/${ request.url }`
    });

    return next(request);
}