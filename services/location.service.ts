import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_STORAGE_KEY = '@app_last_location';

interface SavedLocation {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: number;
}

class LocationService {
  // Guardar ubicación
  async saveLocation(location: { latitude: number; longitude: number; address?: string }) {
    try {
      const savedLocation: SavedLocation = {
        ...location,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(savedLocation));
      console.log('📍 [LOCATION SERVICE] Ubicación guardada:', savedLocation);
    } catch (error) {
      console.error('❌ [LOCATION SERVICE] Error guardando ubicación:', error);
    }
  }

  // Obtener última ubicación guardada
  async getLastLocation(): Promise<SavedLocation | null> {
    try {
      const stored = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
      if (stored) {
        const location = JSON.parse(stored) as SavedLocation;
        console.log('📍 [LOCATION SERVICE] Ubicación recuperada:', location);
        return location;
      }
      return null;
    } catch (error) {
      console.error('❌ [LOCATION SERVICE] Error obteniendo ubicación:', error);
      return null;
    }
  }

  // Limpiar ubicación guardada
  async clearLocation() {
    try {
      await AsyncStorage.removeItem(LOCATION_STORAGE_KEY);
      console.log('🗑️ [LOCATION SERVICE] Ubicación limpiada');
    } catch (error) {
      console.error('❌ [LOCATION SERVICE] Error limpiando ubicación:', error);
    }
  }
}

export const locationService = new LocationService();