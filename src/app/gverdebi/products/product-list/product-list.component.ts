import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../apimxare/services/product.service';
import { CategoryService } from '../../../apimxare/services/category.service';
import { CartService } from '../../../apimxare/services/cart.service';
import { FavoritesService } from '../../../apimxare/services/favorites.service';
import { AuthService } from '../../../apimxare/services/auth.service';
import { Product, Category } from '../../../apimxare/models';
import { ProductCardComponent } from '../../../saziaro/components/product-card/product-card.component';
import { LoaderComponent } from '../../../saziaro/components/loader/loader.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, LoaderComponent],
  templateUrl: "./product-list.component.html",
  styleUrl: "./product-list.component.scss"
})
export class ProductListComponent implements OnInit {
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  favoriteIds = signal<Set<number>>(new Set());
  loading = signal(false);
  error = signal('');
  total = signal(0);
  page = signal(1);
  pageSize = 12;
  sidebarOpen = signal(false);
  selectedCategoryId = signal<number | null>(null);
  activeCategory = computed(() => this.categories().find(c => c.id === this.selectedCategoryId()) || null);
  _totalPages = signal(0);
  totalPages = computed(() => this._totalPages() || Math.ceil(this.total() / this.pageSize) || 1);
  minPriceStr = '';
  maxPriceStr = '';
  sortOrder = '';
  toast = signal('');

  constructor(
    private productSvc: ProductService,
    private catSvc: CategoryService,
    private cartSvc: CartService,
    private favSvc: FavoritesService,
    private auth: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.catSvc.getAll().subscribe(cats => this.categories.set(cats));
    this.route.queryParams.subscribe(params => {
      if (params['search']) { this.searchProducts(params['search']); return; }
      if (params['category']) { this.selectedCategoryId.set(+params['category']); }
      this.loadProducts();
    });
    if (this.auth.isLoggedIn()) {
      this.favSvc.getAll().subscribe(favs =>
        this.favoriteIds.set(new Set(favs.map(f => f.productId)))
      );
    }
  }

  get minPrice(): number | undefined {
    const v = parseFloat(this.minPriceStr);
    return isNaN(v) ? undefined : v;
  }
  get maxPrice(): number | undefined {
    const v = parseFloat(this.maxPriceStr);
    return isNaN(v) ? undefined : v;
  }

  loadProducts() {
    this.loading.set(true);
    this.error.set('');
    const catId = this.selectedCategoryId();
    const hasFilter = catId || this.minPrice !== undefined || this.maxPrice !== undefined;

    const take = this.sortOrder ? 1000 : this.pageSize;
    const page = this.sortOrder ? 1    : this.page();

    const obs = hasFilter || this.sortOrder
      ? this.productSvc.filter(catId || undefined, this.minPrice, this.maxPrice, page, take)
      : this.productSvc.getAll(page, take);

    obs.subscribe({
      next: res => {
        let items = res.items || [];

        if (this.sortOrder === 'price_asc')  items = [...items].sort((a, b) => a.price - b.price);
        if (this.sortOrder === 'price_desc') items = [...items].sort((a, b) => b.price - a.price);

        if (this.sortOrder) {
    
          const start = (this.page() - 1) * this.pageSize;
          const totalAll = items.length;
          this._totalPages.set(Math.ceil(totalAll / this.pageSize));
          this.total.set(totalAll);
          this.products.set(items.slice(start, start + this.pageSize));
        } else {
          this.products.set(items);
          this.total.set(res.totalCount || 0);
          this._totalPages.set(res.totalPages || Math.ceil((res.totalCount || 0) / this.pageSize));
        }
        this.loading.set(false);
      },
      error: () => { this.error.set('Failed to load products'); this.loading.set(false); }
    });
  }

  searchProducts(query: string) {
    this.loading.set(true);
    this.error.set('');
    this.productSvc.search(query, this.page(), this.pageSize).subscribe({
      next: res => {
        this.products.set(res.items || []);
        this.total.set(res.totalCount || 0);
        this._totalPages.set(res.totalPages || Math.ceil((res.totalCount || 0) / this.pageSize));
        this.loading.set(false);
      },
      error: () => { this.error.set('Search failed'); this.loading.set(false); }
    });
  }

  selectCategory(id: number | null) {
    this.selectedCategoryId.set(id);
    this.page.set(1);
    this.sidebarOpen.set(false);
    this.loadProducts();
  }

  applyFilters() {
    this.page.set(1);
    this.sidebarOpen.set(false);
    this.loadProducts();
  }

  onSortChange() {
    this.page.set(1);
    this.loadProducts();
  }

  goPage(p: number) { this.page.set(p); this.loadProducts(); window.scrollTo(0, 0); }

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
      ids.delete(productId); this.favoriteIds.set(ids);
      this.favSvc.remove(productId).subscribe({ next: () => this.showToast('💔 ფავორიტებიდან ამოიღეს') });
    } else {
      ids.add(productId); this.favoriteIds.set(ids);
      this.favSvc.add(productId).subscribe({ next: () => this.showToast('❤️ ფავორიტებში დაემატა!') });
    }
  }
}
