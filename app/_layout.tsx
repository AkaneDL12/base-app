import "../global.css";
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider } from '../contexts';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <Stack
          screenOptions={{
            headerShown: false
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="register" />
          <Stack.Screen
            name="home"
            options={{
              headerShown: false,
              title: 'Home',
              headerLeft: () => null,
              gestureEnabled: false
            }}
          />
          <Stack.Screen
            name="profile"
            options={{
              headerShown: false,
              title: 'Perfil',
            }}
          />
          <Stack.Screen
            name="chats"
            options={{
              headerShown: false,
              title: 'Chats',
            }}
          />
          <Stack.Screen
            name="posts"
            options={{
              headerShown: false,
              title: 'Posts',
            }}
          />
          <Stack.Screen
            name="map"
            options={{
              headerShown: false,
              title: 'Mapa',
            }}
          />
        </Stack>
      </UserProvider>
    </SafeAreaProvider>
  );
}