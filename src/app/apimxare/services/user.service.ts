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

  getMe(): Observable<User> {
    return this.http.get<any>(`${this.base}/me`).pipe(
      map(raw => this.normaliseUser(raw?.data ?? raw))
    );
  }

  update(body: any): Observable<User> {
    return this.http.put<any>(this.base, body).pipe(
      map(raw => this.normaliseUser(raw?.data ?? raw))
    );
  }

  changePassword(body: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.put(`${this.base}/change-password`, body);
  }

  deleteProfile(): Observable<any> {
    return this.http.delete(`${this.base}/delete-profile`);
  }

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
      profileImage: u.profileImage ?? u.pictureUrl ?? u.avatar ?? u.details?.pictureUrl ?? '',
      details: {
        phoneNumber: u.details?.phoneNumber ?? u.phoneNumber ?? '',
        address:     u.details?.address     ?? u.address     ?? '',
        dob:         u.details?.dob         ?? u.dob         ?? '',
        pictureUrl:  u.details?.pictureUrl  ?? u.pictureUrl  ?? '',
      }
    };
  }
}
