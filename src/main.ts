import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppRoutingModule } from './app/app-routing.module';
import { baseUrlInterceptor } from './app/shared/utilities/interceptors/base-url.interceptor';
import { authInterceptor } from './app/shared/utilities/interceptors/auth.interceptor';
import { errorHandlerInterceptor } from './app/shared/utilities/interceptors/error-handler.interceptor';
import { provideAngularSvgIcon } from 'angular-svg-icon';

if (environment.production || environment.staging) {
  enableProdMode()
  //show this warning only on prod mode
  if (window) {
    selfXSSWarning();
  }
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, AppRoutingModule),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([baseUrlInterceptor, authInterceptor, errorHandlerInterceptor])
    ),
    // provideAngularSvgIcon()
  ]
}).catch((err) =>
  console.error(err)
);

function selfXSSWarning() {
  setTimeout(() => {
      console.log('%c** STOP **', 'font-weight:bold; font: 2.5em Arial; color: white; background-color: #e11d48; padding-left: 15px; padding-right: 15px; border-radius: 25px; padding-top: 5px; padding-bottom: 5px;');
      console.log(
          `\n%cThis is a browser feature intended for developers. Using this console may allow attackers to impersonate you and steal your information sing an attack called Self-XSS. Do not enter or paste code that you do not understand.`, 'font-weight:bold; font: 2em Arial; color: #e11d48;'
      );
  });
}