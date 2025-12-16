import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { postService, Post } from "../../services/posts-service";

export function usePosts(user: any) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadPosts = useCallback(async () => {
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
    }, []);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadPosts();
        setRefreshing(false);
    }, [loadPosts]);

    const toggleLike = useCallback(async (postId: string, currentUserId?: string) => {
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
    }, [loadPosts]);

    const deletePost = useCallback(async (postId: string) => {
        try {
            await postService.deletePost(postId);
            setPosts((prev) => prev.filter((p) => p._id !== postId));
            Alert.alert("✅ Éxito", "Publicación eliminada");
        } catch (error) {
            console.error("❌ Error eliminando post:", error);
            Alert.alert("Error", "No se pudo eliminar la publicación");
        }
    }, []);

    const updatePostCommentsCount = useCallback((postId: string, change: number) => {
        setPosts((prev) =>
            prev.map((p) =>
                p._id === postId
                    ? {
                        ...p,
                        commentsCount: Math.max(0, p.commentsCount + change),
                    }
                    : p
            )
        );
    }, []);

    return {
        posts,
        loading,
        refreshing,
        loadPosts,
        handleRefresh,
        toggleLike,
        deletePost,
        updatePostCommentsCount,
    };
}
