export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
}

export class BaseApiService {
  protected config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const url = `${this.config.baseURL}${endpoint}`;

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP Error ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'La solicitud tardó demasiado tiempo',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: 'Error desconocido',
      };
    }
  }

  protected getAuthHeaders(token?: string): Record<string, string> {
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
    };
  }
}