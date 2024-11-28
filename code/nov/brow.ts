import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { InAppBrowserService } from 'path-to-inappbrowser.service';

describe('LGS', () => {
  let component: LGS;
  let inAppBrowserServiceMock: jest.Mocked<InAppBrowserService>;
  let translateServiceMock: jest.Mocked<TranslateService>;

  beforeEach(() => {
    // Mock InAppBrowserService
    inAppBrowserServiceMock = {
      openURL: jest.fn(),
    } as unknown as jest.Mocked<InAppBrowserService>;

    // Mock TranslateService
    translateServiceMock = {
      currentLang: 'en',
    } as unknown as jest.Mocked<TranslateService>;

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
      translateServiceMock.currentLang = 'fr';

      component.openURL();

      expect(inAppBrowserServiceMock.openURL).toHaveBeenCalledWith({
        url: 'fr',
        dismissDialog: true,
      });
    });

    it('should call openURL with "en" if current language is English', () => {
      translateServiceMock.currentLang = 'en';

      component.openURL();

      expect(inAppBrowserServiceMock.openURL).toHaveBeenCalledWith({
        url: 'en',
        dismissDialog: true,
      });
    });

    it('should not call openURL if current language is neither French nor English', () => {
      translateServiceMock.currentLang = 'es';

      component.openURL();

      expect(inAppBrowserServiceMock.openURL).not.toHaveBeenCalled();
    });
  });
});
