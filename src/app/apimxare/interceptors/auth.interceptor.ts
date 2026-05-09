import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../apikey/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authSvc    = inject(AuthService);
  const adminToken = sessionStorage.getItem('admin_token');
  const userToken  = authSvc.getToken();
  const isAdminReq = req.url.includes('/admin');

  const token = (isAdminReq && adminToken) ? adminToken : (userToken || '');

  const headers: Record<string, string> = {};
  if (token)              headers['Authorization'] = `Bearer ${token}`;
  if (environment.apiKey) headers['x-api-key']    = environment.apiKey;

  return next(req.clone({ setHeaders: headers }));
};