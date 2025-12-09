import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ReactNode } from 'react';

import { LucideIcon } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  subtitle?: string;
  bgColor?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  icon?: LucideIcon;
  statusBarStyle?: 'light' | 'dark' | 'auto';
}

export function Header({
  title,
  subtitle,
  bgColor = 'bg-violet-600',
  showBackButton = false,
  onBack,
  icon: Icon,
  statusBarStyle = 'light'
}: HeaderProps) {
  return (
    <SafeAreaView style={{ flex: 0, backgroundColor: bgColor.includes('violet-600') ? '#7c3aed' : bgColor.includes('violet-700') ? '#6d28d9' : bgColor.includes('blue-600') ? '#7c3aed' : '#7c3aed' }} edges={['top']}>
      <StatusBar style={statusBarStyle} />
      <View className={`${bgColor} pt-4 pb-32 px-8 rounded-b-[40px]`}>
        {showBackButton && onBack && (
          <Pressable onPress={onBack} className="mb-4">
            <Text className="text-white text-2xl">←</Text>
          </Pressable>
        )}
        <View className="flex-row items-center gap-3 mb-3">
          <Text className="text-4xl font-bold text-white">
            {title}
          </Text>
          {Icon && <Icon size={32} color="white" />}
        </View>
        {subtitle && (
          <Text className="text-violet-100 text-lg">
            {subtitle}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
