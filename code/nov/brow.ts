import { of } from 'rxjs';

export class TranslateServiceMock {
  currentLang = 'en'; // Default language

  get(key: string | string[]) {
    // Simulate returning an observable with the key(s) as the translation
    return of(key);
  }

  instant(key: string | string[]) {
    // Simulate instant translation by returning the key itself
    return key;
  }

  use(lang: string) {
    // Simulate changing the language
    this.currentLang = lang;
    return of(lang);
  }

  setDefaultLang(lang: string) {
    // No-op mock
  }

  getBrowserLang() {
    // Simulate browser language
    return 'en';
  }
}
-------

import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { InAppBrowserService } from 'path-to-inappbrowser.service';
import { LGS } from './lets-get-started.component';
import { TranslateServiceMock } from './translate-service.mock'; // Adjust path as needed

describe('LGS', () => {
  let component: LGS;
  let inAppBrowserServiceMock: jest.Mocked<InAppBrowserService>;
  let translateServiceMock: TranslateServiceMock;

  beforeEach(() => {
    // Mock InAppBrowserService
    inAppBrowserServiceMock = {
      openURL: jest.fn(),
    } as unknown as jest.Mocked<InAppBrowserService>;

    // Initialize the TranslateServiceMock
    translateServiceMock = new TranslateServiceMock();

    TestBed.configureTestingModule({
      providers: [
        LGS,
        { provide: InAppBrowserService, useValue: inAppBrowserServiceMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    });

    component = TestBed.inject(LGS);
  });

  describe('openURL', () => {
    it('should call openURL with "fr" if current language is French', () => {
      translateServiceMock.currentLang = 'fr'; // Set current language to French

      component.openURL();

      expect(inAppBrowserServiceMock.openURL).toHaveBeenCalledWith({
        url: 'fr',
        dismissDialog: true,
      });
    });

    it('should call openURL with "en" if current language is English', () => {
      translateServiceMock.currentLang = 'en'; // Set current language to English

      component.openURL();

      expect(inAppBrowserServiceMock.openURL).toHaveBeenCalledWith({
        url: 'en',
        dismissDialog: true,
      });
    });

    it('should not call openURL if current language is neither French nor English', () => {
      translateServiceMock.currentLang = 'es'; // Unsupported language

      component.openURL();

      expect(inAppBrowserServiceMock.openURL).not.toHaveBeenCalled();
    });

    it('should handle TranslateService.get and subscribe to it', () => {
      const translationKey = 'SOME_KEY';
      const translatedValue = 'Translated Value';

      jest.spyOn(translateServiceMock, 'get').mockReturnValue(of(translatedValue));

      component.openURL();

      expect(translateServiceMock.get).toHaveBeenCalledWith(translationKey);
    });
  });
});
