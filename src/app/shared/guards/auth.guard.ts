import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '@svp-api-services';
import { Observable } from 'rxjs';

/**
 * AuthGuard is a route guard that checks if the user is authenticated and has the required roles.
 * If the user is not authenticated, they are redirected to the sign-in page.
 * If the user is authenticated but does not have the required roles, they are redirected to the unauthorized page.
 *
 * @param route - The activated route snapshot that contains the route information.
 * @param state - The router state snapshot that contains the current router state.
 * @returns A boolean, UrlTree, Observable, or Promise indicating whether the route can be activated.
 */
export const AuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  // Inject the AuthService to check authentication and roles
  const authService: AuthService = inject(AuthService);
  // Inject the Router to navigate if needed
  const router: Router = inject(Router);

  // Check if the user is authenticated
  const isAuthenticated = authService.IsAuthenticated();
  // Get the required roles from the route data
  const roles = route.data['roles'] as Array<string>;

  // Assume the user has the required roles by default
  let userIsInRole = true;
  // If roles are defined, check if the user has the required roles
  if (roles != null && roles != undefined) {
    userIsInRole = authService.userIsInRole(roles);
  }

  // If the user is not authenticated, navigate to the sign-in page with the current page as the return URL
  if (!isAuthenticated) {
    return router.navigate(['/auth/sign-in'], { queryParams: { returnUrl: state.url } });
  }
  // If the user is authenticated but does not have the required roles, navigate to the unauthorized page
  else if (!userIsInRole) {
    return router.navigate(['/unauthorized']);
  }

  // If the user is authenticated and has the required roles, allow the route activation
  return isAuthenticated;
};
