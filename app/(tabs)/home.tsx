import { StyleSheet, Text, View } from "react-native";

import { Colors, FontFamily, FontSize, FontWeight } from "@/styles/ui-theme";

export default function HomeRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>الرئيسية</Text>
      <Text style={styles.subtitle}>
        هاي أول شاشة للمستخدم بعد تسجيل الدخول
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.extrabold,
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: FontSize.md,
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    textAlign: "center",
  },
});
