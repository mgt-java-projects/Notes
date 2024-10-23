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

function formatVersion(version) {
  const parts = version.split('.');

  // If there's only the major version (e.g., '17'), return it as is.
  if (parts.length === 1) {
    return version;
  }
  
  // If there are more than 2 parts (e.g., '17.5.1'), return only the first two parts.
  if (parts.length > 2) {
    return `${parts[0]}.${parts[1]}`;
  }
  
  // If it's already in '17.5' format, return it as is.
  return version;
}

// Examples:
console.log(formatVersion("17.5.1")); // Output: "17.5"
console.log(formatVersion("17.5"));   // Output: "17.5"
console.log(formatVersion("17"));     // Output: "17"


import { TestBed } from '@angular/core/testing';
import { VersionService } from './version.service'; // Adjust the path to your service

describe('VersionService', () => {
  let service: VersionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VersionService);
  });

  it('should return "17.5" when input is "17.5.1"', () => {
    const result = service.formatVersion('17.5.1');
    expect(result).toBe('17.5');
  });

  it('should return "17.5" when input is "17.5"', () => {
    const result = service.formatVersion('17.5');
    expect(result).toBe('17.5');
  });

  it('should return "17" when input is "17"', () => {
    const result = service.formatVersion('17');
    expect(result).toBe('17');
  });

  it('should return "19.9" when input is "19.9.5"', () => {
    const result = service.formatVersion('19.9.5');
    expect(result).toBe('19.9');
  });

  it('should return "19" when input is "19"', () => {
    const result = service.formatVersion('19');
    expect(result).toBe('19');
  });

  it('should return "21.0" when input is "21.0.0"', () => {
    const result = service.formatVersion('21.0.0');
    expect(result).toBe('21.0');
  });

  it('should handle unexpected input gracefully', () => {
    const result = service.formatVersion('invalid.version');
    expect(result).toBe('invalid');
  });
});


