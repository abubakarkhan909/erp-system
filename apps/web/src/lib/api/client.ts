import type { ApiMeta, ApiResponse } from '@jewelry-erp/shared';

const FALLBACK_API = 'http://127.0.0.1:3847/api/v1';

/**
 * Resolve API base URL for same-machine and LAN access.
 * If the UI is opened as http://192.168.x.x:3000, API calls go to
 * http://192.168.x.x:3847 (or dynamically chosen port) even when .env points at 127.0.0.1.
 */
export function getApiBaseUrl(): string {
  let apiPort = '3847';

  if (typeof window !== 'undefined') {
    // Priority order (highest to lowest):
    // 1. URL query param ?apiPort=XXXX  — set by Electron on every window load with the actual dynamic port
    // 2. sessionStorage 'apiPort'       — persisted from a previous query param on this session
    // 3. window.__API_PORT__            — SSR-injected at build/render time (may be stale on port conflict)
    // 4. hardcoded default 3847

    const urlParams = new URLSearchParams(window.location.search);
    const queryPort = urlParams.get('apiPort');
    if (queryPort) {
      apiPort = queryPort;
      // Persist so it survives client-side navigation (Next.js removes the query param on route push)
      try { sessionStorage.setItem('apiPort', queryPort); } catch { /* ignore */ }
    } else {
      const persistedPort = sessionStorage.getItem('apiPort');
      if (persistedPort) {
        apiPort = persistedPort;
      } else if ((window as any).__API_PORT__) {
        apiPort = (window as any).__API_PORT__;
      }
    }
  }

  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (typeof window !== 'undefined') {
    const pageHost = window.location.hostname;
    const isLanHost =
      Boolean(pageHost) && pageHost !== 'localhost' && pageHost !== '127.0.0.1';

    if (isLanHost) {
      if (configured) {
        try {
          const u = new URL(configured);
          if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
            u.hostname = pageHost;
            u.port = apiPort;
            return u.toString().replace(/\/$/, '');
          }
        } catch {
          /* ignore invalid env */
        }
      }
      const protocol = window.location.protocol || 'http:';
      return `${protocol}//${pageHost}:${apiPort}/api/v1`;
    }
  }

  if (configured) {
    try {
      const u = new URL(configured);
      if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
        u.port = apiPort;
        return u.toString().replace(/\/$/, '');
      }
    } catch {
      /* ignore */
    }
    return configured.replace(/\/$/, '');
  }

  return `http://127.0.0.1:${apiPort}/api/v1`;
}

/** @deprecated Prefer getApiBaseUrl() — kept for any imports that read the const. */
export const API_BASE_URL = FALLBACK_API;

export const TOKEN_STORAGE_KEY = 'jewelry_erp_token';
export const AUTH_PERSIST_KEY = 'jewelry_erp_auth';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public payload?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface PaginatedData<T> {
  data: T[];
  meta: ApiMeta;
}

function readPersistedAuth(): {
  accessToken?: string | null;
  refreshToken?: string | null;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_PERSIST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { accessToken?: string; refreshToken?: string } };
    return parsed.state ?? null;
  } catch {
    return null;
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  const direct = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (direct) return direct;
  const persisted = readPersistedAuth()?.accessToken;
  if (persisted) {
    localStorage.setItem(TOKEN_STORAGE_KEY, persisted);
    return persisted;
  }
  return null;
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return readPersistedAuth()?.refreshToken ?? null;
}

export function setAuthToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

function writePersistedAccessToken(accessToken: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(AUTH_PERSIST_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as {
      state?: Record<string, unknown>;
      version?: number;
    };
    if (!parsed.state) return;
    parsed.state.accessToken = accessToken;
    localStorage.setItem(AUTH_PERSIST_KEY, JSON.stringify(parsed));
  } catch {
    /* ignore */
  }
}

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;
    try {
      const response = await fetch(buildUrl('/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) return null;
      const body = (await response.json()) as ApiResponse<{
        accessToken: string;
        refreshToken: string;
      }>;
      const accessToken = body.data?.accessToken;
      if (!accessToken) return null;
      setAuthToken(accessToken);
      writePersistedAccessToken(accessToken);
      // Keep refresh token rotation if returned
      if (body.data.refreshToken) {
        try {
          const raw = localStorage.getItem(AUTH_PERSIST_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
            if (parsed.state) {
              parsed.state.refreshToken = body.data.refreshToken;
              localStorage.setItem(AUTH_PERSIST_KEY, JSON.stringify(parsed));
            }
          }
        } catch {
          /* ignore */
        }
      }
      return accessToken;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

async function parseJsonResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const text = await response.text();
  let body: ApiResponse<T> | { message?: string | string[]; statusCode?: number };

  try {
    body = text ? JSON.parse(text) : { success: false, data: null as T, message: 'Empty response' };
  } catch {
    throw new ApiError('Invalid JSON response from server', response.status, text);
  }

  if (!response.ok) {
    const message =
      (body as ApiResponse<T>).message ||
      (Array.isArray((body as { message?: string[] }).message)
        ? (body as { message: string[] }).message.join(', ')
        : (body as { message?: string }).message) ||
      response.statusText ||
      'Request failed';
    throw new ApiError(message, response.status, body);
  }

  if ('success' in body && body.success === false) {
    throw new ApiError(body.message || 'Request failed', response.status, body);
  }

  return body as ApiResponse<T>;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  auth?: boolean;
}

function buildUrl(path: string, params?: RequestOptions['params']) {
  const base = getApiBaseUrl();
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
  if (!params) return url;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `${url}?${qs}` : url;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { params, body, auth = true, headers: customHeaders, ...init } = options;

  const headers = new Headers(customHeaders);
  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(buildUrl(path, params), {
    ...init,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // If access token expired/missing, try one refresh then retry
  if (auth && response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      const retry = await fetch(buildUrl(path, params), {
        ...init,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      return parseJsonResponse<T>(retry);
    }
  }

  return parseJsonResponse<T>(response);
}

export async function apiGet<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
  return apiRequest<T>(path, { ...options, method: 'GET' });
}

export async function apiPost<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
  return apiRequest<T>(path, { ...options, method: 'POST', body });
}

export async function apiPatch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
  return apiRequest<T>(path, { ...options, method: 'PATCH', body });
}

export async function apiPut<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
  return apiRequest<T>(path, { ...options, method: 'PUT', body });
}

export async function apiDelete<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
  return apiRequest<T>(path, { ...options, method: 'DELETE' });
}

export async function apiList<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): Promise<PaginatedData<T>> {
  const res = await apiGet<T[] | PaginatedData<T>>(path, { params });

  if (Array.isArray(res.data)) {
    return {
      data: res.data,
      meta: res.meta ?? { page: 1, pageSize: res.data.length, total: res.data.length },
    };
  }

  const payload = res.data as PaginatedData<T>;
  return {
    data: payload.data ?? [],
    meta: payload.meta ?? res.meta ?? {},
  };
}
