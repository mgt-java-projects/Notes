import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface ProgressBarOptions {
  totalPages?: number;
  currentPage?: number;
  showLabel?: boolean;
  label?: string;
  displayPercentageValue?: boolean;
  percentageValue?: number;
  displayProgressBar?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProgressBarService {
  private options: ProgressBarOptions = {
    totalPages: 0,
    currentPage: 0,
    showLabel: false,
    label: '',
    displayPercentageValue: false,
    percentageValue: 0,
    displayProgressBar: true,
  };

  private optionsSubject = new BehaviorSubject<ProgressBarOptions>({ ...this.options });

  /** Observable to access the current state of progress bar options */
  get options$(): Observable<ProgressBarOptions> {
    return this.optionsSubject.asObservable();
  }

  /** Initializes the progress bar with default or provided options */
  init(options?: Partial<ProgressBarOptions>): void {
    this.options = {
      ...this.options,
      ...options,
    };
    this.updatePercentageValue();
    this.emitOptions();
  }

  /** Updates the progress bar options with partial updates */
  updateOptions(options: Partial<ProgressBarOptions>): void {
    this.options = {
      ...this.options,
      ...options,
    };
    this.updatePercentageValue();
    this.emitOptions();
  }

  /** Updates the label visibility */
  setShowLabel(show: boolean): void {
    this.options.showLabel = show;
    this.emitOptions();
  }

  /** Updates the label text */
  setLabel(label: string): void {
    this.options.label = label;
    this.emitOptions();
  }

  /** Updates the visibility of the percentage label */
  setShowPercentageLabel(show: boolean): void {
    this.options.displayPercentageValue = show;
    this.emitOptions();
  }

  /** Increments or updates the current page */
  incrementCurrentPage(currentPage: number, newLabel?: string): void {
    if (currentPage !== undefined) {
      if (currentPage > (this.options.totalPages || 0)) {
        throw new Error(
          `Current page (${currentPage}) cannot be greater than total pages (${this.options.totalPages}).`
        );
      }
      this.options.currentPage = currentPage;
      if (newLabel !== undefined) {
        this.setLabel(newLabel);
        this.setShowLabel(true);
      } else {
        this.setLabel('');
        this.setShowLabel(false);
      }
      this.updatePercentageValue();
    } else {
      console.warn('Current page is required to update the progress.');
    }
  }

  /** Calculates and updates the percentage value based on current page and total pages */
  private updatePercentageValue(): void {
    this.options.percentageValue =
      (this.options.totalPages || 0) > 0
        ? Math.round(((this.options.currentPage || 0) / (this.options.totalPages || 0)) * 100)
        : 0;
    this.emitOptions();
  }

  /** Emits the updated options to subscribers */
  private emitOptions(): void {
    this.optionsSubject.next({ ...this.options });
  }
}

------------

import { TestBed } from '@angular/core/testing';
import { ProgressBarService } from './progress-bar.service';

describe('ProgressBarService', () => {
  let service: ProgressBarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgressBarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default values', () => {
    service.init();
    service.options$.subscribe((options) => {
      expect(options.totalPages).toBe(0);
      expect(options.currentPage).toBe(0);
      expect(options.showLabel).toBe(false);
      expect(options.label).toBe('');
      expect(options.displayPercentageValue).toBe(false);
      expect(options.percentageValue).toBe(0);
      expect(options.displayProgressBar).toBe(true);
    });
  });

  it('should update options', () => {
    service.updateOptions({ currentPage: 5, totalPages: 10 });
    service.options$.subscribe((options) => {
      expect(options.currentPage).toBe(5);
      expect(options.totalPages).toBe(10);
      expect(options.percentageValue).toBe(50);
    });
  });

  it('should increment current page and update percentage', () => {
    service.init({ totalPages: 10, currentPage: 3 });
    service.incrementCurrentPage(4);
    service.options$.subscribe((options) => {
      expect(options.currentPage).toBe(4);
      expect(options.percentageValue).toBe(40);
    });
  });

  it('should throw an error if current page exceeds total pages', () => {
    service.init({ totalPages: 5 });
    expect(() => service.incrementCurrentPage(6)).toThrowError(
      'Current page (6) cannot be greater than total pages (5).'
    );
  });

  it('should update label and visibility', () => {
    service.setLabel('Test Label');
    service.setShowLabel(true);
    service.options$.subscribe((options) => {
      expect(options.label).toBe('Test Label');
      expect(options.showLabel).toBe(true);
    });
  });

  it('should toggle percentage label visibility', () => {
    service.setShowPercentageLabel(true);
    service.options$.subscribe((options) => {
      expect(options.displayPercentageValue).toBe(true);
    });
  });

  it('should handle partial updates', () => {
    service.init({ totalPages: 10, currentPage: 1 });
    service.updateOptions({ showLabel: true });
    service.options$.subscribe((options) => {
      expect(options.totalPages).toBe(10);
      expect(options.currentPage).toBe(1);
      expect(options.showLabel).toBe(true);
    });
  });

  it('should calculate percentage value correctly', () => {
    service.init({ totalPages: 4, currentPage: 2 });
    service.options$.subscribe((options) => {
      expect(options.percentageValue).toBe(50);
    });
  });
});


