// Intercepts HTTP requests, adds the JWT token if available, and logs out
// the user if the API responds with 401 due to an expired token

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const tokenExpiredHeader = error.headers.get('Token-Expired');

      if (error.status === 401 && tokenExpiredHeader === 'true') {
        authService.logout();
        router.navigate(['/login'], { queryParams: { sessionExpired: 'true' } });
      }

      return throwError(() => error);
    }),
  );
};
