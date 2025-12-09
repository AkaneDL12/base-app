import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { Camera } from 'lucide-react-native';

import { Card, Button, Input } from "../components/ui";
import { BottomTabBar } from "../components/ui/BottomTabBar";
import { useAuthGuard, useUser } from "../contexts";
import { userService } from "../services/user.service";
import { uploadService } from "../services/upload.service";

type Gender = "male" | "female" | "other" | "prefer-not-to-say";

const GENDER_OPTIONS = [
  { value: "male", label: "Masculino", icon: "👨" },
  { value: "female", label: "Femenino", icon: "👩" },
  { value: "other", label: "Otro", icon: "🌈" },
  { value: "prefer-not-to-say", label: "Prefiero no decirlo", icon: "🤐" },
];

function getGenderLabel(value?: Gender | ""): string {
  if (!value) return "No especificado";
  const found = GENDER_OPTIONS.find((g) => g.value === value);
  return found ? found.label : "No especificado";
}

export default function ProfileScreen() {
  const { user, loading, isAuthenticated } = useAuthGuard();
  const { updateUser, logout } = useUser();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    bio: "",
    phone: "",
    dateOfBirth: "",
    gender: "" as Gender | "",
    occupation: "",
    company: "",
    website: "",
    interestsText: "",
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    avatar: "",
    coverPhoto: "",
  });

  // 📌 CARGAR DATOS DEL USUARIO
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: (user.gender as Gender) || "",
        occupation: user.occupation || "",
        company: user.company || "",
        website: user.website || "",
        interestsText: user.interests ? user.interests.join(", ") : "",

        facebook:
          user.socialMedia?.facebook?.replace("https://facebook.com/", "") || "",
        instagram:
          user.socialMedia?.instagram?.replace("https://instagram.com/", "") ||
          "",
        twitter:
          user.socialMedia?.twitter?.replace("https://twitter.com/", "") || "",
        linkedin:
          user.socialMedia?.linkedin?.replace("https://linkedin.com/in/", "") ||
          "",

        avatar: user.avatar || "",
        coverPhoto: user.coverPhoto || "",
      });
    }
  }, [user]);

  // 📌 SELECCIONAR IMAGEN (NO SUBIR AÚN)
  const handlePickImage = async (type: "avatar" | "coverPhoto") => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Debes permitir acceso a la galería");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: type === "avatar" ? [1, 1] : [16, 9],
      });

      if (result.canceled) return;

      const uri = result.assets[0].uri;

      // Solo actualizar localmente para preview - NO subir aún
      setEditForm((prev) => ({ ...prev, [type]: uri }));

    } catch (e) {
      console.log("ERROR SELECCIONANDO IMAGEN:", e);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  // 📌 FUNCIÓN AUXILIAR: Verificar si es URI local
  const isLocalUri = (uri: string): boolean => {
    return uri.startsWith('file://') ||
      uri.startsWith('content://') ||
      uri.startsWith('ph://') ||
      (!uri.startsWith('http://') && !uri.startsWith('https://'));
  };

  // 📌 FUNCIÓN AUXILIAR: Subir imagen si es necesario
  const uploadImageIfNeeded = async (uri: string, type: "avatar" | "coverPhoto"): Promise<string> => {
    // Si la URI no es local, retornarla tal cual (ya está en el servidor)
    if (!isLocalUri(uri)) {
      console.log(`ℹ️ ${type} ya está en el servidor:`, uri);
      return uri;
    }

    // Si es local, subirla al servidor
    try {
      console.log(`📤 Subiendo ${type}...`);
      console.log(`   URI local: ${uri.substring(0, 50)}...`);

      const response = await uploadService.uploadImage(uri);

      console.log(`✅ ${type} subido exitosamente!`);
      console.log(`   URL del servidor: ${response.url}`);

      return response.url;
    } catch (error: any) {
      console.error(`❌ Error subiendo ${type}:`, error?.message || error);
      throw new Error(`No se pudo subir ${type === 'avatar' ? 'la foto de perfil' : 'la portada'}`);
    }
  };

  // 📌 SELECTOR DE GÉNERO
  const handleSelectGender = (gender: Gender) => {
    setEditForm((f) => ({ ...f, gender }));
    setShowGenderModal(false);
  };

  // 📌 GUARDAR PERFIL (MODIFICADO)
  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      // 1️⃣ Subir imágenes si son necesarias
      let finalAvatarUrl = editForm.avatar;
      let finalCoverPhotoUrl = editForm.coverPhoto;

      // Subir avatar si cambió y es local
      if (editForm.avatar && editForm.avatar !== user?.avatar) {
        try {
          finalAvatarUrl = await uploadImageIfNeeded(editForm.avatar, "avatar");
          console.log("✅ Avatar actualizado:", finalAvatarUrl);
        } catch (error) {
          console.error("❌ Error subiendo avatar:", error);
          Alert.alert("Error", "No se pudo subir la foto de perfil. Intenta de nuevo.");
          setSaving(false);
          return;
        }
      }

      // Subir portada si cambió y es local
      if (editForm.coverPhoto && editForm.coverPhoto !== user?.coverPhoto) {
        try {
          finalCoverPhotoUrl = await uploadImageIfNeeded(editForm.coverPhoto, "coverPhoto");
          console.log("✅ Portada actualizada:", finalCoverPhotoUrl);
        } catch (error) {
          console.error("❌ Error subiendo portada:", error);
          Alert.alert("Error", "No se pudo subir la foto de portada. Intenta de nuevo.");
          setSaving(false);
          return;
        }
      }

      // 2️⃣ Preparar datos del perfil
      const interestsArr =
        editForm.interestsText
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v.length > 0);

      const social = {
        facebook:
          editForm.facebook !== ""
            ? `https://facebook.com/${editForm.facebook}`
            : undefined,
        instagram:
          editForm.instagram !== ""
            ? `https://instagram.com/${editForm.instagram}`
            : undefined,
        twitter:
          editForm.twitter !== ""
            ? `https://twitter.com/${editForm.twitter}`
            : undefined,
        linkedin:
          editForm.linkedin !== ""
            ? `https://linkedin.com/in/${editForm.linkedin}`
            : undefined,
      };

      const payload: any = {
        name: editForm.name,
        bio: editForm.bio || undefined,
        phone: editForm.phone || undefined,
        dateOfBirth: editForm.dateOfBirth || undefined,
        gender: editForm.gender || undefined,
        occupation: editForm.occupation || undefined,
        company: editForm.company || undefined,
        website:
          editForm.website !== ""
            ? editForm.website.startsWith("http")
              ? editForm.website
              : `https://${editForm.website}`
            : undefined,
        interests: interestsArr.length > 0 ? interestsArr : undefined,
        socialMedia: social,
      };

      // Solo agregar avatar si existe
      if (finalAvatarUrl) {
        payload.avatar = finalAvatarUrl;
      }

      // Solo agregar coverPhoto si existe
      if (finalCoverPhotoUrl) {
        payload.coverPhoto = finalCoverPhotoUrl;
      }

      console.log("📦 Payload a enviar:", payload);

      // 3️⃣ Actualizar perfil en el servidor
      const updatedUser = await userService.updateProfile(payload);

      // 4️⃣ Actualizar contexto local con la respuesta del servidor
      updateUser(updatedUser);

      // 5️⃣ Actualizar el formulario con los datos del servidor
      setEditForm({
        ...editForm,
        avatar: updatedUser.avatar || "",
        coverPhoto: updatedUser.coverPhoto || "",
      });

      Alert.alert("Éxito", "Perfil actualizado correctamente");
      setEditing(false);
    } catch (e: any) {
      console.log("❌ ERROR UPDATE:", e);
      const errorMsg = e?.response?.data?.message || e?.message || "No se pudo actualizar el perfil";
      Alert.alert("Error", errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // 📌 CANCELAR EDICIÓN
  const handleCancelEdit = () => {
    if (!user) return;

    setEditForm({
      name: user.name || "",
      email: user.email || "",
      bio: user.bio || "",
      phone: user.phone || "",
      dateOfBirth: user.dateOfBirth || "",
      gender: (user.gender as Gender) || "",
      occupation: user.occupation || "",
      company: user.company || "",
      website: user.website || "",
      interestsText: user.interests ? user.interests.join(", ") : "",
      facebook:
        user.socialMedia?.facebook?.replace("https://facebook.com/", "") || "",
      instagram:
        user.socialMedia?.instagram?.replace("https://instagram.com/", "") || "",
      twitter:
        user.socialMedia?.twitter?.replace("https://twitter.com/", "") || "",
      linkedin:
        user.socialMedia?.linkedin?.replace("https://linkedin.com/in/", "") ||
        "",
      avatar: user.avatar || "",
      coverPhoto: user.coverPhoto || "",
    });

    setEditing(false);
  };

  if (loading)
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text className="mt-4 text-gray-600">Cargando perfil...</Text>
      </View>
    );

  if (!isAuthenticated || !user) return null;

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* HEADER CON PORTADA */}
      <View className="relative">
        {/* IMAGEN DE PORTADA */}
        <TouchableOpacity
          activeOpacity={editing ? 0.7 : 1}
          onPress={() => editing && handlePickImage("coverPhoto")}
          disabled={!editing}
          className="relative"
        >
          {editForm.coverPhoto ? (
            <Image
              source={{ uri: editForm.coverPhoto }}
              className="w-full h-56"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-56 bg-gradient-to-b from-violet-600 to-violet-700" />
          )}

          {/* Indicador de edición */}
          {editing && (
            <View className="absolute inset-0 items-center justify-center bg-black/20">
              <View className="px-4 py-2 bg-white rounded-full flex-row items-center gap-2">
                <Camera size={16} color="#374151" />
                <Text className="text-sm font-medium text-gray-700">
                  Cambiar portada
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* AVATAR */}
        <View className="absolute left-0 right-0 items-center" style={{ bottom: -50 }}>
          <TouchableOpacity
            activeOpacity={editing ? 0.7 : 1}
            onPress={() => editing && handlePickImage("avatar")}
            disabled={!editing}
            className="relative"
          >
            <View className="w-32 h-32 overflow-hidden bg-white border-4 border-white rounded-full shadow-xl">
              {editForm.avatar ? (
                <Image
                  source={{ uri: editForm.avatar }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="items-center justify-center flex-1 bg-violet-100">
                  <Text className="text-4xl font-bold text-violet-700">
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}

              {/* Indicador de edición */}
              {editing && (
                <View className="absolute inset-0 items-center justify-center bg-black/30">
                  <Camera size={24} color="white" />
                </View>
              )}
            </View>

            {/* Badge de estado online */}
            {user.isOnline && (
              <View className="absolute w-5 h-5 bg-green-500 border-2 border-white rounded-full bottom-2 right-2" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* NOMBRE Y EMAIL */}
      <View className="items-center px-4 mt-16 mb-6">
        <Text className="text-2xl font-bold text-gray-900">
          {user.name}
        </Text>
        <Text className="mt-1 text-gray-500">{user.email}</Text>
        {user.occupation && (
          <Text className="mt-1 text-sm text-gray-600">
            {user.occupation}
            {user.company && ` • ${user.company}`}
          </Text>
        )}
      </View>

      {/* CONTENIDO PRINCIPAL */}
      <ScrollView className="flex-1 px-4">
        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-900">
              Información Personal
            </Text>
            {!editing && (
              <Button
                title="✏️ Editar"
                variant="outline"
                size="sm"
                onPress={() => setEditing(true)}
              />
            )}
          </View>

          {editing ? (
            <>
              <Input
                label="Nombre completo"
                value={editForm.name}
                onChangeText={(t) => setEditForm((f) => ({ ...f, name: t }))}
                placeholder="Tu nombre completo"
              />

              <Input
                label="Biografía"
                value={editForm.bio}
                onChangeText={(t) => setEditForm((f) => ({ ...f, bio: t }))}
                placeholder="Cuéntanos sobre ti"
                multiline
                numberOfLines={3}
              />

              <Input
                label="Teléfono"
                value={editForm.phone}
                onChangeText={(t) => setEditForm((f) => ({ ...f, phone: t }))}
                placeholder="+593 999 999 999"
                keyboardType="phone-pad"
              />

              {/* FECHA DE NACIMIENTO */}
              <View className="mb-4">
                <Text className="mb-2 text-xs font-medium text-gray-600 uppercase">
                  Fecha de Nacimiento
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="px-4 py-3 bg-white border border-gray-300 rounded-xl"
                >
                  <Text className="text-gray-700">
                    {editForm.dateOfBirth || "Seleccionar fecha"}
                  </Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  mode="date"
                  value={
                    editForm.dateOfBirth
                      ? new Date(editForm.dateOfBirth)
                      : new Date(2000, 0, 1)
                  }
                  display="default"
                  maximumDate={new Date()}
                  onChange={(e, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      const y = selectedDate.getFullYear();
                      const m = `${selectedDate.getMonth() + 1}`.padStart(2, "0");
                      const d = `${selectedDate.getDate()}`.padStart(2, "0");
                      setEditForm((f) => ({
                        ...f,
                        dateOfBirth: `${y}-${m}-${d}`,
                      }));
                    }
                  }}
                />
              )}

              {/* GÉNERO */}
              <View className="mb-4">
                <Text className="mb-2 text-xs font-medium text-gray-600 uppercase">
                  Género
                </Text>
                <TouchableOpacity
                  className="px-4 py-3 bg-white border border-gray-300 rounded-xl"
                  onPress={() => setShowGenderModal(true)}
                >
                  <Text className="text-gray-700">
                    {getGenderLabel(editForm.gender)}
                  </Text>
                </TouchableOpacity>
              </View>

              <Input
                label="Ocupación"
                value={editForm.occupation}
                onChangeText={(t) => setEditForm((f) => ({ ...f, occupation: t }))}
                placeholder="Ej: Desarrollador, Estudiante..."
              />

              <Input
                label="Empresa / Institución"
                value={editForm.company}
                onChangeText={(t) => setEditForm((f) => ({ ...f, company: t }))}
                placeholder="Nombre de tu empresa o universidad"
              />

              <Input
                label="Sitio Web"
                value={editForm.website}
                onChangeText={(t) => setEditForm((f) => ({ ...f, website: t }))}
                placeholder="www.tusitio.com"
                keyboardType="url"
                autoCapitalize="none"
              />

              <Input
                label="Intereses (separados por comas)"
                value={editForm.interestsText}
                onChangeText={(t) => setEditForm((f) => ({ ...f, interestsText: t }))}
                placeholder="Ej: Programación, Música, Deportes"
              />

              {/* REDES SOCIALES */}
              <Text className="mt-4 mb-3 text-base font-bold text-gray-900">
                Redes Sociales
              </Text>

              <Input
                label="Facebook"
                value={editForm.facebook}
                onChangeText={(t) => setEditForm((f) => ({ ...f, facebook: t }))}
                placeholder="usuario"
                autoCapitalize="none"
              />

              <Input
                label="Instagram"
                value={editForm.instagram}
                onChangeText={(t) => setEditForm((f) => ({ ...f, instagram: t }))}
                placeholder="@usuario"
                autoCapitalize="none"
              />

              <Input
                label="Twitter"
                value={editForm.twitter}
                onChangeText={(t) => setEditForm((f) => ({ ...f, twitter: t }))}
                placeholder="@usuario"
                autoCapitalize="none"
              />

              <Input
                label="LinkedIn"
                value={editForm.linkedin}
                onChangeText={(t) => setEditForm((f) => ({ ...f, linkedin: t }))}
                placeholder="usuario"
                autoCapitalize="none"
              />

              {/* BOTONES DE ACCIÓN */}
              <View className="flex-row gap-3 mt-6">
                <Button
                  title={saving ? "Guardando..." : "💾 Guardar"}
                  variant="primary"
                  className="flex-1"
                  onPress={handleSaveProfile}
                  disabled={saving}
                />
                <Button
                  title="Cancelar"
                  variant="outline"
                  className="flex-1"
                  onPress={handleCancelEdit}
                  disabled={saving}
                />
              </View>
            </>
          ) : (
            <>
              <InfoField label="Nombre" value={user.name} />
              <InfoField label="Email" value={user.email} />
              <InfoField label="Teléfono" value={user.phone || "No especificado"} />
              <InfoField label="Biografía" value={user.bio || "Sin biografía"} />
              <InfoField label="Fecha de Nacimiento" value={user.dateOfBirth || "No registrada"} />
              <InfoField label="Género" value={getGenderLabel(user.gender as any)} />
              <InfoField label="Ocupación" value={user.occupation || "No especificada"} />
              <InfoField label="Empresa" value={user.company || "No especificada"} />
              <InfoField
                label="Sitio Web"
                value={user.website || "No especificado"}
                isLink={!!user.website}
              />
              <InfoField
                label="Intereses"
                value={user.interests?.length ? user.interests.join(", ") : "No registrados"}
              />

              {/* REDES SOCIALES */}
              {(user.socialMedia?.facebook ||
                user.socialMedia?.instagram ||
                user.socialMedia?.twitter ||
                user.socialMedia?.linkedin) && (
                  <>
                    <Text className="mt-4 mb-2 text-xs font-medium text-gray-600 uppercase">
                      Redes Sociales
                    </Text>
                    {user.socialMedia?.facebook && (
                      <Text className="mb-1 text-sm text-violet-600">
                        📘 {user.socialMedia.facebook}
                      </Text>
                    )}
                    {user.socialMedia?.instagram && (
                      <Text className="mb-1 text-sm text-pink-600">
                        📷 {user.socialMedia.instagram}
                      </Text>
                    )}
                    {user.socialMedia?.twitter && (
                      <Text className="mb-1 text-sm text-violet-500">
                        🐦 {user.socialMedia.twitter}
                      </Text>
                    )}
                    {user.socialMedia?.linkedin && (
                      <Text className="mb-3 text-sm text-violet-700">
                        💼 {user.socialMedia.linkedin}
                      </Text>
                    )}
                  </>
                )}
            </>
          )}
        </Card>

        {/* BOTÓN CERRAR SESIÓN */}
        <Button
          title="🚪 Cerrar Sesión"
          variant="outline"
          className="mb-24 text-red-700 border-red-300 bg-red-50"
          onPress={() => {
            Alert.alert(
              "Cerrar Sesión",
              "¿Estás seguro que deseas cerrar sesión?",
              [
                { text: "Cancelar", style: "cancel" },
                { text: "Cerrar Sesión", style: "destructive", onPress: logout },
              ]
            );
          }}
        />
      </ScrollView>

      {/* MODAL DE SELECCIÓN DE GÉNERO */}
      <Modal
        visible={showGenderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setShowGenderModal(false)}
        >
          <View className="items-center justify-center flex-1 px-6">
            <Pressable
              className="w-full max-w-sm bg-white rounded-3xl"
              onPress={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <View className="items-center px-6 pt-6 pb-4 border-b border-gray-100">
                <Text className="text-2xl font-bold text-gray-900">
                  Selecciona tu género
                </Text>
                <Text className="mt-1 text-sm text-gray-500">
                  Elige la opción que mejor te represente
                </Text>
              </View>

              {/* Opciones */}
              <View className="p-4">
                {GENDER_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleSelectGender(option.value as Gender)}
                    className={`px-6 py-4 mb-3 rounded-2xl border-2 ${editForm.gender === option.value
                        ? 'bg-violet-50 border-violet-500'
                        : 'bg-gray-50 border-transparent'
                      }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <Text className="text-2xl">{option.icon}</Text>
                        <Text
                          className={`text-base font-medium ${editForm.gender === option.value
                              ? 'text-violet-700'
                              : 'text-gray-700'
                            }`}
                        >
                          {option.label}
                        </Text>
                      </View>
                      {editForm.gender === option.value && (
                        <View className="items-center justify-center w-6 h-6 bg-violet-500 rounded-full">
                          <Text className="text-xs font-bold text-white">✓</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Botón Cancelar */}
              <View className="px-4 pb-4">
                <TouchableOpacity
                  onPress={() => setShowGenderModal(false)}
                  className="py-3 bg-gray-100 rounded-2xl"
                >
                  <Text className="font-medium text-center text-gray-700">
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <BottomTabBar />
    </View>
  );
}

// Componente auxiliar para mostrar campos de información
function InfoField({
  label,
  value,
  isLink = false
}: {
  label: string;
  value: string;
  isLink?: boolean;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-1 text-xs font-medium text-gray-600 uppercase">
        {label}
      </Text>
      <Text className={`text-base ${isLink ? 'text-violet-600 underline' : 'text-gray-900'}`}>
        {value}
      </Text>
    </View>
  );
}