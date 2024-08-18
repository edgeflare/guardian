import { Routes } from "@angular/router";
import { AboutComponent } from "./about/about.component";
import { HomeComponent } from "./home/home.component";
import { NavComponent } from "@app/shared/components";
import { CommunityComponent } from "./community/community.component";

export const PUBLIC_ROUTES: Routes = [
  {
    path: '', component: NavComponent,
    children: [
      { path: 'why-guardian-wireguard', component: AboutComponent },
      { path: 'community', component: CommunityComponent },
      { path: '', component: HomeComponent },
    ],
  },
];
