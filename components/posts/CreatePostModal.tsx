import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icons } from "../../assets/icons";
import { LocationData } from "../../components/hooks/useCreatePost";

interface CreatePostModalProps {
    visible: boolean;
    isEditing: boolean;
    content: string;
    selectedImages: string[];
    location: LocationData | null;
    creating: boolean;
    onClose: () => void;
    onContentChange: (text: string) => void;
    onSubmit: () => void;
    onPickImages: () => void;
    onRemoveImage: (index: number) => void;
    onRemoveLocation: () => void;
    getLocationLabel: (loc?: LocationData) => string;
}

export function CreatePostModal({
    visible,
    isEditing,
    content,
    selectedImages,
    location,
    creating,
    onClose,
    onContentChange,
    onSubmit,
    onPickImages,
    onRemoveImage,
    onRemoveLocation,
    getLocationLabel,
}: CreatePostModalProps) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
                {/* HEADER */}
                <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
                    <TouchableOpacity onPress={onClose}>
                        <Text className="text-base font-medium text-gray-600">
                            Cancelar
                        </Text>
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-gray-900">
                        {isEditing ? "Editar Publicación" : "Nueva Publicación"}
                    </Text>
                    <TouchableOpacity
                        onPress={onSubmit}
                        disabled={creating || !content.trim()}
                    >
                        <Text
                            className={`text-base font-semibold ${creating || !content.trim()
                                ? "text-gray-400"
                                : "text-violet-700"
                                }`}
                        >
                            {creating
                                ? "Guardando..."
                                : isEditing
                                    ? "Actualizar"
                                    : "Publicar"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* CONTENIDO */}
                <ScrollView className="flex-1">
                    <View className="p-6">
                        <TextInput
                            className="mb-4 text-base text-gray-900"
                            placeholder="¿Qué estás pensando?"
                            placeholderTextColor="#9CA3AF"
                            multiline
                            value={content}
                            onChangeText={onContentChange}
                            autoFocus
                            style={{ minHeight: 100 }}
                        />

                        {selectedImages.length > 0 && (
                            <View className="flex-row flex-wrap mb-4">
                                {selectedImages.map((uri, index) => (
                                    <View
                                        key={index}
                                        className="relative w-20 h-20 mb-2 mr-2"
                                    >
                                        <Image
                                            source={{ uri }}
                                            className="w-full h-full rounded-lg"
                                            resizeMode="cover"
                                        />
                                        <TouchableOpacity
                                            onPress={() => onRemoveImage(index)}
                                            className="absolute items-center justify-center w-6 h-6 rounded-full -top-2 -right-2 bg-black/60"
                                        >
                                            <Icons.Close size={12} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {location && (
                            <View className="flex-row items-center p-3 mb-4 border border-violet-200 rounded-lg bg-violet-50">
                                <Icons.Location size={20} color="#7c3aed" />
                                <View className="flex-1 ml-2">
                                    <Text className="mb-0.5 text-xs font-medium text-violet-700">
                                        Ubicación del mapa
                                    </Text>
                                    <Text
                                        className="text-sm text-gray-700"
                                        numberOfLines={2}
                                    >
                                        {getLocationLabel(location)}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={onRemoveLocation}
                                    className="items-center justify-center w-8 h-8 ml-2"
                                >
                                    <Icons.Close size={20} color="#dc2626" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>

                {/* ACCIONES INFERIORES */}
                <View className="flex-row items-center justify-start px-6 py-4 border-t border-gray-200">
                    <TouchableOpacity
                        onPress={onPickImages}
                        className="items-center mr-6"
                        disabled={selectedImages.length >= 4}
                    >
                        <View
                            className={`h-12 w-12 items-center justify-center rounded-full ${selectedImages.length >= 4 ? "bg-gray-100" : "bg-violet-50"
                                }`}
                        >
                            <Icons.Image
                                size={24}
                                color={selectedImages.length >= 4 ? "#9ca3af" : "#7c3aed"}
                            />
                        </View>
                        <Text
                            className={`mt-1 text-xs ${selectedImages.length >= 4
                                ? "text-gray-400"
                                : "text-gray-700"
                                }`}
                        >
                            Fotos{" "}
                            {selectedImages.length > 0
                                ? `(${selectedImages.length})`
                                : ""}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
}
