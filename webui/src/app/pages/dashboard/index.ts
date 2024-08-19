import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    pathMatch: 'prefix',
    children: [
      {
        path: 'networks',
        loadChildren: () =>
          import("./networks").then(
            (m) => m.NETWORK_ROUTES,
          ),
      },
      {
        path: '', pathMatch: 'prefix',
        redirectTo: 'networks',
      },
    ],
  },
];
