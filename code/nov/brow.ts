import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser';

/**
 * Service to handle opening URLs in the device's external browser using Capacitor's Browser plugin.
 */
@Injectable({
  providedIn: 'root',
})
export class ExternalBrowserService {
  /**
   * Opens the given URL in the external browser.
   * @param url - The URL to open in the external browser.
   * @returns A promise that resolves when the URL is opened.
   */
  async openUrlInExternalBrowser(url: string): Promise<void> {
    if (!url) {
      throw new Error('URL cannot be empty');
    }
    await Browser.open({ url });
  }

  /**
   * Closes the external browser, if open.
   * @returns A promise that resolves when the browser is closed.
   */
  async closeExternalBrowser(): Promise<void> {
    await Browser.close();
  }
}


----------
import { TestBed } from '@angular/core/testing';
import { ExternalBrowserService } from './external-browser.service';
import { Browser } from '@capacitor/browser';

// Mock the Capacitor Browser plugin
jest.mock('@capacitor/browser', () => ({
  Browser: {
    open: jest.fn(),
    close: jest.fn(),
  },
}));

describe('ExternalBrowserService', () => {
  let service: ExternalBrowserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExternalBrowserService],
    });
    service = TestBed.inject(ExternalBrowserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('openUrlInExternalBrowser', () => {
    it('should call Browser.open with the correct URL', async () => {
      const url = 'https://example.com';
      await service.openUrlInExternalBrowser(url);
      expect(Browser.open).toHaveBeenCalledWith({ url });
    });

    it('should throw an error if URL is empty', async () => {
      await expect(service.openUrlInExternalBrowser('')).rejects.toThrow(
        'URL cannot be empty'
      );
    });
  });

  describe('closeExternalBrowser', () => {
    it('should call Browser.close', async () => {
      await service.closeExternalBrowser();
      expect(Browser.close).toHaveBeenCalled();
    });
  });
});
------

constructor(private externalBrowserService: ExternalBrowserService) {}

/**
 * Opens a URL in the external browser.
 * @param url - The URL to open.
 */
openUrl(url: string): void {
  this.externalBrowserService.openUrlInExternalBrowser(url).catch((error) => {
    console.error('Failed to open URL:', error.message);
  });
}