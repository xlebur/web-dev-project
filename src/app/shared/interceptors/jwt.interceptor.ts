import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('tr_jwt_token');

  // Attach token if it exists
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 — token expired or invalid, force logout
      if (error.status === 401) {
        localStorage.removeItem('tr_jwt_token');
        localStorage.removeItem('tr_user');
        router.navigate(['/auth']);
      }
      return throwError(() => error);
    })
  );
};
