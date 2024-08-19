import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Peer } from '@app/shared/interfaces';
import { NetworkService } from '@app/shared/services';
import { environment } from '@env';

@Component({
  selector: 'e-peer-qr-dialog',
  template: `
    <mat-dialog-content>
      @if (qrCodeBlobUrl()) {
        <img [src]="qrCodeBlobUrl()" alt="Peer QR Code" />
      } @else {
        <div class="center">
          <mat-progress-spinner mode="indeterminate" diameter="100"></mat-progress-spinner>
        </div>
      }
    </mat-dialog-content>
  `,
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, CommonModule, MatProgressSpinnerModule],
})
export class PeerQrDialogComponent implements OnInit {
  qrCodeBlobUrl = signal<string | null>(null);
  isLoading = signal(true);

  constructor(
    @Inject(MAT_DIALOG_DATA) public peer: Peer,
    private networkService: NetworkService,
    private http: HttpClient,
    private snackBar: MatSnackBar // Use snackbar to show errors or notifications
  ) { }

  ngOnInit() {
    const selectedNetwork = this.networkService.items()?.find(
      (network) => network.id === this.peer.network_id
    );

    if (selectedNetwork) {
      this.fetchQrCodeBlob(selectedNetwork.id);
    } else {
      this.snackBar.open('Network not found for peer.', 'Dismiss', { duration: 3000 });
      console.error("Network not found for peer:", this.peer);
    }
  }

  private fetchQrCodeBlob(networkId: string) {
    const qrCodeUrl = `${environment.api}/networks/${networkId}/peers/${this.peer.id}/qr`;

    this.isLoading.set(true);
    this.http.get(qrCodeUrl, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        this.qrCodeBlobUrl.set(URL.createObjectURL(blob));
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching QR code:', error);
        this.snackBar.open('Failed to load QR code.', 'Dismiss', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }
}
