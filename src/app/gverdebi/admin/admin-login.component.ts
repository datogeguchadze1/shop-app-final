import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../apimxare/services/admin.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-login-wrap">
      <div class="admin-login-box">
        <div class="logo">⚙️ Admin Panel</div>
        <h2>Administrator Login</h2>
        <div class="err" *ngIf="error()">{{ error() }}</div>
        <div class="field">
          <label>Email</label>
          <input type="email" [(ngModel)]="email" placeholder="admin@example.com" (keyup.enter)="login()" />
        </div>
        <div class="field">
          <label>Password</label>
          <input type="password" [(ngModel)]="password" placeholder="••••••••" (keyup.enter)="login()" />
        </div>
        <button class="btn-login" (click)="login()" [disabled]="loading()">
          {{ loading() ? 'Signing in…' : 'Sign In' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .admin-login-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0f0f1a; }
    .admin-login-box { background:#1a1a2e; border:1px solid #2a2a4a; border-radius:16px; padding:2.5rem; width:380px; }
    .logo { font-size:2rem; text-align:center; margin-bottom:.5rem; }
    h2 { text-align:center; color:#e2e2f0; margin:0 0 1.5rem; font-size:1.2rem; font-weight:600; }
    .err { background:#ff4a4a22; color:#ff6b6b; border:1px solid #ff4a4a44; border-radius:8px; padding:.75rem 1rem; margin-bottom:1rem; font-size:.875rem; }
    .field { margin-bottom:1rem; }
    .field label { display:block; font-size:.8rem; color:#8888aa; margin-bottom:.4rem; text-transform:uppercase; letter-spacing:.05em; }
    .field input { width:100%; background:#0f0f1a; border:1px solid #2a2a4a; border-radius:8px; padding:.75rem 1rem; color:#e2e2f0; font-size:.95rem; outline:none; box-sizing:border-box; }
    .field input:focus { border-color:#7c5cfc; }
    .btn-login { width:100%; padding:.85rem; background:#7c5cfc; color:#fff; border:none; border-radius:8px; font-size:1rem; font-weight:600; cursor:pointer; margin-top:.5rem; transition:opacity .2s; }
    .btn-login:hover { opacity:.9; }
    .btn-login:disabled { opacity:.5; cursor:not-allowed; }
  `]
})
export class AdminLoginComponent {
  email = ''; password = '';
  loading = signal(false); error = signal('');

  constructor(private adminSvc: AdminService, private router: Router) {}

  login() {
    if (!this.email || !this.password) { this.error.set('Enter email and password'); return; }
    this.loading.set(true); this.error.set('');
    this.adminSvc.login(this.email, this.password).subscribe({
      next: res => {
        if (res.token) {
          localStorage.setItem('admin_token', res.token);
          this.router.navigate(['/admin']);
        } else {
          this.error.set('Login failed — no token received');
          this.loading.set(false);
        }
      },
      error: e => {
        this.error.set(e?.error?.message ?? e?.error?.detail ?? 'Invalid credentials');
        this.loading.set(false);
      }
    });
  }
}
