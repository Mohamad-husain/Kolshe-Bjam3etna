import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';

import { AuthInput } from '@/components/auth/auth-input';
import {
  AuthErrorText,
  authFormStyles,
  AuthSubmitButton,
} from '@/components/auth/auth-form-shared';
import { useLoginMutation } from '@/hooks/mutations/use-auth-mutations';
import { AUTH_COPY, AUTH_VALIDATION } from '@/lib/auth/auth-copy';
import type { User } from '@/services/auth-api';

type LoginFormProps = {
  onSuccess: (user: User) => void;
  onForgotPassword?: () => void;
};

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginForm({ onSuccess, onForgotPassword }: LoginFormProps) {
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const handleLogin = handleSubmit(async (values) => {
    setServerError('');

    try {
      const user = await loginMutation.mutateAsync(values);
      onSuccess(user);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : AUTH_COPY.loginFailed);
    }
  });

  return (
    <View style={authFormStyles.container}>
      <Controller
        control={control}
        name="email"
        rules={AUTH_VALIDATION.email}
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthInput
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            icon="mail-outline"
            keyboardType="email-address"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={AUTH_COPY.universityEmailPlaceholder}
            textContentType="username"
            value={value}
          />
        )}
      />
      <AuthErrorText message={errors.email?.message} />

      <Controller
        control={control}
        name="password"
        rules={AUTH_VALIDATION.loginPassword}
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthInput
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            icon="lock-closed-outline"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={AUTH_COPY.passwordPlaceholder}
            secureTextEntry={!showPassword}
            textContentType="password"
            trailingIcon={showPassword ? 'eye-outline' : 'eye-off-outline'}
            onTrailingIconPress={() => setShowPassword((currentValue) => !currentValue)}
            value={value}
          />
        )}
      />
      <AuthErrorText message={errors.password?.message} />

      <Pressable
        accessibilityRole="button"
        disabled={!onForgotPassword}
        onPress={onForgotPassword}
        style={authFormStyles.inlineButton}
      >
        <Text style={authFormStyles.inlineButtonText}>{AUTH_COPY.forgotPassword}</Text>
      </Pressable>

      <AuthErrorText message={serverError} />

      <AuthSubmitButton
        isPending={loginMutation.isPending}
        label={AUTH_COPY.loginButton}
        onPress={() => {
          void handleLogin();
        }}
        pendingLabel={AUTH_COPY.loginButtonPending}
      />
    </View>
  );
}
