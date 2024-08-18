import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule, RouterOutlet } from '@angular/router';
import { LoginButtonComponent } from '@shared/components';

@Component({
  selector: 'e-nav',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatIconModule, RouterModule, LoginButtonComponent, MatButtonModule],
  template: `
<mat-toolbar color="primary" class="flex justify-between items-center">
  <button mat-button routerLink="/">
    <span class="flex items-center text-2xl">
      <mat-icon [inline]="true" style="font-size: 2.5rem;">home</mat-icon>
    </span>
  </button>
  <div class="flex-1"></div>

  <button mat-button routerLink="/dashboard">
    <span class="flex items-center text-2xl">
      <mat-icon [inline]="true" style="font-size: 2.5rem;">wifi</mat-icon>
      &nbsp;
      <span>GET CONNECTED</span>
    </span>
  </button>

  <div class="flex-1 flex justify-end">
    <e-login-button></e-login-button>
  </div>
</mat-toolbar>

<router-outlet />
`,
  styles: ``
})
export class NavComponent {
}
