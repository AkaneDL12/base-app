// hooks/useComments.ts
import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { postService, Post, Comment } from "../../services/posts-service";

export function useComments(currentUserId?: string) {
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [activePost, setActivePost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [newCommentText, setNewCommentText] = useState("");

    const loadComments = useCallback(async (postId: string) => {
        try {
            setLoading(true);
            const data = await postService.getPostComments(postId);
            setComments(data);
            console.log("[POSTS] Comentarios cargados:", data.length);
        } catch (error) {
            console.error("Error cargando comentarios:", error);
            Alert.alert("Error", "No se pudieron cargar los comentarios");
        } finally {
            setLoading(false);
        }
    }, []);

    const openCommentsModal = useCallback(async (post: Post) => {
        console.log("Abriendo comentarios de post:", post._id);
        setActivePost(post);
        setShowCommentsModal(true);
        setNewCommentText("");
        await loadComments(post._id);
    }, [loadComments]);

    const closeCommentsModal = useCallback(() => {
        setShowCommentsModal(false);
        setActivePost(null);
        setComments([]);
        setNewCommentText("");
    }, []);

    const createComment = useCallback(async (onCommentCreated: (postId: string) => void) => {
        if (!activePost || !newCommentText.trim()) return;

        const content = newCommentText.trim();
        setNewCommentText("");

        try {
            const created = await postService.createComment(activePost._id, { content });
            setComments((prev) => [created, ...prev]);
            onCommentCreated(activePost._id);
        } catch (error) {
            console.error("❌ Error creando comentario:", error);
            Alert.alert("Error", "No se pudo enviar el comentario");
        }
    }, [activePost, newCommentText]);

    const toggleLike = useCallback(async (commentId: string) => {
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
            if (activePost) {
                await loadComments(activePost._id);
            }
        }
    }, [currentUserId, activePost, loadComments]);

    const deleteComment = useCallback(async (commentId: string, onCommentDeleted: (postId: string) => void) => {
        try {
            await postService.deleteComment(commentId);
            setComments((prev) => prev.filter((c) => c._id !== commentId));

            if (activePost) {
                onCommentDeleted(activePost._id);
            }
        } catch (error) {
            console.error("❌ Error eliminando comentario:", error);
            Alert.alert("Error", "No se pudo eliminar el comentario");
        }
    }, [activePost]);

    return {
        showCommentsModal,
        activePost,
        comments,
        loading,
        newCommentText,
        setNewCommentText,
        openCommentsModal,
        closeCommentsModal,
        createComment,
        toggleLike,
        deleteComment,
    };
}