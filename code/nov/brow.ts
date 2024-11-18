import { Injectable } from '@angular/core';

/**
 * Service to handle opening URLs in the mobile device's default browser.
 */
@Injectable({
  providedIn: 'root',
})
export class ExternalBrowserService {
  /**
   * Opens the given URL in the mobile device's default browser (e.g., Safari on iOS, Chrome on Android).
   * @param url - The URL to open.
   * @throws An error if the URL is invalid or empty.
   */
  openInMobileBrowser(url: string): void {
    if (!url) {
      throw new Error('URL cannot be empty');
    }
    // Opens the URL in the external browser
    window.open(url, '_system');
  }
}



----------
import { TestBed } from '@angular/core/testing';
import { ExternalBrowserService } from './external-browser.service';

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

  describe('openInMobileBrowser', () => {
    beforeEach(() => {
      jest.spyOn(window, 'open').mockImplementation(); // Mock `window.open`
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should call window.open with the correct URL and _system target', () => {
      const url = 'https://example.com';
      service.openInMobileBrowser(url);
      expect(window.open).toHaveBeenCalledWith(url, '_system');
    });

    it('should throw an error if the URL is empty', () => {
      expect(() => service.openInMobileBrowser('')).toThrow('URL cannot be empty');
    });

    it('should not call window.open if the URL is empty', () => {
      try {
        service.openInMobileBrowser('');
      } catch (e) {}
      expect(window.open).not.toHaveBeenCalled();
    });
  });
});

------

 /**
   * Opens a URL in the external mobile browser.
   * @param url - The URL to open.
   */
 openUrl(url: string): void {
    try {
      this.externalBrowserService.openInMobileBrowser(url);
    } catch (error) {
      console.error('Error opening URL:', error.message);
    }
  }