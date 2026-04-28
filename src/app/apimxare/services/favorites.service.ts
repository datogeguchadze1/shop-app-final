import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../apikey/environment';
import { FavoriteItem } from '../models';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private base = `${environment.apiUrl}/favorites`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<FavoriteItem[]> {
    const params = new HttpParams().set('Take', 100).set('Page', 1);
    return this.http.get<any>(this.base, { params }).pipe(
      map(raw => {
        const payload = raw?.data ?? raw;
        const arr: any[] = Array.isArray(payload?.items) ? payload.items
                         : Array.isArray(payload)         ? payload
                         : [];
        return arr.map(p => ({
          id:           p.id        ?? 0,
          productId:    p.productId ?? p.id ?? 0,
          productName:  p.productName ?? p.name ?? '',
          productImage: p.productImage ?? p.imageUrl ?? '',
          price:        p.price ?? 0,
          salePrice:    p.salePrice,
        } as FavoriteItem));
      })
    );
  }

  add(productId: number): Observable<any> {
    return this.http.post(`${this.base}/${productId}`, {});
  }

  remove(productId: number): Observable<any> {
    return this.http.delete(`${this.base}/${productId}`);
  }
}
