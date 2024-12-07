import { BehaviorSubject } from 'rxjs';
import { ProgressBarService } from './progress-bar.service'; // Replace with the actual path to your ProgressBarService
import { createSpyObj } from 'jest-create-spyobj';

export const MockProgressBarService = createSpyObj<ProgressBarService>(
  'ProgressBarService',
  [
    'init',
    'setShowLabel',
    'setLabel',
    'setShowPercentageLabel',
    'reset',
    'incrementCurrentPage',
  ],
  {
    showLabel$: new BehaviorSubject(false).asObservable(),
    label$: new BehaviorSubject('').asObservable(),
    showPercentageLabel$: new BehaviorSubject(false).asObservable(),
    percentageValue$: new BehaviorSubject(0).asObservable(),
  }
);

// Optionally, you can customize specific method implementations if needed
MockProgressBarService.init.mockImplementation((currentPage: number, totalPages: number, showPercentage: boolean) => {
  console.log(`Initializing with currentPage: ${currentPage}, totalPages: ${totalPages}, showPercentage: ${showPercentage}`);
});

MockProgressBarService.setShowLabel.mockImplementation((show: boolean) => {
  console.log(`Setting showLabel to: ${show}`);
});

MockProgressBarService.setLabel.mockImplementation((label: string) => {
  console.log(`Setting label to: ${label}`);
});

MockProgressBarService.setShowPercentageLabel.mockImplementation((show: boolean) => {
  console.log(`Setting showPercentageLabel to: ${show}`);
});

MockProgressBarService.reset.mockImplementation(() => {
  console.log('Progress bar reset');
});

MockProgressBarService.incrementCurrentPage.mockImplementation((currentPage?: number, newLabel?: string) => {
  console.log(`Incrementing currentPage to: ${currentPage}, newLabel: ${newLabel}`);
});
