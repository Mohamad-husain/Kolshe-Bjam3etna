import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Redirect, Tabs } from 'expo-router';

import { BottomNavigation, type Screen } from '@/components/bottom-navigation';
import { useAuth } from '@/contexts/auth-context';

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const currentScreen = (state.routes[state.index]?.name as Screen) ?? 'home';

  return (
    <BottomNavigation
      currentScreen={currentScreen}
      onChangeScreen={(screen) => {
        if (screen === 'home' || screen === 'explore') {
          navigation.navigate(screen);
        }
      }}
    />
  );
}

export default function TabsLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: 'الرئيسية' }} />
      <Tabs.Screen name="explore" options={{ title: 'استكشف' }} />
    </Tabs>
  );
}
