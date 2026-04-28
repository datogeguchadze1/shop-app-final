import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../apimxare/services/auth.service';
import { LoaderComponent } from '../../../saziaro/components/loader/loader.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoaderComponent],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss"
})
export class LoginComponent {
  email = ''; password = ''; showPw = false;
  loading = signal(false);
  error = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    if (!this.email || !this.password) return;
    this.loading.set(true); this.error.set('');
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (e) => { this.error.set(e.error?.message || 'Login failed'); this.loading.set(false); }
    });
  }
}
