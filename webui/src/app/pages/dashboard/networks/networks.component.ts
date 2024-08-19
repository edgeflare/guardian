import { CommonModule } from '@angular/common';
import { Component, Inject, inject, WritableSignal, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { EditorComponent, ExpandableTableComponent } from 'ng-essential';
import { AuthService } from '@edgeflare/ng-oidc'
import { NetworkService } from '@app/shared/services/wireguard.service';
import { IPNet, Network } from '@app/shared/interfaces';
import { ipNetToCidr } from '@app/shared/util';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * A component for managing WireGuard networks, displaying them in an expandable table and allowing editing.
 */
@Component({
  selector: 'e-networks',
  standalone: true,
  imports: [CommonModule, ExpandableTableComponent, MatIconModule, EditorComponent, MatButtonModule, RouterModule, MatProgressSpinnerModule],
  templateUrl: './networks.component.html',
  styles: ``,
})
export class NetworksComponent implements OnInit {
  private authService = inject(AuthService);

  /** A reactive signal holding the list of networks, updated when new data is fetched. */
  networks: WritableSignal<Network[] | undefined>;

  constructor(
    private networkService: NetworkService,
    private dialog: MatDialog,
  ) {
    // Initialize networks signal from the NetworkService
    this.networks = this.networkService.items;
  }

  columns = ['name', 'addr'];
  cellDefs = ['name', 'addr'];
  currentExpandedRow?: Network;

  isShowDetails = false;

  /** Updates the currently expanded row in the table. */
  handleRowChange(rowData: Network) {
    this.currentExpandedRow = rowData;
  }

  /** Toggles the display of detailed network information. */
  toggleDetails() {
    this.isShowDetails = !this.isShowDetails;
  }

  /**
   * Opens a dialog to edit the provided network.
   *
   * @param network The network to edit.
   */
  openEditNetworkDialog(network: Network): void {
    this.dialog.open(EditNetworkDialogComponent, {
      data: network,
    });
  }

  /** Fetches network data from the service if the user is authenticated. */
  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.networkService.get(``).subscribe();
    }
  }

  ipNetToCidr = (ipNet: IPNet | string) => ipNetToCidr(ipNet);

  createNetwork(): void {
    // TODO: implement
  }

  editNetwork(network: Network): void {
    console.log('Editing network:', network);
    // TODO: implement
  }

  deleteNetwork(network: Network): void {
    console.log('Deleting network:', network);
    // TODO: implement
  }
}

/**
 * A dialog component for editing network details.
 */
@Component({
  selector: 'e-edit-network-dialog',
  template: `
<mat-dialog-content>
  <pre><code>{{ data | json }}</code></pre>
</mat-dialog-content>
`,
  standalone: true,
  imports: [MatDialogModule, CommonModule],
})
export class EditNetworkDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: Network) { }
}
