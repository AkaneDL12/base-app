import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Card } from '../components/ui';
import { BottomTabBar } from '../components/ui/BottomTabBar';
import { useAuthGuard } from '../contexts';

export default function ChatsScreen() {
  const { user, loading, isAuthenticated } = useAuthGuard();

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-violet-50">
        <Text className="mb-2 text-lg text-gray-600">Cargando...</Text>
        <Text className="text-sm text-gray-500">Un momento por favor</Text>
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
        <View className="px-8 pt-4 pb-8 bg-violet-700 rounded-b-3xl">
          <Text className="mb-2 text-3xl font-bold text-white">
            💬 Chats
          </Text>
          <Text className="text-base text-violet-100">
            Tus conversaciones
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1">
        <View className="px-8 mt-8">
          <Card>
            <Text className="mb-2 text-lg font-medium text-center text-gray-600">
              🚧 En construcción
            </Text>
            <Text className="text-base text-center text-gray-500">
              Esta pantalla estará disponible próximamente
            </Text>
          </Card>
        </View>
      </ScrollView>

      <BottomTabBar />
    </View>
  );
}