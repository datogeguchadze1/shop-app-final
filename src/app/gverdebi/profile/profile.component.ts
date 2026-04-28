import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../apimxare/services/user.service';
import { AuthService } from '../../apimxare/services/auth.service';
import { ModalComponent } from '../../saziaro/components/modal/modal.component';
import { LoaderComponent } from '../../saziaro/components/loader/loader.component';
import { User } from '../../apimxare/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalComponent, LoaderComponent],
  templateUrl: './profile.component.html',
  styleUrl:    './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  user    = signal<User | null>(null);
  loading = signal(true);
  saving  = signal(false);
  tab     = signal<'profile' | 'password' | 'danger'>('profile');
  deleteOpen     = signal(false);
  profileSuccess = signal(false);
  profileError   = signal('');
  pwSuccess = signal(false);
  pwError   = signal('');
  toast     = signal('');

  // Profile fields
  firstName = ''; lastName = ''; email = '';
  phoneNumber = ''; address = ''; dob = '';

  // Password fields
  currentPw = ''; newPw = ''; confirmPw = '';
  showCurrent = false; showNew = false; showConfirm = false;

  constructor(public auth: AuthService, private userSvc: UserService, private router: Router) {}

  ngOnInit() {
    this.userSvc.getMe().subscribe({
      next: u => {
        this.user.set(u);
        this.loading.set(false);
        this.firstName   = u.firstName;
        this.lastName    = u.lastName;
        this.email       = u.email;
        this.phoneNumber = u.details?.phoneNumber ?? '';
        this.address     = u.details?.address     ?? '';
        this.dob         = u.details?.dob         ? u.details.dob.substring(0, 10) : '';
      },
      error: (e) => {
        console.error('Profile load error:', e);
        this.loading.set(false);
      }
    });
  }

  get initials() {
    const u = this.user();
    if (!u) return '?';
    return (u.firstName?.charAt(0) ?? '') + (u.lastName?.charAt(0) ?? '');
  }

  updateProfile() {
    this.saving.set(true); this.profileError.set(''); this.profileSuccess.set(false);
    const body = {
      firstName: this.firstName, lastName: this.lastName, email: this.email,
      details: { phoneNumber: this.phoneNumber, address: this.address, dob: this.dob || undefined }
    };
    this.userSvc.update(body).subscribe({
      next: u => {
        this.user.set(u); this.saving.set(false); this.profileSuccess.set(true);
        setTimeout(() => this.profileSuccess.set(false), 3000);
      },
      error: e => { this.profileError.set(e?.error?.message ?? 'Update failed'); this.saving.set(false); }
    });
  }

  changePassword() {
    if (this.newPw !== this.confirmPw) { this.pwError.set('Passwords do not match'); return; }
    if (this.newPw.length < 6) { this.pwError.set('Password must be at least 6 characters'); return; }
    this.saving.set(true); this.pwError.set(''); this.pwSuccess.set(false);
    this.userSvc.changePassword({ currentPassword: this.currentPw, newPassword: this.newPw }).subscribe({
      next: () => {
        this.saving.set(false); this.pwSuccess.set(true);
        this.currentPw = ''; this.newPw = ''; this.confirmPw = '';
        setTimeout(() => this.pwSuccess.set(false), 3000);
      },
      error: e => { this.pwError.set(e?.error?.message ?? 'Failed to change password'); this.saving.set(false); }
    });
  }

  deleteAccount() {
    this.userSvc.deleteProfile().subscribe({
      next: () => { this.auth.logout(); this.router.navigate(['/']); },
      error: () => {}
    });
  }
}
