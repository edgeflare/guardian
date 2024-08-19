import { Routes } from '@angular/router';

export const NETWORK_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'peers',  // without networkId
        redirectTo: '', // TODO: try redirecting to peers of first network
      },
      {
        path: ':networkId/peers',
        loadChildren: () =>
          import("../peers").then(
            (m) => m.PEER_ROUTES,
          ),
      },
      {
        path: '',
        loadComponent: () => import("./networks.component").then((m) => m.NetworksComponent),
      },
    ],
  },
];
