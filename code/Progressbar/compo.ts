import { Component, OnInit } from '@angular/core';
import { ProgressBarService } from './progress-bar.service';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css'],
})
export class PersonalInfoComponent implements OnInit {
  constructor(private progressBarService: ProgressBarService) {}

  /**
   * Initialize the progress bar for the personal info page.
   */
  ngOnInit(): void {
    // Initialize progress bar state
    this.progressBarService.init(0, 0, false);

    // Increment the current page and update progress
    this.progressBarService.incrementCurrentPage();
  }
}


------

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

    fixture.detectChanges(); // Trigger ngOnInit
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the progress bar using init method', () => {
    jest.spyOn(mockService, 'init');
    component.ngOnInit();
    expect(mockService.init).toHaveBeenCalledWith(0, 0, false);
  });

  it('should increment the current page', () => {
    jest.spyOn(mockService, 'incrementCurrentPage');
    component.ngOnInit();
    expect(mockService.incrementCurrentPage).toHaveBeenCalled();
  });
});
