import { ProgressBarService } from './progress-bar.service';

describe('ProgressBarService', () => {
  let service: ProgressBarService;

  beforeEach(() => {
    service = new ProgressBarService();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should reset progress bar to default state', () => {
    service.setTotalPages(5);
    service.setCurrentPage(3);
    service.setLabel('Step 3 of 5');
    service.setShowLabel(true);

    service.reset();

    service.currentPage$.subscribe((currentPage) => {
      expect(currentPage).toBe(0);
    });
    service.label$.subscribe((label) => {
      expect(label).toBe('');
    });
    service.showLabel$.subscribe((showLabel) => {
      expect(showLabel).toBe(false);
    });
  });

  it('should set total pages', () => {
    service.setTotalPages(5);
    expect(service['totalPages']).toBe(5);
  });

  it('should set current page', () => {
    service.setTotalPages(5);
    service.setCurrentPage(3);
    service.currentPage$.subscribe((currentPage) => {
      expect(currentPage).toBe(3);
    });
  });

  it('should throw an error if current page exceeds total pages', () => {
    service.setTotalPages(3);
    expect(() => service.setCurrentPage(4)).toThrowError(
      'Current page (4) cannot be greater than total pages (3).'
    );
  });

  it('should increment current page by 1 without label', () => {
    service.setTotalPages(5);
    service.setCurrentPage(2);
    service.incrementCurrentPage();
    service.currentPage$.subscribe((currentPage) => {
      expect(currentPage).toBe(3);
    });
    service.label$.subscribe((label) => {
      expect(label).toBe('');
    });
    service.showLabel$.subscribe((showLabel) => {
      expect(showLabel).toBe(false);
    });
  });

  it('should increment current page by 1 and set a label', () => {
    service.setTotalPages(5);
    service.setCurrentPage(2);
    service.incrementCurrentPage(undefined, 'Step 3 of 5');
    service.currentPage$.subscribe((currentPage) => {
      expect(currentPage).toBe(3);
    });
    service.label$.subscribe((label) => {
      expect(label).toBe('Step 3 of 5');
    });
    service.showLabel$.subscribe((showLabel) => {
      expect(showLabel).toBe(true);
    });
  });

  it('should set current page to a specific value and reset label', () => {
    service.setTotalPages(5);
    service.incrementCurrentPage(4);
    service.currentPage$.subscribe((currentPage) => {
      expect(currentPage).toBe(4);
    });
    service.label$.subscribe((label) => {
      expect(label).toBe('');
    });
    service.showLabel$.subscribe((showLabel) => {
      expect(showLabel).toBe(false);
    });
  });

  it('should not allow incrementCurrentPage to exceed total pages', () => {
    service.setTotalPages(3);
    service.setCurrentPage(3);
    expect(() => service.incrementCurrentPage()).toThrowError(
      'Incremented page (4) exceeds total pages (3).'
    );
  });
});



-----------
import { of } from 'rxjs';

export class MockProgressBarService {
  currentPage = 0;
  totalPages = 3;
  label = '';
  showLabel = false;

  currentPage$ = of(this.currentPage);
  showLabel$ = of(this.showLabel);
  label$ = of(this.label);

  setTotalPages = jest.fn((pages: number) => (this.totalPages = pages));
  setCurrentPage = jest.fn((page: number) => (this.currentPage = page));
  incrementCurrentPage = jest.fn(() => {
    if (this.currentPage < this.totalPages) this.currentPage++;
  });
  setLabel = jest.fn((label: string) => (this.label = label));
  setShowLabel = jest.fn((show: boolean) => (this.showLabel = show));

  /**
   * Resets the progress bar state to default values.
   */
  reset = jest.fn(() => {
    this.currentPage = 0;
    this.label = '';
    this.showLabel = false;
  });
}
