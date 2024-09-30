
import { Injectable } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class PersonalInfoConfigService {
  firstNameValidatiors:ValidatorFn[] =[Validators.required];
  middleNameValidatiors:ValidatorFn[] =[];
  lastNameValidatiors:ValidatorFn[] =[Validators.required];
  dobValidatiors:ValidatorFn[] =[Validators.required];

  constructor(){

  }
 
}

-----------------------
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Service to handle HTTP operations such as GET and POST,
 * common headers, and error handling for all API requests.
 */
@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private readonly BASE_URL = 'https://api.example.com'; // Base URL for API requests

  constructor(private http: HttpClient) {}

  /**
   * GET request with custom headers and error handling.
   * @param url API endpoint
   * @returns Observable of response
   */
  get<T>(url: string): Observable<T> {
    const headers = this.getCommonHeaders();
    return this.http.get<T>(`${this.BASE_URL}${url}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * POST request with custom headers and error handling.
   * @param url API endpoint
   * @param body Data to be posted
   * @returns Observable of response
   */
  post<T>(url: string, body: any): Observable<T> {
    const headers = this.getCommonHeaders();
    return this.http.post<T>(`${this.BASE_URL}${url}`, body, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Adds common headers to be used in all requests.
   * @returns HttpHeaders
   */
  private getCommonHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer token', // Add token dynamically if needed
    });
  }

  /**
   * Handles API errors and logs them.
   * @param error HTTP error
   * @returns Observable throwing error message
   */
  private handleError(error: any): Observable<never> {
    console.error('API call failed:', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }
}
-----------------------
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpService } from './http.service';

describe('HttpService', () => {
  let service: HttpService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpService],
    });
    service = TestBed.inject(HttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should make GET request', () => {
    const dummyData = { success: true };

    service.get('/test').subscribe((data) => {
      expect(data).toEqual(dummyData);
    });

    const req = httpMock.expectOne('https://api.example.com/test');
    expect(req.request.method).toBe('GET');
    req.flush(dummyData);
  });

  it('should make POST request', () => {
    const dummyData = { success: true };
    const postData = { name: 'John' };

    service.post('/test', postData).subscribe((data) => {
      expect(data).toEqual(dummyData);
    });

    const req = httpMock.expectOne('https://api.example.com/test');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(postData);
    req.flush(dummyData);
  });

  it('should handle error', () => {
    service.get('/test').subscribe(
      () => fail('Should have failed with the error'),
      (error) => {
        expect(error.message).toBe('Something went wrong; please try again later.');
      }
    );

    const req = httpMock.expectOne('https://api.example.com/test');
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });
});
---------------------------personal-info.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service'; // Global HttpService
import { PersonalInfo } from './personal-info.model';

/**
 * Service to manage the API interactions for Personal Info.
 * Uses HttpService to interact with the backend API.
 */
@Injectable({
  providedIn: 'root',
})
export class PersonalInfoService {
  private readonly API_URL = '/personal-info'; // API endpoint

  constructor(private httpService: HttpService) {}

  /**
   * Save personal info data by making a POST request to the backend.
   * @param personalInfo PersonalInfo object to be saved
   * @returns Observable of response
   */
  savePersonalInfo(personalInfo: PersonalInfo): Observable<void> {
    return this.httpService.post<void>(this.API_URL, personalInfo);
  }
}
---------------------------------
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PersonalInfoService } from './personal-info.service';
import { HttpService } from './http.service';

describe('PersonalInfoService', () => {
  let service: PersonalInfoService;
  let httpMock: HttpTestingController;
  let httpService: HttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PersonalInfoService, HttpService],
    });
    service = TestBed.inject(PersonalInfoService);
    httpMock = TestBed.inject(HttpTestingController);
    httpService = TestBed.inject(HttpService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should save personal info', () => {
    const mockPersonalInfo = {
      name: { first: 'John', middle: 'A.', last: 'Doe' },
      dob: '1990-01-01',
    };

    service.savePersonalInfo(mockPersonalInfo).subscribe((response) => {
      expect(response).toBeUndefined();
    });

    const req = httpMock.expectOne('/personal-info');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockPersonalInfo);
    req.flush(null);
  });
});
