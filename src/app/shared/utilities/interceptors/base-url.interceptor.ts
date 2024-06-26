import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export function baseUrlInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  const BASE_PATH = environment.apiUrl;

  // skip if it is loading assets
  if (request.url.includes('assets')) {
    return next(request);
  }

  request = request.clone({
    headers: request.headers.set('Accept', 'application/json')
                            .set('AppType', 'Admin'),
    url: `${BASE_PATH}/${request.url}`,
  });

  return next(request);
}
