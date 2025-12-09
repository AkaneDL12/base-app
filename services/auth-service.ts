// services/auth-service.ts
import { BaseApiService, ApiResponse } from "./base-api";
import { API_CONFIG, ENDPOINTS } from "./config";
import { StorageService } from "./storage";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    isOnline?: boolean;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export class AuthService extends BaseApiService {
  constructor() {
    super(API_CONFIG);
  }

  // -----------------------------------------------------------
  // LOGIN
  // -----------------------------------------------------------
  async login(
    credentials: LoginRequest
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await this.makeRequest<AuthResponse>(
      ENDPOINTS.AUTH.LOGIN,
      {
        method: "POST",
        body: JSON.stringify(credentials),
      }
    );

    if (response.success && response.data) {
      await StorageService.saveToken(response.data.access_token);
      await StorageService.saveUser(response.data.user);
    }

    return response;
  }

  // -----------------------------------------------------------
  // REGISTER
  // -----------------------------------------------------------
  async register(
    userData: RegisterRequest
  ): Promise<ApiResponse<AuthResponse>> {
    return this.makeRequest<AuthResponse>(ENDPOINTS.AUTH.REGISTER, {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  // -----------------------------------------------------------
  // LOGOUT
  // -----------------------------------------------------------
  async logout(token?: string): Promise<ApiResponse<null>> {
    const authToken = token || (await StorageService.getToken());

    const response = await this.makeRequest<null>(ENDPOINTS.AUTH.LOGOUT, {
      method: "POST",
      headers: authToken ? this.getAuthHeaders(authToken) : {},
    });

    await StorageService.clearAuth();
    return response;
  }

  // -----------------------------------------------------------
  // REFRESH TOKEN
  // -----------------------------------------------------------
  async refreshToken(
    token: string
  ): Promise<ApiResponse<{ token: string }>> {
    return this.makeRequest<{ token: string }>(ENDPOINTS.AUTH.REFRESH, {
      method: "POST",
      headers: this.getAuthHeaders(token),
    });
  }

  // -----------------------------------------------------------
  // VERIFY TOKEN
  // -----------------------------------------------------------
  async verifyToken(
    token: string
  ): Promise<ApiResponse<AuthResponse["user"]>> {
    return this.makeRequest<AuthResponse["user"]>(ENDPOINTS.AUTH.VERIFY, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    });
  }

  // -----------------------------------------------------------
  // PASSWORD FUNCTIONS
  // -----------------------------------------------------------
  async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(
      ENDPOINTS.AUTH.FORGOT_PASSWORD,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async resetPassword(
    data: ResetPasswordRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(
      ENDPOINTS.AUTH.RESET_PASSWORD,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  // -----------------------------------------------------------
  // SESSION HELPERS (ALMACEN LOCAL)
  // -----------------------------------------------------------
  async getCurrentUser(): Promise<any | null> {
    return await StorageService.getUser();
  }

  async getCurrentToken(): Promise<string | null> {
    return await StorageService.getToken();
  }

  // ATENCIÓN: este es el que usa tu UserContext
  async getToken(): Promise<string | null> {
    return await StorageService.getToken();
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await StorageService.getToken();
    if (!token) return false;

    return !(await StorageService.isTokenExpired(token));
  }
}

export const authService = new AuthService();