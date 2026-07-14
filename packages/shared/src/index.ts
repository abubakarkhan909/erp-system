export * from './enums';
export * from './money';
export * from './schemas';

export interface ApiMeta {
  page?: number;
  pageSize?: number;
  total?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: ApiMeta;
  message?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  roles: string[];
  permissions: string[];
}
