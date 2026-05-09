import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../apikey/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY         = 'shop_token';
  private readonly REFRESH_TOKEN_KEY = 'shop_refresh_token';

  isLoggedIn = signal<boolean>(this.hasToken());

  constructor(private http: HttpClient, private router: Router) {}

  login(body: LoginRequest): Observable<AuthResponse> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, body).pipe(
      map(raw => {
        const inner        = raw?.data ?? raw;
        const token        = typeof inner === 'string' ? inner
          : (inner?.token ?? inner?.accessToken ?? inner?.jwt ?? '');
        const refreshToken = inner?.refreshToken ?? inner?.refresh_token ?? '';
        return { token, refreshToken } as AuthResponse;
      }),
      tap(res => {
        if (res.token) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
          this.isLoggedIn.set(true);
        }
        if (res.refreshToken) {
          localStorage.setItem(this.REFRESH_TOKEN_KEY, res.refreshToken);
        }
      })
    );
  }

  register(body: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/register`, body);
  }

  verifyEmail(email: string, code: string): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/auth/verify-email`, { email, code });
  }

  resendVerification(email: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/resend-email-verification/${email}`, {});
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }

  getToken(): string | null        { return localStorage.getItem(this.TOKEN_KEY); }
  getRefreshToken(): string | null { return localStorage.getItem(this.REFRESH_TOKEN_KEY); }
  hasToken(): boolean              { return !!localStorage.getItem(this.TOKEN_KEY); }

  getCurrentUserId(): number | null {
    const p = this.decodeToken();
    return p?.sub ?? p?.userId ?? p?.id ?? p?.nameid
      ?? p?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
      ?? null;
  }

  getCurrentUserEmail(): string | null {
    const p = this.decodeToken();
    return p?.email ?? p?.unique_name
      ?? p?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
      ?? null;
  }

  private decodeToken(): any {
    const token = this.getToken();
    if (!token) return null;
    try { return JSON.parse(atob(token.split('.')[1])); }
    catch { return null; }
  }
}