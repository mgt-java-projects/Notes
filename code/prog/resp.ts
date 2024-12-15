import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResponsiveLayoutComponent } from './responsive-layout.component';
import { ProgressBarService } from '@app/launchpack/core/services/navigation/progress-bar/progress-bar.service';
import { ResponsiveLayoutDisplayStateService } from '@app/launchpack/pages/layout/responsive-layout/responsive-layout-display-state.service';
import { NavigationService } from '@app/launchpack/core/services/navigation/navigation.service';
import { MockProgressBarService } from '@mocks/progress-bar.service.mock';
import { MockResponsiveLayoutDisplayStateService } from '@mocks/responsive-layout-display-state.service.mock';
import { MockNavigationService } from '@mocks/navigation.service.mock';
import { ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

describe('ResponsiveLayoutComponent', () => {
  let component: ResponsiveLayoutComponent;
  let fixture: ComponentFixture<ResponsiveLayoutComponent>;

  let mockProgressBarService: typeof MockProgressBarService;
  let mockResponsiveLayoutDisplayStateService: typeof MockResponsiveLayoutDisplayStateService;
  let mockNavigationService: typeof MockNavigationService;

  beforeEach(async () => {
    mockProgressBarService = MockProgressBarService;
    mockResponsiveLayoutDisplayStateService = MockResponsiveLayoutDisplayStateService;
    mockNavigationService = MockNavigationService;

    mockProgressBarService.options$ = new BehaviorSubject({
      totalPages: 3,
      currentPage: 1,
      showLabel: true,
      label: 'Step 1',
      displayPercentageValue: true,
      percentageValue: 33,
      displayProgressBar: true,
    }).asObservable();

    mockResponsiveLayoutDisplayStateService.nextButtonDisplayState$ = new BehaviorSubject({
      isLoading: false,
      loadingLabel: 'Loading...',
      innerProjectedText: 'Next',
    }).asObservable();

    await TestBed.configureTestingModule({
      declarations: [ResponsiveLayoutComponent],
      providers: [
        { provide: ProgressBarService, useValue: mockProgressBarService },
        {
          provide: ResponsiveLayoutDisplayStateService,
          useValue: mockResponsiveLayoutDisplayStateService,
        },
        { provide: NavigationService, useValue: mockNavigationService },
        ChangeDetectorRef,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResponsiveLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call adjustNextButton and pageDisplayValueUpdate on initialization', () => {
      const adjustNextButtonSpy = jest.spyOn(component, 'adjustNextButton');
      const pageDisplayValueUpdateSpy = jest.spyOn(component, 'pageDisplayValueUpdate');
      
      component.ngOnInit();

      expect(adjustNextButtonSpy).toHaveBeenCalled();
      expect(pageDisplayValueUpdateSpy).toHaveBeenCalled();
    });

    it('should subscribe to progressBarService.options$', () => {
      const mockOptions = {
        totalPages: 5,
        currentPage: 2,
        showLabel: true,
        label: 'Step 2',
        displayPercentageValue: true,
        percentageValue: 40,
        displayProgressBar: true,
      };

      (mockProgressBarService.options$ as BehaviorSubject<any>).next(mockOptions);
      fixture.detectChanges();

      expect(component.progressBarOptions).toEqual(mockOptions);
    });

    it('should subscribe to nextButtonDisplayState$', () => {
      const mockNextButtonState = {
        isLoading: true,
        loadingLabel: 'Processing...',
        innerProjectedText: 'Submit',
      };

      (mockResponsiveLayoutDisplayStateService.nextButtonDisplayState$ as BehaviorSubject<any>).next(
        mockNextButtonState
      );
      fixture.detectChanges();

      expect(component.nextButtonState).toEqual(mockNextButtonState);
    });
  });

  describe('adjustNextButton', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="pageArea" style="height: 500px;"></div>
        <div id="takeOverArea"></div>
        <div id="pageData"></div>
      `;
    });

    it('should make the next button sticky if scrollHeight is less than clientHeight', () => {
      const pageArea = document.getElementById('pageArea')!;
      const takeOverArea = document.getElementById('takeOverArea')!;
      
      Object.defineProperty(pageArea, 'scrollHeight', { value: 400 });
      Object.defineProperty(pageArea, 'clientHeight', { value: 500 });

      component.adjustNextButton();

      expect(takeOverArea.classList.contains('content-filled')).toBe(false);
    });

    it('should add "content-filled" class if scrollHeight exceeds clientHeight', () => {
      const pageArea = document.getElementById('pageArea')!;
      const takeOverArea = document.getElementById('takeOverArea')!;
      
      Object.defineProperty(pageArea, 'scrollHeight', { value: 600 });
      Object.defineProperty(pageArea, 'clientHeight', { value: 500 });

      component.adjustNextButton();

      expect(takeOverArea.classList.contains('content-filled')).toBe(true);
    });
  });

  describe('onClickAction', () => {
    it('should trigger layout navigation when called', () => {
      const triggerLayoutActionSpy = jest.spyOn(mockNavigationService, 'navigateTo');
      component.onClickAction('NEXT');
      expect(triggerLayoutActionSpy).toHaveBeenCalledWith('NEXT');
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from all subscriptions', () => {
      const unsubscribeSpy = jest.spyOn(component['subscriptions'], 'unsubscribe');
      component.ngOnDestroy();
      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });

  describe('HostListener window resize', () => {
    it('should call adjustNextButton on window resize', () => {
      const adjustNextButtonSpy = jest.spyOn(component, 'adjustNextButton');
      window.dispatchEvent(new Event('resize'));
      expect(adjustNextButtonSpy).toHaveBeenCalled();
    });
  });
});
