import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProgressBarService } from './progress-bar.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent implements OnInit, OnDestroy {
  progressPercentage = 0; // Percentage progress of the current step
  progressShowLabel = false; // Whether to display the label
  progressLabel = ''; // The label text for the progress bar

  private subscriptions: Subscription = new Subscription();

  constructor(private progressBarService: ProgressBarService) {}

  /**
   * Initialize the component and subscribe to progress bar service observables
   * to dynamically update the progress bar in the header.
   */
  ngOnInit(): void {
    this.progressBarValueUpdate();
  }

  /**
   * Subscribes to all progress bar service observables.
   */
  private progressBarValueUpdate(): void {
    this.subscriptions.add(
      this.progressBarService.percentageValue$.subscribe((percentage) => {
        this.progressPercentage = percentage;
      })
    );

    this.subscriptions.add(
      this.progressBarService.showLabel$.subscribe((showLabel) => {
        this.progressShowLabel = showLabel;
      })
    );

    this.subscriptions.add(
      this.progressBarService.label$.subscribe((label) => {
        this.progressLabel = label;
      })
    );
  }

  /**
   * Unsubscribes from all subscriptions to avoid memory leaks.
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}


-------

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutComponent } from './layout.component';
import { ProgressBarService } from './progress-bar.service';
import { MockProgressBarService } from './mock-progress-bar.service';

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;
  let mockService: MockProgressBarService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LayoutComponent],
      providers: [
        { provide: ProgressBarService, useClass: MockProgressBarService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    mockService = TestBed.inject(ProgressBarService) as MockProgressBarService;

    fixture.detectChanges(); // Trigger ngOnInit
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call progressBarValueUpdate on initialization', () => {
    const spy = jest.spyOn(component as any, 'progressBarValueUpdate');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should subscribe to percentageValue$ and update progressPercentage', () => {
    mockService.percentageValue = 40; // Simulate percentage
    fixture.detectChanges();
    expect(component.progressPercentage).toBe(40);
  });

  it('should update progressShowLabel when showLabel$ emits', () => {
    mockService.showLabel = true; // Simulate showLabel$
    fixture.detectChanges();
    expect(component.progressShowLabel).toBe(true);
  });

  it('should update progressLabel when label$ emits', () => {
    mockService.label = 'Step 2 of 5'; // Simulate label$
    fixture.detectChanges();
    expect(component.progressLabel).toBe('Step 2 of 5');
  });

  it('should unsubscribe from all subscriptions on destroy', () => {
    const unsubscribeSpy = jest.spyOn(component['subscriptions'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
