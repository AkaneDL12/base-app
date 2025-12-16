// app/posts.tsx
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAuthGuard } from "../contexts";
import { BottomTabBar } from "../components/ui/BottomTabBar";
import {
  usePosts,
  useCreatePost,
  useComments
} from "../components/hooks";
import {
  PostsHeader,
  PostCard,
  EmptyPosts,
  CreatePostModal,
  CommentsModal
} from "../components/posts";

export default function PostsScreen() {
  const { user, loading: authLoading, isAuthenticated } = useAuthGuard();

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


  // ================== HELPERS DE UI ==================
  // Mantenemos estos helpers aquí por ahora como "UI formatters"
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

  if (authLoading || postsLoading) {
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

  return (
    <View className="flex-1 bg-gray-50">
      <PostsHeader
        postsCount={posts.length}
        onCreatePost={openCreateModal}
      />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="px-4 py-4">
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

      <BottomTabBar />
    </View>
  );
}