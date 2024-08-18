import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, WritableSignal, inject, signal } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';

/**
 * A generic wrapper around Angular HttpClient for PostgREST CRUD operations over HTTP.
 * @template T The type of the entities managed by this service.
 */
@Injectable({
  providedIn: 'root'
})
export class PGService<T> {
  /**
   * The HttpClient used to make HTTP requests.
   */
  private http = inject(HttpClient);

  /**
   * A stream of items of type T, shared among multiple subscribers.
   */
  items$: Observable<T[]>;

  /**
   * A signal representing the current value of items$, providing a reactive alternative to traditional promises.
   */
  items: WritableSignal<T[] | undefined>;

  /**
   * Constructs a new instance of the service.
   * @param apiUrl The base URL of the API to which requests are made.
   */

  constructor(
    @Inject(String) private apiUrl: string,
    http: HttpClient
  ) {
    this.http = http;
    this.items$ = this.http
      .get<T[]>(`${this.apiUrl}`)
      .pipe(shareReplay(1));

    // Initialize items as a writable signal with an initial value of undefined
    this.items = signal<T[] | undefined>(undefined);
  }

  get(query: string): Observable<T[]> {
    return this.http
      .get<T[]>(`${this.apiUrl}${query}`)
      .pipe(
        map((data: T[]) => {
          this.items.set(data);
          return data;
        })
      );
  }

  /**
   * Updates an item of type T identified by `id`.
   * @param id The identifier of the item to be updated.
   * @param item The updated item.
   * @returns An Observable of the HTTP response.
   */
  patch(query: string, item: T): Observable<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
    return this.http.patch<any>(`${this.apiUrl}${query}`, item); // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  /**
   * Retrieves an item of type T by its `id`.
   * @param query See https://postgrest.org/en/latest/references/api/tables_views.html#operators
   * @returns An Observable of the retrieved items.
   */

  /**
   * Creates a new item of type T.
   * @param item The item to create.
   * @returns An Observable of the HTTP response.
   */
  post(query: string, item: T): Observable<T> {
    const headers = new HttpHeaders({
      'Prefer': 'return=representation'
    });
    return this.http.post<T[]>(`${this.apiUrl}${query}`, item, { headers })
      .pipe(map((items) => items[0]));

  }

  /**
   * Deletes an item of type T identified by `id`.
   * @param id The identifier of the item to delete.
   * @returns An Observable of the HTTP response.
   */
  delete(query: string): Observable<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
    return this.http.delete<any>(`${this.apiUrl}${query}`); // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}
