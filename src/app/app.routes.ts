import { Routes } from '@angular/router';
import { authGuard } from './apimxare/guards/auth.guard';
import { adminGuard } from './apimxare/guards/admin.guard';

export const routes: Routes = [
  {
     path: '', loadComponent: () => import('./gverdebi/home/home.component').then(m => m.HomeComponent) 
    },
  {
    path: 'auth',
    children: [
      { 
        path: 'login',    loadComponent: () => import('./gverdebi/auth/login/login.component').then(m => m.LoginComponent) 
      },
      { 
        path: 'register', loadComponent: () => import('./gverdebi/auth/register/register.component').then(m => m.RegisterComponent) 
      }
    ]
  },
  {
     path: 'products',     loadComponent: () => import('./gverdebi/products/product-list/product-list.component').then(m => m.ProductListComponent) 
    },
  {
     path: 'products/:id', loadComponent: () => import('./gverdebi/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent) 
    },
  {
     path: 'cart',         loadComponent: () => import('./gverdebi/cart/cart.component').then(m => m.CartComponent), canActivate: [authGuard] },
  {
     path: 'favorites',    loadComponent: () => import('./gverdebi/favorites/favorites.component').then(m => m.FavoritesComponent), canActivate: [authGuard] 
    },
  {
     path: 'profile',      loadComponent: () => import('./gverdebi/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] 
    },

  {
     path: 'admin/login',  loadComponent: () => import('./gverdebi/admin/admin-login.component').then(m => m.AdminLoginComponent)
     },
  {
     path: "admin", loadComponent: () => import("./gverdebi/admin/admin.component").then(m => m.AdminComponent) 
    },


  {
     path: 'not-found',    loadComponent: () => import('./gverdebi/not-found/not-found.component').then(m => m.NotFoundComponent) 
    },
  
  {
     path: '**',           loadComponent: () => import('./gverdebi/not-found/not-found.component').then(m => m.NotFoundComponent)
     }
];
