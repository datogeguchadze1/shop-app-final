// ─── Auth ───────────────────────────────────────────────
export interface LoginRequest  { email: string; password: string; }
export interface RegisterRequest { firstName: string; lastName: string; email: string; password: string; }
export interface AuthResponse  { token: string; }

// ─── User ────────────────────────────────────────────────
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  profileImage?: string;
  details?: { phoneNumber?: string; address?: string; dob?: string; pictureUrl?: string; };
}

// ─── Category ────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  imageUrl?: string;
  description?: string;
  productCount?: number;
  canDelete?: boolean;
}

// ─── Product ─────────────────────────────────────────────
export interface Product {
  id: number;
  stock: number;
  name: string;
  brand?: string;
  model?: string;
  price: number;
  imageUrl?: string;
  imageUrls?: string[];
  images?: string[];
  isFavorite?: boolean;
  rating?: number;
  createdAt?: string;
  canDelete?: boolean;
  category?: Category;
  categoryId?: number;
  categoryName?: string;
  description?: string;
  salePrice?: number;
  reviewCount?: number;
  specifications?: Record<string, string>;
}

// ─── Paginated response ───────────────────────────────────
export interface ProductsResponse {
  items: Product[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasMore: boolean;
}

// ─── Cart ─────────────────────────────────────────────────
export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  totalPrice: number;
}
export interface Cart { items: CartItem[]; totalPrice: number; }

// ─── Favorites ────────────────────────────────────────────
export interface FavoriteItem {
  id: number;
  productId: number;
  productName: string;
  productImage?: string;
  price: number;
  salePrice?: number;
}

// ─── Review ───────────────────────────────────────────────
export interface ReviewUser {
  id: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  user?: ReviewUser;
  rating: number;
  comment: string;
  createdAt: string;
  canDelete?: boolean;
}

export interface CreateReviewRequest { productId: number; rating: number; comment: string; }
export interface UpdateReviewRequest { id: number; rating: number; comment: string; }
