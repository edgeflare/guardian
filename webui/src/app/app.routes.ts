import { Routes } from '@angular/router';
import { authGuard } from '@edgeflare/ng-oidc';

export const routes: Routes = [
  {
    path: 'account',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/account').then((m) => m.ACCOUNT_ROUTES),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/dashboard').then((m) => m.DASHBOARD_ROUTES),
    pathMatch: 'prefix',
  },
  // public (landing, about etc)
  {
    path: '', pathMatch: 'prefix',
    loadChildren: () => import('./pages/public').then((m) => m.PUBLIC_ROUTES),
  },
];
