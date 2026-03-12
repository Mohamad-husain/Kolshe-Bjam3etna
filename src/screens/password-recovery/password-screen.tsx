import { RecoveryScaffold } from '@src/components/password-recovery';
import { usePasswordRecoveryFlow } from '@src/hooks/use-password-recovery-flow';
import {
  CodeSentScreen,
  ForgotPasswordScreen,
  NewPasswordScreen,
  PasswordResetSuccessScreen,
  VerifyCodeScreen,
} from './screens';
import type { PasswordRecoveryFlowProps } from './types';

export default function PasswordRecoveryFlow({ onDone }: PasswordRecoveryFlowProps) {
  const flow = usePasswordRecoveryFlow({ onDone });

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
          onSendCode={() => {
            void flow.handleSendCode();
          }}
        />
      ) : null}

      {flow.step === 'sent' ? (
        <CodeSentScreen
          email={flow.normalizedEmail}
          error={flow.error}
          loading={flow.loading}
          onEnterCode={flow.moveToVerifyStep}
          onResendCode={() => {
            void flow.handleResendCode();
          }}
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
          onVerifyCode={() => {
            void flow.handleVerifyCode();
          }}
          onResendCode={() => {
            void flow.handleResendCode();
          }}
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
          onSavePassword={() => {
            void flow.handleSavePassword();
          }}
        />
      ) : null}

      {flow.step === 'success' ? <PasswordResetSuccessScreen onDone={onDone} /> : null}
    </RecoveryScaffold>
  );
}
