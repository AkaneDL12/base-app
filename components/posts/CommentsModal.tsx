
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    Image,
    ActivityIndicator,
    ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icons } from "../../assets/icons";
import { Post, Comment } from "../../services/posts-service";

interface CommentsModalProps {
    visible: boolean;
    post: Post | null;
    comments: Comment[];
    loading: boolean;
    newCommentText: string;
    currentUserId?: string;
    onClose: () => void;
    onCommentTextChange: (text: string) => void;
    onSubmitComment: () => void;
    onToggleLike: (commentId: string) => void;
    onDeleteComment: (commentId: string) => void;
    formatDate: (dateString: string) => string;
}

export function CommentsModal({
    visible,
    post,
    comments,
    loading,
    newCommentText,
    currentUserId,
    onClose,
    onCommentTextChange,
    onSubmitComment,
    onToggleLike,
    onDeleteComment,
    formatDate,
}: CommentsModalProps) {

    const isMyComment = (comment: Comment) => {
        const a: any = comment.authorId;
        if (!currentUserId || !a) return false;
        const authorId = typeof a === "string" ? a : a._id || a.id;
        return authorId === currentUserId;
    };

    const hasLikedComment = (comment: Comment) => {
        if (!currentUserId) return false;
        return comment.likes.includes(currentUserId);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <SafeAreaView className="flex-1 bg-white">
                {/* HEADER */}
                <View className="px-6 py-4 border-b border-gray-200">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-lg font-bold text-gray-900">
                            Comentarios
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text className="text-base font-medium text-gray-600">
                                Cerrar
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {post && (
                        <Text className="mt-2 text-sm text-gray-700" numberOfLines={2}>
                            {post.content}
                        </Text>
                    )}
                </View>

                {/* LISTA */}
                <View className="flex-1">
                    {loading ? (
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
                                                    onToggleLike(comment._id)
                                                }
                                                className="flex-row items-center"
                                            >
                                                <Icons.Heart
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
                                                    onPress={() => onDeleteComment(comment._id)}
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
                            onChangeText={onCommentTextChange}
                        />
                        <TouchableOpacity
                            onPress={onSubmitComment}
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
    );
}

