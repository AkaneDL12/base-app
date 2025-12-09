import Constants from "expo-constants";

/**
 * Obtiene automáticamente la IP del host donde corre Expo.
 * Funciona en Android, iOS, Emuladores y modo producción.
 */
function getBaseURL(): string {
  const debuggerHost = Constants.expoConfig?.hostUri;

  if (debuggerHost) {
    const host = debuggerHost.split(":")[0]; // ejemplo: 192.168.83.1
    return `http://${host}:3000`;
  }

  // fallback: usa EXPO_PUBLIC_API_BASE_URL si existe
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  // fallback final (emulador Android)
  return "http://10.0.2.2:3000";
}

export const API_BASE_URL = getBaseURL();
export const WEBSOCKET_URL = API_BASE_URL.replace("http", "ws");

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  websocketURL: WEBSOCKET_URL,
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    VERIFY: "/auth/verify",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  USER: {
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
    UPLOAD_AVATAR: "/upload/image",
    UPLOAD_COVER: "/upload/image",
  },
};