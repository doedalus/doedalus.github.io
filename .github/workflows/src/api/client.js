const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const ACCESS_KEY = 'esagila_access_token'
const REFRESH_KEY = 'esagila_refresh_token'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens({ access_token, refresh_token }) {
  if (access_token) localStorage.setItem(ACCESS_KEY, access_token)
  if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export class ApiError extends Error {
  constructor(status, detail) {
    super(typeof detail === 'string' ? detail : 'Ошибка запроса')
    this.status = status
    this.detail = detail
  }
}

// Extracts a human-readable message from FastAPI's error shape
// (which can be a string, or a list of pydantic validation errors).
function extractDetailMessage(detail) {
  if (!detail) return 'Что-то пошло не так'
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((e) => e.msg || JSON.stringify(e))
      .join('; ')
  }
  return 'Что-то пошло не так'
}

let refreshPromise = null

async function doRefresh() {
  const refresh_token = getRefreshToken()
  if (!refresh_token) throw new ApiError(401, 'Не авторизован')

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token }),
  })

  if (!res.ok) {
    clearTokens()
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, extractDetailMessage(body.detail))
  }

  const data = await res.json()
  setTokens(data)
  return data
}

/**
 * Core request helper.
 * - auth: true attaches the Bearer access token
 * - on a 401 with auth on, it tries a single silent refresh + retry
 */
export async function apiFetch(path, { method = 'GET', body, auth = false, params } = {}) {
  const url = new URL(`${API_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
    })
  }

  const doFetch = () => {
    const headers = { 'Content-Type': 'application/json' }
    if (auth) {
      const token = getAccessToken()
      if (token) headers['Authorization'] = `Bearer ${token}`
    }
    return fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  let res = await doFetch()

  if (res.status === 401 && auth && getRefreshToken()) {
    try {
      refreshPromise = refreshPromise || doRefresh()
      await refreshPromise
    } catch (e) {
      refreshPromise = null
      clearTokens()
      throw new ApiError(401, 'Сессия истекла, войдите снова')
    }
    refreshPromise = null
    res = await doFetch()
  }

  if (res.status === 204) return null

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    throw new ApiError(res.status, extractDetailMessage(data?.detail))
  }

  return data
}

export const api = {
  register: (payload) => apiFetch('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => apiFetch('/auth/login', { method: 'POST', body: payload }),
  logout: (refresh_token) => apiFetch('/auth/logout', { method: 'POST', body: { refresh_token } }),
  me: () => apiFetch('/auth/me', { auth: true }),

  getBooks: ({ search = '', skip = 0, limit = 20 } = {}) =>
    apiFetch('/books/', { params: { search, skip, limit } }),
  getBook: (id) => apiFetch(`/books/${id}`),
  getBookReviews: (id) => apiFetch(`/books/${id}/reviews`),
  createBook: (payload) => apiFetch('/books/', { method: 'POST', body: payload, auth: true }),
  updateBook: (id, payload) => apiFetch(`/books/${id}`, { method: 'PUT', body: payload, auth: true }),
  deleteBook: (id) => apiFetch(`/books/${id}`, { method: 'DELETE', auth: true }),

  getMyLibrary: ({ skip = 0, limit = 20 } = {}) =>
    apiFetch('/user_books/me', { params: { skip, limit }, auth: true }),
  getUserLibrary: (userId, { skip = 0, limit = 20 } = {}) =>
    apiFetch(`/user_books/users/${userId}`, { params: { skip, limit } }),
  getMyBookEntry: (bookId) => apiFetch(`/user_books/${bookId}`, { auth: true }),
  addToLibrary: (bookId, payload) =>
    apiFetch(`/user_books/${bookId}`, { method: 'POST', body: payload, auth: true }),
  updateLibraryEntry: (bookId, payload) =>
    apiFetch(`/user_books/${bookId}`, { method: 'PUT', body: payload, auth: true }),
  removeFromLibrary: (bookId) => apiFetch(`/user_books/${bookId}`, { method: 'DELETE', auth: true }),
}

export { API_URL }
