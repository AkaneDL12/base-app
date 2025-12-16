import { View, Text, ScrollView, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Plus } from 'lucide-react-native';
import { BottomTabBar } from '../components/ui/BottomTabBar';
import { useAuthGuard, useUser } from '../contexts';
import {
  usePosts,
  useCreatePost,
  useComments
} from "../components/hooks";
import {
  PostCard,
  EmptyPosts,
  CreatePostModal,
  CommentsModal
} from "../components/posts";

export default function HomeScreen() {
  const { user, loading: authLoading, isAuthenticated } = useAuthGuard();
  const { logout } = useUser();

  // Helper para consistencia de IDs
  const getCurrentUserId = () => {
    if (!user) return undefined;
    const u: any = user;
    return u.id || u._id;
  };
  const currentUserId = getCurrentUserId();

  const {
    posts,
    loading: postsLoading,
    refreshing,
    loadPosts,
    handleRefresh,
    toggleLike,
    deletePost,
    updatePostCommentsCount,
  } = usePosts(user);

  const {
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
    submitPost,
  } = useCreatePost(user, handleRefresh);

  const {
    showCommentsModal,
    activePost,
    comments,
    loading: commentsLoading,
    newCommentText,
    setNewCommentText,
    openCommentsModal,
    closeCommentsModal,
    createComment,
    toggleLike: toggleCommentLike,
    deleteComment: deleteCommentAction,
  } = useComments(currentUserId);

  // Helper formatting functions
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

  if (authLoading || postsLoading) {
    return (
      <View className="items-center justify-center flex-1 bg-violet-50">
        <Text className="mb-2 text-lg text-gray-600">Cargando...</Text>
        <Text className="text-sm text-gray-500">Un momento por favor</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <View className="flex-1 bg-gray-50">
      {/* HEADER */}
      <SafeAreaView style={{ backgroundColor: '#7c3aed' }} edges={['top']}>
        <StatusBar style="light" />
        <View className="px-8 pb-6 pt-4 bg-violet-700 rounded-b-3xl">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-3xl font-bold text-white">
                ¡Hola, {user.name?.split(' ')[0]}!
              </Text>
              <Text className="text-base text-violet-100 mt-1">
                ¿Qué estás pensando hoy?
              </Text>
            </View>
            <TouchableOpacity
              onPress={openCreateModal}
              className="items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg"
            >
              <Plus color="#7c3aed" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* CONTENIDO */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="px-4 py-6">
          {posts.length === 0 ? (
            <EmptyPosts />
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={currentUserId}
                onToggleLike={(postId) => toggleLike(postId, currentUserId)}
                onOpenComments={openCommentsModal}
                onEdit={openEditModal}
                onDelete={deletePost}
                formatDate={formatDate}
                getLocationLabel={getLocationLabel}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* MODALS */}
      <CreatePostModal
        visible={showCreateModal}
        isEditing={!!editingPostId}
        content={content}
        selectedImages={selectedImages}
        location={location}
        creating={creating}
        onClose={closeModal}
        onContentChange={setContent}
        onSubmit={submitPost}
        onPickImages={pickImages}
        onRemoveImage={removeImage}
        onRemoveLocation={() => setLocation(null)}
        getLocationLabel={getLocationLabel}
      />

      <CommentsModal
        visible={showCommentsModal}
        post={activePost}
        comments={comments}
        loading={commentsLoading}
        newCommentText={newCommentText}
        currentUserId={currentUserId}
        onClose={closeCommentsModal}
        onCommentTextChange={setNewCommentText}
        onSubmitComment={() =>
          createComment((postId) => updatePostCommentsCount(postId, 1))
        }
        onToggleLike={toggleCommentLike}
        onDeleteComment={(commentId) =>
          deleteCommentAction(commentId, (postId) =>
            updatePostCommentsCount(postId, -1)
          )
        }
        formatDate={formatDate}
      />

      {/* BOTTOM NAV */}
      <BottomTabBar />
    </View>
  );
}