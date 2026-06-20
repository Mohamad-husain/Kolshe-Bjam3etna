import { useState } from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';

import { AuthHintCard } from '@/components/auth/auth-hint-card';
import { AuthInput } from '@/components/auth/auth-input';
import {
  AuthErrorText,
  authFormStyles,
  AuthSubmitButton,
  getAuthErrorMessage,
} from '@/components/auth/auth-form-shared';
import { useAppSettings } from '@/contexts/app-settings-context';
import { useRegisterMutation } from '@/hooks/mutations/use-auth-mutations';
import { AUTH_PATTERNS } from '@/lib/auth/auth-copy';
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
  const { t } = useAppSettings();
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

  const isSubmitting = registerMutation.isPending;
  const registerError = registerMutation.isError
    ? getAuthErrorMessage(registerMutation.error, t('auth.registerFailed'))
    : '';
  const nameRules = {
    required: t('auth.fullNameRequired'),
    minLength: {
      value: 3,
      message: t('auth.fullNameTooShort'),
    },
  };
  const emailRules = {
    required: t('auth.emailRequired'),
    pattern: {
      value: AUTH_PATTERNS.email,
      message: t('auth.invalidEmail'),
    },
  };
  const passwordRules = {
    required: t('auth.passwordRequired'),
    minLength: {
      value: 8,
      message: t('auth.registerPasswordMinLength'),
    },
    pattern: {
      value: AUTH_PATTERNS.strongPassword,
      message: t('auth.passwordStrength'),
    },
  };

  const clearRegisterError = () => {
    if (registerMutation.isError) {
      registerMutation.reset();
    }
  };

  const submitRegister = handleSubmit((values) => {
    registerMutation.mutate(values, { onSuccess });
  });

  return (
    <View style={authFormStyles.container}>
      <Controller
        control={control}
        name="name"
        rules={nameRules}
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthInput
            autoCapitalize="words"
            autoComplete="name"
            icon="person-outline"
            onBlur={onBlur}
            onChangeText={(nextValue) => {
              clearRegisterError();
              onChange(nextValue);
            }}
            placeholder={t('auth.fullNamePlaceholder')}
            textContentType="name"
            value={value}
          />
        )}
      />
      <AuthErrorText message={errors.name?.message} />

      <Controller
        control={control}
        name="email"
        rules={emailRules}
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthInput
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            icon="mail-outline"
            keyboardType="email-address"
            onBlur={onBlur}
            onChangeText={(nextValue) => {
              clearRegisterError();
              onChange(nextValue);
            }}
            placeholder={t('auth.universityEmailPlaceholder')}
            textContentType="username"
            value={value}
          />
        )}
      />
      <AuthErrorText message={errors.email?.message} />

      <Controller
        control={control}
        name="password"
        rules={passwordRules}
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthInput
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password-new"
            icon="lock-closed-outline"
            onBlur={onBlur}
            onChangeText={(nextValue) => {
              clearRegisterError();
              onChange(nextValue);
            }}
            placeholder={t('auth.passwordPlaceholder')}
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            trailingIcon={showPassword ? 'eye-outline' : 'eye-off-outline'}
            onTrailingIconPress={() => setShowPassword((currentValue) => !currentValue)}
            value={value}
          />
        )}
      />
      <AuthErrorText message={errors.password?.message} />

      <AuthHintCard message={t('auth.registerHint')} />

      <AuthErrorText message={registerError} />

      <AuthSubmitButton
        isPending={isSubmitting}
        label={t('auth.registerButton')}
        onPress={() => {
          void submitRegister();
        }}
        pendingLabel={t('auth.registerButtonPending')}
      />
    </View>
  );
}
