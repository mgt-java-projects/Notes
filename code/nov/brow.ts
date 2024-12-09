import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NextButtonDisplayState, HeaderAreaDisplayState } from './interfaces';

@Injectable({
  providedIn: 'root',
})
export class LayoutDisplayStateService {
  // Default display states
  private defaultNextButtonDisplayState: NextButtonDisplayState = {
    isLoading: false,
    loadingLabel: 'LOADING',
    isSuccess: false,
    successLabel: 'DONE',
    disabled: false,
    color: 'primary',
    innerProjectedText: 'Next',
    ariaLabel: 'Next',
  };

  private defaultHeaderAreaDisplayState: HeaderAreaDisplayState = {
    tertiaryButtonLabel: 'Help',
    showLogo: true,
    showBackButton: true,
    showTertiaryButton: true,
    showCloseButton: true,
  };

  // BehaviorSubjects for individual states
  private nextButtonDisplayStateSubject = new BehaviorSubject<NextButtonDisplayState>({
    ...this.defaultNextButtonDisplayState,
  });
  private headerAreaDisplayStateSubject = new BehaviorSubject<HeaderAreaDisplayState>({
    ...this.defaultHeaderAreaDisplayState,
  });

  // Exposed observables
  public nextButtonDisplayState$ = this.nextButtonDisplayStateSubject.asObservable();
  public headerAreaDisplayState$ = this.headerAreaDisplayStateSubject.asObservable();

  /**
   * Initializes the Next Button state with optional values.
   * @param initialState Optional initial state for the Next Button.
   */
  initNextButtonState(initialState?: Partial<NextButtonDisplayState>): void {
    const initializedState = {
      ...this.defaultNextButtonDisplayState,
      ...initialState,
    };
    this.nextButtonDisplayStateSubject.next(initializedState);
  }

  /**
   * Initializes the Header Area state with optional values.
   * @param initialState Optional initial state for the Header Area.
   */
  initHeaderAreaState(initialState?: Partial<HeaderAreaDisplayState>): void {
    const initializedState = {
      ...this.defaultHeaderAreaDisplayState,
      ...initialState,
    };
    this.headerAreaDisplayStateSubject.next(initializedState);
  }

  /**
   * Updates the Next Button state with partial values.
   * @param updates Partial updates for Next Button state.
   */
  updateNextButtonState(updates: Partial<NextButtonDisplayState>): void {
    const currentState = this.nextButtonDisplayStateSubject.getValue();
    const updatedState = { ...currentState, ...updates };
    this.nextButtonDisplayStateSubject.next(updatedState);
  }

  /**
   * Updates the Header Area state with partial values.
   * @param updates Partial updates for Header Area state.
   */
  updateHeaderAreaState(updates: Partial<HeaderAreaDisplayState>): void {
    const currentState = this.headerAreaDisplayStateSubject.getValue();
    const updatedState = { ...currentState, ...updates };
    this.headerAreaDisplayStateSubject.next(updatedState);
  }

  /**
   * Resets the state for Next Button to its default values.
   */
  resetNextButtonState(): void {
    this.nextButtonDisplayStateSubject.next({ ...this.defaultNextButtonDisplayState });
  }

  /**
   * Resets the state for Header Area to its default values.
   */
  resetHeaderAreaState(): void {
    this.headerAreaDisplayStateSubject.next({ ...this.defaultHeaderAreaDisplayState });
  }

  /**
   * Resets both Next Button and Header Area states to their default values.
   */
  resetAllStates(): void {
    this.resetNextButtonState();
    this.resetHeaderAreaState();
  }
}


----------

import { LayoutDisplayStateService } from './layout-display-state.service';
import { NextButtonDisplayState, HeaderAreaDisplayState } from './interfaces';

