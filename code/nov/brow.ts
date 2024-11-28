import { InAppBrowserWeb } from './inappbrowser.plugin';

describe('InAppBrowserWeb', () => {
  let inAppBrowser: InAppBrowserWeb;

  beforeEach(() => {
    inAppBrowser = new InAppBrowserWeb();
  });

  describe('open', () => {
    it('should call window.open with the correct parameters', () => {
      // Mock window.open
      const mockWindowOpen = jest.fn();
      window.open = mockWindowOpen;

      const options = { url: 'https://example.com', target: '_blank' };
      inAppBrowser.open(options);

      expect(mockWindowOpen).toHaveBeenCalledWith(options.url, options.target);
    });
  });

  describe('close', () => {
    it('should call close on the opened window', () => {
      const mockClose = jest.fn();
      const mockWindow: Partial<Window> = { close: mockClose };

      (inAppBrowser as any).win = mockWindow as Window;
      inAppBrowser.close();

      expect(mockClose).toHaveBeenCalled();
    });

    it('should not throw if there is no window to close', () => {
      (inAppBrowser as any).win = null;
      expect(() => inAppBrowser.close()).not.toThrow();
    });
  });

  describe('unimplemented methods', () => {
    it('should throw "Not implemented on web" for openURL', async () => {
      await expect(inAppBrowser.openURL({})).rejects.toThrow('Not implemented on web');
    });

    it('should throw "Not implemented on web" for openHTML', async () => {
      await expect(inAppBrowser.openHTML({})).rejects.toThrow('Not implemented on web');
    });

    it('should throw "Not implemented on web" for nativeToJS', async () => {
      await expect(inAppBrowser.nativeToJS({})).rejects.toThrow('Not implemented on web');
    });

    it('should throw "Not implemented on web" for captureCardNumber', async () => {
      await expect(inAppBrowser.captureCardNumber({})).rejects.toThrow('Not implemented on web');
    });
  });
});
