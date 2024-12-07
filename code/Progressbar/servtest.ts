import { createSpyObj } from 'jest-create-spyobj';

export const MockProgressBarService = createSpyObj('ProgressBarService', [
  'showLabel$', 
  'label$', 
  'showPercentageLabel$', 
  'percentageValue$', 
  'init', 
  'setShowLabel', 
  'setLabel', 
  'setShowPercentageLabel', 
  'reset', 
  'incrementCurrentPage'
]);

MockProgressBarService.showLabel$ = jest.fn();
MockProgressBarService.label$ = jest.fn();
MockProgressBarService.showPercentageLabel$ = jest.fn();
MockProgressBarService.percentageValue$ = jest.fn();

// Mock implementations for testing
MockProgressBarService.init.mockImplementation((currentPage, totalPages, showPercentage) => {
  console.log(`Initializing with currentPage: ${currentPage}, totalPages: ${totalPages}, showPercentage: ${showPercentage}`);
});

MockProgressBarService.setShowLabel.mockImplementation((show) => {
  console.log(`Setting showLabel to: ${show}`);
});

MockProgressBarService.setLabel.mockImplementation((label) => {
  console.log(`Setting label to: ${label}`);
});

MockProgressBarService.setShowPercentageLabel.mockImplementation((show) => {
  console.log(`Setting showPercentageLabel to: ${show}`);
});

MockProgressBarService.reset.mockImplementation(() => {
  console.log('Resetting progress bar');
});

MockProgressBarService.incrementCurrentPage.mockImplementation((currentPage, newLabel) => {
  console.log(`Incrementing currentPage to: ${currentPage}, newLabel: ${newLabel}`);
});

export default MockProgressBarService;
