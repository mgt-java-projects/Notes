import { GenericWelcomeComponent } from './generic-welcome.component';
import { Router } from '@angular/router';
import { LaunchpadPaths } from '../constants/launchpad-paths';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('GenericWelcomeComponent', () => {
  let component: GenericWelcomeComponent;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [GenericWelcomeComponent],
      providers: [Router]
    }).compileComponents();

    const fixture = TestBed.createComponent(GenericWelcomeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    // Mock the window.dataLayer before each test
    window.dataLayer = [];
  });

  afterEach(() => {
    // Clear the mock after each test to avoid data contamination
    window.dataLayer = [];
  });

  it('should call triggerGTM with AppStep1 on ngOnInit', () => {
    const triggerGTMSpy = jest.spyOn(component, 'triggerGTM');
    component.ngOnInit();
    expect(triggerGTMSpy).toHaveBeenCalledWith('AppStep1');
  });

  it('should call triggerGTM with AppStep2 and navigate on onClickOpenAccount', () => {
    const triggerGTMSpy = jest.spyOn(component, 'triggerGTM');
    const navigateSpy = jest.spyOn(router, 'navigate');
    
    component.onClickOpenAccount();

    expect(triggerGTMSpy).toHaveBeenCalledWith('AppStep2');
    expect(navigateSpy).toHaveBeenCalledWith(['/' + LaunchpadPaths.LAUNCHPAD_OPENACCOUNT]);
  });

  it('should push AppStep1 event to dataLayer when triggerGTM is called with AppStep1', () => {
    component.triggerGTM('AppStep1');

    expect(window.dataLayer).toContainEqual({
      event: 'BMOPageViewEvent',
      action: 'AppStep1',
      category: 'EDB',
      RefID: 'RefXXXXX', // Replace with actual dynamic value
      Label: 'Product Name-EDB-NEW-TO-CANADA',
      Language: 'en',
      Medium: 'mobileApp_Webview',
    });
  });

  it('should push AppStep2 event to dataLayer when triggerGTM is called with AppStep2', () => {
    component.triggerGTM('AppStep2');

    expect(window.dataLayer).toContainEqual({
      event: 'BMOPageViewEvent',
      action: 'AppStep2',
      category: 'EDB',
      RefID: 'RefXXXXX', // Replace with actual dynamic value
      Label: 'Product Name-EDB-NEW-TO-CANADA',
      Language: 'en',
      Medium: 'mobileApp_Webview',
    });
  });

  it('should initialize component and call triggerGTM with AppStep1 on ngOnInit', () => {
    // Mock the observe function to return an observable of a mock BreakpointState
    jest.spyOn(breakpointObserver, 'observe').mockReturnValue(of({
      matches: false // Simulate a non-tablet view state
    }));

    const triggerGTMSpy = jest.spyOn(component, 'triggerGTM');
    
    // Call ngOnInit to trigger the logic
    component.ngOnInit();

    // Test expectations
    expect(triggerGTMSpy).toHaveBeenCalledWith('AppStep1');
    expect(breakpointObserver.observe).toHaveBeenCalled();  // Verify that the BreakpointObserver is called
  });

  it('should set isTabletView to true if breakpoint matches on ngOnInit', () => {
    // Mock the observe function to simulate a tablet view (matches: true)
    jest.spyOn(breakpointObserver, 'observe').mockReturnValue(of({
      matches: true // Simulate tablet view
    }));

    const detectChangesSpy = jest.spyOn(cdr, 'detectChanges');

    // Call ngOnInit
    component.ngOnInit();

    // Test expectations
    expect(component.isTabletView).toBe(true);  // isTabletView should be set to true
    expect(detectChangesSpy).toHaveBeenCalled();  // detectChanges should be triggered after state change
  });

  it('should set isTabletView to false if breakpoint does not match on ngOnInit', () => {
    // Mock the observe function to simulate a non-tablet view (matches: false)
    jest.spyOn(breakpointObserver, 'observe').mockReturnValue(of({
      matches: false // Simulate non-tablet view
    }));

    const detectChangesSpy = jest.spyOn(cdr, 'detectChanges');

    // Call ngOnInit
    component.ngOnInit();

    // Test expectations
    expect(component.isTabletView).toBe(false);  // isTabletView should be set to false
    expect(detectChangesSpy).toHaveBeenCalled();  // detectChanges should be triggered after state change
  });

});
