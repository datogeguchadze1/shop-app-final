import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../apikey/environment';
import { Category } from '../models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<any>(`${environment.apiUrl}/categories`).pipe(
      map(raw => {
        if (Array.isArray(raw))        return raw as Category[];
        if (Array.isArray(raw?.items)) return raw.items as Category[];
        if (Array.isArray(raw?.data))  return raw.data  as Category[];
        return [];
      })
    );
  }
}
