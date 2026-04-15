import { router } from 'expo-router';

import PasswordRecoveryFlow from './_passwordRecovery/password-screen';

export default function PasswordRecoveryRoute() {
  return (
    <PasswordRecoveryFlow
      onDone={() => {
        router.replace('/(auth)/(entry)/login');
      }}
    />
  );
}
