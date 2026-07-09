function normalizeApiBaseUrl(value: string): string {
  if (!value) return '/api';

  const trimmed = value.trim();
  if (!trimmed) return '/api';

  if (trimmed.startsWith('/')) return trimmed;

  const withoutTrailingSlash = trimmed.replace(/\/+$/, '');
  return withoutTrailingSlash.endsWith('/api')
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
}

export function getApiBaseUrl(): string {
  return normalizeApiBaseUrl(import.meta.env.VITE_API_URL?.trim() || '');
}

export function getSocketBaseUrl(): string {
  const configured = import.meta.env.VITE_SOCKET_URL?.trim();
  if (configured) return configured;
  return window.location.origin;
}
