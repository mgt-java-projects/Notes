export function getAppInitializationConfig(env: string): { environment: string; isProd: boolean; apiHost: string } {
  const isProd = env === 'production';
  const apiHost = isProd ? 'https://api.production.com' : 'https://api.staging.com';

  return {
    environment: env,
    isProd,
    apiHost,
  };
}

describe('getAppInitializationConfig', () => {
  it('should return production config for "production" environment', () => {
    const config = getAppInitializationConfig('production');
    expect(config.environment).toBe('production');
    expect(config.isProd).toBe(true);
    expect(config.apiHost).toBe('https://api.production.com');
  });

  it('should return staging config for non-production environments', () => {
    const config = getAppInitializationConfig('staging');
    expect(config.environment).toBe('staging');
    expect(config.isProd).toBe(false);
    expect(config.apiHost).toBe('https://api.staging.com');
  });
});