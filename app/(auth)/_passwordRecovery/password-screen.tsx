import { RecoveryScaffold } from '@/components/password-recovery';
import { usePasswordRecoveryFlow } from '@/hooks/use-password-recovery-flow';
import type { PasswordRecoveryFlowProps } from '@/hooks/password-recovery/types';

import { CodeSentScreen } from './screens/code-sent-screen';
import { ForgotPasswordScreen } from './screens/forgot-password-screen';
import { NewPasswordScreen } from './screens/new-password-screen';
import { PasswordResetSuccessScreen } from './screens/password-reset-success-screen';
import { VerifyCodeScreen } from './screens/verify-code-screen';

export default function PasswordRecoveryFlow({ onDone }: PasswordRecoveryFlowProps) {
  const flow = usePasswordRecoveryFlow({ onDone });

  const sendCode = () => {
    void flow.handleSendCode();
  };

  const resendCode = () => {
    void flow.handleResendCode();
  };

  const verifyCode = () => {
    void flow.handleVerifyCode();
  };

  const savePassword = () => {
    void flow.handleSavePassword();
  };

  return (
    <RecoveryScaffold
      showBackButton={flow.showBackButton}
      onBackPress={flow.handleBack}
      backDisabled={flow.loading}
    >
      {flow.step === 'forgot' ? (
        <ForgotPasswordScreen
          email={flow.email}
          error={flow.error}
          loading={flow.loading}
          onChangeEmail={flow.setEmail}
          onSendCode={sendCode}
        />
      ) : null}

      {flow.step === 'sent' ? (
        <CodeSentScreen
          email={flow.normalizedEmail}
          error={flow.error}
          loading={flow.loading}
          onEnterCode={flow.moveToVerifyStep}
          onResendCode={resendCode}
        />
      ) : null}

      {flow.step === 'verify' ? (
        <VerifyCodeScreen
          codeDigits={flow.codeDigits}
          error={flow.error}
          loading={flow.loading}
          onCodeChange={flow.handleCodeChange}
          onCodeKeyPress={flow.handleCodeKeyPress}
          onSetCodeRef={flow.setCodeRef}
          onVerifyCode={verifyCode}
          onResendCode={resendCode}
        />
      ) : null}

      {flow.step === 'reset' ? (
        <NewPasswordScreen
          newPassword={flow.newPassword}
          confirmPassword={flow.confirmPassword}
          showNewPassword={flow.showNewPassword}
          showConfirmPassword={flow.showConfirmPassword}
          error={flow.error}
          loading={flow.loading}
          onChangeNewPassword={flow.setNewPassword}
          onChangeConfirmPassword={flow.setConfirmPassword}
          onToggleShowNewPassword={flow.toggleShowNewPassword}
          onToggleShowConfirmPassword={flow.toggleShowConfirmPassword}
          onSavePassword={savePassword}
        />
      ) : null}

      {flow.step === 'success' ? <PasswordResetSuccessScreen onDone={onDone} /> : null}
    </RecoveryScaffold>
  );
}
