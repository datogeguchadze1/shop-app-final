import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../apimxare/services/auth.service';

type Step = 'form' | 'verify' | 'done';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  step = signal<Step>('form');

  firstName = ''; lastName = ''; email = ''; password = ''; confirmPw = '';
  showPw = false; showConfirm = false;

  verifyCode = '';
  resendCooldown = signal(0);

  loading  = signal(false);
  error    = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  get pwMatch() { return !this.confirmPw || this.password === this.confirmPw; }
  get formValid() {
    return this.firstName.trim() && this.lastName.trim()
        && this.email.trim() && this.password.length >= 6
        && this.password === this.confirmPw;
  }

  submit() {
    if (!this.formValid) return;
    this.loading.set(true); this.error.set('');
    this.auth.register({
      firstName: this.firstName, lastName: this.lastName,
      email: this.email, password: this.password
    }).subscribe({
      next: () => { this.loading.set(false); this.step.set('verify'); },
      error: e => {
        this.error.set(e?.error?.message ?? e?.error?.detail ?? 'Registration failed');
        this.loading.set(false);
      }
    });
  }

  verify() {
    if (!this.verifyCode.trim()) return;
    this.loading.set(true); this.error.set('');
    this.auth.verifyEmail(this.email, this.verifyCode.trim()).subscribe({
      next: () => {
        this.loading.set(false);
        this.step.set('done');
      },
      error: e => {
        this.error.set(e?.error?.detail ?? e?.error?.message ?? 'Invalid code. Try again.');
        this.loading.set(false);
      }
    });
  }

  resend() {
    if (this.resendCooldown() > 0) return;
    this.auth.resendVerification(this.email).subscribe({
      next: () => { this.error.set(''); this.startCooldown(); },
      error: () => this.startCooldown()
    });
  }

  startCooldown() {
    this.resendCooldown.set(60);
    const t = setInterval(() => {
      this.resendCooldown.update(n => { if (n <= 1) { clearInterval(t); return 0; } return n - 1; });
    }, 1000);
  }

  goLogin() { this.router.navigate(['/auth/login']); }
}