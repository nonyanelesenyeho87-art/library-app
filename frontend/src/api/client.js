// Thin wrapper around fetch: adds base URL, JSON headers, auth token and error handling.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'library_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token) onUnauthorized();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  login: (membershipId, password) => request('/auth/login', { method: 'POST', body: { membershipId, password } }),

  getBooks: () => request('/books'),
  createBook: (book) => request('/books', { method: 'POST', body: book }),
  updateBook: (id, book) => request(`/books/${id}`, { method: 'PUT', body: book }),
  deleteBook: (id) => request(`/books/${id}`, { method: 'DELETE' }),

  getTransactions: () => request('/transactions'),
  createTransaction: (tx) => request('/transactions', { method: 'POST', body: tx }),

  getUsers: () => request('/users'),
  createUser: (user) => request('/users', { method: 'POST', body: user }),
  updateUser: (id, user) => request(`/users/${id}`, { method: 'PUT', body: user }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};
