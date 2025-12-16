import { View, Text, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { BottomTabBar } from '../components/ui/BottomTabBar';
import { useAuthGuard } from '../contexts';
import { userService } from '../services/user.service';
import { locationService } from '../services/location.service';

const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000;

export default function MapScreen() {
  const { user, loading: authLoading, isAuthenticated } = useAuthGuard();
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    requestLocationPermission();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Necesitamos acceso a tu ubicación para mostrar el mapa'
        );
        setLoading(false);
        return;
      }

      setHasPermission(true);
      await startLocationTracking();
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      setLoading(false);
    }
  };

  const getAddressFromCoords = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const address = await userService.getAddressFromCoords(latitude, longitude);
      return address;
    } catch (error) {
      console.error('Error obteniendo dirección:', error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  };

  const startLocationTracking = async () => {
    try {
      setLoading(true);

      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const address = await getAddressFromCoords(
        initialLocation.coords.latitude,
        initialLocation.coords.longitude
      );

      const newLocation = {
        latitude: initialLocation.coords.latitude,
        longitude: initialLocation.coords.longitude,
        address,
      };

      setLocation(newLocation);

      // Guardar en la API
      await saveLocationToAPI(newLocation);

      // Guardar localmente para usar en posts
      await locationService.saveLocation(newLocation);

      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          updateMapLocation(${newLocation.latitude}, ${newLocation.longitude});
          true;
        `);
      }

      setLoading(false);

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000, // Cada 5 segundos para no saturar
          distanceInterval: 10, // Cada 10 metros
        },
        async (newPosition) => {
          const address = await getAddressFromCoords(
            newPosition.coords.latitude,
            newPosition.coords.longitude
          );

          const updatedLocation = {
            latitude: newPosition.coords.latitude,
            longitude: newPosition.coords.longitude,
            address,
          };

          setLocation(updatedLocation);

          // Guardar localmente
          await locationService.saveLocation(updatedLocation);

          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`
              updateMapLocation(${updatedLocation.latitude}, ${updatedLocation.longitude});
              true;
            `);
          }
        }
      );

      saveIntervalRef.current = setInterval(async () => {
        const currentLoc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const address = await getAddressFromCoords(
          currentLoc.coords.latitude,
          currentLoc.coords.longitude
        );

        const locationToSave = {
          latitude: currentLoc.coords.latitude,
          longitude: currentLoc.coords.longitude,
          address,
        };

        await saveLocationToAPI(locationToSave);
        await locationService.saveLocation(locationToSave);
        console.log('🕒 Ubicación guardada automáticamente cada 2 horas');
      }, TWO_HOURS_IN_MS);

    } catch (error) {
      console.error('Error al iniciar seguimiento:', error);
      setLoading(false);
      Alert.alert('Error', 'No se pudo iniciar el seguimiento de ubicación');
    }
  };

  const saveLocationToAPI = async (locationData: { latitude: number; longitude: number; address?: string }) => {
    try {
      await userService.updateLocation({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: locationData.address,
      });
      console.log('✅ Ubicación guardada en API:', locationData);
    } catch (error: any) {
      console.error('❌ Error al guardar ubicación en API:', error);
    }
  };

  const avatarUrl = user && (user as any).avatar ? (user as any).avatar : "";
  const userInitials =
    user && (user as any).name
      ? (user as any).name.charAt(0).toUpperCase()
      : "U";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
        }
        #map {
          height: 100%;
          width: 100%;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        let map;
        let marker;
        let accuracyCircle;
        
        const avatarUrl = "${avatarUrl}";
        const userInitials = "${userInitials}";

        let iconHtml;
        if (avatarUrl) {
            iconHtml = \`
              <div style="
                width: 48px; height: 48px; 
                border-radius: 50%; 
                border: 3px solid white; 
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                overflow: hidden;
                background-color: #7c3aed;
                display: flex; align-items: center; justify-content: center;
              ">
                <img src="\${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.parentElement.innerHTML='<span style=\\'color: white; font-weight: bold; font-size: 20px; font-family: sans-serif;\\'>' + userInitials + '</span>'"/>
              </div>
            \`;
        } else {
             iconHtml = \`
              <div style="
                width: 48px; height: 48px; 
                border-radius: 50%; 
                border: 3px solid white; 
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                background-color: #7c3aed;
                display: flex; align-items: center; justify-content: center;
              ">
                <span style="color: white; font-weight: bold; font-size: 20px; font-family: sans-serif;">\${userInitials}</span>
              </div>
            \`;
        }

        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: iconHtml,
          iconSize: [48, 48],
          iconAnchor: [24, 24]
        });
        
        function initMap(lat, lng) {
          map = L.map('map', {
            zoomControl: true,
            attributionControl: true
          }).setView([lat, lng], 17);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 19
          }).addTo(map);
          
          accuracyCircle = L.circle([lat, lng], {
            color: '#4285F4',
            fillColor: '#4285F4',
            fillOpacity: 0.15,
            weight: 1,
            radius: 30
          }).addTo(map);
          
          marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        }
        
        function updateMapLocation(lat, lng) {
          if (map && marker && accuracyCircle) {
            marker.setLatLng([lat, lng]);
            accuracyCircle.setLatLng([lat, lng]);
            map.panTo([lat, lng], {
              animate: true,
              duration: 0.25
            });
          } else {
            initMap(lat, lng);
          }
        }
        
        initMap(${location?.latitude || -2.9001}, ${location?.longitude || -79.0059});
      </script>
    </body>
    </html>
  `;

  if (authLoading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text className="mt-4 text-lg text-gray-600">Cargando...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView style={{ flex: 0, backgroundColor: '#7c3aed' }} edges={['top']}>
        <StatusBar style="light" />
        <View className="px-8 pt-4 pb-6 bg-violet-700 rounded-b-3xl">
          <Text className="mb-2 text-3xl font-bold text-white">
            🗺️ Mapa
          </Text>
          <Text className="text-sm text-violet-100" numberOfLines={2}>
            {location?.address || (location
              ? `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`
              : 'Obteniendo ubicación...')}
          </Text>
        </View>
      </SafeAreaView>

      <View className="flex-1">
        {!hasPermission ? (
          <View className="items-center justify-center flex-1 px-8">
            <Text className="mb-4 text-xl font-semibold text-center text-gray-800">
              📍 Permiso Requerido
            </Text>
            <Text className="mb-6 text-base text-center text-gray-600">
              Necesitamos acceso a tu ubicación para mostrar el mapa
            </Text>
            <TouchableOpacity
              onPress={requestLocationPermission}
              className="px-6 py-3 bg-violet-700 rounded-xl"
            >
              <Text className="font-semibold text-white">Permitir Acceso</Text>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <View className="items-center justify-center flex-1">
            <ActivityIndicator size="large" color="#7c3aed" />
            <Text className="mt-4 text-gray-600">Obteniendo ubicación...</Text>
          </View>
        ) : location ? (
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            style={{ flex: 1 }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View className="absolute inset-0 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#7c3aed" />
                <Text className="mt-4 text-gray-600">Cargando mapa...</Text>
              </View>
            )}
          />
        ) : (
          <View className="items-center justify-center flex-1 px-8">
            <Text className="mb-4 text-lg text-center text-gray-600">
              No se pudo obtener tu ubicación
            </Text>
            <TouchableOpacity
              onPress={requestLocationPermission}
              className="px-6 py-3 bg-violet-700 rounded-xl"
            >
              <Text className="font-semibold text-white">Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <BottomTabBar />
    </View>
  );
}