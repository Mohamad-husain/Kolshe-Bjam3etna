import { StatusBar } from 'expo-status-bar';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useState } from 'react';

import { BottomNavigation, type Screen } from '@src/components/bottom-navigation';
import { AppProviders } from '@src/contexts/app-providers';
import HomeScreen from '@src/screens/home-screen';
import LoginScreen, { type User } from '@src/screens/login-screen';

type AppTabsParamList = {
  home: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

const TAB_TITLES: Record<Screen, string> = {
  home: 'الرئيسية',
  explore: 'استكشف',
  'add-menu': 'إضافة جديد',
  messages: 'الرسائل',
  profile: 'حسابي',
};

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const currentScreen = (state.routes[state.index]?.name as Screen) ?? 'home';

  return (
    <BottomNavigation
      currentScreen={currentScreen}
      onChangeScreen={(screen) => {
        if (screen === 'home') {
          navigation.navigate('home');
        }
      }}
    />
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="home" component={HomeScreen} options={{ title: TAB_TITLES.home }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <AppProviders>
      <StatusBar style="auto" />
      {user ? (
        <NavigationContainer>
          <MainTabs />
        </NavigationContainer>
      ) : (
        <LoginScreen onSuccess={setUser} />
      )}
    </AppProviders>
  );
}
