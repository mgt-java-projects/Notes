personal-info.actions.ts

import { createAction, props } from '@ngrx/store';
import { PersonalInfo } from './personal-info.model';

/**
 * Action to save personal info to the store.
 * @param personalInfo - The personal info object to save.
 */
export const savePersonalInfo = createAction(
  '[PersonalInfo] Save Personal Info',
  props<{ personalInfo: PersonalInfo }>()
);

----------------------personal-info.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { savePersonalInfo } from './personal-info.actions';
import { PersonalInfo } from './personal-info.model';

/**
 * Interface representing the state of personal info.
 */
export interface PersonalInfoState {
  personalInfo: PersonalInfo | null;
}

/**
 * Initial state for personal info.
 */
export const initialState: PersonalInfoState = {
  personalInfo: null,
};

/**
 * Reducer function to handle actions related to personal info.
 * @param state - The current state of personal info.
 * @param action - The action dispatched.
 */
export const personalInfoReducer = createReducer(
  initialState,
  on(savePersonalInfo, (state, { personalInfo }) => ({
    ...state,
    personalInfo,
  }))
);

-------------------------personal-info.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PersonalInfoState } from './personal-info.reducer';

/**
 * Selector to get the personal info state from the store.
 */
export const selectPersonalInfoState = createFeatureSelector<PersonalInfoState>('personalInfo');

/**
 * Selector to get the personal info from the personal info state.
 */
export const selectPersonalInfo = createSelector(
  selectPersonalInfoState,
  (state) => state.personalInfo
);
----------------------------------personal-info.selectors.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { PersonalInfoService } from './personal-info.service';
import { savePersonalInfo } from './personal-info.actions';
import { EMPTY } from 'rxjs';

/**
 * Effects class for handling side effects related to personal info actions.
 */
@Injectable()
export class PersonalInfoEffects {
  /**
   * Effect to save personal info to the backend when the save action is dispatched.
   * @param actions$ - Stream of actions.
   * @param personalInfoService - Service to handle API calls related to personal info.
   */
  savePersonalInfo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(savePersonalInfo),
      mergeMap((action) =>
        this.personalInfoService.savePersonalInfo(action.personalInfo).pipe(
          map(() => ({ type: '[PersonalInfo] Save Success' })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  constructor(private actions$: Actions, private personalInfoService: PersonalInfoService) {}
}
-----------------------------personal-info.reducer.test.ts
import { personalInfoReducer, PersonalInfoState, initialState } from './personal-info.reducer';
import { savePersonalInfo } from './personal-info.actions';
import { PersonalInfo } from './personal-info.model';

describe('PersonalInfoReducer', () => {
  const mockPersonalInfo: PersonalInfo = {
    name: { first: 'John', middle: 'Doe', last: 'Smith' },
    dob: '1990-01-01',
  };

  it('should return the initial state when no action is dispatched', () => {
    const state = personalInfoReducer(undefined, { type: undefined });
    expect(state).toEqual(initialState);
  });

  it('should save personal info when savePersonalInfo action is dispatched', () => {
    const state = personalInfoReducer(initialState, savePersonalInfo({ personalInfo: mockPersonalInfo }));
    expect(state.personalInfo).toEqual(mockPersonalInfo);
  });
});

------------------------personal-info.effects.spec.ts
import { PersonalInfoEffects } from './personal-info.effects';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { PersonalInfoService } from './personal-info.service';
import { savePersonalInfo } from './personal-info.actions';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PersonalInfoEffects', () => {
  let actions$: Observable<any>;
  let effects: PersonalInfoEffects;
  let mockPersonalInfoService: any;

  beforeEach(() => {
    mockPersonalInfoService = {
      savePersonalInfo: jest.fn().mockReturnValue(of({}))
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PersonalInfoEffects,
        provideMockActions(() => actions$),
        { provide: PersonalInfoService, useValue: mockPersonalInfoService },
      ],
    });

    effects = TestBed.inject(PersonalInfoEffects);
  });

  it('should call savePersonalInfo on savePersonalInfo action', (done) => {
    const personalInfo = { name: { first: 'John', middle: 'Doe', last: 'Smith' }, dob: '1990-01-01' };
    actions$ = of(savePersonalInfo({ personalInfo }));

    effects.savePersonalInfo$.subscribe(() => {
      expect(mockPersonalInfoService.savePersonalInfo).toHaveBeenCalledWith(personalInfo);
      done();
    });
  });
});
-------------------------
