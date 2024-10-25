import { TestBed } from '@angular/core/testing';
import { LaunchPermanentStorage } from './launch-permanent-storage.service';
import { StorageService } from './storage.service';
import { StorageKeys } from './storage-keys.enum';
import { StorageSerializable } from './storage-serializable.interface';

describe('LaunchPermanentStorage', () => {
  let service: LaunchPermanentStorage;
  let storageServiceMock: jest.Mocked<StorageService>;

  beforeEach(() => {
    const storageServiceMock = {
      set: jest.fn(),
      get: jest.fn(),
      remove: jest.fn(),
      setStringValue: jest.fn(),
      getStringValue: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        LaunchPermanentStorage,
        { provide: StorageService, useValue: storageServiceMock },
      ],
    });

    service = TestBed.inject(LaunchPermanentStorage);
    storageServiceMock = TestBed.inject(StorageService) as jest.Mocked<StorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save data to permanent storage', async () => {
    const key = StorageKeys.USER_INFO;
    const data: StorageSerializable = { id: 1, name: 'test' };
    storageServiceMock.set.mockResolvedValue(true);

    const result = await service.saveData(key, data);
    expect(result).toBe(true);
    expect(storageServiceMock.set).toHaveBeenCalledWith(key, data);
  });

  it('should retrieve data from permanent storage', async () => {
    const key = StorageKeys.USER_INFO;
    const data: StorageSerializable = { id: 1, name: 'test' };
    storageServiceMock.get.mockResolvedValue(data);

    const result = await service.getData<typeof data>(key);
    expect(result).toEqual(data);
    expect(storageServiceMock.get).toHaveBeenCalledWith(key);
  });

  it('should return null if no data exists in permanent storage', async () => {
    const key = StorageKeys.USER_INFO;
    storageServiceMock.get.mockResolvedValue(null);

    const result = await service.getData(key);
    expect(result).toBeNull();
    expect(storageServiceMock.get).toHaveBeenCalledWith(key);
  });

  it('should remove data from permanent storage', async () => {
    const key = StorageKeys.USER_INFO;
    storageServiceMock.remove.mockResolvedValue();

    await service.removeData(key);
    expect(storageServiceMock.remove).toHaveBeenCalledWith(key);
  });

  it('should save a string value to permanent storage', async () => {
    const key = StorageKeys.USER_TOKEN;
    const value = 'token123';
    storageServiceMock.setStringValue.mockResolvedValue(true);

    const result = await service.setStringValue(key, value);
    expect(result).toBe(true);
    expect(storageServiceMock.setStringValue).toHaveBeenCalledWith(key, value);
  });

  it('should retrieve a string value from permanent storage', async () => {
    const key = StorageKeys.USER_TOKEN;
    const value = 'token123';
    storageServiceMock.getStringValue.mockResolvedValue(value);

    const result = await service.getStringValue(key);
    expect(result).toBe(value);
    expect(storageServiceMock.getStringValue).toHaveBeenCalledWith(key);
  });

  it('should return null if no string value exists in permanent storage', async () => {
    const key = StorageKeys.USER_TOKEN;
    storageServiceMock.getStringValue.mockResolvedValue(null);

    const result = await service.getStringValue(key);
    expect(result).toBeNull();
    expect(storageServiceMock.getStringValue).toHaveBeenCalledWith(key);
  });
});


import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UrlParamService {

  constructor() {}

  getQueryParams(url: string): { [key: string]: string } {
    const params = new URL(url).searchParams;
    const queryParams: { [key: string]: string } = {};
    
    params.forEach((value, key) => {
      queryParams[key] = value;
    });

    return queryParams;
  }
}


import { TestBed } from '@angular/core/testing';
import { UrlParamService } from './url-param.service';

describe('UrlParamService', () => {
  let service: UrlParamService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UrlParamService]
    });
    service = TestBed.inject(UrlParamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should extract query parameters from the URL', () => {
    const url = ''
    const expectedParams = {
      rg: '',
      spc: '',
      ofid: '',
      spc2: '',
      ofid2: '',
      lang: '',
      plan: '--Account',
      plan2: '-Account',
      OMPID: '',
      OMPID2: '',
      productID: '',
      product2ID: '',
      os: 'iosl'
    };

    const queryParams = service.getQueryParams(url);

    expect(queryParams).toEqual(expectedParams);
  });

  it('should return an empty object if no parameters are present', () => {
    const url = '';
    const queryParams = service.getQueryParams(url);
    expect(queryParams).toEqual({});
  });
});

<meta http-equiv="Content-Security-Policy" content="default-src * 'self' data: gap: https://ssl.gstatic.com https://www.google-analytics.com https://www.googletagmanager.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com https://www.googletagmanager.com; connect-src * 'self' https://www.google-analytics.com https://www.googletagmanager.com; img-src 'self' data: https://www.google-analytics.com; style-src 'self' 'unsafe-inline';">