describe('LayoutDisplayStateService', () => {
  let service: LayoutDisplayStateService;

  beforeEach(() => {
    service = new LayoutDisplayStateService();
  });

  it('should initialize the Next Button state with default values', () => {
    const state = service['nextButtonDisplayStateSubject'].getValue();
    expect(state).toEqual({
      isLoading: false,
      loadingLabel: 'LOADING',
      isSuccess: false,
      successLabel: 'DONE',
      disabled: false,
      color: 'primary',
      innerProjectedText: 'Next',
      ariaLabel: 'Next',
    });
  });

  it('should initialize the Header Area state with default values', () => {
    const state = service['headerAreaDisplayStateSubject'].getValue();
    expect(state).toEqual({
      tertiaryButtonLabel: 'Help',
      showLogo: true,
      showBackButton: true,
      showTertiaryButton: true,
      showCloseButton: true,
    });
  });

  it('should initialize the Next Button state with custom values', () => {
    const customState: Partial<NextButtonDisplayState> = {
      isLoading: true,
      loadingLabel: 'Custom Loading',
    };
    service.initNextButtonState(customState);
    const state = service['nextButtonDisplayStateSubject'].getValue();
    expect(state).toMatchObject(customState);
    expect(state.color).toBe('primary'); // Default value
  });

  it('should initialize the Header Area state with custom values', () => {
    const customState: Partial<HeaderAreaDisplayState> = {
      showLogo: false,
      tertiaryButtonLabel: 'Custom Help',
    };
    service.initHeaderAreaState(customState);
    const state = service['headerAreaDisplayStateSubject'].getValue();
    expect(state).toMatchObject(customState);
    expect(state.showCloseButton).toBe(true); // Default value
  });

  it('should update the Next Button state with partial values', () => {
    const updates: Partial<NextButtonDisplayState> = {
      isLoading: true,
      loadingLabel: 'Submitting...',
    };
    service.updateNextButtonState(updates);
    const state = service['nextButtonDisplayStateSubject'].getValue();
    expect(state.isLoading).toBe(true);
    expect(state.loadingLabel).toBe('Submitting...');
  });

  it('should update the Header Area state with partial values', () => {
    const updates: Partial<HeaderAreaDisplayState> = {
      showBackButton: false,
      tertiaryButtonLabel: 'Updated Help',
    };
    service.updateHeaderAreaState(updates);
    const state = service['headerAreaDisplayStateSubject'].getValue();
    expect(state.showBackButton).toBe(false);
    expect(state.tertiaryButtonLabel).toBe('Updated Help');
  });

  it('should reset the Next Button state to default values', () => {
    const updates: Partial<NextButtonDisplayState> = { isLoading: true };
    service.updateNextButtonState(updates);
    service.resetNextButtonState();
    const state = service['nextButtonDisplayStateSubject'].getValue();
    expect(state).toEqual(service['defaultNextButtonDisplayState']);
  });

  it('should reset the Header Area state to default values', () => {
    const updates: Partial<HeaderAreaDisplayState> = { showLogo: false };
    service.updateHeaderAreaState(updates);
    service.resetHeaderAreaState();
    const state = service['headerAreaDisplayStateSubject'].getValue();
    expect(state).toEqual(service['defaultHeaderAreaDisplayState']);
  });

  it('should reset all states to default values', () => {
    service.updateNextButtonState({ isLoading: true });
    service.updateHeaderAreaState({ showLogo: false });
    service.resetAllStates();

    const nextButtonState = service['nextButtonDisplayStateSubject'].getValue();
    const headerAreaState = service['headerAreaDisplayStateSubject'].getValue();

    expect(nextButtonState).toEqual(service['defaultNextButtonDisplayState']);
    expect(headerAreaState).toEqual(service['defaultHeaderAreaDisplayState']);
  });

  it('should emit state changes for Next Button on update', () => {
    const spy = jest.fn();
    service.nextButtonDisplayState$.subscribe(spy);

    const updates: Partial<NextButtonDisplayState> = { isLoading: true };
    service.updateNextButtonState(updates);

    expect(spy).toHaveBeenCalledTimes(2); // Initial + Update
    expect(spy).toHaveBeenCalledWith(expect.objectContaining(updates));
  });

  it('should emit state changes for Header Area on update', () => {
    const spy = jest.fn();
    service.headerAreaDisplayState$.subscribe(spy);

    const updates: Partial<HeaderAreaDisplayState> = { showLogo: false };
    service.updateHeaderAreaState(updates);

    expect(spy).toHaveBeenCalledTimes(2); // Initial + Update
    expect(spy).toHaveBeenCalledWith(expect.objectContaining(updates));
  });
});
--------

import { Component, OnInit } from '@angular/core';
import { LayoutDisplayStateService } from './layout-display-state.service';

@Component({
  selector: 'app-personal-info',
  template: ``,
})
export class PersonalInfoComponent implements OnInit {
  constructor(private layoutDisplayStateService: LayoutDisplayStateService) {}

  ngOnInit(): void {
    // Initialize Layout States
    this.initLayoutStates();

    // Update Layout States
    this.updateLayoutStates();
  }

  /**
   * Initializes the Next Button and Header Area states
   */
  private initLayoutStates(): void {
    this.layoutDisplayStateService.initNextButtonState({
      isLoading: false,
      loadingLabel: 'Start Processing',
      innerProjectedText: 'Submit',
    });

    this.layoutDisplayStateService.initHeaderAreaState({
      showLogo: true,
      showBackButton: true,
      tertiaryButtonLabel: 'Help',
    });
  }

