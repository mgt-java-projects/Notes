import { ProgressBarService } from './progress-bar.service'; // Replace with your actual path
import { createSpyObj } from 'jest-create-spyobj';

export const MockProgressBarService: Partial<ProgressBarService> = createSpyObj('ProgressBarService', [
  'init', 
  'setShowLabel', 
  'setLabel', 
  'setShowPercentageLabel', 
  'reset', 
  'incrementCurrentPage'
]);

// Mock Observables
MockProgressBarService.showLabel$ = jest.fn(() => new BehaviorSubject(false).asObservable());
MockProgressBarService.label$ = jest.fn(() => new BehaviorSubject('').asObservable());
MockProgressBarService.showPercentageLabel$ = jest.fn(() => new BehaviorSubject(false).asObservable());
MockProgressBarService.percentageValue$ = jest.fn(() => new BehaviorSubject(0).asObservable());

// Add specific mock implementations for testing, if required
MockProgressBarService.init = jest.fn((currentPage: number, totalPages: number, showPercentage: boolean) => {
  console.log(`Initializing with currentPage: ${currentPage}, totalPages: ${totalPages}, showPercentage: ${showPercentage}`);
});

MockProgressBarService.setShowLabel = jest.fn((show: boolean) => {
  console.log(`Setting showLabel to: ${show}`);
});

MockProgressBarService.setLabel = jest.fn((label: string) => {
  console.log(`Setting label to: ${label}`);
});

MockProgressBarService.setShowPercentageLabel = jest.fn((show: boolean) => {
  console.log(`Setting showPercentageLabel to: ${show}`);
});

MockProgressBarService.reset = jest.fn(() => {
  console.log('Resetting progress bar');
});

MockProgressBarService.incrementCurrentPage = jest.fn((currentPage?: number, newLabel?: string) => {
  console.log(`Incrementing currentPage to: ${currentPage}, newLabel: ${newLabel}`);
});
