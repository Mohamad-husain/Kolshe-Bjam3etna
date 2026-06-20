import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from '@/hooks/queries/use-notification-queries';
import type { AppNotification } from '@/services/notifications-api';
import { FontFamily, FontSize, FontWeight, SemanticColors } from '@/styles/ui-theme';

function formatNotificationTime(value: string, language: 'ar' | 'en') {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return language === 'ar' ? 'الآن' : 'Now';
  }

  const formatter = new Intl.DateTimeFormat(language === 'ar' ? 'ar-JO' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return formatter.format(date);
}

function getNotificationAccent(type: string) {
  const normalized = type.toLowerCase();

  if (normalized.includes('message')) {
    return { icon: 'chatbubble-ellipses-outline' as const, color: SemanticColors.blue };
  }

  if (normalized.includes('offer')) {
    return { icon: 'pricetag-outline' as const, color: SemanticColors.green };
  }

  if (normalized.includes('event')) {
    return { icon: 'calendar-outline' as const, color: SemanticColors.orange };
  }

  if (normalized.includes('deadline')) {
    return { icon: 'time-outline' as const, color: SemanticColors.red };
  }

  return { icon: 'megaphone-outline' as const, color: SemanticColors.violet };
}

function getNotificationRoute(notification: AppNotification) {
  const targetType = notification.targetType?.toLowerCase() ?? '';
  const targetId = notification.targetId ? String(notification.targetId) : null;

  if (targetType.includes('news')) {
    return { pathname: '/news' as const };
  }

  if (!targetId) {
    if (notification.type.toLowerCase().includes('announcement')) {
      return { pathname: '/news' as const };
    }

    return null;
  }

  if (targetType.includes('chat')) {
    return { pathname: '/chat/[conversationId]' as const, params: { conversationId: targetId } };
  }

  if (targetType.includes('event')) {
    return { pathname: '/event/[id]' as const, params: { id: targetId } };
  }

  if (targetType.includes('product') || targetType.includes('ad')) {
    return { pathname: '/ad/[id]' as const, params: { id: targetId } };
  }

  if (targetType.includes('service')) {
    return { pathname: '/service/[id]' as const, params: { id: targetId } };
  }

  if (targetType.includes('offer')) {
    return { pathname: '/(tabs)/profile' as const };
  }

  return null;
}

export default function NotificationsRoute() {
  const insets = useSafeAreaInsets();
  const { t, isRtl, language, notifications: preferences } = useAppSettings();
  const { colors, effectiveTheme } = useThemePreference();
  const notificationsQuery = useNotificationsQuery();
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();
  const items = notificationsQuery.data?.items ?? [];
  const unreadCount = items.filter((item) => !item.isRead).length;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/home');
  };

  const handleMarkAllRead = () => {
    if (!unreadCount || markAllReadMutation.isPending) {
      return;
    }

    markAllReadMutation.mutate(undefined, {
      onSuccess: () => {
        Alert.alert(t('notifications.title'), t('notifications.markedAll'));
      },
    });
  };

  const openNotification = (notification: AppNotification) => {
    const route = getNotificationRoute(notification);

    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }

    if (route) {
      router.push(route);
    }
  };

  const renderNotification = ({ item }: { item: AppNotification }) => {
    const accent = getNotificationAccent(item.type);

    return (
      <Pressable
        onPress={() => openNotification(item)}
        style={({ pressed }) => [
          styles.notificationCard,
          {
            backgroundColor: colors.card,
            borderColor: item.isRead ? colors.border : accent.color,
            flexDirection: isRtl ? 'row-reverse' : 'row',
          },
          !item.isRead && styles.unreadCard,
          pressed && styles.pressed,
        ]}
      >
        <View style={[styles.iconBox, { backgroundColor: `${accent.color}18` }]}>
          <Ionicons name={accent.icon} size={21} color={accent.color} />
        </View>

        <View style={[styles.notificationBody, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
          <View style={[styles.notificationTitleRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            {!item.isRead ? <View style={[styles.unreadDot, { backgroundColor: accent.color }]} /> : null}
            <Text
              style={[
                styles.notificationTitle,
                {
                  color: colors.foreground,
                  textAlign: isRtl ? 'right' : 'left',
                  writingDirection: isRtl ? 'rtl' : 'ltr',
                },
              ]}
            >
              {item.title}
            </Text>
          </View>

          <Text
            style={[
              styles.notificationText,
              {
                color: colors.mutedForeground,
                textAlign: isRtl ? 'right' : 'left',
                writingDirection: isRtl ? 'rtl' : 'ltr',
              },
            ]}
          >
            {item.body}
          </Text>

          <Text style={[styles.notificationTime, { color: colors.mutedForeground }]}>
            {formatNotificationTime(item.createdAtUtc, language)}
          </Text>
        </View>

        <Ionicons
          name={isRtl ? 'chevron-back' : 'chevron-forward'}
          size={18}
          color={colors.mutedForeground}
        />
      </Pressable>
    );
  };

  const disabled = !preferences.notificationsEnabled;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={handleBack} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
          <Ionicons
            name={isRtl ? 'arrow-forward' : 'arrow-back'}
            size={20}
            color={colors.foreground}
          />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: colors.foreground }]}>{t('notifications.title')}</Text>
          {unreadCount ? (
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {unreadCount}
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={handleMarkAllRead}
          disabled={!unreadCount || markAllReadMutation.isPending}
          style={({ pressed }) => [
            styles.headerButton,
            (!unreadCount || markAllReadMutation.isPending) && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="checkmark-done-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {disabled ? (
        <View style={styles.center}>
          <Ionicons name="notifications-off-outline" size={42} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            {t('settings.notificationsDisabled')}
          </Text>
        </View>
      ) : notificationsQuery.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
            {t('common.loading')}
          </Text>
        </View>
      ) : notificationsQuery.isError ? (
        <View style={styles.center}>
          <Ionicons name="warning-outline" size={42} color={SemanticColors.red} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            {t('notifications.error')}
          </Text>
          <Pressable
            onPress={() => notificationsQuery.refetch()}
            style={({ pressed }) => [
              styles.retryButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderNotification}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 28 },
            !items.length && styles.listEmpty,
          ]}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="notifications-outline" size={42} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                {t('notifications.emptyTitle')}
              </Text>
              <Text
                style={[
                  styles.emptyBody,
                  {
                    color: colors.mutedForeground,
                    textAlign: isRtl ? 'center' : 'center',
                    writingDirection: isRtl ? 'rtl' : 'ltr',
                  },
                ]}
              >
                {t('notifications.emptyBody')}
              </Text>
            </View>
          }
          refreshing={notificationsQuery.isRefetching}
          onRefresh={() => notificationsQuery.refetch()}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    minHeight: 62,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
  },
  subtitle: {
    marginTop: -2,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
  },
  listEmpty: {
    flexGrow: 1,
  },
  notificationCard: {
    minHeight: 96,
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 12,
  },
  unreadCard: {
    borderWidth: 1.5,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBody: {
    flex: 1,
    gap: 4,
  },
  notificationTitleRow: {
    alignItems: 'center',
    gap: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  notificationText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 21,
  },
  notificationTime: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    gap: 10,
  },
  loadingText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  emptyTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 22,
  },
  retryButton: {
    minHeight: 42,
    borderRadius: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    color: '#ffffff',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  disabled: {
    opacity: 0.35,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
