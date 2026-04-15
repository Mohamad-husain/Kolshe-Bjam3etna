import { useState } from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';

import { AuthHintCard } from '@/components/auth/auth-hint-card';
import { AuthInput } from '@/components/auth/auth-input';
import {
  AuthErrorText,
  authFormStyles,
  AuthSubmitButton,
} from '@/components/auth/auth-form-shared';
import { useRegisterMutation } from '@/hooks/mutations/use-auth-mutations';
import { AUTH_COPY, AUTH_VALIDATION } from '@/lib/auth/auth-copy';
import type { User } from '@/services/auth-api';

type RegisterFormProps = {
  onSuccess: (user: User) => void;
};

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
};

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegisterMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const serverError =
    registerMutation.isError && registerMutation.error
      ? registerMutation.error instanceof Error
        ? registerMutation.error.message
        : AUTH_COPY.registerFailed
      : '';

  const clearServerError = () => {
    if (registerMutation.isError) {
      registerMutation.reset();
    }
  };

  const handleRegister = handleSubmit((values) => {
    registerMutation.mutate(values, { onSuccess });
  });

  return (
    <View style={authFormStyles.container}>
      <Controller
        control={control}
        name="name"
        rules={AUTH_VALIDATION.name}
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthInput
            autoCapitalize="words"
            autoComplete="name"
            icon="person-outline"
            onBlur={onBlur}
            onChangeText={(nextValue) => {
              clearServerError();
              onChange(nextValue);
            }}
            placeholder={AUTH_COPY.fullNamePlaceholder}
            textContentType="name"
            value={value}
          />
        )}
      />
      <AuthErrorText message={errors.name?.message} />

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
            onChangeText={(nextValue) => {
              clearServerError();
              onChange(nextValue);
            }}
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
        rules={AUTH_VALIDATION.registerPassword}
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthInput
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password-new"
            icon="lock-closed-outline"
            onBlur={onBlur}
            onChangeText={(nextValue) => {
              clearServerError();
              onChange(nextValue);
            }}
            placeholder={AUTH_COPY.passwordPlaceholder}
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            trailingIcon={showPassword ? 'eye-outline' : 'eye-off-outline'}
            onTrailingIconPress={() => setShowPassword((currentValue) => !currentValue)}
            value={value}
          />
        )}
      />
      <AuthErrorText message={errors.password?.message} />

      <AuthHintCard message={AUTH_COPY.registerHint} />

      <AuthErrorText message={serverError} />

      <AuthSubmitButton
        isPending={registerMutation.isPending}
        label={AUTH_COPY.registerButton}
        onPress={() => {
          void handleRegister();
        }}
        pendingLabel={AUTH_COPY.registerButtonPending}
      />
    </View>
  );
}
