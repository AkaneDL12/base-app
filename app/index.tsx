import { useState, useEffect } from 'react';
import { View, Text, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { Header, Card, Input, Button, DividerWithText } from '../components/ui';
import { Hand } from 'lucide-react-native';
import { authService } from '../services';
import { useUser } from '../contexts';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, loading: userLoading, checkSession } = useUser();

  useEffect(() => {
    if (!userLoading) {
      if (user) {
        console.log('Usuario autenticado encontrado, redirigiendo a home...');
        router.replace('/home');
      }
    }
  }, [user, userLoading]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({ email, password });

      if (response.success && response.data) {
        console.log('Login exitoso:', response.data);
        // Actualizar el contexto de usuario después del login exitoso
        await checkSession();
        // El redirect se manejará automáticamente por el useEffect de arriba
      } else {
        Alert.alert('Error', response.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error en login:', error);
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-violet-50">
        <Text className="text-lg text-gray-600 mb-2">Verificando sesión...</Text>
        <Text className="text-sm text-gray-500">Un momento por favor</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-violet-50"
        contentContainerClassName="flex-1"
      >
        <View className="flex-1 bg-white">

          <Header
            title="¡Hola!"
            subtitle="Bienvenido de vuelta"
            icon={Hand}
            bgColor="bg-violet-600"
          />

          {/* Form Card */}
          <View className="flex-1 px-8 -mt-20">
            <Card className="mb-6">
              <Input
                label="Correo Electrónico"
                placeholder="ejemplo@correo.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                containerClassName="mb-5"
              />

              <Input
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                containerClassName="mb-3"
              />

              <Pressable className="self-end mb-6">
                <Text className="text-violet-600 font-semibold text-sm">
                  ¿Olvidaste tu contraseña?
                </Text>
              </Pressable>

              <Button
                title={loading ? "Iniciando..." : "Iniciar Sesión"}
                variant="primary"
                size="lg"
                onPress={handleLogin}
                disabled={loading}
              />
            </Card>

            <DividerWithText text="O continúa con" />

            {/* Social Buttons */}
            <View className="flex-row gap-4 mb-8">
              <Button
                title="Google"
                variant="outline"
                className="flex-1"
                onPress={() => Alert.alert('Google Login', 'Integrar con Google')}
              />
              <Button
                title="Apple"
                variant="outline"
                className="flex-1"
                onPress={() => Alert.alert('Apple Login', 'Integrar con Apple')}
              />
            </View>

            {/* Register Link */}
            <View className="flex-row justify-center pb-8">
              <Text className="text-gray-600 text-base">
                ¿No tienes cuenta?{' '}
              </Text>
              <Link href="/register" asChild>
                <Pressable>
                  <Text className="text-violet-600 font-bold text-base">
                    Regístrate aquí
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
