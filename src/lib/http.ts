import axios, { AxiosError, type AxiosInstance } from "axios";

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

if (!API_BASE && typeof window !== "undefined") {
  console.warn("NEXT_PUBLIC_API_URL is not set — API calls will fail.");
}

/** A failed API call. `status` is 0 for network / timeout errors. */
export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ClientOptions {
  /** Called per request to attach `Authorization: Bearer <token>`. */
  getToken?: () => string | null;
  /** Called when the API answers 401 (e.g. to clear a stale token). */
  onUnauthorized?: () => void;
}

/**
 * Build a pre-configured Axios instance. Every rejection is normalised to an
 * {@link ApiError} by the response interceptor, so callers only ever catch one
 * error type.
 */
export function createClient({ getToken, onUnauthorized }: ClientOptions = {}): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE,
    timeout: 20_000,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use((config) => {
    if (getToken) {
      const token = getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    // Let the browser set the multipart boundary for file uploads.
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ error?: string }>) => {
      const status = error.response?.status ?? 0;
      const message =
        error.response?.data?.error ??
        (status === 0
          ? "Не удалось связаться с сервером"
          : `Ошибка запроса (${status})`);

      if (status === 401) {
        try {
          onUnauthorized?.();
        } catch {
          /* ignore */
        }
      }
      return Promise.reject(new ApiError(status, message));
    },
  );

  return client;
}
