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
    this.subscriptions.add(
      this.progressBarService.currentPage$.subscribe(() => {
        this.progressPercentage = this.progressBarService.getProgressValue();
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


  -----
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
  
    it('should subscribe to progress updates on initialization', () => {
      jest.spyOn(mockService, 'currentPage$');
      jest.spyOn(mockService, 'showLabel$');
      jest.spyOn(mockService, 'label$');
  
      component.ngOnInit();
  
      expect(mockService.currentPage$).toBeTruthy();
      expect(mockService.showLabel$).toBeTruthy();
      expect(mockService.label$).toBeTruthy();
    });
  
    it('should update progressPercentage based on current page', () => {
      jest.spyOn(mockService, 'getProgressValue').mockReturnValue(50);
  
      mockService.setCurrentPage(2); // Simulate progress update
      fixture.detectChanges();
  
      expect(component.progressPercentage).toBe(50);
    });
  
    it('should update progressShowLabel based on service', () => {
      mockService.setShowLabel(true);
      fixture.detectChanges();
  
      expect(component.progressShowLabel).toBe(true);
    });
  
    it('should update progressLabel based on service', () => {
      mockService.setLabel('Step 2 of 5');
      fixture.detectChanges();
  
      expect(component.progressLabel).toBe('Step 2 of 5');
    });
  
    it('should unsubscribe on component destruction', () => {
      const unsubscribeSpy = jest.spyOn(component['subscriptions'], 'unsubscribe');
      component.ngOnDestroy();
      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });
  