import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ApiService } from './api.service';

export const authExpiryInterceptor: HttpInterceptorFn = (request, next) => {
  const api = inject(ApiService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && api.accessToken()) {
        api.logout();
        void router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
