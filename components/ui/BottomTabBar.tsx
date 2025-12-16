import { View, Text, Pressable } from 'react-native';
import { router, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, User, MessageCircle, Map } from 'lucide-react-native';

interface TabButton {
  name: string;
  route: string;
  icon: any;
  label: string;
}

const TABS: TabButton[] = [
  { name: 'home', route: '/home', icon: Home, label: 'Home' },
  { name: 'profile', route: '/profile', icon: User, label: 'Perfil' },
  { name: 'chats', route: '/chats', icon: MessageCircle, label: 'Chats' },
  { name: 'map', route: '/map', icon: Map, label: 'Mapa' },
];

export function BottomTabBar() {
  const pathname = usePathname();

  const handlePress = (route: string) => {
    router.push(route);
  };

  const isActive = (route: string) => pathname === route;

  return (
    <SafeAreaView
      edges={['bottom']}
      className="bg-white border-t border-gray-200"
    >
      <View className="flex-row items-center justify-around px-4 py-2">

        {TABS.map((tab) => {
          const active = isActive(tab.route);
          const Icon = tab.icon;

          return (
            <Pressable
              key={tab.name}
              onPress={() => handlePress(tab.route)}
              className={`flex-1 items-center py-2 rounded-xl ${active ? 'bg-violet-50' : ''
                }`}
            >
              <Icon size={24} color={active ? '#7c3aed' : '#6b7280'} />
              <Text
                className={`text-xs font-semibold mt-1 ${active ? 'text-violet-600' : 'text-gray-500'
                  }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}

      </View>
    </SafeAreaView>
  );
}