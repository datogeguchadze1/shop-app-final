import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../apikey/environment';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = `${environment.apiUrl}/users`;
  constructor(private http: HttpClient) {}

  // GET /api/users/me
  getMe(): Observable<User> {
    return this.http.get<any>(`${this.base}/me`).pipe(
      map(raw => {
        // Response: { id, email, role, lastName, firstName, details:{ phoneNumber, address, dob, pictureUrl } }
        const u = raw?.data ?? raw;
        return this.normaliseUser(u);
      })
    );
  }

  // PUT /api/users
  update(body: any): Observable<User> {
    return this.http.put<any>(this.base, body).pipe(
      map(raw => this.normaliseUser(raw?.data ?? raw))
    );
  }

  // PUT /api/users/change-password
  changePassword(body: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.put(`${this.base}/change-password`, body);
  }

  // DELETE /api/users/delete-profile
  deleteProfile(): Observable<any> {
    return this.http.delete(`${this.base}/delete-profile`);
  }

  // POST /api/users/checkout
  checkout(body: { address: string; paymentMethod: string }): Observable<any> {
    return this.http.post(`${this.base}/checkout`, body);
  }

  normaliseUser(u: any): User {
    if (!u) return { id: 0, firstName: '', lastName: '', email: '' };
    return {
      id:           u.id ?? 0,
      firstName:    u.firstName  ?? u.first_name  ?? '',
      lastName:     u.lastName   ?? u.last_name   ?? '',
      email:        u.email ?? '',
      role:         u.role  ?? '',
      profileImage: u.profileImage ?? u.pictureUrl ?? u.avatar
                 ?? u.details?.pictureUrl ?? '',
      details: {
        phoneNumber: u.details?.phoneNumber ?? u.phoneNumber ?? '',
        address:     u.details?.address     ?? u.address     ?? '',
        dob:         u.details?.dob         ?? u.dob         ?? '',
        pictureUrl:  u.details?.pictureUrl  ?? u.pictureUrl  ?? '',
      }
    };
  }
}
