
import { Injectable } from '@angular/core';
import { StorageService } from './storage.service'; // Import your StorageService


// Define an enum for storage keys
export enum StorageKeys {
    UUID = 'uuid',
    SELECTED_PRODUCT_DETAILS = 'selectedProductDetails',
  }

@Injectable({
  providedIn: 'root',
})
export class LaunchPermanentStorage {
  constructor(private readonly permanentStorage: StorageService) {}

  /**
   * Save data to permanent storage using the given key.
   * @param key - The key used to identify the data in storage.
   * @param data - The data to store.
   */
  async saveData(key: StorageKeys, data: any): Promise<void> {
    await this.permanentStorage.set(key, data);
  }

  /**
   * Retrieve data from permanent storage using the given key.
   * @param key - The key used to retrieve data from storage.
   * @returns A promise that resolves to the stored data or null if no data exists.
   */
  async getData<T>(key: StorageKeys): Promise<T | null> {
    return await this.permanentStorage.get<T>(key);
  }
}

---------
import { TestBed } from '@angular/core/testing';
import { LaunchPermanentStorage } from './launch-permanent-storage.service';
import { StorageService } from './storage.service'; // Import the mockable StorageService
import { StorageKeys } from './storage-keys.enum';

describe('LaunchPermanentStorage Service', () => {
  let service: LaunchPermanentStorage;
  let storageService: StorageService;

  beforeEach(() => {
    // Create a mock StorageService
    const storageServiceMock = {
      set: jest.fn(),
      get: jest.fn(),
    };

    // Initialize TestBed
    TestBed.configureTestingModule({
      providers: [
        LaunchPermanentStorage,
        { provide: StorageService, useValue: storageServiceMock },
      ],
    });

    // Inject the service and the mocked StorageService
    service = TestBed.inject(LaunchPermanentStorage);
    storageService = TestBed.inject(StorageService);
  });

  /**
   * Test the saveData method to ensure it calls the set method of StorageService.
   */
  it('should save data to permanent storage', async () => {
    const testData = 'test-device-id';
    const key = StorageKeys.UUID;

    // Call the saveData method
    await service.saveData(key, testData);

    // Assert that the StorageService's set method was called with the correct key and data
    expect(storageService.set).toHaveBeenCalledWith(key, testData);
  });

  /**
   * Test the getData method to ensure it calls the get method of StorageService and returns the correct data.
   */
  it('should retrieve data from permanent storage', async () => {
    const storedData = 'stored-device-id';
    const key = StorageKeys.UUID;

    // Mock the get method to return a specific value
    (storageService.get as jest.Mock).mockResolvedValue(storedData);

    // Call the getData method
    const result = await service.getData<string>(key);

    // Assert that the StorageService's get method was called with the correct key
    expect(storageService.get).toHaveBeenCalledWith(key);

    // Assert that the result is equal to the mocked data
    expect(result).toBe(storedData);
  });

  /**
   * Test the getData method to handle when no data exists (returns null).
   */
  it('should return null when no data exists', async () => {
    const key = StorageKeys.SELECTED_PRODUCT_DETAILS;

    // Mock the get method to return null
    (storageService.get as jest.Mock).mockResolvedValue(null);

    // Call the getData method
    const result = await service.getData<any>(key);

    // Assert that the result is null
    expect(result).toBeNull();
  });
});

