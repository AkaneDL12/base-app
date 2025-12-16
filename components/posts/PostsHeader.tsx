import { View, Text, TouchableOpacity } from "react-native";
import { Icons } from "../../assets/icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

interface PostsHeaderProps {
    postsCount: number;
    onCreatePost: () => void;
}

export function PostsHeader({ postsCount, onCreatePost }: PostsHeaderProps) {
    return (
        <SafeAreaView
            style={{ flex: 0, backgroundColor: "#7c3aed" }}
            edges={["top"]}
        >
            <StatusBar style="light" />
            <View className="px-8 pt-4 pb-6 bg-violet-700 rounded-b-3xl">
                <View className="flex-row items-center justify-between">
                    <View>
                        <View className="flex-row items-center gap-2 mb-2">
                            <Icons.Posts color="white" size={28} />
                            <Text className="text-3xl font-bold text-white">
                                Posts
                            </Text>
                        </View>
                        <Text className="text-base text-violet-100">
                            {postsCount} publicaciones
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={onCreatePost}
                        className="items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg"
                    >
                        <Icons.Plus color="#7c3aed" size={24} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
