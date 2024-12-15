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


import { BehaviorSubject, Observable } from 'rxjs';

export const MockProgressBarService = {
  // Observable to mimic options$
  options$: new BehaviorSubject({
    totalPages: 0,
    currentPage: 0,
    showLabel: false,
    label: '',
    displayPercentageValue: false,
    percentageValue: 0,
    displayProgressBar: true,
  }).asObservable(),

  /** Mocked init method */
  init: jest.fn(),

  /** Mocked updateOptions method */
  updateOptions: jest.fn(),

  /** Mocked setShowLabel method */
  setShowLabel: jest.fn(),

  /** Mocked setLabel method */
  setLabel: jest.fn(),

  /** Mocked setShowPercentageLabel method */
  setShowPercentageLabel: jest.fn(),

  /** Mocked incrementCurrentPage method */
  incrementCurrentPage: jest.fn(),
};


import { BehaviorSubject } from 'rxjs';

export const MockProgressBarService = {
  optionsSubject: new BehaviorSubject({
    totalPages: 0,
    currentPage: 0,
    showLabel: false,
    label: '',
    displayPercentageValue: false,
    percentageValue: 0,
    displayProgressBar: true,
  }),
  
  get options$() {
    return this.optionsSubject.asObservable();
  },
  
  init: jest.fn(),
  updateOptions: jest.fn(),
  setShowLabel: jest.fn(),
  setLabel: jest.fn(),
  setShowPercentageLabel: jest.fn(),
  incrementCurrentPage: jest.fn(),
};


get nextButtonDisplayState$() {
  return this.nextButtonDisplayStateSubject.asObservable();
},