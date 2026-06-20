import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { router, Tabs } from 'expo-router';
import { useEffect, useRef } from 'react';

import { BottomNavigation, type Screen } from '@/components/bottom-navigation';
import { useAppSettings } from '@/contexts/app-settings-context';
import { useAuth } from '@/contexts/auth-context';
import { emitHomeScrollToTop } from '@/lib/navigation-events';

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
    const currentScreen = (state.routes[state.index]?.name as Screen) ?? 'home';
    const lastHomePressAt = useRef(0);

    return (
        <BottomNavigation
            currentScreen={currentScreen}
            onChangeScreen={(screen) => {
                const now = Date.now();

                if (screen === 'home') {
                    if (currentScreen === 'home' && now - lastHomePressAt.current < 550) {
                        emitHomeScrollToTop();
                        lastHomePressAt.current = 0;
                        return;
                    }

                    lastHomePressAt.current = now;
                }

                navigation.navigate(screen);
            }}
        />
    );
}

export default function TabsLayout() {
    const { user } = useAuth();
    const { t } = useAppSettings();

    useEffect(() => {
        if (!user) {
            router.navigate('/(auth)');
            return;
        }

        if (!user.isProfileCompleted) {
            router.navigate('/(auth)/select-university');
        }
    }, [user]);

    if (!user) {
        return null;
    }

    if (!user.isProfileCompleted) {
        return null;
    }

    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tabs.Screen name="home" options={{ title: t('nav.home') }} />
            <Tabs.Screen name="explore" options={{ title: t('nav.explore') }} />
            <Tabs.Screen name="add-menu" options={{ title: t('addMenu.title'), href: null }} />
            <Tabs.Screen name="messages" options={{ title: t('nav.messages') }} />
            <Tabs.Screen name="profile" options={{ title: t('nav.profile') }} />
        </Tabs>
    );
}
