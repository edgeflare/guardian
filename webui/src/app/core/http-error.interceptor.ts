import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, retry, throwError, timer } from 'rxjs';

/**
 * HTTP error interceptor for Angular HTTP requests.
 * This interceptor retries failed HTTP requests a specified number (default 3) of times
 * and handles errors by logging them and throwing a new error after retries.
 * @type {import('@angular/common/http').HttpInterceptor}
 * @param {import('@angular/common/http').HttpRequest<any>} req - The HTTP request being intercepted.
 * @param {import('@angular/common/http').HttpHandler} next - The next HTTP handler in the chain.
 * @returns {import('rxjs').Observable<import('@angular/common/http').HttpEvent<any>>} - The observable stream of HTTP events.
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const retryCounts = 3;

  return next(req).pipe(
    retry({
      count: retryCounts,
      delay: (_, retryCount) => timer(retryCount * 1000),
    }),
    catchError((error) => {
      console.error(`${retryCounts} retries failed, ${error}`);
      return throwError(
        () => new Error(`request failed after ${retryCounts} retries`),
      );
    }),
  );
};
