import { Ionicons } from "@expo/vector-icons";
import {
  KeyboardAvoidingView,
  View,
  TextInput,
  StyleSheet,
  Text,
} from "react-native";
import {
  Dimensions,
  FontFamily,
  FontSize,
  SemanticColors,
  Spacing,
} from "@/styles/ui-theme";
import { useAppSettings } from "@/contexts/app-settings-context";
import { useThemePreference } from "@/contexts/theme-preference-context";

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
  const { isRtl } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <KeyboardAvoidingView>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            flexDirection: isRtl ? "row-reverse" : "row",
          },
          error ? { borderColor: SemanticColors.red } : null,
        ]}
      >
        <Ionicons
          name="search-outline"
          size={18}
          color={error ? SemanticColors.red : colors.mutedForeground}
        />
        <TextInput
          style={[
            styles.input,
            {
              color: colors.foreground,
              textAlign: isRtl ? "right" : "left",
              writingDirection: isRtl ? "rtl" : "ltr",
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: Dimensions.radiusButton,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: "center",
    maxWidth: 500,
    width: "100%",
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    fontFamily: FontFamily.cairo,
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
