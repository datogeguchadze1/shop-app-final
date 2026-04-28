import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoritesService } from '../../apimxare/services/favorites.service';
import { CartService } from '../../apimxare/services/cart.service';
import { FavoriteItem } from '../../apimxare/models';
import { LoaderComponent } from '../../saziaro/components/loader/loader.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, LoaderComponent],
  templateUrl: "./favorites.component.html",
  styleUrl: "./favorites.component.scss"
})
export class FavoritesComponent implements OnInit {
  favorites = signal<FavoriteItem[]>([]);
  loading = signal(true);
  toast = signal('');

  constructor(private favSvc: FavoritesService, private cartSvc: CartService) {}

  ngOnInit() {
    this.favSvc.getAll().subscribe({
      next: f => { this.favorites.set(f); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 2500);
  }

  remove(productId: number) {
    this.favSvc.remove(productId).subscribe({
      next: () => {
        this.favorites.update(f => f.filter(i => i.productId !== productId));
        this.showToast('💔 ფავორიტებიდან ამოიღეს');
      },
      error: () => this.showToast('❌ შეცდომა')
    });
  }

  addToCart(productId: number) {
    this.cartSvc.addToCart(productId).subscribe({
      next: () => { this.cartSvc.cartCount.update(n => n + 1); this.showToast('🛒 კალათაში დაემატა!'); },
      error: () => this.showToast('❌ ვერ დაემატა')
    });
  }
}
