import axios from "axios";
import { API_BASE_URL } from "./config";
import { StorageService } from "./storage";

class UserService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  // Obtener token guardado REAL
  private async getAuthHeaders() {
    const token = await StorageService.getToken();

    return token
      ? { Authorization: `Bearer ${token}` }
      : {};
  }

  // Obtener perfil
  async getProfile() {
    try {
      const headers = await this.getAuthHeaders();
      const res = await this.api.get("/users/profile", { headers });
      return res.data;
    } catch (err: any) {
      console.log("❌ Error al obtener perfil:", err?.response?.data || err);
      throw new Error("No se pudo cargar el perfil.");
    }
  }

  // Actualizar perfil
  async updateProfile(payload: any) {
    try {
      const headers = await this.getAuthHeaders();
      const res = await this.api.patch("/users/profile", payload, { headers });
      return res.data;
    } catch (err: any) {
      console.log("❌ Error al actualizar perfil:", err?.response?.data || err);
      throw new Error("No se pudo actualizar el perfil.");
    }
  }

  // Actualizar ubicación
  async updateLocation(data: { latitude: number; longitude: number; address?: string }) {
    try {
      const headers = await this.getAuthHeaders();
      const res = await this.api.patch("/users/location", data, { headers });
      return res.data;
    } catch (err: any) {
      console.log("❌ Error al actualizar ubicación:", err?.response?.data || err);
      throw err;
    }
  }

  // Obtener dirección desde coordenadas (geocoding reverso)
  async getAddressFromCoords(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await axios.get(
        'https://nominatim.openstreetmap.org/reverse',
        {
          params: {
            format: 'json',
            lat: latitude,
            lon: longitude,
            zoom: 18,
            addressdetails: 1,
          },
          headers: {
            'User-Agent': 'SocialApp/1.0 (social-app)'
          }
        }
      );

      const raw = response.data?.display_name as string | undefined;

      if (raw && raw.trim().length > 0) {
        return raw;
      }

      // Si por alguna razón no hay texto, devolvemos algo genérico
      return 'Ubicación actual';
    } catch (error) {
      console.log("❌ Error al obtener dirección:", error);
      // IMPORTANTE: ya no devolvemos coordenadas crudas
      return 'Ubicación actual';
    }
  }
}

export const userService = new UserService();