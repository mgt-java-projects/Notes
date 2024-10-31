jest.mock('@capacitor/core', () => ({
    CapacitorHttp: {
      get: jest.fn(),
    },
  }));
  
  describe('CpxHttpClientService', () => {
    it('should call CapacitorHttp.get and return the expected response', async () => {
      const data = { body: 'test', status: 200, url: 'test', headers: {} };
      CapacitorHttp.get.mockResolvedValueOnce(data);
  
      const result = await lastValueFrom(httpClientService.get('test', {}));
      expect(result).toEqual(data);
    });
  });