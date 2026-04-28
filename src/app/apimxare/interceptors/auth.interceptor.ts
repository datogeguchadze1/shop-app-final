import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../apikey/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authSvc = inject(AuthService);

  // Admin token takes priority when present and request goes to admin endpoints
  const adminToken = localStorage.getItem('admin_token');
  const userToken  = authSvc.getToken();

  // Use admin token for admin API calls, user token otherwise
  const isAdminReq = req.url.includes('/admin');
  const token = (isAdminReq && adminToken) ? adminToken
              : (userToken || adminToken || environment.token || '');

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (environment.apiKey) headers['x-api-key'] = environment.apiKey;

  const cloned = req.clone({ setHeaders: headers });
  return next(cloned);
};
