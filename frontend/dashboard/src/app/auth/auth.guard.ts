import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// Guard that only allows access if the user is logged in
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If the user has a token, allow access
  if (authService.isLoggedIn()) {
    return true;
  }

  // If not logged in, redirect to login page
  router.navigate(['/login']);
  return false;
};
