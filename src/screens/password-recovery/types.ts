import type {
  NativeSyntheticEvent,
  TextInput,
  TextInputKeyPressEventData,
} from 'react-native';

export type RecoveryStep = 'forgot' | 'sent' | 'verify' | 'reset' | 'success';

export type PasswordRecoveryFlowProps = {
  onDone: () => void;
};

export type CodeInputRef = TextInput | null;

export type CodeValueChangeHandler = (value: string, index: number) => void;

export type CodeKeyPressHandler = (
  event: NativeSyntheticEvent<TextInputKeyPressEventData>,
  index: number,
) => void;
