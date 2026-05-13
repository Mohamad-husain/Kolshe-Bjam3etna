import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

type Props = {
  name?: string | null;
  imageUrl?: string | null;
  size?: number;
  color?: string;
};

const CHAT_AVATAR_COLORS = [
  '#2563EB',
  '#22C55E',
  '#38BDF8',
  '#F59E0B',
  '#A855F7',
  '#F97316',
] as const;

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim().replace(/\/$/, '');

function getAvatarColor(seed?: string | null) {
  const value = (seed ?? '').trim();

  if (!value) {
    return CHAT_AVATAR_COLORS[0];
  }

  const index =
    value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % CHAT_AVATAR_COLORS.length;

  return CHAT_AVATAR_COLORS[index];
}

function getAvatarInitial(name?: string | null) {
  const value = (name ?? '').trim();
  return value[0]?.toUpperCase() ?? 'م';
}

function getValidImageUri(value?: string | null) {
  const uri = value?.trim();

  if (!uri) {
    return null;
  }

  if (
    uri.startsWith('http://') ||
    uri.startsWith('https://') ||
    uri.startsWith('data:') ||
    uri.startsWith('file:') ||
    uri.startsWith('blob:') ||
    uri.startsWith('content:')
  ) {
    return uri;
  }

  if (!API_BASE_URL) {
    return null;
  }

  if (uri.startsWith('/')) {
    return `${API_BASE_URL}${uri}`;
  }

  return `${API_BASE_URL}/${uri.replace(/^\/+/, '')}`;
}

export default function ChatAvatar({
  name,
  imageUrl,
  size = 48,
  color,
}: Props) {
  const avatarUri = getValidImageUri(imageUrl);
  const backgroundColor = color ?? getAvatarColor(name);
  const initial = getAvatarInitial(name);

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {avatarUri ? (
        <Image
          source={{ uri: avatarUri }}
          contentFit="cover"
          style={[
            styles.avatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.avatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor,
            },
          ]}
        >
          <Text
            style={[
              styles.initial,
              {
                fontSize: Math.max(15, Math.round(size * 0.38)),
              },
            ]}
          >
            {initial}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initial: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
