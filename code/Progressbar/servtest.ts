import { ProgressBarService } from './progress-bar.service';

describe('ProgressBarService', () => {
  let service: ProgressBarService;

  beforeEach(() => {
    service = new ProgressBarService();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize the progress bar', () => {
    jest.spyOn(service, 'setShowPercentageLabel');
    service.init(1, 5, true);

    expect(service['currentPage']).toBe(1);
    expect(service['totalPages']).toBe(5);
    expect(service.setShowPercentageLabel).toHaveBeenCalledWith(true);

    service.percentageValue$.subscribe((value) => {
      expect(value).toBe(20); // 1/5 = 20%
    });
  });

  it('should increment the current page and update percentage', () => {
    service.init(1, 5, true);

    service.incrementCurrentPage();

    expect(service['currentPage']).toBe(2);

    service.percentageValue$.subscribe((value) => {
      expect(value).toBe(40); // 2/5 = 40%
    });
  });

  it('should increment the current page and set a label', () => {
    jest.spyOn(service, 'setLabel');
    jest.spyOn(service, 'setShowLabel');
    service.init(1, 5, true);

    service.incrementCurrentPage('Step 2 of 5');

    expect(service['currentPage']).toBe(2);

    service.percentageValue$.subscribe((value) => {
      expect(value).toBe(40); // 2/5 = 40%
    });

    expect(service.setLabel).toHaveBeenCalledWith('Step 2 of 5');
    expect(service.setShowLabel).toHaveBeenCalledWith(true);
  });

  it('should throw an error if increment exceeds total pages', () => {
    service.init(5, 5, true);

    expect(() => service.incrementCurrentPage()).toThrowError(
      'Incremented page (6) exceeds total pages (5).'
    );
  });

  it('should reset the progress bar state', () => {
    jest.spyOn(service, 'setLabel');
    jest.spyOn(service, 'setShowLabel');
    jest.spyOn(service, 'setShowPercentageLabel');

    service.init(2, 5, true);
    service.reset();

    expect(service['currentPage']).toBe(0);

    service.percentageValue$.subscribe((value) => {
      expect(value).toBe(0); // Reset to 0%
    });

    expect(service.setLabel).toHaveBeenCalledWith('');
    expect(service.setShowLabel).toHaveBeenCalledWith(false);
    expect(service.setShowPercentageLabel).toHaveBeenCalledWith(false);
  });

  it('should update the percentage value when the current page changes', () => {
    service.init(1, 5, true);

    service.incrementCurrentPage();
    service.percentageValue$.subscribe((value) => {
      expect(value).toBe(40); // 2/5 = 40%
    });

    service.incrementCurrentPage();
    service.percentageValue$.subscribe((value) => {
      expect(value).toBe(60); // 3/5 = 60%
    });
  });

  it('should throw an error if current page is set beyond total pages', () => {
    expect(() => service  'Current page (6) cannot be greater than total pages (5).'
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
  showPercentageLabel = false;
  percentageValue = 0;

  currentPage$ = of(this.currentPage);
  showLabel$ = of(this.showLabel);
  showPercentageLabel$ = of(this.showPercentageLabel);
  label$ = of(this.label);
  percentageValue$ = of(this.percentageValue);

  setTotalPages = jest.fn((pages: number) => {
    this.totalPages = pages;
    this.updatePercentageValue(); // Update percentage when total pages change
  });

  setCurrentPage = jest.fn((page: number) => {
    if (page > this.totalPages) {
      throw new Error(`Current page (${page}) cannot be greater than total pages (${this.totalPages}).`);
    }
    this.currentPage = page;
    this.updatePercentageValue(); // Update percentage when current page changes
  });

  incrementCurrentPage = jest.fn(() => {
    if (this.currentPage + 1 > this.totalPages) {
      throw new Error(`Incremented page (${this.currentPage + 1}) exceeds total pages (${this.totalPages}).`);
    }
    this.currentPage++;
    this.updatePercentageValue(); // Update percentage after increment
  });

  setLabel = jest.fn((label: string) => (this.label = label));
  setShowLabel = jest.fn((show: boolean) => (this.showLabel = show));
  setShowPercentageLabel = jest.fn((show: boolean) => (this.showPercentageLabel = show));

  /**
   * Resets the progress bar state to default values.
   */
  reset = jest.fn(() => {
    this.currentPage = 0;
    this.label = '';
    this.showLabel = false;
    this.showPercentageLabel = false;
    this.percentageValue = 0;
  });

  /**
   * Updates the percentage value based on the current page and total pages.
   */
  private updatePercentageValue = jest.fn(() => {
    this.percentageValue = this.totalPages > 0
      ? Math.round((this.currentPage / this.totalPages) * 100)
      : 0;
  });
}
