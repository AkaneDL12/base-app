import { View, Text, Image, TouchableOpacity } from "react-native";
import { Icons } from "../../assets/icons";
import { Post } from "../../services/posts-service";
import { Card } from "../ui";

interface PostCardProps {
    post: Post;
    currentUserId?: string;
    onToggleLike: (postId: string) => void;
    onOpenComments: (post: Post) => void;
    onEdit: (post: Post) => void;
    onDelete: (postId: string) => void;
    formatDate: (dateString: string) => string;
    getLocationLabel: (loc?: { latitude: number; longitude: number; address?: string }) => string;
}

export function PostCard({
    post,
    currentUserId,
    onToggleLike,
    onOpenComments,
    onEdit,
    onDelete,
    formatDate,
    getLocationLabel,
}: PostCardProps) {

    const getPostAuthorId = (post: Post) => {
        const a: any = post.authorId;
        if (!a) return undefined;
        if (typeof a === "string") return a;
        return a._id || a.id;
    };

    const isMyPost = () => {
        const authorId = getPostAuthorId(post);
        if (!currentUserId || !authorId) return false;
        return authorId === currentUserId;
    };

    const hasLikedPost = () => {
        if (!currentUserId) return false;
        return post.likes.includes(currentUserId);
    };

    const isMine = isMyPost();
    const liked = hasLikedPost();

    return (
        <Card className="mb-4">
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
                                    ? (post.authorId as any).name?.charAt(0)?.toUpperCase()
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
                        <Icons.Location size={16} color="#4b5563" />
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
                    onPress={() => onToggleLike(post._id)}
                    className="flex-row items-center mr-6"
                >
                    <Icons.Heart
                        size={20}
                        color={liked ? "#ef4444" : "#374151"}
                        fill={liked ? "#ef4444" : "none"}
                    />
                    <Text className="ml-1 text-sm font-medium text-gray-700">
                        {post.likes.length}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onOpenComments(post)}
                    className="flex-row items-center mr-4"
                >
                    <Icons.MessageCircle size={20} color="#374151" />
                    <Text className="ml-1 text-sm font-medium text-gray-700">
                        {post.commentsCount}
                    </Text>
                </TouchableOpacity>

                {isMine && (
                    <>
                        <View className="flex-1" />

                        <TouchableOpacity
                            onPress={() => onEdit(post)}
                            className="flex-row items-center mr-3"
                        >
                            <Icons.Edit size={16} color="#374151" />
                            <Text className="ml-1 text-sm font-medium text-gray-700">
                                Editar
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => onDelete(post._id)}
                            className="flex-row items-center"
                        >
                            <Icons.Trash size={16} color="#dc2626" />
                            <Text className="ml-1 text-sm font-medium text-red-600">
                                Eliminar
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </Card>
    );
}
