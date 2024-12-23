import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Store } from '@ngrx/store';

@Injectable({
  providedIn: 'root',
})
export class ApplyEDBGuard implements CanActivate {
  constructor(private router: Router, private store: Store) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const applyEDB = route.queryParamMap.get('PLY_EDB_DEDUPE');

    if (applyEDB === 'Y') {
      this.moveToApplyEDBSSO(route);
      return false;
    }

    return true;
  }

  private moveToApplyEDBSSO(route: ActivatedRouteSnapshot): void {
    const lang = route.queryParamMap.get('lang');
    this.router.navigate(['/login/o'], {
      replaceUrl: true,
      queryParams: { applyEDB: 'Y', lang },
    });

    this.store.dispatch({
      type: '[DeepLink] Set Params',
      payload: {
        queryString: location.search,
        path: '/login/o',
        params: { applyEDB: 'Y', lang },
      },
    });
  }
}


-----------

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ApplyEDBGuard } from './apply-edb.guard';
import { Store } from '@ngrx/store';
import { ActivatedRouteSnapshot } from '@angular/router';

describe('ApplyEDBGuard', () => {
  let guard: ApplyEDBGuard;
  let router: Router;
  let store: Store;

  const mockRouter = {
    navigate: jest.fn(),
  };

  const mockStore = {
    dispatch: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApplyEDBGuard,
        { provide: Router, useValue: mockRouter },
        { provide: Store, useValue: mockStore },
      ],
    });

    guard = TestBed.inject(ApplyEDBGuard);
    router = TestBed.inject(Router);
    store = TestBed.inject(Store);
  });

  it('should return true if applyEDB is not "Y"', () => {
    const route = {
      queryParamMap: {
        get: jest.fn().mockImplementation((param) => {
          if (param === 'PLY_EDB_DEDUPE') return 'N';
          return null;
        }),
      },
    } as unknown as ActivatedRouteSnapshot;

    expect(guard.canActivate(route)).toBe(true);
  });

  it('should navigate and dispatch if applyEDB is "Y"', () => {
    const route = {
      queryParamMap: {
        get: jest.fn().mockImplementation((param) => {
          if (param === 'PLY_EDB_DEDUPE') return 'Y';
          if (param === 'lang') return 'en';
          return null;
        }),
      },
    } as unknown as ActivatedRouteSnapshot;

    expect(guard.canActivate(route)).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login/o'], {
      replaceUrl: true,
      queryParams: { applyEDB: 'Y', lang: 'en' },
    });
    expect(mockStore.dispatch).toHaveBeenCalledWith({
      type: '[DeepLink] Set Params',
      payload: {
        queryString: location.search,
        path: '/login/sso',
        params: { applyEDB: 'Y', lang: 'en' },
      },
    });
  });
});
