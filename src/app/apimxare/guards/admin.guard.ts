import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const adminGuard = () => {
  const router = inject(Router);
  if (localStorage.getItem('admin_token')) return true;
  router.navigate(['/admin/login']);
  return false;
};
