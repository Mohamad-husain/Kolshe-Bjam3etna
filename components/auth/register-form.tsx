import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';

import { AuthInput } from '@/components/auth/auth-input';
import { useRegisterMutation } from '@/hooks/mutations/use-auth-mutations';
import type { User } from '@/services/auth-api';
import {
  Colors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  Spacing,
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

  const onRegister = handleSubmit(async (values) => {
    setServerError('');

    try {
      const user = await registerMutation.mutateAsync(values);
      onSuccess(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'تعذر إنشاء الحساب';
      setServerError(message);
    }
  });

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="name"
        rules={{
          required: 'يرجى إدخال الاسم الكامل',
          minLength: {
            value: 3,
            message: 'الاسم الكامل قصير جدًا',
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthInput
            icon="person-outline"
            value={value}
            onBlur={() => onBlur()}
            onChangeText={(text) => onChange(text)}
            placeholder="الاسم الكامل"
          />
        )}
      />
      {!!errors.name?.message ? <Text style={styles.errorText}>{errors.name.message}</Text> : null}

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
            value: 8,
            message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
          },
          pattern: {
            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/,
            message: 'يجب أن تحتوي على حرف كبير وصغير ورمز',
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

      <View style={styles.hintBox}>
        <View style={styles.hintDot} />
        <Text style={styles.hintText}>استخدم بريدك الجامعي (.edu) للتوثيق الفوري.</Text>
      </View>

      {!!serverError ? <Text style={styles.errorText}>{serverError}</Text> : null}

      <Pressable
        disabled={registerMutation.isPending}
        onPress={() => {
          void onRegister();
        }}
        style={({ pressed }) => [
          styles.submitButton,
          pressed && styles.submitButtonPressed,
          registerMutation.isPending && styles.submitButtonDisabled,
        ]}
      >
        <View style={styles.submitContent}>
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
          <Text style={styles.submitButtonText}>
            {registerMutation.isPending ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
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
