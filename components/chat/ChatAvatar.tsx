import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { getAvatarColor, getAvatarInitial, getValidImageUri } from '@/components/chat/chat-ui';

type Props = {
  name?: string | null;
  imageUrl?: string | null;
  size?: number;
  color?: string;
};

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
