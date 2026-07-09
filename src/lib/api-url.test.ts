import { describe, expect, it, vi } from 'vitest';
import { getApiBaseUrl } from './api-url';

describe('getApiBaseUrl', () => {
  it('returns a configured API base when provided', () => {
    vi.stubEnv('VITE_API_URL', 'https://example.com/api');
    expect(getApiBaseUrl()).toBe('https://example.com/api');
  });

  it('appends /api when the configured origin does not already include it', () => {
    vi.stubEnv('VITE_API_URL', 'https://render-backend.example.com');
    expect(getApiBaseUrl()).toBe('https://render-backend.example.com/api');
  });

  it('falls back to /api when no environment override is set', () => {
    vi.stubEnv('VITE_API_URL', '');
    expect(getApiBaseUrl()).toBe('/api');
  });
});
