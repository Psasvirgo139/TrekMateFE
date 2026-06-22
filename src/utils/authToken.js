const TOKEN_KEY = 'accessToken';
const STORAGE_TYPE_KEY = 'authStorageType';

export function storeToken(token, rememberMe = true) {
  clearToken(false);
  const storage = rememberMe ? localStorage : sessionStorage;
  localStorage.setItem(STORAGE_TYPE_KEY, rememberMe ? 'local' : 'session');
  storage.setItem(TOKEN_KEY, token);
}

export function getStoredToken() {
  const storageType = localStorage.getItem(STORAGE_TYPE_KEY) || 'local';
  const storage = storageType === 'session' ? sessionStorage : localStorage;
  return storage.getItem(TOKEN_KEY);
}

export function clearToken(clearType = true) {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  if (clearType) {
    localStorage.removeItem(STORAGE_TYPE_KEY);
  }
}

export function getAuthHeaders() {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function handleUnauthorized() {
  clearToken();
  const path = window.location.pathname;
  if (!path.startsWith('/auth')) {
    sessionStorage.setItem('returnUrl', `${path}${window.location.search}`);
    window.dispatchEvent(new Event('auth:logout'));
    window.location.assign('/auth?tab=login');
  }
}

export function saveReturnUrl() {
  const path = `${window.location.pathname}${window.location.search}`;
  if (path && !path.startsWith('/auth')) {
    sessionStorage.setItem('returnUrl', path);
  }
}
