import { HttpErrorResponse } from '@angular/common/http';
import {
  ErrorHandler,
  Inject,
  Injectable,
  Injector,
  NgZone,
} from '@angular/core';
import { Result } from '@svp-models';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    @Inject(Injector) private readonly injector: Injector,
    private zone: NgZone
  ) {}

/*   private get notificationService() {
    return this.injector.get(NotificationService);
  } */

  handleError(error: any) {
    // Check if it's an error from an HTTP response
    if (error instanceof HttpErrorResponse) {
      return; //http interceptor error handler has handled this already
    }

    if (error instanceof Result) {
      //ignore as it has been handled already
      //this.notificationService.showMessage(error.message);
    } else {
/*       this.notificationService.showMessage(
        `Undefined client error: ${error.message}`
      ); */
    }

    //this.notificationService.hideLoader();

    console.error('Error from global error handler', error);
  }
}
