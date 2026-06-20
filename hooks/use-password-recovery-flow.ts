import { useRef, useState } from 'react';

import { useAppSettings } from '@/contexts/app-settings-context';
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyResetCodeMutation,
} from '@/hooks/mutations/use-auth-mutations';
import type {
  CodeInputRef,
  CodeKeyPressHandler,
  CodeValueChangeHandler,
  PasswordRecoveryFlowProps,
  RecoveryStep,
} from '@/hooks/password-recovery/types';
import {
  CODE_LENGTH,
  EMAIL_PATTERN,
  getErrorMessage,
} from '@/hooks/password-recovery/utils';

function createEmptyCodeDigits() {
  return Array.from({ length: CODE_LENGTH }, () => '');
}

export function usePasswordRecoveryFlow({ onDone }: PasswordRecoveryFlowProps) {
  const { t } = useAppSettings();
  const [step, setStep] = useState<RecoveryStep>('forgot');
  const [email, setEmail] = useState('');
  const [codeDigits, setCodeDigits] = useState<string[]>(createEmptyCodeDigits);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const forgotPasswordMutation = useForgotPasswordMutation();
  const verifyResetCodeMutation = useVerifyResetCodeMutation();
  const resetPasswordMutation = useResetPasswordMutation();

  const codeRefs = useRef<CodeInputRef[]>([]);
  const normalizedEmail = email.trim().toLowerCase();
  const code = codeDigits.join('');
  const showBackButton = step !== 'success';
  const loading =
    forgotPasswordMutation.isPending ||
    verifyResetCodeMutation.isPending ||
    resetPasswordMutation.isPending;

  const resetCodeDigits = () => {
    setCodeDigits(createEmptyCodeDigits());
  };

  const isEmailValid = () => EMAIL_PATTERN.test(normalizedEmail);

  const focusCodeInput = (index: number) => {
    codeRefs.current[index]?.focus();
  };

  const saveCodeDigit = (index: number, digit: string) => {
    setCodeDigits((currentDigits) => {
      const nextDigits = [...currentDigits];
      nextDigits[index] = digit;
      return nextDigits;
    });
  };

  const handleBack = () => {
    setError('');

    if (step === 'forgot' || step === 'success') {
      onDone();
      return;
    }

    if (step === 'sent') {
      setStep('forgot');
      return;
    }

    if (step === 'verify') {
      setStep('sent');
      return;
    }

    setStep('verify');
  };

  const handleSendCode = async () => {
    if (!isEmailValid()) {
      setError(t('recovery.invalidEmail'));
      return;
    }

    setError('');

    try {
      await forgotPasswordMutation.mutateAsync({ email: normalizedEmail });
      resetCodeDigits();
      setStep('sent');
    } catch (err) {
      setError(getErrorMessage(err, t('recovery.sendCodeError')));
    }
  };

  const handleResendCode = async () => {
    if (!isEmailValid()) {
      setError(t('recovery.invalidEmail'));
      return;
    }

    setError('');

    try {
      await forgotPasswordMutation.mutateAsync({ email: normalizedEmail });
    } catch (err) {
      setError(getErrorMessage(err, t('recovery.resendCodeError')));
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== CODE_LENGTH) {
      setError(t('recovery.codeIncomplete'));
      return;
    }

    setError('');

    try {
      await verifyResetCodeMutation.mutateAsync({
        email: normalizedEmail,
        code,
      });
      setStep('reset');
    } catch (err) {
      setError(getErrorMessage(err, t('recovery.invalidCode')));
    }
  };

  const handleSavePassword = async () => {
    const trimmedPassword = newPassword.trim();

    if (trimmedPassword.length < 8) {
      setError(t('recovery.passwordMin'));
      return;
    }

    if (trimmedPassword !== confirmPassword.trim()) {
      setError(t('recovery.confirmPasswordMismatch'));
      return;
    }

    setError('');

    try {
      await resetPasswordMutation.mutateAsync({
        email: normalizedEmail,
        code,
        newPassword: trimmedPassword,
      });
      setStep('success');
    } catch (err) {
      setError(getErrorMessage(err, t('recovery.savePassword')));
    }
  };

  const handleCodeChange: CodeValueChangeHandler = (value, index) => {
    const digitsOnly = value.replace(/\D/g, '');

    if (!digitsOnly) {
      saveCodeDigit(index, '');
      return;
    }

    // Allow pasting the full code into one box.
    if (digitsOnly.length > 1) {
      setCodeDigits((currentDigits) => {
        const nextDigits = [...currentDigits];
        for (let offset = 0; offset < digitsOnly.length; offset += 1) {
          const targetIndex = index + offset;

          if (targetIndex >= CODE_LENGTH) {
            break;
          }

          nextDigits[targetIndex] = digitsOnly[offset] ?? '';
        }

        return nextDigits;
      });

      const nextFocusIndex = Math.min(index + digitsOnly.length, CODE_LENGTH - 1);
      focusCodeInput(nextFocusIndex);
      return;
    }

    saveCodeDigit(index, digitsOnly);

    if (index < CODE_LENGTH - 1) {
      focusCodeInput(index + 1);
    }
  };

  const handleCodeKeyPress: CodeKeyPressHandler = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && !codeDigits[index] && index > 0) {
      focusCodeInput(index - 1);
    }
  };

  const setCodeRef = (index: number, ref: CodeInputRef) => {
    codeRefs.current[index] = ref;
  };

  const moveToVerifyStep = () => {
    setError('');
    setStep('verify');
    setTimeout(() => {
      focusCodeInput(0);
    }, 30);
  };

  const toggleShowNewPassword = () => {
    setShowNewPassword((currentValue) => !currentValue);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword((currentValue) => !currentValue);
  };

  return {
    step,
    email,
    codeDigits,
    newPassword,
    confirmPassword,
    showNewPassword,
    showConfirmPassword,
    loading,
    error,
    normalizedEmail,
    showBackButton,
    setEmail,
    setNewPassword,
    setConfirmPassword,
    toggleShowNewPassword,
    toggleShowConfirmPassword,
    handleBack,
    handleSendCode,
    handleResendCode,
    handleVerifyCode,
    handleSavePassword,
    handleCodeChange,
    handleCodeKeyPress,
    setCodeRef,
    moveToVerifyStep,
  };
}
