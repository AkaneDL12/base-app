import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BottomTabBar } from '../components/ui/BottomTabBar';
import { useAuthGuard, useUser } from '../contexts';
import { Button } from '../components/ui';

export default function HomeScreen() {
  const { user, loading, isAuthenticated } = useAuthGuard();
  const { logout } = useUser();

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-violet-50">
        <Text className="mb-2 text-lg text-gray-600">Cargando...</Text>
        <Text className="text-sm text-gray-500">Un momento por favor</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <View className="flex-1 bg-white">

      {/* HEADER */}
      <SafeAreaView style={{ backgroundColor: '#7c3aed' }}>
        <StatusBar style="light" />
        <View className="px-8 py-6 bg-violet-700 rounded-b-3xl">
          <Text className="mb-1 text-3xl font-bold text-white">
            ¡Hola, {user.name}!
          </Text>
          <Text className="text-base text-violet-100">{user.email}</Text>
        </View>
      </SafeAreaView>

      {/* CONTENIDO */}
      <ScrollView className="flex-1">
        <View className="px-8 mt-8">

          <Text className="mb-4 text-xl font-bold text-gray-800">
            Inicio
          </Text>

          <Text className="mb-8 text-gray-600">
            Bienvenido a tu aplicación. Desde aquí puedes navegar al perfil, chats, posts y mapa usando la barra inferior.
          </Text>
        </View>
      </ScrollView>

      {/* BOTTOM NAV */}
      <BottomTabBar />
    </View>
  );
}