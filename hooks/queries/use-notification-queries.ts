import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useAuth } from '@/contexts/auth-context';
import { queryKeys } from '@/lib/query-keys';
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/notifications-api';

function useNotificationsEnabled() {
  const { user } = useAuth();
  const { notifications } = useAppSettings();

  return Boolean(user && notifications.notificationsEnabled);
}

export function useNotificationsQuery() {
  const enabled = useNotificationsEnabled();

  return useQuery({
    queryKey: queryKeys.notifications.summary,
    queryFn: () => getNotifications(40),
    enabled,
    refetchInterval: enabled ? 30_000 : false,
  });
}

export function useUnreadNotificationsQuery() {
  const enabled = useNotificationsEnabled();

  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: getUnreadNotificationCount,
    enabled,
    refetchInterval: enabled ? 25_000 : false,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => markNotificationRead(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.summary }),
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount }),
      ]);
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.summary }),
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount }),
      ]);
    },
  });
}
