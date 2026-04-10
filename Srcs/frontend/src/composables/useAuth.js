import { ref, computed } from 'vue';
import { API_CONFIG } from '../config/apiConfig.js';

const token = ref(localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY));
const user = ref(readStoredUser());
const loading = ref(false);
const error = ref(null);

function readStoredUser() {
  const raw = localStorage.getItem(API_CONFIG.USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(API_CONFIG.USER_STORAGE_KEY);
    return null;
  }
}

function setSession(nextToken, nextUser = null) {
  token.value = nextToken;
  user.value = nextUser;

  if (nextToken) {
    localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEY, nextToken);
  } else {
    localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
  }

  if (nextUser) {
    localStorage.setItem(API_CONFIG.USER_STORAGE_KEY, JSON.stringify(nextUser));
  } else {
    localStorage.removeItem(API_CONFIG.USER_STORAGE_KEY);
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    let message = 'Request failed';

    if (typeof data === 'string') {
      message = data;
    } else if (data?.detail) {
      message = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    }

    throw new Error(message);
  }

  return data;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function useAuth() {
  const isAuthenticated = computed(() => Boolean(token.value));

  async function signup({ username, email, password }) {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_CONFIG.BASE_PATH}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_CONFIG.API_KEY },
        body: JSON.stringify({
          username: String(username || '').trim(),
          email: normalizeEmail(email),
          password,
        }),
      });

      return await parseResponse(response);
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function login({ email, password }) {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_CONFIG.BASE_PATH}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_CONFIG.API_KEY },
        body: JSON.stringify({
          email: normalizeEmail(email),
          password,
        }),
      });

      const authData = await parseResponse(response);
      setSession(authData.access_token, user.value);

      return authData;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMe() {
    if (!token.value) return null;

    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_CONFIG.BASE_PATH}/auth/users/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token.value}`,
          'X-API-Key': API_CONFIG.API_KEY,
        },
      });

      const profile = await parseResponse(response);
      setSession(token.value, profile);
      return profile;
    } catch (err) {
      error.value = err.message;
      setSession(null, null);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    error.value = null;
    setSession(null, null);
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    signup,
    login,
    fetchMe,
    logout,
  };
}

export { useAuth };
