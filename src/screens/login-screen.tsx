import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

import {
  Colors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  Spacing,
  STRINGS,
} from '@src/styles/ui-theme';

export type User = {
  id: string;
  name: string;
  email: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type LoginScreenProps = {
  onSuccess: (user: User) => void;
};

const MOCK_USERS: (User & { password: string })[] = [
  {
    id: '1',
    name: 'Test User',
    email: 'test@test.com',
    password: '123456',
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function login(input: LoginInput): Promise<User> {
  await delay(250);

  const user = MOCK_USERS.find(
    (item) => item.email.toLowerCase() === input.email.trim().toLowerCase(),
  );

  if (!user || user.password !== input.password) {
    throw new Error('Invalid email or password');
  }

  return { id: user.id, name: user.name, email: user.email };
}

export default function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('test@test.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');

  async function onLogin() {
    setError('');

    try {
      const user = await login({ email, password });
      onSuccess(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        padding: Spacing.md,
        gap: Spacing.sm,
        backgroundColor: Colors.background,
      }}
    >
      <Text
        style={{
          color: Colors.foreground,
          fontFamily: FontFamily.cairo,
          fontSize: FontSize.base,
          fontWeight: FontWeight.semibold,
          textAlign: 'right',
        }}
      >
        {STRINGS.authTitle}
      </Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder={STRINGS.authEmailPlaceholder}
        placeholderTextColor={Colors.mutedForeground}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderColor: Colors.border,
          padding: Spacing.sm,
          borderRadius: Dimensions.radiusButton,
          backgroundColor: Colors.card,
          color: Colors.foreground,
          textAlign: 'left',
        }}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder={STRINGS.authPasswordPlaceholder}
        placeholderTextColor={Colors.mutedForeground}
        secureTextEntry
        style={{
          borderWidth: 1,
          borderColor: Colors.border,
          padding: Spacing.sm,
          borderRadius: Dimensions.radiusButton,
          backgroundColor: Colors.card,
          color: Colors.foreground,
          textAlign: 'left',
        }}
      />

      {!!error && (
        <Text style={{ color: Colors.destructive, textAlign: 'right' }}>{error}</Text>
      )}

      <Button title={STRINGS.authLoginButton} onPress={onLogin} color={Colors.primary} />
    </View>
  );
}
