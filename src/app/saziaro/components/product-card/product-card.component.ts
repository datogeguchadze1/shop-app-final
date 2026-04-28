import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Product } from '../../../apimxare/models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: "./product-card.component.html",
  styleUrl: "./product-card.component.scss"
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() isFav = false;
  @Output() addToCart  = new EventEmitter<number>();
  @Output() toggleFav  = new EventEmitter<number>();

  constructor(private router: Router) {}

  get starsArray(): string {
    const r = Math.round(this.product.rating || 0);
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  }

  goToProduct() {
    this.router.navigate(['/products', this.product.id]);
  }

  onCart(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    this.addToCart.emit(this.product.id);
  }

  onFav(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    this.toggleFav.emit(this.product.id);
  }
}
