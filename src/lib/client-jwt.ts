// JWT Token Management for Client-Side Authentication

const TOKEN_KEY = "admin_token";

/**
 * Save JWT token to localStorage
 */
export const saveToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Get JWT token from localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove JWT token from localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Parse JWT token and check if it's expired
 * Token format: header.payload.signature
 */
export const isTokenValid = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration
    if (payload.exp) {
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expirationTime;
    }

    return true;
  } catch (error) {
    console.error("Error parsing token:", error);
    return false;
  }
};

/**
 * Get Authorization header with Bearer token
 */
export const getAuthHeader = (): Record<string, string> => {
  const token = getToken();
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Get token expiration date
 */
export const getTokenExpiration = (): Date | null => {
  const token = getToken();
  if (!token) return null;

  try {
    const parts = token.split(".");
    const payload = JSON.parse(atob(parts[1]));
    
    if (payload.exp) {
      return new Date(payload.exp * 1000);
    }

    return null;
  } catch (error) {
    console.error("Error parsing token:", error);
    return null;
  }
};

/**
 * Check if token will expire within specified time (in minutes)
 */
export const isTokenExpiringWithin = (minutes: number): boolean => {
  const token = getToken();
  if (!token) return true;

  try {
    const parts = token.split(".");
    const payload = JSON.parse(atob(parts[1]));
    
    if (payload.exp) {
      const expirationTime = payload.exp * 1000;
      const expiryThreshold = Date.now() + minutes * 60 * 1000;
      return expirationTime < expiryThreshold;
    }

    return false;
  } catch (error) {
    console.error("Error parsing token:", error);
    return true;
  }
};
