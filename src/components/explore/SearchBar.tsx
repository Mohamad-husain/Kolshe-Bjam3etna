import { Ionicons } from "@expo/vector-icons";
import { View, TextInput, StyleSheet } from "react-native";
import {
  Colors,
  Dimensions,
  FontFamily,
  FontSize,
  Spacing,
} from "@src/styles/ui-theme";

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}

export function SearchBar({
  placeholder,
  value,
  onChangeText,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons
        name="search-outline"
        size={18}
        color={Colors.mutedForeground}
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
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    fontFamily: FontFamily.cairo,
    color: Colors.foreground,
  },
});
