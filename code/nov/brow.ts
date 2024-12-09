constructor(private layoutStateService: LayoutStateService) {}

ngOnInit(): void {
  // Initialize layout state with custom values
  this.layoutStateService.init({
    nextButtonState: { loadingLabel: 'Starting...', color: 'secondary' },
    headerAreaState: { showLogo: false, tertiaryButtonLabel: 'Custom Help' },
  });

  // Access and log the current layout state
  console.log('Initial State:', this.layoutStateService.getState());

  // Update the layout state partially
  this.layoutStateService.update({
    nextButtonState: { isLoading: true, loadingLabel: 'Submitting...' },
  });

  // Log the updated state
  console.log('Updated State:', this.layoutStateService.getState());

  // Reset the layout state to the initialized values
  this.layoutStateService.reset();

  // Log the reset state
  console.log('Reset State:', this.layoutStateService.getState());
}
}
-------------------------------

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LayoutDisplayStateService {
  // Default display state
  private defaultDisplayState = {
    nextButtonDisplayState: {
      isLoading: false,
      loadingLabel: 'LOADING',
      isSuccess: false,
      successLabel: 'DONE',
      disabled: false,
      color: 'primary', // Enum: 'primary' | 'secondary'
      innerProjectedText: 'Next',
      ariaLabel: 'Next',
    },
    headerAreaDisplayState: {
      tertiaryButtonLabel: 'Help',
      showLogo: true,
      showBackButton: true,
      showTertiaryButton: true,
      showCloseButton: true,
    },
  };

  // Holds the initialized state
  private initializedDisplayState: any = { ...this.defaultDisplayState };

  // Observable display state using BehaviorSubject
  private displayStateSubject = new BehaviorSubject<any>({ ...this.defaultDisplayState });
  public displayState$ = this.displayStateSubject.asObservable(); // Expose as Observable

  /**
   * Initializes the display state with optional values.
   * @param initialDisplayState Optional state values to override defaults during app initialization.
   */
  init(initialDisplayState?: Partial<typeof this.defaultDisplayState>): void {
    this.initializedDisplayState = {
      ...this.defaultDisplayState,
      ...initialDisplayState,
      nextButtonDisplayState: {
        ...this.defaultDisplayState.nextButtonDisplayState,
        ...initialDisplayState?.nextButtonDisplayState,
      },
      headerAreaDisplayState: {
        ...this.defaultDisplayState.headerAreaDisplayState,
        ...initialDisplayState?.headerAreaDisplayState,
      },
    };

    // Set the current display state to the initialized state
    this.displayStateSubject.next({ ...this.initializedDisplayState });
  }

  /**
   * Resets the display state to the initialized state.
   */
  reset(): void {
    this.displayStateSubject.next({ ...this.initializedDisplayState });
  }

  /**
   * Updates the display state with optional values.
   * @param updates Partial state object to modify the current display state.
   */
  update(updates?: Partial<typeof this.defaultDisplayState>): void {
    const currentState = this.displayStateSubject.getValue();
    const updatedState = {
      ...currentState,
      ...updates,
      nextButtonDisplayState: {
        ...currentState.nextButtonDisplayState,
        ...updates?.nextButtonDisplayState,
      },
      headerAreaDisplayState: {
        ...currentState.headerAreaDisplayState,
        ...updates?.headerAreaDisplayState,
      },
    };
    this.displayStateSubject.next(updatedState);
  }

  /**
   * Retrieves the current display state (not reactive).
   */
  getState(): typeof this.defaultDisplayState {
    return this.displayStateSubject.getValue();
  }
}

---------


import { LayoutDisplayStateService } from './layout-display-state.service';

