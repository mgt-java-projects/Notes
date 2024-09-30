
export interface AppState {
    personalInfo: PersonalInfoState;
    contactInfo: ContactInfoState;
    addressInfo: AddressInfoState;
    // Add other form sections here
  }
  
  export interface PersonalInfoState {
    personalInfo: PersonalInfo | null;
  }
  
  export interface ContactInfoState {
    contactInfo: ContactInfo | null;
  }
  
  export interface AddressInfoState {
    addressInfo: AddressInfo | null;
  }
------------------
  StoreModule.forRoot({
    personalInfo: personalInfoReducer,
  })
------------------------

import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AppState } from './app-state.model';
import { PersonalInfoState } from './personal-info.reducer';
import { ContactInfoState } from './contact-info.reducer';
import { AddressInfoState } from './address-info.reducer';

// Create feature selectors for each part of the form
export const selectPersonalInfoState = createFeatureSelector<AppState, PersonalInfoState>('personalInfo');
export const selectContactInfoState = createFeatureSelector<AppState, ContactInfoState>('contactInfo');
export const selectAddressInfoState = createFeatureSelector<AppState, AddressInfoState>('addressInfo');

// Combine the selectors to get all form data
export const selectFormData = createSelector(
  selectPersonalInfoState,
  selectContactInfoState,
  selectAddressInfoState,
  (personalInfoState, contactInfoState, addressInfoState) => ({
    personalInfo: personalInfoState.personalInfo,
    contactInfo: contactInfoState.contactInfo,
    addressInfo: addressInfoState.addressInfo
  })
);

-----------
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from './store/app-state.model';
import { selectFormData } from './store/form-data.selectors';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-final-submit',
  templateUrl: './final-submit.component.html'
})
export class FinalSubmitComponent {
  formData$: Observable<any>;

  constructor(private store: Store<AppState>, private http: HttpClient) {
    // Get all form data from the store
    this.formData$ = this.store.select(selectFormData);
  }

  onSubmit() {
    // Subscribe to the form data and submit it to the backend
    this.formData$.subscribe(formData => {
      this.http.post('https://your-backend-api.com/submit', formData)
        .subscribe(response => {
          console.log('Form submitted successfully:', response);
        });
    });
  }
}
