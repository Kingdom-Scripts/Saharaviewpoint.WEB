import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '@svp-api-services';
import { Observable } from 'rxjs';

export const AuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);
  
    const isAuthenticated = authService.IsAuthenticated();
    const roles = route.data['roles'] as Array<string>;

    let userIsInRole = true;
    if(roles != null && roles != undefined) {
      userIsInRole = authService.userIsInRole(roles);
    }
    
    if (!isAuthenticated) {
      return router.navigate(['/auth/sign-in'], { queryParams: { returnUrl: state.url }});
    } else if(!userIsInRole) {
      return router.navigate(['/auth/unauthorized']);
    }

    return isAuthenticated;
}