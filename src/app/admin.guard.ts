import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from './api.service';

export const adminGuard: CanActivateFn = () => {
  const api = inject(ApiService);
  return api.role() === 'administrator' || inject(Router).createUrlTree(['/account']);
};
