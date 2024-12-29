import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid'; // Assuming you're using the uuid library
import { StorageService } from './storage.service'; // Replace with your actual storage service

@Injectable({
  providedIn: 'root',
})
export class Dev {
  deviceUniqueId: string = '';

  constructor(private readonly permanentStorage: StorageService) {}

  /**
   * Initialize the device ID by loading it from permanent storage.
   * If it doesn't exist, create a new one and save it.
   */
  async initialize(): Promise<string> {
    const permanentDeviceId = await this.permanentStorage.get<string>('DEVICE_UNIQUE_ID');
    if (!permanentDeviceId) {
      this.deviceUniqueId = uuidv4(); // Generate new UUID
      await this.saveDeviceIdToPermanentStorage(this.deviceUniqueId);
    } else {
      this.deviceUniqueId = permanentDeviceId;
    }

    console.log('Device ID:', this.deviceUniqueId);
    return this.deviceUniqueId;
  }

  /**
   * Get the device ID. Warns if not initialized.
   */
  getDeviceId(): string {
    if (!this.deviceUniqueId) {
      console.warn('deviceUniqueId has not been initialized!');
    }
    return this.deviceUniqueId;
  }

  /**
   * Save the device ID to permanent storage.
   */
  private async saveDeviceIdToPermanentStorage(deviceUniqueId: string): Promise<void> {
    await this.permanentStorage.set('DEVICE_UNIQUE_ID', deviceUniqueId);
  }
}
