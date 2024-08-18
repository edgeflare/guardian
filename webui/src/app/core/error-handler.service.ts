import { ErrorHandler, Injectable, NgZone, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

/**
 * A service for handling errors globally across the application.
 * It displays error messages using MatSnackBar from Angular Material.
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService implements ErrorHandler {
  private snackBar = inject(MatSnackBar);
  private zone = inject(NgZone);

  /**
   * Handles the given error by displaying it in a snackbar.
   * @param error The error to handle.
   */
  handleError(error: unknown): void {
    this.zone.run(() => {
      this.showError(error);
    });

    // this.postLogToIngestor(error);
  }

  /**
   * Displays the error message using MatSnackBar. If the error is not an instance
   * of Error, a generic message is shown.
   * @param error The error to display.
   * @private
   */
  private showError(error: unknown): void {
    const config: MatSnackBarConfig = {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    };

    if (error instanceof Error) {
      this.snackBar.open(error.message, 'OK', config);
    } else {
      this.snackBar.open('An unexpected error occurred', 'OK', config);
    }

    console.error(error);
  }

  /**
   * Sends the given log entry to LogIngestor. We're likely gonna use ClickHouse, but considering among Loki, Fluentd
   * @param logEntry The log entry to send.
   * @private
   * @todo Implement this method
   */
  private postLogToIngestor(error: unknown) {
    const logEntry = this.formatErrorForIngestor(error);
    fetch('https://log-ingestion.backend.service/endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logEntry),
    }).catch((error) => console.error('Failed to send log to backend', error));
  }

  /**
   * Formats the given error as needed for LogIngestor.
   * @param error The error to format.
   * @private
   */

  private formatErrorForIngestor(error: unknown): object {
    // format log entry as needed for LogIngestor
    const formattedError: {
      timestamp: string;
      level: string;
      message: string;
      stack?: string;
    } = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message: 'An unexpected error occurred',
    };

    if (error instanceof Error) {
      formattedError.message = error.message || formattedError.message;
      formattedError.stack = error.stack || 'No stack trace available';
    }

    // Add any additional formatting or fields as required by logging strategy
    return formattedError;
  }
}
