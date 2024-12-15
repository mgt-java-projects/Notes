import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResponsiveLayoutComponent } from './responsive-layout.component';
import { ProgressBarService } from '@app/launchpack/core/services/navigation/progress-bar/progress-bar.service';
import { MockProgressBarService } from '@mocks/progress-bar.service.mock';
import { ResponsiveLayoutDisplayStateService } from '@app/launchpack/core/services/navigation/responsive-layout-display-state.service';
import { MockResponsiveLayoutDisplayStateService } from '@mocks/responsive-layout-display-state.service.mock';
import { ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NextButtonDisplayState } from './next-button-display-state.model';

describe('ResponsiveLayoutComponent', () => {
  let component: ResponsiveLayoutComponent;
  let fixture: ComponentFixture<ResponsiveLayoutComponent>;
  let mockProgressBarService: jest.Mocked<ProgressBarService>;
  let mockResponsiveLayoutDisplayStateService: jest.Mocked<ResponsiveLayoutDisplayStateService>;

  const mockNextButtonState: NextButtonDisplayState = {
    isLoading: false,
    loadingLabel: 'Start Processing',
    innerProjectedText: 'Submit',
  };

  beforeEach(async () => {
    // Initialize mock services
    mockProgressBarService = MockProgressBarService;
    mockResponsiveLayoutDisplayStateService = MockResponsiveLayoutDisplayStateService;

    // Setup mock observables
    mockProgressBarService.options$ = new BehaviorSubject({
      totalPages: 5,
      currentPage: 1,
      showLabel: true,
      label: 'Step 1',
      displayPercentageValue: true,
      percentageValue: 20,
      displayProgressBar: true,
    }).asObservable();

    mockResponsiveLayoutDisplayStateService.nextButtonDisplayState$ = new BehaviorSubject(
      mockNextButtonState
    ).asObservable();

    await TestBed.configureTestingModule({
      declarations: [ResponsiveLayoutComponent],
      providers: [
        { provide: ProgressBarService, useValue: mockProgressBarService },
        {
          provide: ResponsiveLayoutDisplayStateService,
          useValue: mockResponsiveLayoutDisplayStateService,
        },
        ChangeDetectorRef,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResponsiveLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should adjust the next button when the page is initialized', () => {
    const adjustNextButtonSpy = jest.spyOn(component, 'adjustNextButton');
    component.ngOnInit();
    expect(adjustNextButtonSpy).toHaveBeenCalled();
  });

  it('should update progress bar options on options$ emit', () => {
    const updatedOptions = {
      totalPages: 10,
      currentPage: 2,
      showLabel: true,
      label: 'Step 2',
      displayPercentageValue: true,
      percentageValue: 40,
      displayProgressBar: true,
    };

    // Simulate the observable emitting new values
    mockProgressBarService.options$.next(updatedOptions);

    // Trigger change detection to update the component
    fixture.detectChanges();

    expect(component.progressBarOptions).toEqual(updatedOptions);
  });

  it('should update nextButtonState on nextButtonDisplayState$ emit', () => {
    const updatedState: NextButtonDisplayState = {
      isLoading: true,
      loadingLabel: 'Processing...',
      innerProjectedText: 'Wait',
    };

    // Simulate the observable emitting new values
    mockResponsiveLayoutDisplayStateService.nextButtonDisplayState$.next(
      updatedState
    );

    // Trigger change detection to update the component
    fixture.detectChanges();

    expect(component.nextButtonState).toEqual(updatedState);
  });

  it('should unsubscribe from subscriptions on destroy', () => {
    const unsubscribeSpy = jest.spyOn(component['subscriptions'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
