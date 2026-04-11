import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';

import { AuthInput } from '@/components/auth/auth-input';
import {
  AuthErrorText,
  authFormStyles,
  AuthSubmitButton,
} from '@/components/auth/auth-form-shared';
import { useRegisterMutation } from '@/hooks/mutations/use-auth-mutations';
import { AUTH_COPY, AUTH_VALIDATION } from '@/lib/auth/auth-copy';
import type { User } from '@/services/auth-api';
import {
  Colors,
  Dimensions,
  FontFamily,
} from '@/styles/ui-theme';

type RegisterFormProps = {
  onSuccess: (user: User) => void;
};

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
};

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [serverError, setServerError] = useState('');
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

  const handleRegister = handleSubmit(async (values) => {
    setServerError('');

    try {
      const user = await registerMutation.mutateAsync(values);
      onSuccess(user);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : AUTH_COPY.registerFailed);
    }
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
            onChangeText={onChange}
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
        rules={AUTH_VALIDATION.registerPassword}
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthInput
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password-new"
            icon="lock-closed-outline"
            onBlur={onBlur}
            onChangeText={onChange}
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

      <View style={styles.hintBox}>
        <View style={styles.hintDot} />
        <Text style={styles.hintText}>{AUTH_COPY.registerHint}</Text>
      </View>

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

const styles = StyleSheet.create({
  hintBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(74, 120, 247, 0.1)',
  },
  hintDot: {
    width: 6,
    height: 6,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: Colors.primary,
  },
  hintText: {
    flex: 1,
    color: 'rgba(54, 101, 229, 0.9)',
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: FontFamily.cairo,
    fontSize: 12,
    lineHeight: 18,
  },
});
