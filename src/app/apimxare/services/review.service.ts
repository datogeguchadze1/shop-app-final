import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../apikey/environment';
import { Review, CreateReviewRequest, UpdateReviewRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private base = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  getByProduct(productId: number): Observable<Review[]> {
    const params = new HttpParams().set('Take', 50).set('Page', 1);
    return this.http.get<any>(`${this.base}/${productId}`, { params }).pipe(
      map(raw => {
        const payload = raw?.data ?? raw;
        const arr: any[] = Array.isArray(payload?.items) ? payload.items
                         : Array.isArray(payload)         ? payload
                         : [];
        return arr.map(r => this.normaliseReview(r));
      })
    );
  }

  create(body: CreateReviewRequest): Observable<any> {
    return this.http.post<any>(this.base, {
      productId: body.productId,
      rate:      body.rating,
      rating:    body.rating,
      comment:   body.comment,
      text:      body.comment,
    });
  }

  update(body: UpdateReviewRequest): Observable<any> {
    return this.http.put<any>(this.base, {
      reviewId: body.id,
      rate:     body.rating,
      rating:   body.rating,
      comment:  body.comment,
      text:     body.comment,
    });
  }

  delete(reviewId: number): Observable<any> {
    return this.http.delete(`${this.base}/${reviewId}`);
  }

  normaliseReview(r: any): Review {
    if (!r) return {} as Review;
    const user      = r.user ?? {};
    const firstName = user.firstName ?? '';
    const lastName  = user.lastName  ?? '';
    const fullName  = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : '';
    const userName  = r.userName ?? fullName ?? (user.email ? user.email.split('@')[0] : 'Anonymous');

    return {
      id:        r.id ?? 0,
      productId: r.productId ?? 0,
      userId:    r.userId ?? user.id ?? 0,
      userName,
      user,
      comment:   r.comment ?? r.text ?? r.body ?? r.review ?? '',
      rating:    typeof r.rate   === 'number' ? r.rate
               : typeof r.rating === 'number' ? r.rating
               : parseFloat(r.rate ?? r.rating ?? '0') || 0,
      createdAt: r.createdAt ?? r.created_at ?? new Date().toISOString(),
      canDelete: r.canDelete ?? false,
    };
  }
}