------

import { BehaviorSubject } from 'rxjs';
import { createSpyObj } from 'jest-mock'; // Assuming Jest is used
import { ProgressBarService } from '@app/launchpack/core/services/navigation/progress-bar/progress-bar.service';

// Create the spy object with the required methods
export const MockProgressBarService = createSpyObj<ProgressBarService>(
  'ProgressBarService',
  [
    'init',
    'setShowLabel',
    'setLabel',
    'setShowPercentageLabel',
    'reset',
    'incrementCurrentPage',
  ]
);

// Mock the observables using BehaviorSubject
const showLabelSubject = new BehaviorSubject<boolean>(false);
const labelSubject = new BehaviorSubject<string>('');
const showPercentageLabelSubject = new BehaviorSubject<boolean>(false);
const percentageValueSubject = new BehaviorSubject<number>(0);

// Define observable properties on the mock object
Object.defineProperty(MockProgressBarService, 'showLabels$', {
  get: () => showLabelSubject.asObservable(),
});
Object.defineProperty(MockProgressBarService, 'labels$', {
  get: () => labelSubject.asObservable(),
});
Object.defineProperty(MockProgressBarService, 'showPercentageLabels$', {
  get: () => showPercentageLabelSubject.asObservable(),
});
Object.defineProperty(MockProgressBarService, 'percentageValues$', {
  get: () => percentageValueSubject.asObservable(),
});

// Customize mocked methods if needed
MockProgressBarService.init.mockImplementation(
  (currentPage: number, totalPages: number, showPercentage: boolean) => {
    console.log(
      `Initializing with currentPage: ${currentPage}, totalPages: ${totalPages}, showPercentage: ${showPercentage}`
    );
  }
);

MockProgressBarService.setShowLabel.mockImplementation((show: boolean) => {
  showLabelSubject.next(show); // Update the observable value for testing
});

MockProgressBarService.setLabel.mockImplementation((label: string) => {
  labelSubject.next(label); // Update the observable value for testing
});

MockProgressBarService.setShowPercentageLabel.mockImplementation(
  (show: boolean) => {
    showPercentageLabelSubject.next(show); // Update the observable value for testing
  }
);

MockProgressBarService.incrementCurrentPage.mockImplementation(() => {
  console.log('Incrementing current page...');
});

MockProgressBarService.reset.mockImplementation(() => {
  console.log('Resetting progress bar...');
  showLabelSubject.next(false);
  labelSubject.next('');
  showPercentageLabelSubject.next(false);
  percentageValueSubject.next(0);
});

// Optionally, mock additional methods or behaviors here
MockProgressBarService.init.mockImplementation((options?: Partial<ProgressBarOptions>) => {
  const { currentPage, totalPages, showPercentage } = options || {};
  console.log(
    `Initializing with currentPage: ${currentPage}, totalPages: ${totalPages}, showPercentage: ${showPercentage}`
  );
});