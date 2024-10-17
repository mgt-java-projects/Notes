import { Injectable } from '@angular/core';
import { StorageService } from './storage.service'; // Import your StorageService
import { StorageKeys } from './storage-keys.enum'; // Import the enum
import { StorageSerializable } from './storage-serializable.interface'; // Assuming this exists

@Injectable({
  providedIn: 'root',
})
export class LaunchPermanentStorage {
  constructor(private readonly permanentStorage: StorageService) {}

  /**
   * Save data to permanent storage using the given key.
   * The data must implement StorageSerializable.
   * @param key - The key used to identify the data in storage.
   * @param data - The data to store, must be StorageSerializable.
   * @returns A promise that resolves to true if the operation is successful.
   */
  async saveData(key: StorageKeys, data: StorageSerializable): Promise<boolean> {
    return await this.permanentStorage.set(key, data);
  }

  /**
   * Retrieve data from permanent storage using the given key.
   * The data retrieved must implement StorageSerializable.
   * @param key - The key used to retrieve data from storage.
   * @returns A promise that resolves to the stored data or null if no data exists.
   */
  async getData<T extends StorageSerializable>(key: StorageKeys): Promise<T | null> {
    return await this.permanentStorage.get<T>(key);
  }

  /**
   * Remove data from permanent storage using the given key.
   * @param key - The key used to remove data from storage.
   */
  async removeData(key: StorageKeys): Promise<void> {
    await this.permanentStorage.remove(key);
  }

  /**
   * Save a string value to permanent storage using the given key.
   * @param key - The key used to store the string value.
   * @param value - The string value to store.
   */
  async setStringValue(key: StorageKeys, value: string): Promise<boolean> {
    return await this.permanentStorage.setStringValue(key, value);
  }

  /**
   * Retrieve a string value from permanent storage using the given key.
   * @param key - The key used to retrieve the string value from storage.
   * @returns A promise that resolves to the stored string or null if no data exists.
   */
  async getStringValue(key: StorageKeys): Promise<string | null> {
    return await this.permanentStorage.getStringValue(key);
  }
}
-------------
import { TestBed } from '@angular/core/testing';
import { LaunchPermanentStorage } from './launch-permanent-storage.service';
import { StorageService } from './storage.service';
import { StorageKeys } from './storage-keys.enum';
import { StorageSerializable } from './storage-serializable.interface';

describe('LaunchPermanentStorage', () => {
  let service: LaunchPermanentStorage;
  let storageServiceMock: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('StorageService', [
      'set',
      'get',
      'remove',
      'setStringValue',
      'getStringValue',
    ]);

    TestBed.configureTestingModule({
      providers: [
        LaunchPermanentStorage,
        { provide: StorageService, useValue: spy },
      ],
    });

    service = TestBed.inject(LaunchPermanentStorage);
    storageServiceMock = TestBed.inject(
      StorageService
    ) as jasmine.SpyObj<StorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save data to permanent storage', async () => {
    const key = StorageKeys.USER_INFO;
    const data: StorageSerializable = { id: 1, name: 'test' };
    storageServiceMock.set.and.returnValue(Promise.resolve(true));

    const result = await service.saveData(key, data);
    expect(result).toBe(true);
    expect(storageServiceMock.set).toHaveBeenCalledWith(key, data);
  });

  it('should retrieve data from permanent storage', async () => {
    const key = StorageKeys.USER_INFO;
    const data: StorageSerializable = { id: 1, name: 'test' };
    storageServiceMock.get.and.returnValue(Promise.resolve(data));

    const result = await service.getData<typeof data>(key);
    expect(result).toEqual(data);
    expect(storageServiceMock.get).toHaveBeenCalledWith(key);
  });

  it('should return null if no data exists in permanent storage', async () => {
    const key = StorageKeys.USER_INFO;
    storageServiceMock.get.and.returnValue(Promise.resolve(null));

    const result = await service.getData(key);
    expect(result).toBeNull();
    expect(storageServiceMock.get).toHaveBeenCalledWith(key);
  });

  it('should remove data from permanent storage', async () => {
    const key = StorageKeys.USER_INFO;
    storageServiceMock.remove.and.returnValue(Promise.resolve());

    await service.removeData(key);
    expect(storageServiceMock.remove).toHaveBeenCalledWith(key);
  });

  it('should save a string value to permanent storage', async () => {
    const key = StorageKeys.USER_TOKEN;
    const value = 'token123';
    storageServiceMock.setStringValue.and.returnValue(Promise.resolve(true));

    const result = await service.setStringValue(key, value);
    expect(result).toBe(true);
    expect(storageServiceMock.setStringValue).toHaveBeenCalledWith(key, value);
  });

  it('should retrieve a string value from permanent storage', async () => {
    const key = StorageKeys.USER_TOKEN;
    const value = 'token123';
    storageServiceMock.getStringValue.and.returnValue(Promise.resolve(value));

    const result = await service.getStringValue(key);
    expect(result).toBe(value);
    expect(storageServiceMock.getStringValue).toHaveBeenCalledWith(key);
  });

  it('should return null if no string value exists in permanent storage', async () => {
    const key = StorageKeys.USER_TOKEN;
    storageServiceMock.getStringValue.and.returnValue(Promise.resolve(null));

    const result = await service.getStringValue(key);
    expect(result).toBeNull();
    expect(storageServiceMock.getStringValue).toHaveBeenCalledWith(key);
  });
});
