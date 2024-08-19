import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Peer } from '@app/shared/interfaces';
import { environment } from '@env';
// import { EditorComponent } from 'ng-essential';

@Component({
  selector: 'e-peer-conf-dialog',
  template: `
    <mat-dialog-content>
      @if (peerConfText()) {
        <div class="m-4 flex justify-end">
          <button mat-icon-button aria-label="download conf file" (click)="downloadConfFile()">
            <mat-icon color="primary">download</mat-icon>
          </button>

          <button
            mat-icon-button
            [cdkCopyToClipboard]="peerConfText()"
            (click)="onCopyClick()"
            aria-label="copy conf file"
          >
            <mat-icon color="primary">content_copy</mat-icon>
          </button>
        </div>
        <!-- <ng-editor [inputText]="peerConfText()" [mode]="'text'" [isReadOnly]="true"></ng-editor> -->
        <pre><code>{{ peerConfText() }}</code></pre>
      } @else {
        <div class="center">
          <mat-progress-spinner mode="indeterminate" diameter="100"></mat-progress-spinner>
        </div>
      }
    </mat-dialog-content>
  `,
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    CommonModule,
    ClipboardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    // EditorComponent,
  ],
})
export class PeerConfDialogComponent implements OnInit {
  peerConfText = signal<string>('');

  constructor(
    @Inject(MAT_DIALOG_DATA) public peer: Peer,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.fetchPeerConfig();
  }

  private fetchPeerConfig() {
    this.http
      .get(`${environment.api}/networks/${this.peer.network_id}/peers/${this.peer.id}`, {
        responseType: 'text',
      })
      .subscribe({
        next: (config) => this.peerConfText.set(config),
        error: (error) => {
          console.error('Error fetching peer configuration:', error);
          this.snackBar.open('Failed to load configuration.', 'Dismiss', { duration: 3000 });
        },
      });
  }

  downloadConfFile() {
    const blob = new Blob([this.peerConfText()], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.peer.name || 'peer'}.conf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  onCopyClick(): void {
    this.snackBar.open('Copied to clipboard!', 'Dismiss', { duration: 2000 });
  }
}
