import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { MyEventCard } from "@/components/coordinator/MyEventCard";
import { useMyEventsQuery } from "@/hooks/queries/use-coordinator-queries";
import type { CoordinatorEvent } from "@/services/coordinator-api";
import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
  Spacing,
} from "@/styles/ui-theme";

type MyEventsTabProps = {
  onEdit: (event: CoordinatorEvent) => void;
};
export function MyEventsTab({ onEdit }: MyEventsTabProps) {
  const { data: events = [], isLoading, error } = useMyEventsQuery();
  const errorMessage =
    error instanceof Error ? error.message : "تعذر تحميل الفعاليات";

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={SemanticColors.green} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="calendar-outline"
          size={48}
          color={Colors.mutedForeground}
        />
        <Text style={styles.emptyText}>لا توجد فعاليات بعد</Text>
        <Text style={styles.emptySubText}>أنشئ فعاليتك الأولى!</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => <MyEventCard event={item} onEdit={onEdit} />}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: Spacing.md,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  emptyText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
  },
  emptySubText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    color: Colors.mutedForeground,
  },
  errorText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    color: Colors.mutedForeground,
  },
});