describe('LayoutDisplayStateService', () => {
  let service: LayoutDisplayStateService;

  beforeEach(() => {
    service = new LayoutDisplayStateService();
  });

  it('should initialize with default display state', () => {
    service.init();
    const state = service.getState();
    expect(state.nextButtonDisplayState.loadingLabel).toBe('LOADING');
    expect(state.headerAreaDisplayState.showLogo).toBe(true);
  });

  it('should initialize with custom display state', () => {
    const customState = {
      nextButtonDisplayState: { loadingLabel: 'Custom Loading' },
    };
    service.init(customState);
    const state = service.getState();
    expect(state.nextButtonDisplayState.loadingLabel).toBe('Custom Loading');
    expect(state.headerAreaDisplayState.showLogo).toBe(true); // Default value remains
  });

  it('should update the display state partially', () => {
    service.init();
    service.update({
      nextButtonDisplayState: { isLoading: true, loadingLabel: 'Submitting...' },
      headerAreaDisplayState: { showBackButton: false },
    });
    const state = service.getState();
    expect(state.nextButtonDisplayState.isLoading).toBe(true);
    expect(state.nextButtonDisplayState.loadingLabel).toBe('Submitting...');
    expect(state.headerAreaDisplayState.showBackButton).toBe(false);
  });

  it('should reset to initialized display state', () => {
    service.init({
      nextButtonDisplayState: { loadingLabel: 'Initialized Label' },
    });
    service.update({
      nextButtonDisplayState: { loadingLabel: 'Updated Label' },
    });
    service.reset();
    const state = service.getState();
    expect(state.nextButtonDisplayState.loadingLabel).toBe('Initialized Label');
    expect(state.headerAreaDisplayState.showLogo).toBe(true); // Default value
  });

  it('should emit state changes on update', () => {
    const spy = jest.fn();
    service.displayState$.subscribe(spy);

    service.init();
    expect(spy).toHaveBeenCalledTimes(1); // Called once on init

    service.update({
      nextButtonDisplayState: { isLoading: true },
    });
    expect(spy).toHaveBeenCalledTimes(2); // Called again on update

    const lastState = spy.mock.calls[spy.mock.calls.length - 1][0];
    expect(lastState.nextButtonDisplayState.isLoading).toBe(true);
  });

  it('should emit state changes on reset', () => {
    const spy = jest.fn();
    service.displayState$.subscribe(spy);

    service.init({
      nextButtonDisplayState: { loadingLabel: 'Initialized Label' },
    });
    service.update({
      nextButtonDisplayState: { loadingLabel: 'Updated Label' },
    });
    service.reset();

    expect(spy).toHaveBeenCalledTimes(3); // Init, update, reset
    const lastState = spy.mock.calls[spy.mock.calls.length - 1][0];
    expect(lastState.nextButtonDisplayState.loadingLabel).toBe('Initialized Label');
  });
});



-----------
import { Component, OnInit } from '@angular/core';
import { LayoutDisplayStateService } from './layout-display-state.service';

@Component({
  selector: 'app-layout-component',
  template: `
    <div>
      <h1>Header Area</h1>
      <button *ngIf="displayState.headerAreaDisplayState.showBackButton">Back</button>
      <button *ngIf="displayState.headerAreaDisplayState.showTertiaryButton">
        {{ displayState.headerAreaDisplayState.tertiaryButtonLabel }}
      </button>
      <button *ngIf="displayState.headerAreaDisplayState.showCloseButton">Close</button>

      <h2>Next Button</h2>
      <button [disabled]="displayState.nextButtonDisplayState.disabled">
        {{ displayState.nextButtonDisplayState.isLoading
          ? displayState.nextButtonDisplayState.loadingLabel
          : displayState.nextButtonDisplayState.innerProjectedText }}
      </button>
    </div>
  `,
  styleUrls: ['./layout-component.css'],
})
export class LayoutComponent implements OnInit {
  displayState: any;

  constructor(private layoutDisplayStateService: LayoutDisplayStateService) {}

  ngOnInit(): void {
    // Subscribe to display state changes
    this.layoutDisplayStateService.displayState$.subscribe((newState) => {
      this.displayState = newState;
    });

    // Update the layout display state dynamically
    setTimeout(() => {
      this.layoutDisplayStateService.update({
        nextButtonDisplayState: { isLoading: true, loadingLabel: 'Processing...' },
        headerAreaDisplayState: { showBackButton: false },
      });
    }, 2000);

    // Reset state after some time
    setTimeout(() => {
      this.layoutDisplayStateService.reset();
    }, 5000);
  }
}
