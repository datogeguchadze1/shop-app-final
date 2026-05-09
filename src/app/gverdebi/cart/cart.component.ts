import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../apimxare/services/cart.service';
import { UserService } from '../../apimxare/services/user.service';
import { AuthService } from '../../apimxare/services/auth.service';
import { Cart, CartItem } from '../../apimxare/models';
import { LoaderComponent } from '../../saziaro/components/loader/loader.component';
import { ModalComponent } from '../../saziaro/components/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

const N8N_WEBHOOK_URL = 'https://dato.app.n8n.cloud/webhook/order-confirmation';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, LoaderComponent, ModalComponent, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  cart            = signal<Cart | null>(null);
  loading         = signal(true);
  checkoutOpen    = signal(false);
  checkoutLoading = signal(false);
  checkoutSuccess = signal(false);
  toast           = signal('');
  address = ''; paymentMethod = 'card';

  constructor(
    private cartSvc: CartService,
    private userSvc: UserService,
    private authSvc: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.cartSvc.getCart().subscribe({
      next: c => { this.cart.set(c); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 2500);
  }

  updateQty(item: CartItem, qty: number) {
    if (qty < 1) return;
    this.cartSvc.editQuantity(item.id, qty).subscribe({
      next: () => {
        this.cart.update(c => c ? {
          ...c,
          items: c.items.map((i: CartItem) => i.id === item.id
            ? { ...i, quantity: qty, totalPrice: i.price * qty }
            : i),
          totalPrice: c.items.reduce((s: number, i: CartItem) =>
            s + (i.id === item.id ? i.price * qty : i.totalPrice), 0)
        } : c);
      },
      error: () => this.showToast('❌ რაოდენობის შეცვლა ვერ მოხდა')
    });
  }

  removeItem(item: CartItem) {
    const doRemove = (id: number) => {
      this.cartSvc.removeFromCart(id).subscribe({
        next: () => {
          this.cart.update(c => c ? {
            ...c,
            items: c.items.filter((i: CartItem) => i.id !== item.id),
            totalPrice: c.items
              .filter((i: CartItem) => i.id !== item.id)
              .reduce((s: number, i: CartItem) => s + i.totalPrice, 0)
          } : c);
          this.cartSvc.cartCount.update(n => Math.max(0, n - 1));
          this.showToast('🗑 ამოიღეს კალათიდან');
        },
        error: (e: any) => {
          if (e.status === 404 && id === item.productId && item.id !== item.productId) {
            doRemove(item.id);
          } else {
            this.showToast('❌ წაშლა ვერ მოხდა');
          }
        }
      });
    };
    doRemove(item.productId || item.id);
  }

  placeOrder() {
    this.checkoutLoading.set(true);
    this.userSvc.checkout({ address: this.address, paymentMethod: this.paymentMethod }).subscribe({
      next: () => {
        this.sendOrderConfirmationEmail();

        this.checkoutSuccess.set(true);
        this.checkoutLoading.set(false);
        this.cart.set({ items: [], totalPrice: 0 });
        this.cartSvc.cartCount.set(0);
      },
      error: () => this.checkoutLoading.set(false)
    });
  }

  private sendOrderConfirmationEmail() {
    const email = this.authSvc.getCurrentUserEmail()
      ?? localStorage.getItem('user_email')
      ?? '';

    if (!email) return; 

    const payload = {
      email,
      firstName:     localStorage.getItem('user_firstName') ?? '',
      address:       this.address,
      paymentMethod: this.paymentMethod,
      totalPrice:    this.cart()?.totalPrice ?? 0
    };

    this.http.post(N8N_WEBHOOK_URL, payload).subscribe({
      next: () => console.log('✅ Webhook sent'),
      error: (e) => console.warn('⚠️ Webhook failed (checkout still OK):', e)
    });
  }
}