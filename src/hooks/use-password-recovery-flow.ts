import { useRef, useState } from 'react';

import {
  forgotPassword,
  resetPassword,
  verifyResetCode,
} from '@src/services/auth-service';

import type {
  CodeInputRef,
  CodeKeyPressHandler,
  CodeValueChangeHandler,
  PasswordRecoveryFlowProps,
  RecoveryStep,
} from '@src/screens/password-recovery/types';
import {
  CODE_LENGTH,
  EMAIL_PATTERN,
  getErrorMessage,
} from '@src/screens/password-recovery/utils';

type UsePasswordRecoveryFlowArgs = PasswordRecoveryFlowProps;

export function usePasswordRecoveryFlow({ onDone }: UsePasswordRecoveryFlowArgs) {
  const [step, setStep] = useState<RecoveryStep>('forgot');
  const [email, setEmail] = useState('');
  const [codeDigits, setCodeDigits] = useState<string[]>(
    Array.from({ length: CODE_LENGTH }, () => ''),
  );
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const codeRefs = useRef<CodeInputRef[]>([]);
  const normalizedEmail = email.trim().toLowerCase();
  const code = codeDigits.join('');
  const showBackButton = step !== 'success';

  const resetCodeDigits = () => {
    setCodeDigits(Array.from({ length: CODE_LENGTH }, () => ''));
  };

  const handleBack = () => {
    setError('');

    switch (step) {
      case 'forgot':
        onDone();
        break;
      case 'sent':
        setStep('forgot');
        break;
      case 'verify':
        setStep('sent');
        break;
      case 'reset':
        setStep('verify');
        break;
      case 'success':
        onDone();
        break;
      default:
        onDone();
        break;
    }
  };

  const handleSendCode = async () => {
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError('يرجى إدخال بريد جامعي صحيح');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await forgotPassword({ email: normalizedEmail });
      resetCodeDigits();
      setStep('sent');
    } catch (err) {
      setError(getErrorMessage(err, 'تعذر إرسال رمز التحقق'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError('يرجى إدخال بريد جامعي صحيح');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await forgotPassword({ email: normalizedEmail });
    } catch (err) {
      setError(getErrorMessage(err, 'تعذر إعادة إرسال الرمز'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== CODE_LENGTH) {
      setError('يرجى إدخال رمز التحقق كاملًا');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyResetCode({
        email: normalizedEmail,
        code,
      });
      setStep('reset');
    } catch (err) {
      setError(getErrorMessage(err, 'رمز التحقق غير صحيح'));
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async () => {
    const trimmedPassword = newPassword.trim();

    if (trimmedPassword.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    if (trimmedPassword !== confirmPassword.trim()) {
      setError('تأكيد كلمة المرور غير مطابق');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await resetPassword({
        email: normalizedEmail,
        code,
        newPassword: trimmedPassword,
      });
      setStep('success');
    } catch (err) {
      setError(getErrorMessage(err, 'تعذر حفظ كلمة المرور الجديدة'));
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange: CodeValueChangeHandler = (value, index) => {
    const normalized = value.replace(/\D/g, '');

    if (!normalized) {
      setCodeDigits((prev) => {
        const next = [...prev];
        next[index] = '';
        return next;
      });
      return;
    }

    if (normalized.length > 1) {
      setCodeDigits((prev) => {
        const next = [...prev];
        for (let i = 0; i < normalized.length; i += 1) {
          const targetIndex = index + i;
          if (targetIndex >= CODE_LENGTH) {
            break;
          }
          next[targetIndex] = normalized[i] ?? '';
        }
        return next;
      });

      const nextFocus = Math.min(index + normalized.length, CODE_LENGTH - 1);
      codeRefs.current[nextFocus]?.focus();
      return;
    }

    setCodeDigits((prev) => {
      const next = [...prev];
      next[index] = normalized;
      return next;
    });

    if (index < CODE_LENGTH - 1) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyPress: CodeKeyPressHandler = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && !codeDigits[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const setCodeRef = (index: number, ref: CodeInputRef) => {
    codeRefs.current[index] = ref;
  };

  const moveToVerifyStep = () => {
    setError('');
    setStep('verify');
    setTimeout(() => {
      codeRefs.current[0]?.focus();
    }, 30);
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
    toggleShowNewPassword: () => setShowNewPassword((prev) => !prev),
    toggleShowConfirmPassword: () => setShowConfirmPassword((prev) => !prev),
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
