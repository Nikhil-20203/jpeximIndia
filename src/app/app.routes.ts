import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home').then(m => m.Home),
  },
  {
    path: 'about',
    loadComponent: () => import('./about').then(m => m.About),
  },
  {
    path: 'products',
    loadComponent: () => import('./products').then(m => m.Products),
  },
  {
    path: 'process',
    loadComponent: () => import('./process').then(m => m.Process),
  },
  {
    path: 'trade',
    loadComponent: () => import('./trade').then(m => m.Trade),
  },
  {
    path: 'markets',
    loadComponent: () => import('./markets').then(m => m.Markets),
  },
  {
    path: 'contact',
    loadComponent: () => import('./contact').then(m => m.Contact),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
