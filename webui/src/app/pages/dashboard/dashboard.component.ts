import { Component } from '@angular/core';
import { AppShellComponent } from '@app/shared/components';

@Component({
  selector: 'e-dashboard',
  standalone: true,
  imports: [AppShellComponent],
  template: `<e-app-shell />`,
  styles: ``
})
export class DashboardComponent {

}
