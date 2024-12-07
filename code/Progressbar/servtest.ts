import { BehaviorSubject } from 'rxjs';
import { ProgressBarService } from './progress-bar.service'; // Replace with the actual path
import { createSpyObj } from 'jest-createspyobj';

// Create the spy object with only the methods
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

// Mock the observables separately using Object.defineProperty
const showLabelSubject = new BehaviorSubject(false);
const labelSubject = new BehaviorSubject('');
const showPercentageLabelSubject = new BehaviorSubject(false);
const percentageValueSubject = new BehaviorSubject(0);

Object.defineProperty(MockProgressBarService, 'showLabel$', {
  get: jest.fn(() => showLabelSubject.asObservable()),
});
Object.defineProperty(MockProgressBarService, 'label$', {
  get: jest.fn(() => labelSubject.asObservable()),
});
Object.defineProperty(MockProgressBarService, 'showPercentageLabel$', {
  get: jest.fn(() => showPercentageLabelSubject.asObservable()),
});
Object.defineProperty(MockProgressBarService, 'percentageValue$', {
  get: jest.fn(() => percentageValueSubject.asObservable()),
});

// Customize methods if needed
MockProgressBarService.init.mockImplementation((currentPage: number, totalPages: number, showPercentage: boolean) => {
  console.log(`Initializing with currentPage: ${currentPage}, totalPages: ${totalPages}, showPercentage: ${showPercentage}`);
});

MockProgressBarService.setShowLabel.mockImplementation((show: boolean) => {
  showLabelSubject.next(show); // Update subject for testing
});

MockProgressBarService.setLabel.mockImplementation((label: string) => {
  labelSubject.next(label); // Update subject for testing
});

MockProgressBarService.setShowPercentageLabel.mockImplementation((show: boolean) => {
  showPercentageLabelSubject.next(show); // Update subject for testing
});

MockProgressBarService.reset.mockImplementation(() => {
  showLabelSubject.next(false);
  labelSubject.next('');
  showPercentageLabelSubject.next(false);
  percentageValueSubject.next(0);
});

MockProgressBarService.incrementCurrentPage.mockImplementation((currentPage?: number, newLabel?: string) => {
  console.log(`Incrementing currentPage to: ${currentPage}, newLabel: ${newLabel}`);
});
