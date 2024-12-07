  /**
   * Initialize the progress bar for the personal info page.
   */
  ngOnInit(): void {
    // Reset progress bar state
    this.progressBarService.reset();

    // Set total pages for the progress
    this.progressBarService.setTotalPages(5);

    // Increment the current page and set progress
    this.progressBarService.incrementCurrentPage();
    this.progressBarService.setLabel('Step 1 of 5'); // Set label for the current step
    this.progressBarService.setShowLabel(true); // Ensure the label is displayed
  }


  import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PersonalInfoComponent } from './personal-info.component';
import { ProgressBarService } from './progress-bar.service';
import { MockProgressBarService } from './mock-progress-bar.service';

describe('PersonalInfoComponent', () => {
  let component: PersonalInfoComponent;
  let fixture: ComponentFixture<PersonalInfoComponent>;
  let mockService: MockProgressBarService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PersonalInfoComponent],
      providers: [
        { provide: ProgressBarService, useClass: MockProgressBarService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PersonalInfoComponent);
    component = fixture.componentInstance;
    mockService = TestBed.inject(ProgressBarService) as MockProgressBarService;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should reset progress bar on initialization', () => {
    jest.spyOn(mockService, 'reset');
    component.ngOnInit();
    expect(mockService.reset).toHaveBeenCalled();
  });

  it('should set total pages on initialization', () => {
    jest.spyOn(mockService, 'setTotalPages');
    component.ngOnInit();
    expect(mockService.setTotalPages).toHaveBeenCalledWith(5);
  });

  it('should increment the current page on initialization', () => {
    jest.spyOn(mockService, 'incrementCurrentPage');
    component.ngOnInit();
    expect(mockService.incrementCurrentPage).toHaveBeenCalled();
  });

  it('should set label and show label on initialization', () => {
    jest.spyOn(mockService, 'setLabel');
    jest.spyOn(mockService, 'setShowLabel');
    component.ngOnInit();
    expect(mockService.setLabel).toHaveBeenCalledWith('Step 1 of 5');
    expect(mockService.setShowLabel).toHaveBeenCalledWith(true);
  });
});
