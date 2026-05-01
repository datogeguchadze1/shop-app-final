import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../../apimxare/services/product.service';
import { CartService } from '../../../apimxare/services/cart.service';
import { FavoritesService } from '../../../apimxare/services/favorites.service';
import { ReviewService } from '../../../apimxare/services/review.service';
import { AuthService } from '../../../apimxare/services/auth.service';
import { Product, Review } from '../../../apimxare/models';
import { LoaderComponent } from '../../../saziaro/components/loader/loader.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoaderComponent, CurrencyPipe],
  templateUrl: "./product-detail.component.html",
  styleUrl: "./product-detail.component.scss"
})
export class ProductDetailComponent implements OnInit {
  product    = signal<Product | null>(null);
  reviews    = signal<Review[]>([]);
  loading    = signal(true);
  reviewsLoading = signal(false);
  isFav      = signal(false);
  addingCart = signal(false);
  selectedImg = signal('');
  toast      = signal('');
  error      = signal('');
  editReviewId = signal<number | null>(null);

  qty = 1; newRating = 5; newComment = '';

  currentUserId    = signal<number | null>(null);
  currentUserEmail = signal<string | null>(null);

  constructor(
    private route:      ActivatedRoute,
    private productSvc: ProductService,
    private cartSvc:    CartService,
    private favSvc:     FavoritesService,
    private reviewSvc:  ReviewService,
    public  auth:       AuthService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error.set('Invalid product ID'); this.loading.set(false); return; }

    if (this.auth.isLoggedIn()) {
      this.currentUserId.set(this.auth.getCurrentUserId());
      this.currentUserEmail.set(this.auth.getCurrentUserEmail());
    }

    this.productSvc.getById(id).subscribe({
      next: p => {
        this.product.set(p);
        this.selectedImg.set(p.imageUrl || '');
        this.loading.set(false);
      },
      error: () => { this.error.set('Failed to load product'); this.loading.set(false); }
    });

    this.loadReviews(id);

    if (this.auth.isLoggedIn()) {
      this.favSvc.getAll().subscribe({
        next: favs => this.isFav.set(favs.some(f => f.productId === id)),
        error: () => {}
      });
    }
  }

  loadReviews(id?: number) {
    const pid = id ?? this.product()?.id;
    if (!pid) return;
    this.reviewsLoading.set(true);
    this.reviewSvc.getByProduct(pid).subscribe({
      next: r => {
        const arr = Array.isArray(r) ? r : ((r as any)?.data ?? (r as any)?.items ?? []);
        this.reviews.set(arr);
        this.reviewsLoading.set(false);
      },
      error: () => this.reviewsLoading.set(false)
    });
  }

  canModifyReview(r: Review): boolean {
    if (!this.auth.isLoggedIn()) return false;
    if (r.canDelete) return true;
    const uid = this.currentUserId();
    if (uid && r.userId && r.userId === uid) return true;
    const email = this.currentUserEmail();
    if (email && r.user?.email && r.user.email === email) return true;
    return false;
  }

  addToCart() {
    if (!this.auth.isLoggedIn() || !this.product()) return;
    this.addingCart.set(true);
    this.cartSvc.addToCart(this.product()!.id, this.qty).subscribe({
      next: () => {
        this.addingCart.set(false);
        this.cartSvc.cartCount.update(n => n + 1);
        this.showToast('✓ კალათაში დაემატა!');
      },
      error: () => { this.addingCart.set(false); this.showToast('❌ ვერ დაემატა'); }
    });
  }

  toggleFav() {
    if (!this.auth.isLoggedIn() || !this.product()) return;
    const id = this.product()!.id;
    if (this.isFav()) {
      this.favSvc.remove(id).subscribe({
        next: () => { this.isFav.set(false); this.showToast('💔 ფავორიტებიდან ამოიღეს'); },
        error: () => {}
      });
    } else {
      this.favSvc.add(id).subscribe({
        next: () => { this.isFav.set(true); this.showToast('❤️ ფავორიტებში დაემატა!'); },
        error: () => {}
      });
    }
  }

  submitReview() {
    const p = this.product();
    if (!p || !this.newComment.trim()) return;
    if (this.editReviewId()) {
      this.reviewSvc.update({ id: this.editReviewId()!, rating: this.newRating, comment: this.newComment })
        .subscribe({
          next: () => { this.cancelEdit(); this.loadReviews(); this.showToast('✓ რევიუ განახლდა!'); },
          error: (e) => { this.showToast('შეცდომა: ' + (e?.error?.detail ?? e?.error?.message ?? 'ვერ განახლდა')); }
        });
    } else {
      this.reviewSvc.create({ productId: p.id, rating: this.newRating, comment: this.newComment })
        .subscribe({
          next: () => { this.newComment = ''; this.newRating = 5; this.loadReviews(); this.showToast('✓ რევიუ გამოქვეყნდა!'); },
          error: (e) => { this.showToast('შეცდომა: ' + (e?.error?.detail ?? e?.error?.message ?? 'ვერ გამოქვეყნდა')); }
        });
    }
  }

  startEdit(r: Review)  { this.editReviewId.set(r.id); this.newRating = r.rating; this.newComment = r.comment; }
  cancelEdit()           { this.editReviewId.set(null); this.newComment = ''; this.newRating = 5; }

  deleteReview(r: Review) {
    if (!confirm('გსურთ ამ რევიუს წაშლა?')) return;
    this.reviewSvc.delete(r.id).subscribe({
      next: () => { this.loadReviews(); this.showToast('🗑 რევიუ წაიშალა'); },
      error: () => this.showToast('❌ წაშლა ვერ მოხდა')
    });
  }

  stars(n: number): string { const r = Math.round(n || 0); return '★'.repeat(r) + '☆'.repeat(5 - r); }
  incQty() { this.qty++; }
  decQty() { if (this.qty > 1) this.qty--; }
  showToast(msg: string) { this.toast.set(msg); setTimeout(() => this.toast.set(''), 2500); }
  onImgError(e: Event)   { (e.target as HTMLImageElement).src = '/placeholder.png'; }
}
