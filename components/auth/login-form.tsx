import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';

import { AuthInput } from '@/components/auth/auth-input';
import { useLoginMutation } from '@/hooks/mutations/use-auth-mutations';
import type { User } from '@/services/auth-api';
import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
  Spacing,
} from '@/styles/ui-theme';

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

  const onLogin = handleSubmit(async (values) => {
    setServerError('');

    try {
      const user = await loginMutation.mutateAsync(values);
      onSuccess(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'تعذر تسجيل الدخول';
      setServerError(message);
    }
  });

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="email"
        rules={{
          required: 'يرجى إدخال البريد الجامعي',
          pattern: {
            value: /^\S+@\S+\.\S+$/,
            message: 'صيغة البريد غير صحيحة',
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthInput
            icon="mail-outline"
            value={value}
            onBlur={() => onBlur()}
            onChangeText={(text) => onChange(text)}
            placeholder="البريد الجامعي"
            autoCapitalize="none"
          />
        )}
      />
      {!!errors.email?.message ? <Text style={styles.errorText}>{errors.email.message}</Text> : null}

      <Controller
        control={control}
        name="password"
        rules={{
          required: 'يرجى إدخال كلمة المرور',
          minLength: {
            value: 6,
            message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthInput
            icon="lock-closed-outline"
            value={value}
            onBlur={() => onBlur()}
            onChangeText={(text) => onChange(text)}
            placeholder="كلمة المرور"
            secureTextEntry={!showPassword}
            trailingIcon={showPassword ? 'eye-outline' : 'eye-off-outline'}
            onTrailingIconPress={() => setShowPassword((prev) => !prev)}
          />
        )}
      />
      {!!errors.password?.message ? (
        <Text style={styles.errorText}>{errors.password.message}</Text>
      ) : null}

      <Pressable
        onPress={onForgotPassword}
        disabled={!onForgotPassword}
        style={styles.inlineButton}
      >
        <Text style={styles.inlineButtonText}>نسيت كلمة المرور؟</Text>
      </Pressable>

      {!!serverError ? <Text style={styles.errorText}>{serverError}</Text> : null}

      <Pressable
        disabled={loginMutation.isPending}
        onPress={() => {
          void onLogin();
        }}
        style={({ pressed }) => [
          styles.submitButton,
          pressed && styles.submitButtonPressed,
          loginMutation.isPending && styles.submitButtonDisabled,
        ]}
      >
        <View style={styles.submitContent}>
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
          <Text style={styles.submitButtonText}>
            {loginMutation.isPending ? 'جاري الدخول...' : 'دخول'}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  inlineButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  inlineButtonText: {
    color: Colors.primary,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  errorText: {
    color: Colors.destructive,
    textAlign: 'right',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  submitButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontFamily: FontFamily.cairo,
    fontSize: 16,
    fontWeight: FontWeight.bold,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
