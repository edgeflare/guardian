import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@edgeflare/ng-oidc';
import { ConfirmDeleteDialogComponent, ConfirmDeleteDialogData, EditorComponent, ExpandableTableComponent } from 'ng-essential';
import { NetworkService, PeerService } from '@app/shared/services';
import { Network, Peer } from '@shared/interfaces';
import { environment } from '@env';
import { PeerConfDialogComponent } from './peer-conf-dialog.component';
import { PeerQrDialogComponent } from './peer-qr-dialog.component';

@Component({
  selector: 'e-peers',
  standalone: true,
  imports: [
    CommonModule,
    ExpandableTableComponent,
    MatIconModule,
    MatButtonModule,
    EditorComponent,
    RouterModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './peers.component.html',
  styles: ``
})
export class PeersComponent implements OnInit {
  private authService = inject(AuthService);
  private peerService = inject(PeerService);
  private router = inject(Router);
  private networkService = inject(NetworkService);

  @Input() networkId!: string;

  peers: WritableSignal<Peer[]> = signal<Peer[]>([]);
  networks: WritableSignal<Network[] | undefined>;
  selectedNetwork: Network | undefined;
  peerConf: WritableSignal<string> = signal<string>('');

  constructor(private dialog: MatDialog, private http: HttpClient) {
    this.networks = this.networkService.items;
    if (this.networks() === undefined) {
      this.networkService.get(``).subscribe(networks => {
        this.networks.set(networks);
      });
    }
  }

  columns = ['name', 'addr', 'type'];
  cellDefs = ['name', 'addr', 'type'];
  currentExpandedRow?: Peer;
  isShowDetails = false;

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      if (this.networkExists(this.networkId)) {
        this.peerService.get(`/${this.networkId}/peers`).subscribe(peers => {
          this.peers.set(peers);
        });
      } else {
        this.router.navigate(['/dashboard/networks']);
      }
    }
  }

  private networkExists(networkId: string): boolean {
    const network = (this.networks() || []).find(network => network.id === networkId);
    if (network) this.selectedNetwork = network;
    return !!network;
  }

  handleRowChange(rowData: Peer): void {
    this.currentExpandedRow = rowData;
  }

  toggleDetails(): void {
    this.isShowDetails = !this.isShowDetails;
  }

  getPeerConfig(peer: Peer): void {
    this.peerConf.set('');
    this.http.get(`${environment.api}/networks/${this.networkId}/peers/${peer.id}`, { responseType: 'text' })
      .subscribe(config => this.peerConf.set(config));
  }

  openQrDialog(peer: Peer): void {
    this.dialog.open(PeerQrDialogComponent, {
      data: peer,
    });
  }

  openConfDialog(peer: Peer): void {
    this.dialog.open(PeerConfDialogComponent, {
      data: peer,
    });
  }

  onDeletePeer(peer: Peer) {
    const dialogData: ConfirmDeleteDialogData = {
      itemName: peer.name,
      deleteUrl: `${environment.api}/networks/${peer.network_id}/peers/${peer.id}`,
      itemType: 'peer'
    };

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: dialogData
    });

    // Subscribe to deletionComplete to get the API response or handle any further actions
    dialogRef.componentInstance.deletionComplete.subscribe(() => {
      // refresh data for the table
      this.peers.update(peers => peers?.filter(item => item.id !== peer.id));
    });
  }

  createPeer(): void {
    // TODO: implement
  }

  editPeer(peer: Peer): void {
    console.log('Editing peer:', peer);
    // TODO: implement
  }

}
