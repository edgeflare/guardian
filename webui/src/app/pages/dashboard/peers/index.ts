import { Routes } from '@angular/router';

export const PEER_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./peers.component').then((m) => m.PeersComponent),
      },
    ],
  },
];
