import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../apimxare/services/product.service';
import { CategoryService } from '../../apimxare/services/category.service';
import { CartService } from '../../apimxare/services/cart.service';
import { FavoritesService } from '../../apimxare/services/favorites.service';
import { AuthService } from '../../apimxare/services/auth.service';
import { Product, Category } from '../../apimxare/models';
import { ProductCardComponent } from '../../saziaro/components/product-card/product-card.component';
import { LoaderComponent } from '../../saziaro/components/loader/loader.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent, LoaderComponent],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss"
})
export class HomeComponent implements OnInit {
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  favoriteIds = signal<Set<number>>(new Set());
  prodLoading = signal(true);
  catLoading = signal(true);
  toast = signal('');

  constructor(
    private productSvc: ProductService,
    private catSvc: CategoryService,
    private cartSvc: CartService,
    private favSvc: FavoritesService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.productSvc.getAll(1, 8).subscribe({
      next: r => { this.products.set(r.items || []); this.prodLoading.set(false); },
      error: () => this.prodLoading.set(false)
    });
    this.catSvc.getAll().subscribe({
      next: c => { this.categories.set(c); this.catLoading.set(false); },
      error: () => this.catLoading.set(false)
    });
    if (this.auth.isLoggedIn()) {
      this.favSvc.getAll().subscribe(f => this.favoriteIds.set(new Set(f.map(i => i.productId))));
    }
  }

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 2500);
  }

  onAddToCart(productId: number) {
    if (!this.auth.isLoggedIn()) { this.showToast('⚠ გთხოვთ გაიაროთ ავტორიზაცია'); return; }
    this.cartSvc.addToCart(productId).subscribe({
      next: () => { this.cartSvc.cartCount.update(n => n + 1); this.showToast('🛒 კალათაში დაემატა!'); },
      error: () => this.showToast('❌ ვერ დაემატა')
    });
  }

  onToggleFav(productId: number) {
    if (!this.auth.isLoggedIn()) { this.showToast('⚠ გთხოვთ გაიაროთ ავტორიზაცია'); return; }
    const ids = new Set(this.favoriteIds());
    if (ids.has(productId)) {
      ids.delete(productId);
      this.favoriteIds.set(ids);
      this.favSvc.remove(productId).subscribe({
        next: () => this.showToast('💔 ფავორიტებიდან ამოიღეს'),
        error: () => {}
      });
    } else {
      ids.add(productId);
      this.favoriteIds.set(ids);
      this.favSvc.add(productId).subscribe({
        next: () => this.showToast('❤️ ფავორიტებში დაემატა!'),
        error: () => {}
      });
    }
  }
}
