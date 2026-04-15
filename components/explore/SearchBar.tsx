import { Ionicons } from "@expo/vector-icons";
import {
  KeyboardAvoidingView,
  View,
  TextInput,
  StyleSheet,
  Text,
} from "react-native";
import {
  Colors,
  Dimensions,
  FontFamily,
  FontSize,
  SemanticColors,
  Spacing,
} from "@/styles/ui-theme";

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

export function SearchBar({
  placeholder,
  value,
  onChangeText,
  error,
}: SearchBarProps) {
  return (
    <KeyboardAvoidingView>
      <View
        style={[
          styles.container,
          error ? { borderColor: SemanticColors.red } : null,
        ]}
      >
        <Ionicons
          name="search-outline"
          size={18}
          color={error ? SemanticColors.red : Colors.mutedForeground}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.mutedForeground}
          value={value}
          onChangeText={onChangeText}
          textAlign="right"
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: Dimensions.radiusButton,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    alignSelf: "center",
    maxWidth: 500,
    width: "100%",
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    fontFamily: FontFamily.cairo,
    color: Colors.foreground,
  },
  errorText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    color: SemanticColors.red,
    textAlign: "right",
    paddingHorizontal: Spacing.md,
    marginTop: -4,
    marginBottom: Spacing.xs,
  },
});
