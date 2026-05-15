const AUTH_KEY = 'ctroi_auth';

export const saveAuth = (username: string, password: string): string => {
  const encoded = btoa(`${username}:${password}`);
  sessionStorage.setItem(AUTH_KEY, encoded);
  return encoded;
};

export const loadAuth = (): string | null => sessionStorage.getItem(AUTH_KEY);

export const clearAuth = (): void => sessionStorage.removeItem(AUTH_KEY);
