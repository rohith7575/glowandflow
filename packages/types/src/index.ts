export type User = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
};

export type HealthStatus = {
  ok: boolean;
  uptime: number;
  timestamp: string;
  version: string;
};

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};