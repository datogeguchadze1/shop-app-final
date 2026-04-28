import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../apimxare/services/auth.service';
import { CartService } from '../../../apimxare/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.scss"
})
export class NavbarComponent {
  auth = inject(AuthService);
  cartService = inject(CartService);
  private router = inject(Router);

  searchOpen = signal(false);
  menuOpen = signal(false);
  searchQuery = '';

  doSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { queryParams: { search: this.searchQuery.trim() } });
      this.searchOpen.set(false);
    }
  }
}
