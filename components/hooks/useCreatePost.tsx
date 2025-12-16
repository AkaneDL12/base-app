import { useState, useCallback } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { postService, Post } from "../../services/posts-service";
import { uploadService } from "../../services/upload.service";
import { userService } from "../../services/user.service";

export interface LocationData {
    latitude: number;
    longitude: number;
    address?: string;
}

export function useCreatePost(user: any, onSuccess: () => void) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [content, setContent] = useState("");
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [location, setLocation] = useState<LocationData | null>(null);
    const [creating, setCreating] = useState(false);

    const resetForm = useCallback(() => {
        setContent("");
        setSelectedImages([]);
        setLocation(null);
        setEditingPostId(null);
    }, []);

    const openCreateModal = useCallback(async () => {
        resetForm();

        try {
            // RECARGAR PERFIL DEL BACKEND PARA TENER LA UBICACION MAS RECIENTE
            const profile: any = await userService.getProfile();
            console.log(
                "👤 [POSTS] Perfil actualizado para nuevo post:",
                profile?.location
            );

            if (profile?.location) {
                setLocation({
                    latitude: profile.location.latitude,
                    longitude: profile.location.longitude,
                    address: profile.location.address,
                });
            } else if ((user as any)?.location) {
                const uLoc: any = (user as any).location;
                setLocation({
                    latitude: uLoc.latitude,
                    longitude: uLoc.longitude,
                    address: uLoc.address,
                });
            } else {
                setLocation(null);
            }
        } catch (error) {
            console.log(
                "⚠️ [POSTS] No se pudo refrescar el perfil para ubicación:",
                error
            );
            if ((user as any)?.location) {
                const uLoc: any = (user as any).location;
                setLocation({
                    latitude: uLoc.latitude,
                    longitude: uLoc.longitude,
                    address: uLoc.address,
                });
            } else {
                setLocation(null);
            }
        }

        setShowCreateModal(true);
    }, [user, resetForm]);

    const openEditModal = useCallback((post: Post) => {
        setEditingPostId(post._id);
        setContent(post.content);
        setSelectedImages(post.mediaUrls || []);

        if (post.location) {
            setLocation(post.location);
        } else {
            setLocation(null);
        }

        setShowCreateModal(true);
    }, []);

    const closeModal = useCallback(() => {
        resetForm();
        setShowCreateModal(false);
    }, [resetForm]);

    const pickImages = useCallback(async () => {
        try {
            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== "granted") {
                Alert.alert(
                    "Permiso denegado",
                    "Necesitas permitir acceso a la galería"
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                selectionLimit: 4,
            });

            if (!result.canceled) {
                const uris = result.assets.map((asset) => asset.uri);
                setSelectedImages((prev) => [...prev, ...uris].slice(0, 4));
            }
        } catch (error) {
            console.error("Error seleccionando imágenes:", error);
        }
    }, []);

    const removeImage = useCallback((index: number) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const submitPost = useCallback(async () => {
        if (!content.trim()) {
            Alert.alert("Error", "Escribe algo antes de publicar");
            return;
        }

        try {
            setCreating(true);

            // SUBIR IMÁGENES
            let uploadedUrls: string[] = [];
            if (selectedImages.length > 0) {
                // Filtrar imágenes que ya son URLs (para edición) vs nuevas (para subida)
                // Asumimos que si empieza con http/https ya es subida.
                // Pero uploadService maneja subida.
                // Si la imagen es local, se sube. Si ya es remota, se mantiene.
                // Simplificación: Re-subir todo o chequear.
                // Generalmente en edición, si es http no subimos.

                // TODO: Mejorar lógica de subida para no resubir existentes
                // Por ahora, asumimos que todas las de selectedImages necesitan procesarse 
                // ó diferenciamos si son file://

                for (const uri of selectedImages) {
                    if (uri.startsWith('http')) {
                        uploadedUrls.push(uri);
                        continue;
                    }
                    try {
                        const response = await uploadService.uploadImage(uri);
                        uploadedUrls.push(response.url);
                    } catch (error) {
                        console.error("Error subiendo imagen:", error);
                    }
                }
            }

            const postData: any = {
                content: content.trim(),
            };

            if (uploadedUrls.length > 0) {
                postData.mediaUrls = uploadedUrls;
            }

            if (location) {
                postData.location = {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    address: location.address,
                };
                console.log(
                    " [POSTS] Incluyendo ubicación en post:",
                    postData.location
                );
            }

            if (editingPostId) {
                await postService.updatePost(editingPostId, postData);
                Alert.alert("✅ Éxito", "Publicación actualizada correctamente");
            } else {
                await postService.createPost(postData);
                Alert.alert("✅ Éxito", "Publicación creada correctamente");
            }

            closeModal();
            onSuccess();
        } catch (error: any) {
            console.error("❌ [POSTS] Error al crear/editar post:", error);
            const errorMsg =
                error?.response?.data?.message || "No se pudo crear la publicación";
            Alert.alert("Error", errorMsg);
        } finally {
            setCreating(false);
        }
    }, [content, selectedImages, location, editingPostId, closeModal, onSuccess]);

    return {
        showCreateModal,
        editingPostId,
        content,
        setContent,
        selectedImages,
        location,
        setLocation,
        creating,
        openCreateModal,
        openEditModal,
        closeModal,
        pickImages,
        removeImage,
        submitPost
    };
}
