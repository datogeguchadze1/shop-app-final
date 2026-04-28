import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../apikey/environment';
import { Product, ProductsResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private base = `${environment.apiUrl}/products`;
  constructor(private http: HttpClient) {}

  getAll(page = 1, pageSize = 12, sortBy?: string): Observable<ProductsResponse> {
    let params = new HttpParams().set('Take', pageSize).set('Page', page);
    if (sortBy) params = params.set('SortBy', sortBy);
    return this.http.get<any>(this.base, { params }).pipe(map(r => this.normalise(r)));
  }

  getById(id: number): Observable<Product> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(
      map(r => this.normaliseProduct(r?.data ?? r))
    );
  }

  search(query: string, page = 1, pageSize = 12): Observable<ProductsResponse> {
    const params = new HttpParams()
      .set('query', query)
      .set('Take', pageSize)
      .set('Page', page);
    return this.http.get<any>(`${this.base}/search`, { params }).pipe(map(r => this.normalise(r)));
  }

  filter(categoryId?: number, minPrice?: number, maxPrice?: number,
         page = 1, pageSize = 12, sortBy?: string): Observable<ProductsResponse> {
    let params = new HttpParams().set('Take', pageSize).set('Page', page);
    if (categoryId)             params = params.set('CategoryId', categoryId);
    if (minPrice !== undefined) params = params.set('MinPrice', minPrice);
    if (maxPrice !== undefined) params = params.set('MaxPrice', maxPrice);
    if (sortBy)                 params = params.set('SortBy', sortBy);
    return this.http.get<any>(`${this.base}/filter`, { params }).pipe(map(r => this.normalise(r)));
  }

  private normalise(raw: any): ProductsResponse {
    const payload = raw?.data ?? raw;
    if (payload && Array.isArray(payload.items)) {
      return {
        items:       payload.items.map((p: any) => this.normaliseProduct(p)),
        currentPage: payload.currentPage ?? 1,
        totalPages:  payload.totalPages  ?? 1,
        totalCount:  payload.totalCount  ?? payload.items.length,
        pageSize:    payload.pageSize    ?? payload.items.length,
        hasMore:     payload.hasMore     ?? false,
      };
    }
    if (Array.isArray(payload)) {
      return {
        items: payload.map((p: any) => this.normaliseProduct(p)),
        currentPage: 1, totalPages: 1,
        totalCount: payload.length, pageSize: payload.length, hasMore: false,
      };
    }
    return { items: [], currentPage: 1, totalPages: 1, totalCount: 0, pageSize: 12, hasMore: false };
  }

  normaliseProduct(p: any): Product {
    if (!p) return {} as Product;
    return {
      ...p,
      categoryId:   p.category?.id   ?? p.categoryId,
      categoryName: p.category?.name ?? p.categoryName,
    };
  }
}
