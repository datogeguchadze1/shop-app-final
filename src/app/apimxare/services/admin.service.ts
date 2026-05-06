import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../apikey/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base     = `${environment.apiUrl}/admin`;
  private prodBase = `${environment.apiUrl}/products`;
  private catBase  = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<any>(`${this.base}/login`, { email, password }).pipe(
      map(raw => {
        const inner = raw?.data ?? raw;
        const token = typeof inner === 'string' ? inner
          : (inner?.token ?? inner?.accessToken ?? inner?.jwt ?? '');
        return { token };
      })
    );
  }

  register(body: { firstName: string; lastName: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.base}/register`, body);
  }

  getProducts(page = 1, take = 20): Observable<any> {
    const params = new HttpParams().set('Take', take).set('Page', page);
    return this.http.get<any>(this.prodBase, { params });
  }

  createProduct(data: any): Observable<any>             { return this.http.post(this.prodBase, data); }
  updateProduct(id: number, data: any): Observable<any> { return this.http.put(`${this.prodBase}/${id}`, data); }
  deleteProduct(id: number): Observable<any>            { return this.http.delete(`${this.prodBase}/${id}`); }

  getCategories(): Observable<any>                              { return this.http.get<any>(this.catBase); }
  createCategory(data: { name: string; description?: string }): Observable<any> { return this.http.post(this.catBase, data); }
  updateCategory(id: number, data: any): Observable<any>       { return this.http.put(`${this.catBase}/${id}`, data); }
  deleteCategory(id: number): Observable<any>                   { return this.http.delete(`${this.catBase}/${id}`); }

  getOrders(page = 1, take = 20): Observable<any> {
    const params = new HttpParams().set('Take', take).set('Page', page);
    return this.http.get<any>(`${environment.apiUrl}/orders`, { params });
  }
}
