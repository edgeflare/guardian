import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  readonly isNative: boolean;
  readonly isIos: boolean;
  readonly isAndroid: boolean;
  private breakpointObserver = inject(BreakpointObserver);

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.isIos = this.isNative && Capacitor.getPlatform() === 'ios';
    this.isAndroid = this.isNative && Capacitor.getPlatform() === 'android';
  }

  /** Observables for detecting various device types */
  isHandset$ = this.observeBreakpoint(Breakpoints.Handset);
  isTablet$ = this.observeBreakpoint(Breakpoints.Tablet);

  /** Signals derived from the Observables */
  isHandset = toSignal(this.isHandset$);
  isTablet = toSignal(this.isTablet$);

  /**
   * Observes a specific breakpoint and returns an Observable indicating
   * whether the current viewport matches that breakpoint.
   */
  private observeBreakpoint(breakpoint: string): Observable<boolean> {
    return this.breakpointObserver.observe(breakpoint).pipe(
      map((result) => result.matches),
      shareReplay(1)
    );
  }
}
