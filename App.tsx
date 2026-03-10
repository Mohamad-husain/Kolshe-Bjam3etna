import { StatusBar } from "expo-status-bar";
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { useState } from "react";
import {
  BottomNavigation,
  type Screen,
} from "@src/components/bottom-navigation";
import { AppProviders } from "@src/contexts/app-providers";
import AuthScreen from "@src/screens/auth-screen";
import type { User } from "@src/services/auth-service";
import HomeScreen from "@src/screens/home-screen";
import ExploreScreen from "@src/screens/explore-screen";

type AppTabsParamList = {
  home: undefined;
  explore: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

const TAB_TITLES: Record<Screen, string> = {
  home: "الرئيسية",
  explore: "استكشف",
  "add-menu": "إضافة جديد",
  messages: "الرسائل",
  profile: "حسابي",
};

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const currentScreen = (state.routes[state.index]?.name as Screen) ?? "home";

  return (
    <BottomNavigation
      currentScreen={currentScreen}
      onChangeScreen={(screen) => {
        if (screen === "home") {
          navigation.navigate("home");
        }
        if (screen === "explore") navigation.navigate("explore");
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
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{ title: TAB_TITLES.home }}
      />
      <Tab.Screen
        name="explore"
        component={ExploreScreen}
        options={{ title: TAB_TITLES.explore }}
      />
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
        <AuthScreen onSuccess={setUser} />
      )}
    </AppProviders>
  );
}
