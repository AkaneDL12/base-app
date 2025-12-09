// app/posts.tsx
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  Heart,
  MessageCircle,
  Edit,
  Trash,
  MapPin,
  Plus,
  X,
  Image as ImageIcon,
  Send,
  FileText,
  Inbox
} from 'lucide-react-native';

import { Card } from "../components/ui";
import { BottomTabBar } from "../components/ui/BottomTabBar";
import { useAuthGuard } from "../contexts";
import { postService, Post, Comment } from "../services/posts-service";
import { uploadService } from "../services/upload.service";
import { userService } from "../services/user.service";

export default function PostsScreen() {
  const { user, loading: authLoading, isAuthenticated } = useAuthGuard();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);

  // CREAR / EDITAR POST
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // UBICACIÓN DEL POST
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);

  // COMENTARIOS
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [activePostForComments, setActivePostForComments] =
    useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");

  // ================== CARGA INICIAL ==================
  useEffect(() => {
    if (isAuthenticated) {
      loadPosts();
    }
  }, [isAuthenticated]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await postService.getFeed(20, 0);
      setPosts(data);
      console.log("📥 [POSTS] Posts cargados:", data.length);
    } catch (error) {
      console.error("❌ [POSTS] Error cargando posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  // ================== IMÁGENES ==================
  const handlePickImages = async () => {
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
  };

  // ================== UBICACIÓN ==================
  const getLocationLabel = (loc?: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => {
    if (!loc) return "";

    const addr = loc.address?.trim();
    const coordPattern = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;

    if (addr && !coordPattern.test(addr)) {
      return addr;
    }

    return "Ubicación actual";
  };

  // Helper para IDs
  const getCurrentUserId = () => {
    if (!user) return undefined;
    const u: any = user;
    return u.id || u._id;
  };

  const getPostAuthorId = (post: Post) => {
    const a: any = post.authorId;
    if (!a) return undefined;
    if (typeof a === "string") return a;
    return a._id || a.id;
  };

  const getCommentAuthorId = (comment: Comment) => {
    const a: any = comment.authorId;
    if (!a) return undefined;
    if (typeof a === "string") return a;
    return a._id || a.id;
  };

  // al pulsar +
  const handleOpenCreateModal = async () => {
    resetForm();

    try {
      // RECARGAR PERFIL DEL BACKEND PARA TENER LA UBICACION MAS RECIENTE
      const profile: any = await userService.getProfile();
      console.log(
        "👤 [POSTS] Perfil actualizado para nuevo post:",
        profile?.location
      );

      if (profile?.location) {
        setCurrentLocation({
          latitude: profile.location.latitude,
          longitude: profile.location.longitude,
          address: profile.location.address,
        });
      } else if ((user as any)?.location) {
        const uLoc: any = (user as any).location;
        setCurrentLocation({
          latitude: uLoc.latitude,
          longitude: uLoc.longitude,
          address: uLoc.address,
        });
      } else {
        setCurrentLocation(null);
      }
    } catch (error) {
      console.log(
        "⚠️ [POSTS] No se pudo refrescar el perfil para ubicación:",
        error
      );
      if ((user as any)?.location) {
        const uLoc: any = (user as any).location;
        setCurrentLocation({
          latitude: uLoc.latitude,
          longitude: uLoc.longitude,
          address: uLoc.address,
        });
      } else {
        setCurrentLocation(null);
      }
    }

    setShowCreateModal(true);
  };

  // ================== CREAR / EDITAR POST ==================
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      Alert.alert("Error", "Escribe algo antes de publicar");
      return;
    }

    try {
      setCreating(true);

      // SUBIR IMÁGENES
      let uploadedUrls: string[] = [];
      if (selectedImages.length > 0) {
        for (const uri of selectedImages) {
          try {
            const response = await uploadService.uploadImage(uri);
            uploadedUrls.push(response.url);
          } catch (error) {
            console.error("Error subiendo imagen:", error);
          }
        }
      }

      // LA UBICACIÓN VIENE DEL BACKEND (perfil del usuario)
      const finalLocation = currentLocation;

      const postData: any = {
        content: newPostContent.trim(),
      };

      if (uploadedUrls.length > 0) {
        postData.mediaUrls = uploadedUrls;
      }

      if (finalLocation) {
        postData.location = {
          latitude: finalLocation.latitude,
          longitude: finalLocation.longitude,
          address: finalLocation.address,
        };
        console.log(
          "📍 [POSTS] Incluyendo ubicación en post:",
          postData.location
        );
      }

      console.log(
        "📤 [POSTS] Datos del post:",
        JSON.stringify(postData, null, 2)
      );

      if (editingPostId) {
        await postService.updatePost(editingPostId, postData);
        Alert.alert("✅ Éxito", "Publicación actualizada correctamente");
      } else {
        await postService.createPost(postData);
        Alert.alert("✅ Éxito", "Publicación creada correctamente");
      }

      resetForm();
      setShowCreateModal(false);
      await loadPosts();
    } catch (error: any) {
      console.error("❌ [POSTS] Error al crear/editar post:", error);
      const errorMsg =
        error?.response?.data?.message || "No se pudo crear la publicación";
      Alert.alert("Error", errorMsg);
    } finally {
      setCreating(false);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPostId(post._id);
    setNewPostContent(post.content);
    setSelectedImages(post.mediaUrls || []);

    if (post.location) {
      setCurrentLocation(post.location);
    } else {
      setCurrentLocation(null);
    }

    setShowCreateModal(true);
  };

  const handleDeletePost = (postId: string) => {
    Alert.alert("¿Eliminar publicación?", "Esta acción no se puede deshacer", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await postService.deletePost(postId);
            setPosts((prev) => prev.filter((p) => p._id !== postId));
            Alert.alert("✅ Éxito", "Publicación eliminada");
          } catch (error) {
            console.error("❌ Error eliminando post:", error);
            Alert.alert("Error", "No se pudo eliminar la publicación");
          }
        },
      },
    ]);
  };

  // ================== LIKE POST ==================
  const handleToggleLike = async (postId: string) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;

    try {
      // actualizar UI optimista
      setPosts((prev) =>
        prev.map((post) => {
          if (post._id === postId) {
            const hasLike = post.likes.includes(currentUserId);
            return {
              ...post,
              likes: hasLike
                ? post.likes.filter((id) => id !== currentUserId)
                : [...post.likes, currentUserId],
            };
          }
          return post;
        })
      );

      // llamar API
      await postService.toggleLike(postId);
      console.log("💗 [POSTS] toggle like", postId);
    } catch (error) {
      console.error("❌ Error al dar like:", error);
      await loadPosts();
    }
  };

  // ================== COMENTARIOS ==================
  const openCommentsModal = async (post: Post) => {
    console.log("💬 Abriendo comentarios de post:", post._id);
    setActivePostForComments(post);
    setShowCommentsModal(true);
    setNewCommentText("");
    await loadComments(post._id);
  };

  const loadComments = async (postId: string) => {
    try {
      setCommentsLoading(true);
      const data = await postService.getPostComments(postId);
      setComments(data);
      console.log("📥 [POSTS] Comentarios cargados:", data.length);
    } catch (error) {
      console.error("❌ Error cargando comentarios:", error);
      Alert.alert("Error", "No se pudieron cargar los comentarios");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCreateComment = async () => {
    if (!activePostForComments) return;
    if (!newCommentText.trim()) return;

    const content = newCommentText.trim();
    setNewCommentText("");

    try {
      const created = await postService.createComment(
        activePostForComments._id,
        { content }
      );

      setComments((prev) => [created, ...prev]);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === activePostForComments._id
            ? { ...p, commentsCount: p.commentsCount + 1 }
            : p
        )
      );
    } catch (error) {
      console.error("❌ Error creando comentario:", error);
      Alert.alert("Error", "No se pudo enviar el comentario");
    }
  };

  const handleToggleCommentLike = async (commentId: string) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;

    try {
      setComments((prev) =>
        prev.map((c) => {
          if (c._id === commentId) {
            const liked = c.likes.includes(currentUserId);
            return {
              ...c,
              likes: liked
                ? c.likes.filter((id) => id !== currentUserId)
                : [...c.likes, currentUserId],
            };
          }
          return c;
        })
      );

      await postService.toggleCommentLike(commentId);
    } catch (error) {
      console.error("❌ Error al dar like a comentario:", error);
      if (activePostForComments) {
        await loadComments(activePostForComments._id);
      }
    }
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert("Eliminar comentario", "Esta acción no se puede deshacer", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await postService.deleteComment(commentId);
            setComments((prev) => prev.filter((c) => c._id !== commentId));

            if (activePostForComments) {
              setPosts((prev) =>
                prev.map((p) =>
                  p._id === activePostForComments._id
                    ? {
                      ...p,
                      commentsCount: Math.max(0, p.commentsCount - 1),
                    }
                    : p
                )
              );
            }
          } catch (error) {
            console.error("❌ Error eliminando comentario:", error);
            Alert.alert("Error", "No se pudo eliminar el comentario");
          }
        },
      },
    ]);
  };

  // ================== UTILIDADES ==================
  const resetForm = () => {
    setNewPostContent("");
    setSelectedImages([]);
    setCurrentLocation(null);
    setEditingPostId(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;

    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  };

  const isMyPost = (post: Post) => {
    const currentUserId = getCurrentUserId();
    const authorId = getPostAuthorId(post);
    if (!currentUserId || !authorId) return false;
    return authorId === currentUserId;
  };

  const hasLikedPost = (post: Post) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return false;
    return post.likes.includes(currentUserId);
  };

  const isMyComment = (comment: Comment) => {
    const currentUserId = getCurrentUserId();
    const authorId = getCommentAuthorId(comment);
    if (!currentUserId || !authorId) return false;
    return authorId === currentUserId;
  };

  const hasLikedComment = (comment: Comment) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return false;
    return comment.likes.includes(currentUserId);
  };

  // ================== ESTADOS GLOBALES ==================
  if (authLoading || loading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text className="mt-4 text-gray-600">Cargando publicaciones...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // ================== UI PRINCIPAL ==================
  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView
        style={{ flex: 0, backgroundColor: "#7c3aed" }}
        edges={["top"]}
      >
        <StatusBar style="light" />
        <View className="px-8 pt-4 pb-6 bg-violet-700 rounded-b-3xl">
          <View className="flex-row items-center justify-between">
            <View>
              <View className="flex-row items-center gap-2 mb-2">
                <FileText color="white" size={28} />
                <Text className="text-3xl font-bold text-white">
                  Posts
                </Text>
              </View>
              <Text className="text-base text-violet-100">
                {posts.length} publicaciones
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleOpenCreateModal}
              className="items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg"
            >
              <Plus color="#7c3aed" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="px-4 py-4">
          {posts.length === 0 ? (
            <Card>
              <View className="items-center justify-center py-8">
                <Inbox size={48} color="#9ca3af" />
                <Text className="mt-4 text-lg font-medium text-center text-gray-600">
                  No hay publicaciones
                </Text>
                <Text className="text-base text-center text-gray-500">
                  Sé el primero en publicar algo
                </Text>
              </View>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post._id} className="mb-4">
                {/* HEADER */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View className="items-center justify-center w-10 h-10 mr-3 overflow-hidden bg-violet-100 rounded-full">
                      {post.authorId &&
                        typeof (post.authorId as any) === "object" &&
                        (post.authorId as any).avatar ? (
                        <Image
                          source={{ uri: (post.authorId as any).avatar }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <Text className="text-lg font-bold text-violet-700">
                          {typeof post.authorId === "object"
                            ? (post.authorId as any).name
                              ?.charAt(0)
                              ?.toUpperCase()
                            : "U"}
                        </Text>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900">
                        {typeof post.authorId === "object"
                          ? (post.authorId as any).name || "Usuario"
                          : "Usuario"}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {formatDate(post.createdAt)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* CONTENIDO */}
                <Text className="mb-3 text-base leading-6 text-gray-800">
                  {post.content}
                </Text>

                {/* IMÁGENES */}
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <View className="mb-3 overflow-hidden rounded-lg">
                    <Image
                      source={{ uri: post.mediaUrls[0] }}
                      className="w-full h-64"
                      resizeMode="cover"
                    />
                    {post.mediaUrls.length > 1 && (
                      <View className="absolute bottom-2 right-2">
                        <View className="px-2 py-1 rounded-lg bg-black/60">
                          <Text className="text-xs font-semibold text-white">
                            +{post.mediaUrls.length - 1}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* UBICACIÓN */}
                {post.location &&
                  post.location.latitude &&
                  post.location.longitude && (
                    <View className="flex-row items-center px-3 py-2 mb-3 rounded-lg bg-gray-50">
                      <MapPin size={16} color="#4b5563" />
                      <Text
                        className="flex-1 ml-2 text-sm font-medium text-gray-700"
                        numberOfLines={2}
                      >
                        {getLocationLabel(post.location)}
                      </Text>
                    </View>
                  )}

                {/* ACCIONES */}
                <View className="flex-row items-center pt-3 border-t border-gray-100">
                  <TouchableOpacity
                    onPress={() => handleToggleLike(post._id)}
                    className="flex-row items-center mr-6"
                  >
                    <Heart
                      size={20}
                      color={hasLikedPost(post) ? "#ef4444" : "#374151"}
                      fill={hasLikedPost(post) ? "#ef4444" : "none"}
                    />
                    <Text className="ml-1 text-sm font-medium text-gray-700">
                      {post.likes.length}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => openCommentsModal(post)}
                    className="flex-row items-center mr-4"
                  >
                    <MessageCircle size={20} color="#374151" />
                    <Text className="ml-1 text-sm font-medium text-gray-700">
                      {post.commentsCount}
                    </Text>
                  </TouchableOpacity>

                  {isMyPost(post) && (
                    <>
                      <View className="flex-1" />

                      <TouchableOpacity
                        onPress={() => handleEditPost(post)}
                        className="flex-row items-center mr-3"
                      >
                        <Edit size={16} color="#374151" />
                        <Text className="ml-1 text-sm font-medium text-gray-700">
                          Editar
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDeletePost(post._id)}
                        className="flex-row items-center"
                      >
                        <Trash size={16} color="#dc2626" />
                        <Text className="ml-1 text-sm font-medium text-red-600">
                          Eliminar
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* =============== MODAL CREAR / EDITAR POST =============== */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        onRequestClose={() => {
          resetForm();
          setShowCreateModal(false);
        }}
      >
        <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
          {/* HEADER */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
            <TouchableOpacity
              onPress={() => {
                resetForm();
                setShowCreateModal(false);
              }}
            >
              <Text className="text-base font-medium text-gray-600">
                Cancelar
              </Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-900">
              {editingPostId ? "Editar Publicación" : "Nueva Publicación"}
            </Text>
            <TouchableOpacity
              onPress={handleCreatePost}
              disabled={creating || !newPostContent.trim()}
            >
              <Text
                className={`text-base font-semibold ${creating || !newPostContent.trim()
                    ? "text-gray-400"
                    : "text-violet-700"
                  }`}
              >
                {creating
                  ? "Guardando..."
                  : editingPostId
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
                value={newPostContent}
                onChangeText={setNewPostContent}
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
                        onPress={() =>
                          setSelectedImages((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        className="absolute items-center justify-center w-6 h-6 rounded-full -top-2 -right-2 bg-black/60"
                      >
                        <X size={12} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {currentLocation && (
                <View className="flex-row items-center p-3 mb-4 border border-violet-200 rounded-lg bg-violet-50">
                  <MapPin size={20} color="#7c3aed" />
                  <View className="flex-1 ml-2">
                    <Text className="mb-0.5 text-xs font-medium text-violet-700">
                      Ubicación del mapa
                    </Text>
                    <Text
                      className="text-sm text-gray-700"
                      numberOfLines={2}
                    >
                      {getLocationLabel(currentLocation)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setCurrentLocation(null);
                    }}
                    className="items-center justify-center w-8 h-8 ml-2"
                  >
                    <X size={20} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>

          {/* ACCIONES INFERIORES */}
          <View className="flex-row items-center justify-start px-6 py-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={handlePickImages}
              className="items-center mr-6"
              disabled={selectedImages.length >= 4}
            >
              <View
                className={`h-12 w-12 items-center justify-center rounded-full ${selectedImages.length >= 4 ? "bg-gray-100" : "bg-violet-50"
                  }`}
              >
                <ImageIcon
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

      {/* =============== MODAL COMENTARIOS =============== */}
      <Modal
        visible={showCommentsModal}
        animationType="slide"
        onRequestClose={() => setShowCommentsModal(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          {/* HEADER */}
          <View className="px-6 py-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-900">
                Comentarios
              </Text>
              <TouchableOpacity onPress={() => setShowCommentsModal(false)}>
                <Text className="text-base font-medium text-gray-600">
                  Cerrar
                </Text>
              </TouchableOpacity>
            </View>
            {activePostForComments && (
              <Text className="mt-2 text-sm text-gray-700" numberOfLines={2}>
                {activePostForComments.content}
              </Text>
            )}
          </View>

          {/* LISTA */}
          <View className="flex-1">
            {commentsLoading ? (
              <View className="items-center justify-center flex-1">
                <ActivityIndicator size="large" color="#7c3aed" />
                <Text className="mt-2 text-gray-600">
                  Cargando comentarios...
                </Text>
              </View>
            ) : comments.length === 0 ? (
              <View className="items-center justify-center flex-1 px-6">
                <Text className="mb-2 text-base text-center text-gray-600">
                  Nadie ha comentado aún
                </Text>
                <Text className="text-sm text-center text-gray-500">
                  Sé el primero en dejar tu opinión
                </Text>
              </View>
            ) : (
              <ScrollView className="flex-1 px-6 py-3">
                {comments.map((comment) => (
                  <View
                    key={comment._id}
                    className="flex-row items-start mb-3"
                  >
                    <View className="items-center justify-center mr-3 overflow-hidden bg-violet-100 rounded-full h-9 w-9">
                      {comment.authorId &&
                        typeof (comment.authorId as any) === "object" &&
                        (comment.authorId as any).avatar ? (
                        <Image
                          source={{ uri: (comment.authorId as any).avatar }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <Text className="text-base font-bold text-violet-700">
                          {typeof comment.authorId === "object"
                            ? (comment.authorId as any).name
                              ?.charAt(0)
                              ?.toUpperCase()
                            : "U"}
                        </Text>
                      )}
                    </View>

                    <View className="flex-1 px-3 py-2 rounded-2xl bg-gray-50">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-sm font-semibold text-gray-900">
                          {typeof comment.authorId === "object"
                            ? (comment.authorId as any).name || "Usuario"
                            : "Usuario"}
                        </Text>
                        <Text className="text-[10px] text-gray-500">
                          {formatDate(comment.createdAt)}
                        </Text>
                      </View>
                      <Text className="text-sm text-gray-800">
                        {comment.content}
                      </Text>

                      <View className="flex-row items-center justify-between mt-1">
                        <TouchableOpacity
                          onPress={() =>
                            handleToggleCommentLike(comment._id)
                          }
                          className="flex-row items-center"
                        >
                          <Heart
                            size={14}
                            color={hasLikedComment(comment) ? "#ef4444" : "#374151"}
                            fill={hasLikedComment(comment) ? "#ef4444" : "none"}
                          />
                          <Text className="ml-1 text-xs text-gray-700">
                            {comment.likes.length}
                          </Text>
                        </TouchableOpacity>

                        {isMyComment(comment) && (
                          <TouchableOpacity
                            onPress={() => handleDeleteComment(comment._id)}
                          >
                            <Text className="text-xs text-red-600">
                              Eliminar
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* INPUT NUEVO COMENTARIO */}
          <View className="px-4 py-3 border-t border-gray-200">
            <View className="flex-row items-center px-3 py-2 bg-gray-100 rounded-full">
              <TextInput
                className="flex-1 text-sm text-gray-900"
                placeholder="Escribe un comentario..."
                placeholderTextColor="#9CA3AF"
                value={newCommentText}
                onChangeText={setNewCommentText}
              />
              <TouchableOpacity
                onPress={handleCreateComment}
                disabled={!newCommentText.trim()}
                className="px-3 py-1 ml-2"
              >
                <Text
                  className={`text-sm font-semibold ${!newCommentText.trim() ? "text-gray-400" : "text-violet-700"
                    }`}
                >
                  Enviar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <BottomTabBar />
    </View>
  );
}