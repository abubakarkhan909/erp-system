import type { ApiMeta, ApiResponse } from '@jewelry-erp/shared';

const FALLBACK_API = 'http://127.0.0.1:3847/api/v1';

/**
 * Resolve API base URL for same-machine and LAN access.
 * If the UI is opened as http://192.168.x.x:3000, API calls go to
 * http://192.168.x.x:3847 even when .env points at 127.0.0.1.
 */
export function getApiBaseUrl(): string {
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
            return u.toString().replace(/\/$/, '');
          }
        } catch {
          /* ignore invalid env */
        }
      }
      const protocol = window.location.protocol || 'http:';
      return `${protocol}//${pageHost}:3847/api/v1`;
    }
  }

  return (configured || FALLBACK_API).replace(/\/$/, '');
}

/** @deprecated Prefer getApiBaseUrl() — kept for any imports that read the const. */
export const API_BASE_URL = FALLBACK_API;

export const TOKEN_STORAGE_KEY = 'jewelry_erp_token';

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

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
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
