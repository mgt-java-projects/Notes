import { ProgressBarService } from './progress-bar.service';

describe('ProgressBarService', () => {
  let service: ProgressBarService;

  beforeEach(() => {
    service = new ProgressBarService();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('init', () => {
    it('should initialize the progress bar with given values', () => {
      jest.spyOn(service as any, 'setCurrentPage');
      jest.spyOn(service, 'setShowPercentageLabel');

      service.init(1, 5, true);

      expect(service['totalPages']).toBe(5);
      expect(service.setShowPercentageLabel).toHaveBeenCalledWith(true);
      expect(service['setCurrentPage']).toHaveBeenCalledWith(1);
    });
  });

  describe('setShowLabel', () => {
    it('should update showLabel$', () => {
      service.setShowLabel(true);

      service.showLabel$.subscribe((value) => {
        expect(value).toBe(true);
      });
    });
  });

  describe('setLabel', () => {
    it('should update label$', () => {
      service.setLabel('Step 1 of 5');

      service.label$.subscribe((value) => {
        expect(value).toBe('Step 1 of 5');
      });
    });
  });

  describe('setShowPercentageLabel', () => {
    it('should update showPercentageLabel$', () => {
      service.setShowPercentageLabel(true);

      service.showPercentageLabel$.subscribe((value) => {
        expect(value).toBe(true);
      });
    });
  });

  describe('reset', () => {
    it('should reset the progress bar to its default state', () => {
      jest.spyOn(service as any, 'setCurrentPage');
      jest.spyOn(service, 'setLabel');
      jest.spyOn(service, 'setShowLabel');
      jest.spyOn(service, 'setShowPercentageLabel');

      service.reset();

      expect(service['setCurrentPage']).toHaveBeenCalledWith(0);
      expect(service.setLabel).toHaveBeenCalledWith('');
      expect(service.setShowLabel).toHaveBeenCalledWith(false);
      expect(service.setShowPercentageLabel).toHaveBeenCalledWith(false);
    });
  });

  describe('incrementCurrentPage', () => {
    beforeEach(() => {
      service.init(1, 5, true);
    });

    it('should increment the current page and update label when no arguments are passed', () => {
      jest.spyOn(service as any, 'setCurrentPage');

      service.incrementCurrentPage();

      expect(service['setCurrentPage']).toHaveBeenCalledWith(2);
    });

    it('should increment the current page and set a label when only label is passed', () => {
      jest.spyOn(service as any, 'setCurrentPage');
      jest.spyOn(service, 'setLabel');

      service.incrementCurrentPage(undefined, 'Step 2 of 5');

      expect(service['setCurrentPage']).toHaveBeenCalledWith(2);
      expect(service.setLabel).toHaveBeenCalledWith('Step 2 of 5');
    });

    it('should set the current page to a specific value and reset the label when only currentPage is passed', () => {
      jest.spyOn(service as any, 'setCurrentPage');
      jest.spyOn(service, 'setLabel');

      service.incrementCurrentPage(3);

      expect(service['setCurrentPage']).toHaveBeenCalledWith(3);
      expect(service.setLabel).toHaveBeenCalledWith('');
    });

    it('should throw an error if incrementing exceeds total pages', () => {
      service.init(5, 5, true);

      expect(() => service.incrementCurrentPage()).toThrowError(
        'Incremented page (6) exceeds total pages (5).'
      );
    });

    it('should throw an error if currentPage is set beyond total pages', () => {
      expect(() => service.incrementCurrentPage(6)).toThrowError(
        'Current page (6) cannot be greater than total pages (5).'
      );
    });
  });

  describe('updatePercentageValue', () => {
    it('should calculate and emit percentage value based on currentPage and totalPages', () => {
      service.init(2, 5, true);

      service.percentageValue$.subscribe((value) => {
        expect(value).toBe(40); // 2/5 = 40%
      });

      service.incrementCurrentPage();
      service.percentageValue$.subscribe((value) => {
        expect(value).toBe(60); // 3/5 = 60%
      });
    });

    it('should emit 0 if totalPages is 0', () => {
      service.init(0, 0, true);

      service.percentageValue$.subscribe((value) => {
        expect(value).toBe(0);
      });
    });
  });
});
