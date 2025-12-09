import { useState } from 'react';
import { View, Text, Pressable, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { Header, Card, Input, Button } from '../components/ui';
import { authService } from '../services';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const newErrors: Record<string, string> = {};

    if (!name) newErrors.name = 'El nombre es requerido';
    if (!email) newErrors.email = 'El email es requerido';
    if (!password) newErrors.password = 'La contraseña es requerida';
    if (!confirmPassword) newErrors.confirmPassword = 'Debes confirmar la contraseña';

    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Error', 'Por favor corrige los errores');
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await authService.register({ name, email, password });

      if (response.success && response.data) {
        // Aquí podrías guardar el token en AsyncStorage/SecureStore
        console.log('Registro exitoso:', response.data);
        Alert.alert(
          '¡Éxito! 🎉',
          `Bienvenido ${response.data.user.name}. Tu cuenta ha sido creada exitosamente`,
          [{ text: 'Continuar', onPress: () => router.push('/home') }]
        );
      } else {
        Alert.alert('Error', response.error || 'Error al crear la cuenta');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-white">

        <Header
          title="Crear Cuenta"
          subtitle="Únete y comienza tu experiencia"
          bgColor="bg-violet-600"
          showBackButton
          onBack={() => router.back()}
        />

        {/* Form Card */}
        <View className="px-8 -mt-12">
          <Card className="mb-6">
            <Input
              label="Nombre Completo"
              placeholder="Juan Pérez"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors((prev) => ({ ...prev, name: '' }));
              }}
              error={errors.name}
              containerClassName="mb-4"
            />

            <Input
              label="Correo Electrónico"
              placeholder="ejemplo@correo.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors((prev) => ({ ...prev, email: '' }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              containerClassName="mb-4"
            />

            <Input
              label="Contraseña"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({ ...prev, password: '' }));
              }}
              secureTextEntry
              error={errors.password}
              containerClassName="mb-4"
            />

            <Input
              label="Confirmar Contraseña"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
              secureTextEntry
              error={errors.confirmPassword}
              containerClassName="mb-6"
            />

            {/* Terms */}
            <Text className="text-gray-500 text-xs text-center mb-6 px-4">
              Al registrarte, aceptas nuestros{' '}
              <Text className="text-violet-600 font-semibold">Términos de Servicio</Text>
              {' '}y{' '}
              <Text className="text-violet-600 font-semibold">Política de Privacidad</Text>
            </Text>

            <Button
              title={loading ? "Creando cuenta..." : "Crear Mi Cuenta"}
              variant="secondary"
              size="lg"
              onPress={handleRegister}
              disabled={loading}
            />
          </Card>

          {/* Login Link */}
          <View className="flex-row justify-center pb-8 pt-4">
            <Text className="text-gray-600 text-base">
              ¿Ya tienes cuenta?{' '}
            </Text>
            <Link href="/" asChild>
              <Pressable>
                <Text className="text-violet-600 font-bold text-base">
                  Inicia Sesión
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