  /**
   * Updates the Next Button and Header Area states
   */
  private updateLayoutStates(): void {
    this.layoutDisplayStateService.updateNextButtonState({
      isLoading: true,
      loadingLabel: 'Submitting...',
    });

    this.layoutDisplayStateService.updateHeaderAreaState({
      showBackButton: false,
      tertiaryButtonLabel: 'Assistance',
    });
  }
}
--------------------

import { TestBed } from '@angular/core/testing';
import { PersonalInfoComponent } from './personal-info.component';
import { LayoutDisplayStateService } from './layout-display-state.service';

describe('PersonalInfoComponent', () => {
  let component: PersonalInfoComponent;
  let service: LayoutDisplayStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PersonalInfoComponent],
      providers: [
        {
          provide: LayoutDisplayStateService,
          useValue: {
            initNextButtonState: jest.fn(),
            initHeaderAreaState: jest.fn(),
            updateNextButtonState: jest.fn(),
            updateHeaderAreaState: jest.fn(),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(PersonalInfoComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(LayoutDisplayStateService);
  });

  it('should initialize layout states on initialization', () => {
    const nextButtonInitState = {
      isLoading: false,
      loadingLabel: 'Start Processing',
      innerProjectedText: 'Submit',
    };

    const headerAreaInitState = {
      showLogo: true,
      showBackButton: true,
      tertiaryButtonLabel: 'Help',
    };

    component.ngOnInit();

    expect(service.initNextButtonState).toHaveBeenCalledWith(nextButtonInitState);
    expect(service.initHeaderAreaState).toHaveBeenCalledWith(headerAreaInitState);
  });

  it('should update layout states after initialization', () => {
    const nextButtonUpdateState = {
      isLoading: true,
      loadingLabel: 'Submitting...',
    };

    const headerAreaUpdateState = {
      showBackButton: false,
      tertiaryButtonLabel: 'Assistance',
    };

    component.ngOnInit();

    expect(service.updateNextButtonState).toHaveBeenCalledWith(nextButtonUpdateState);
    expect(service.updateHeaderAreaState).toHaveBeenCalledWith(headerAreaUpdateState);
  });

  it('should call init and update methods in the correct order', () => {
    const initNextButtonSpy = jest.spyOn(service, 'initNextButtonState');
    const initHeaderAreaSpy = jest.spyOn(service, 'initHeaderAreaState');
    const updateNextButtonSpy = jest.spyOn(service, 'updateNextButtonState');
    const updateHeaderAreaSpy = jest.spyOn(service, 'updateHeaderAreaState');

    component.ngOnInit();

    expect(initNextButtonSpy).toHaveBeenCalledBefore(updateNextButtonSpy);
    expect(initHeaderAreaSpy).toHaveBeenCalledBefore(updateHeaderAreaSpy);
  });
});


--------

import { Component, OnInit } from '@angular/core';
import { LayoutDisplayStateService } from './layout-display-state.service';
import { NextButtonDisplayState, HeaderAreaDisplayState } from './interfaces';

@Component({
  selector: 'app-responsive-layout',
  template: `
    <div>
      <h1>Responsive Layout</h1>
      <div>
        <button [disabled]="nextButtonState?.disabled">
          {{ nextButtonState?.isLoading ? nextButtonState?.loadingLabel : nextButtonState?.innerProjectedText }}
        </button>
      </div>
      <div>
        <p *ngIf="headerAreaState?.showLogo">Logo is visible</p>
        <button *ngIf="headerAreaState?.showBackButton">Back</button>
        <button *ngIf="headerAreaState?.showTertiaryButton">{{ headerAreaState?.tertiaryButtonLabel }}</button>
        <button *ngIf="headerAreaState?.showCloseButton">Close</button>
      </div>
    </div>
  `,
})
export class ResponsiveLayoutComponent implements OnInit {
  nextButtonState: NextButtonDisplayState | undefined;
  headerAreaState: HeaderAreaDisplayState | undefined;

  constructor(private layoutDisplayStateService: LayoutDisplayStateService) {}

  ngOnInit(): void {
    // Initialize Layout States
    this.initLayoutStates();

    // Subscribe to observables for state changes
    this.layoutDisplayStateService.nextButtonDisplayState$.subscribe((state) => {
      this.nextButtonState = state;
    });

    this.layoutDisplayStateService.headerAreaDisplayState$.subscribe((state) => {
      this.headerAreaState = state;
    });

    // Update Layout States
    this.updateLayoutStates();
  }

  /**
   * Initializes the layout states
   */
  private initLayoutStates(): void {
    this.layoutDisplayStateService.initNextButtonState({
      isLoading: false,
      loadingLabel: 'Start Processing',
      innerProjectedText: 'Submit',
    });

    this.layoutDisplayStateService.initHeaderAreaState({
      showLogo: true,
      showBackButton: true,
      tertiaryButtonLabel: 'Help',
    });
  }

  /**
   * Updates the layout states
   */
  private updateLayoutStates(): void {
    this.layoutDisplayStateService.updateNextButtonState({
      isLoading: true,
      loadingLabel: 'Submitting...',
    });

    this.layoutDisplayStateService.updateHeaderAreaState({
      showBackButton: false,
      tertiaryButtonLabel: 'Assistance',
    });
  }
}


------------

import { TestBed } from '@angular/core/testing';
import { ResponsiveLayoutComponent } from './responsive-layout.component';
import { LayoutDisplayStateService } from './layout-display-state.service';
import { NextButtonDisplayState, HeaderAreaDisplayState } from './interfaces';

describe('ResponsiveLayoutComponent', () => {
  let component: ResponsiveLayoutComponent;
  let service: LayoutDisplayStateService;

  const mockNextButtonState: NextButtonDisplayState = {
    isLoading: false,
    loadingLabel: 'Start Processing',
    innerProjectedText: 'Submit',
  };

  const mockHeaderAreaState: HeaderAreaDisplayState = {
    showLogo: true,
    showBackButton: true,
    tertiaryButtonLabel: 'Help',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResponsiveLayoutComponent],
      providers: [
        {
          provide: LayoutDisplayStateService,
          useValue: {
            initNextButtonState: jest.fn(),
            initHeaderAreaState: jest.fn(),
            updateNextButtonState: jest.fn(),
            updateHeaderAreaState: jest.fn(),
            nextButtonDisplayState$: {
              subscribe: jest.fn((callback) => callback(mockNextButtonState)),
            },
            headerAreaDisplayState$: {
              subscribe: jest.fn((callback) => callback(mockHeaderAreaState)),
            },
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(ResponsiveLayoutComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(LayoutDisplayStateService);
  });

  it('should initialize layout states on initialization', () => {
    component.ngOnInit();

    expect(service.initNextButtonState).toHaveBeenCalledWith({
      isLoading: false,
      loadingLabel: 'Start Processing',
      innerProjectedText: 'Submit',
    });

    expect(service.initHeaderAreaState).toHaveBeenCalledWith({
      showLogo: true,
      showBackButton: true,
      tertiaryButtonLabel: 'Help',
    });
  });

  it('should update layout states after initialization', () => {
    component.ngOnInit();

    expect(service.updateNextButtonState).toHaveBeenCalledWith({
      isLoading: true,
      loadingLabel: 'Submitting...',
    });

    expect(service.updateHeaderAreaState).toHaveBeenCalledWith({
      showBackButton: false,
      tertiaryButtonLabel: 'Assistance',
    });
  });

  it('should subscribe to Next Button state changes', () => {
    const spy = jest.spyOn(service.nextButtonDisplayState$, 'subscribe');
    component.ngOnInit();

    expect(spy).toHaveBeenCalled();
    expect(component.nextButtonState).toEqual(mockNextButtonState);
  });

  it('should subscribe to Header Area state changes', () => {
    const spy = jest.spyOn(service.headerAreaDisplayState$, 'subscribe');
    component.ngOnInit();

    expect(spy).toHaveBeenCalled();
    expect(component.headerAreaState).toEqual(mockHeaderAreaState);
  });

  it('should call init and update methods in the correct order', () => {
    const initNextButtonSpy = jest.spyOn(service, 'initNextButtonState');
    const initHeaderAreaSpy = jest.spyOn(service, 'initHeaderAreaState');
    const updateNextButtonSpy = jest.spyOn(service, 'updateNextButtonState');
    const updateHeaderAreaSpy = jest.spyOn(service, 'updateHeaderAreaState');

    component.ngOnInit();

    expect(initNextButtonSpy).toHaveBeenCalledBefore(updateNextButtonSpy);
    expect(initHeaderAreaSpy).toHaveBeenCalledBefore(updateHeaderAreaSpy);
  });
});


-----------




----------
Old

---------

import { LayoutDisplayStateService } from './layout-display-state.service';

describe('LayoutDisplayStateService', () => {
  let service: LayoutDisplayStateService;

  beforeEach(() => {
    service = new LayoutDisplayStateService();
  });

  it('should initialize with default display states', () => {
    const nextButtonState = service.getNextButtonState();
    const headerAreaState = service.getHeaderAreaState();

    expect(nextButtonState).toEqual({
      isLoading: false,
      loadingLabel: 'LOADING',
      isSuccess: false,
      successLabel: 'DONE',
      disabled: false,
      color: 'primary',
      innerProjectedText: 'Next',
      ariaLabel: 'Next',
    });

    expect(headerAreaState).toEqual({
      tertiaryButtonLabel: 'Help',
      showLogo: true,
      showBackButton: true,
      showTertiaryButton: true,
      showCloseButton: true,
    });
  });

  it('should initialize with custom display states', () => {
    service.init(
      { loadingLabel: 'Custom Loading', isLoading: true },
      { showLogo: false, tertiaryButtonLabel: 'Custom Help' }
    );

    const nextButtonState = service.getNextButtonState();
    const headerAreaState = service.getHeaderAreaState();

    expect(nextButtonState).toMatchObject({
      loadingLabel: 'Custom Loading',
      isLoading: true,
    });

    expect(headerAreaState).toMatchObject({
      showLogo: false,
      tertiaryButtonLabel: 'Custom Help',
    });
  });

  it('should update the Next Button state', () => {
    service.updateNextButtonState({ isLoading: true, loadingLabel: 'Processing...' });

    const nextButtonState = service.getNextButtonState();
    expect(nextButtonState).toMatchObject({
      isLoading: true,
      loadingLabel: 'Processing...',
    });
  });

  it('should update the Header Area state', () => {
    service.updateHeaderAreaState({ showBackButton: false, tertiaryButtonLabel: 'Updated Help' });

    const headerAreaState = service.getHeaderAreaState();
    expect(headerAreaState).toMatchObject({
      showBackButton: false,
      tertiaryButtonLabel: 'Updated Help',
    });
  });

  it('should reset the Next Button state to default', () => {
    service.updateNextButtonState({ isLoading: true });
    service.resetNextButtonState();

    const nextButtonState = service.getNextButtonState();
    expect(nextButtonState).toEqual({
      isLoading: false,
      loadingLabel: 'LOADING',
      isSuccess: false,
      successLabel: 'DONE',
      disabled: false,
      color: 'primary',
      innerProjectedText: 'Next',
      ariaLabel: 'Next',
    });
  });

  it('should reset the Header Area state to default', () => {
    service.updateHeaderAreaState({ showLogo: false });
    service.resetHeaderAreaState();

    const headerAreaState = service.getHeaderAreaState();
    expect(headerAreaState).toEqual({
      tertiaryButtonLabel: 'Help',
      showLogo: true,
      showBackButton: true,
      showTertiaryButton: true,
      showCloseButton: true,
    });
  });

  it('should reset all states to default', () => {
    service.updateNextButtonState({ isLoading: true });
    service.updateHeaderAreaState({ showLogo: false });

    service.resetAllStates();

    const nextButtonState = service.getNextButtonState();
    const headerAreaState = service.getHeaderAreaState();

    expect(nextButtonState).toEqual({
      isLoading: false,
      loadingLabel: 'LOADING',
      isSuccess: false,
      successLabel: 'DONE',
      disabled: false,
      color: 'primary',
      innerProjectedText: 'Next',
      ariaLabel: 'Next',
    });

    expect(headerAreaState).toEqual({
      tertiaryButtonLabel: 'Help',
      showLogo: true,
      showBackButton: true,
      showTertiaryButton: true,
      showCloseButton: true,
    });
  });

  it('should emit changes to Next Button state on update', () => {
    const spy = jest.fn();
    service.nextButtonDisplayState$.subscribe(spy);

    service.updateNextButtonState({ isLoading: true });
    expect(spy).toHaveBeenCalledWith({
      isLoading: true,
      loadingLabel: 'LOADING',
      isSuccess: false,
      successLabel: 'DONE',
      disabled: false,
      color: 'primary',
      innerProjectedText: 'Next',
      ariaLabel: 'Next',
    });
  });

  it('should emit changes to Header Area state on update', () => {
    const spy = jest.fn();
    service.headerAreaDisplayState$.subscribe(spy);

    service.updateHeaderAreaState({ showLogo: false });
    expect(spy).toHaveBeenCalledWith({
      tertiaryButtonLabel: 'Help',
      showLogo: false,
      showBackButton: true,
      showTertiaryButton: true,
      showCloseButton: true,
    });
  });
});


-----------



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
