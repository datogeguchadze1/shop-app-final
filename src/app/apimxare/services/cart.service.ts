import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../apikey/environment';
import { Cart, CartItem } from '../models';

@Injectable({ providedIn: 'root' })
export class CartService {
  cartCount = signal<number>(0);
  private base = `${environment.apiUrl}/cart`;
  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    const params = new HttpParams().set('Take', 100).set('Page', 1);
    return this.http.get<any>(this.base, { params }).pipe(
      map(raw => this.normaliseCart(raw)),
      tap(c => this.cartCount.set(c.items?.length ?? 0))
    );
  }

  addToCart(productId: number, quantity = 1): Observable<any> {
    return this.http.post(`${this.base}/add-to-cart`, { productId, quantity });
  }

  // API: DELETE /api/cart/remove-from-cart/{productId}
  removeFromCart(productId: number): Observable<any> {
    return this.http.delete(`${this.base}/remove-from-cart/${productId}`);
  }

  // Fallback: try with cartItem id if productId fails
  removeFromCartById(cartItemId: number): Observable<any> {
    return this.http.delete(`${this.base}/remove-from-cart/${cartItemId}`);
  }

  // API expects: { itemId, quantity }
  editQuantity(itemId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.base}/edit-quantity`, { itemId, quantity });
  }

  private normaliseCart(raw: any): Cart {
    if (!raw) return { items: [], totalPrice: 0 };

    const payload = raw?.data ?? raw;
    const arr: any[] = Array.isArray(payload.items)    ? payload.items
                     : Array.isArray(payload.cartItems) ? payload.cartItems
                     : Array.isArray(payload)           ? payload
                     : [];

    const items: CartItem[] = arr.map(i => {
      const prod = i.product ?? {};
      return {
        id:           i.id ?? 0,
        // productId: prefer explicit field, fallback to nested product.id
        productId:    i.productId ?? prod.id ?? 0,
        productName:  i.productName ?? prod.name ?? i.product?.name ?? '',
        productImage: i.productImage ?? prod.imageUrl ?? i.product?.imageUrl ?? '',
        price:        i.price ?? prod.price ?? 0,
        quantity:     i.quantity ?? 1,
        totalPrice:   i.totalPrice ?? ((i.price ?? prod.price ?? 0) * (i.quantity ?? 1)),
      };
    });

    const totalPrice = payload.totalPrice ?? payload.total
      ?? items.reduce((s, i) => s + i.totalPrice, 0);

    return { items, totalPrice };
  }
}
