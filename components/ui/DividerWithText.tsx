import { View, Text } from 'react-native';

interface DividerWithTextProps {
  text: string;
}

export function DividerWithText({ text }: DividerWithTextProps) {
  return (
    <View className="flex-row items-center my-6">
      <View className="flex-1 h-[1px] bg-gray-300" />
      <Text className="mx-4 text-gray-500 font-medium">{text}</Text>
      <View className="flex-1 h-[1px] bg-gray-300" />
    </View>
  );
}
