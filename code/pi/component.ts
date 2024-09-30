import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { PersonalInfoConfigService } from './personal-info-config.service'; // Service for form validators configuration
import { NavigationService } from '@app/launchpack/core/services/navigation/navigation.service';
import { LayoutNavigationService } from '@app/launchpack/core/services/navigation/layout-navigation/layout-navigation.service';
import { savePersonalInfo } from './store/personal-info.actions'; // Save action to store personal info
import { selectPersonalInfo } from './store/personal-info.selectors'; // Selector to read personal info from store
import { LayoutActionEnum } from './layoutActionEnum.ts'; // Enum for navigation actions

/**
 * Component to manage the Personal Info form.
 * Handles form initialization, navigation, and store interaction to save personal info.
 */
@Component({
  selector: 'personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss']
})
export class PersonalInfoComponent implements OnInit, OnDestroy {
  // Subscriptions to handle observable data
  layoutNavSubscription: Subscription = Subscription.EMPTY;
  storeSubscription: Subscription = Subscription.EMPTY;

  // FormGroup to manage Personal Info form controls
  personalInfoForm: FormGroup;

  /**
   * Constructor to initialize services, form builder, and store.
   * @param navigationService - Handles navigation events (Next, Back)
   * @param layoutNavigationService - Manages layout-related navigation actions
   * @param fb - Form builder for reactive forms
   * @param store - NGRX store to manage state
   * @param personalInfoConfigService - Service for personal info form validation configuration
   */
  constructor(
    private navigationService: NavigationService,
    private layoutNavigationService: LayoutNavigationService,
    private fb: FormBuilder,
    private store: Store,
    private personalInfoConfigService: PersonalInfoConfigService
  ) {
    // Initialize the form group with nested form controls and validation
    this.personalInfoForm = this.fb.group({
      name: this.fb.group({
        first: ['', personalInfoConfigService.firstNameValidatiors],
        middle: ['', personalInfoConfigService.middleNameValidatiors],
        last: ['', personalInfoConfigService.lastNameValidatiors]
      }),
      dob: ['', personalInfoConfigService.dobValidatiors]
    });
  }

  /**
   * Lifecycle hook for component initialization.
   * Subscribes to navigation actions and loads personal info from the store.
   */
  ngOnInit(): void {
    // Subscribe to layout navigation actions (Next, Back)
    this.layoutNavSubscription = this.layoutNavigationService.layoutActionItems$.subscribe((actionType) => {
      this.onLayoutAction(actionType);
    });

    // Load personal info from the store and patch the form with data
    this.storeSubscription = this.store.select(selectPersonalInfo).subscribe((storedPersonalInfo) => {
      if (storedPersonalInfo) {
        this.personalInfoForm.patchValue(storedPersonalInfo);
      }
    });
  }

  /**
   * Handles layout navigation actions such as Next and Back.
   * @param actionType - The type of layout action triggered (Next, Back)
   */
  onLayoutAction(actionType: LayoutActionEnum): void {
    switch (actionType) {
      case LayoutActionEnum.NEXT:
        this.savePersonalInfo();
        this.navigationService.navigationNext();
        break;
      case LayoutActionEnum.BACK:
        this.navigationService.navigationBack();
        break;
    }
  }

  /**
   * Saves the form data to the store.
   * Checks if the form is valid and dispatches save action if there are changes.
   */
  savePersonalInfo(): void {
    if (this.personalInfoForm.valid) {
      const newPersonalInfo = this.personalInfoForm.value;

      this.store.select(selectPersonalInfo).subscribe((storedPersonalInfo) => {
        if (JSON.stringify(storedPersonalInfo) !== JSON.stringify(newPersonalInfo)) {
          // Dispatch save action if there are changes
          this.store.dispatch(savePersonalInfo({ personalInfo: newPersonalInfo }));
        }
      });
    }
  }

  /**
   * Lifecycle hook for component destruction.
   * Unsubscribes from all active subscriptions.
   */
  ngOnDestroy(): void {
    if (this.layoutNavSubscription) this.layoutNavSubscription.unsubscribe();
    if (this.storeSubscription) this.storeSubscription.unsubscribe();
  }
}

------------------------
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreModule, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { PersonalInfoComponent } from './personal-info.component';
import { NavigationService } from '@app/launchpack/core/services/navigation/navigation.service';
import { LayoutNavigationService } from '@app/launchpack/core/services/navigation/layout-navigation/layout-navigation.service';
import { PersonalInfoConfigService } from './personal-info-config.service';
import { savePersonalInfo } from './store/personal-info.actions';
import { selectPersonalInfo } from './store/personal-info.selectors';

describe('PersonalInfoComponent', () => {
  let component: PersonalInfoComponent;
  let fixture: ComponentFixture<PersonalInfoComponent>;
  let mockStore: any;
  let mockNavigationService: any;
  let mockLayoutNavigationService: any;
  let mockPersonalInfoConfigService: any;

  beforeEach(async () => {
    mockStore = {
      select: jest.fn().mockReturnValue(of({ name: { first: '', middle: '', last: '' }, dob: '' })),
      dispatch: jest.fn()
    };
    mockNavigationService = {
      navigationNext: jest.fn(),
      navigationBack: jest.fn()
    };
    mockLayoutNavigationService = {
      layoutActionItems$: of(null)
    };
    mockPersonalInfoConfigService = {
      firstNameValidatiors: [],
      middleNameValidatiors: [],
      lastNameValidatiors: [],
      dobValidatiors: []
    };

    await TestBed.configureTestingModule({
      declarations: [PersonalInfoComponent],
      imports: [
        ReactiveFormsModule,
        StoreModule.forRoot({})
      ],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: NavigationService, useValue: mockNavigationService },
        { provide: LayoutNavigationService, useValue: mockLayoutNavigationService },
        { provide: PersonalInfoConfigService, useValue: mockPersonalInfoConfigService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty values', () => {
    expect(component.personalInfoForm.value).toEqual({
      name: { first: '', middle: '', last: '' },
      dob: ''
    });
  });

  it('should subscribe to layout actions and handle navigation', () => {
    const nextSpy = jest.spyOn(mockNavigationService, 'navigationNext');
    component.onLayoutAction('NEXT');
    expect(nextSpy).toHaveBeenCalled();
  });

  it('should save personal info if form is valid', () => {
    component.personalInfoForm.setValue({
      name: { first: 'John', middle: 'Doe', last: 'Smith' },
      dob: '1990-01-01'
    });

    component.savePersonalInfo();
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      savePersonalInfo({
        personalInfo: {
          name: { first: 'John', middle: 'Doe', last: 'Smith' },
          dob: '1990-01-01'
        }
      })
    );
  });

  it('should not save personal info if form is invalid', () => {
    component.personalInfoForm.setValue({
      name: { first: '', middle: '', last: '' },
      dob: ''
    });
    component.savePersonalInfo();
    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });

  it('should unsubscribe on destroy', () => {
    const unsubscribeSpy = jest.spyOn(component.layoutNavSubscription, 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
