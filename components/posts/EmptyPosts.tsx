import { View, Text } from "react-native";
import { Icons } from "../../assets/icons";
import { Card } from "../ui";

export function EmptyPosts() {
    return (
        <Card>
            <View className="items-center justify-center py-8">
                <Icons.Inbox size={48} color="#9ca3af" />
                <Text className="mt-4 text-lg font-medium text-center text-gray-600">
                    No hay publicaciones
                </Text>
                <Text className="text-base text-center text-gray-500">
                    Sé el primero en publicar algo
                </Text>
            </View>
        </Card>
    );
}
