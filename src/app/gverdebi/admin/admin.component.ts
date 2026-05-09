import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../apimxare/services/admin.service';
import { CategoryService } from '../../apimxare/services/category.service';
import { Product, Category } from '../../apimxare/models';

type Tab = 'products' | 'categories';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  tab = signal<Tab>('products');

  products   = signal<Product[]>([]);
  prodLoad   = signal(true);
  prodPage   = signal(1);
  prodTotal  = signal(0);
  prodPages  = signal(1);
  prodSearch = '';
  showProdForm = signal(false);
  editingProd  = signal<Product | null>(null);
  prodForm: any = this.emptyProd();

  categories  = signal<Category[]>([]);
  catLoad     = signal(true);
  showCatForm = signal(false);
  editingCat  = signal<Category | null>(null);
  catForm: any = { name: '', description: '' };

  toast         = signal('');
  confirmDelete = signal<{ type: string; id: number; name: string } | null>(null);

  constructor(
    private adminSvc: AdminService,
    private catSvc:   CategoryService,
    private router:   Router
  ) {}

  ngOnInit() { this.loadProducts(); this.loadCategories(); }

  loadProducts() {
    this.prodLoad.set(true);
    this.adminSvc.getProducts(this.prodPage(), 20).subscribe({
      next: raw => {
        const p     = raw?.data ?? raw;
        const items = p?.items ?? (Array.isArray(p) ? p : []);
        this.products.set(items);
        this.prodTotal.set(p?.totalCount ?? items.length);
        this.prodPages.set(p?.totalPages ?? 1);
        this.prodLoad.set(false);
      },
      error: () => this.prodLoad.set(false)
    });
  }

  openProdCreate() { this.prodForm = this.emptyProd(); this.editingProd.set(null); this.showProdForm.set(true); }

  openProdEdit(p: Product) {
    this.editingProd.set(p);
    this.prodForm = {
      name: p.name, price: p.price, stock: p.stock ?? 0,
      description: p.description ?? '', brand: p.brand ?? '',
      categoryId: p.categoryId ?? '', imageUrl: p.imageUrl ?? '',
      salePrice: p.salePrice ?? ''
    };
    this.showProdForm.set(true);
  }

  saveProd() {
    const body = {
      ...this.prodForm,
      price:      +this.prodForm.price,
      stock:      +this.prodForm.stock,
      categoryId: +this.prodForm.categoryId || undefined,
      salePrice:  this.prodForm.salePrice ? +this.prodForm.salePrice : undefined
    };
    const ep  = this.editingProd();
    const obs = ep ? this.adminSvc.updateProduct(ep.id, body) : this.adminSvc.createProduct(body);
    obs.subscribe({
      next: () => { this.showProdForm.set(false); this.loadProducts(); this.showToast(ep ? '✓ Product updated' : '✓ Product created'); },
      error: (e: any) => this.showToast('❌ ' + (e?.error?.message ?? 'Failed to save'))
    });
  }

  askDeleteProd(p: Product) { this.confirmDelete.set({ type: 'product', id: p.id, name: p.name }); }

  loadCategories() {
    this.catLoad.set(true);
    this.catSvc.getAll().subscribe({
      next: cats => { this.categories.set(cats); this.catLoad.set(false); },
      error: () => this.catLoad.set(false)
    });
  }

  openCatCreate() { this.catForm = { name: '', description: '' }; this.editingCat.set(null); this.showCatForm.set(true); }

  openCatEdit(c: Category) {
    this.editingCat.set(c);
    this.catForm = { name: c.name, description: c.description ?? '' };
    this.showCatForm.set(true);
  }

  saveCat() {
    const ec  = this.editingCat();
    const obs = ec ? this.adminSvc.updateCategory(ec.id, this.catForm) : this.adminSvc.createCategory(this.catForm);
    obs.subscribe({
      next: () => { this.showCatForm.set(false); this.loadCategories(); this.showToast(ec ? '✓ Category updated' : '✓ Category created'); },
      error: (e: any) => this.showToast('❌ ' + (e?.error?.message ?? 'Failed to save'))
    });
  }

  askDeleteCat(c: Category) { this.confirmDelete.set({ type: 'category', id: c.id, name: c.name }); }

  confirmDoDelete() {
    const d = this.confirmDelete();
    if (!d) return;
    const obs = d.type === 'product'
      ? this.adminSvc.deleteProduct(d.id)
      : this.adminSvc.deleteCategory(d.id);
    obs.subscribe({
      next: () => {
        this.confirmDelete.set(null);
        this.showToast('🗑 Deleted successfully');
        if (d.type === 'product') this.loadProducts(); else this.loadCategories();
      },
      error: (e: any) => { this.confirmDelete.set(null); this.showToast('❌ ' + (e?.error?.message ?? 'Delete failed')); }
    });
  }

  goPage(p: number) { this.prodPage.set(p); this.loadProducts(); }

  logout() { sessionStorage.removeItem('admin_token'); this.router.navigate(['/admin/login']); }

  showToast(msg: string) { this.toast.set(msg); setTimeout(() => this.toast.set(''), 3000); }

  emptyProd() { return { name: '', price: '', stock: '', description: '', brand: '', categoryId: '', imageUrl: '', salePrice: '' }; }

  get filteredProducts(): Product[] {
    const q = this.prodSearch.toLowerCase();
    return q ? this.products().filter(p => p.name.toLowerCase().includes(q)) : this.products();
  }
}