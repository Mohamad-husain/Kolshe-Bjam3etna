import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AuthProvider } from "@/contexts/auth-context";
import { AppProviders } from "@/contexts/app-providers";
import { useThemePreference } from "@/contexts/theme-preference-context";
import { queryClient } from "@/lib/query-client";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProviders>
          <ThemedStatusBar />
          <Stack screenOptions={{ headerShown: false }} />
        </AppProviders>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function ThemedStatusBar() {
  const { effectiveTheme } = useThemePreference();

  return <StatusBar style={effectiveTheme === "dark" ? "light" : "dark"} />;
}
