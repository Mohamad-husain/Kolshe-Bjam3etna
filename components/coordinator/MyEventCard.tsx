import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Image } from "expo-image";
import {
  useDeleteEventMutation,
  useEventRegistrationsQuery,
} from "@/hooks/queries/use-coordinator-queries";
import type { CoordinatorEvent } from "@/services/coordinator-api";
import {
  Colors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
  Spacing,
} from "@/styles/ui-theme";
import { toAbsoluteImageUrl } from "@/services/admin/admin-utils";

function formatDate(dateTimeUtc: string | null): string {
  if (!dateTimeUtc) return "تاريخ غير متوفر";

  const date = new Date(dateTimeUtc);
  if (Number.isNaN(date.getTime())) return "تاريخ غير متوفر";

  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
function formatTime(dateTimeUtc: string | null): string {
  if (!dateTimeUtc) return "وقت غير متوفر";

  const date = new Date(dateTimeUtc);
  if (Number.isNaN(date.getTime())) return "وقت غير متوفر";

  return date.toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusColor(
  registeredCount: number,
  capacity: number,
  isEnded: boolean,
) {
  if (capacity <= 0) return SemanticColors.green;
  const ratio = registeredCount / capacity;
  if (ratio >= 1) return SemanticColors.red;
  if (ratio >= 0.8) return SemanticColors.orange;
  if (isEnded) return "#888888";

  return SemanticColors.green;
}

type MyEventCardProps = {
  event: CoordinatorEvent;
  onEdit: (event: CoordinatorEvent) => void;
};

export function MyEventCard({ event, onEdit }: MyEventCardProps) {
  const [showRegistrations, setShowRegistrations] = useState(false);

  const deleteMutation = useDeleteEventMutation();

  const registrationsQuery = useEventRegistrationsQuery(
    event.id,
    showRegistrations,
  );
  const imageUrl = toAbsoluteImageUrl(event.coverImageUrl) ?? undefined;
  const capacity = event.capacity > 0 ? event.capacity : 1;
  const registeredCount = event.registeredCount ?? 0;
  const progress = Math.max(0, Math.min((event.progressPercent ?? 0) / 100, 1));
  const eventTime = event.dateTimeUtc
    ? new Date(event.dateTimeUtc).getTime()
    : 0;
  const now = Date.now();
  const isEnded = eventTime !== null && eventTime < now;
  const statusColor = getStatusColor(registeredCount, capacity, isEnded);
  const isFull = registeredCount >= capacity;

  const handleDelete = () => {
    Alert.alert("حذف الفعالية", `هل أنت متأكد من حذف "${event.title}"؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => {
          deleteMutation.mutate(event.id, {
            onError: (error) => {
              Alert.alert(
                "خطأ",
                error instanceof Error ? error.message : "تعذر حذف الفعالية",
              );
            },
          });
        },
      },
    ]);
  };

  return (
    <>
      <View style={styles.card}>
        <View style={[styles.accentBar, { backgroundColor: statusColor }]} />
        {imageUrl ? (
          <View style={styles.mediaWrapper}>
            <Image source={{ uri: imageUrl }} style={styles.image} />
          </View>
        ) : null}
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor + "20" },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              <Text style={styles.statusText}>
                {isEnded ? "منتهية" : isFull ? "ممتلئة" : "نشطة"}
              </Text>
            </Text>
          </View>
          <Text style={styles.cardTitle}>{event.title}</Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons
              name="location-outline"
              size={13}
              color={Colors.mutedForeground}
            />
            <Text style={styles.detailText}>{event.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="time-outline"
              size={13}
              color={Colors.mutedForeground}
            />
            <Text style={styles.detailText}>
              {formatTime(event.dateTimeUtc)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="calendar-outline"
              size={13}
              color={Colors.mutedForeground}
            />
            <Text style={styles.detailText}>
              {formatDate(event.dateTimeUtc)}
            </Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressCount, { color: statusColor }]}>
              {Math.round(progress * 100)}%
            </Text>
            <Text style={styles.progressLabel}>
              {registeredCount} / {capacity} مسجل
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: statusColor,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.viewButton}
            onPress={() => setShowRegistrations(true)}
          >
            <Ionicons
              name="eye-outline"
              size={16}
              color={Colors.mutedForeground}
            />
            <Text style={styles.viewButtonText}>عرض المسجلين</Text>
          </Pressable>

          <Pressable style={styles.editButton} onPress={() => onEdit(event)}>
            <Ionicons
              name="create-outline"
              size={16}
              color={SemanticColors.blue}
            />
          </Pressable>

          <Pressable
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <ActivityIndicator size="small" color={SemanticColors.red} />
            ) : (
              <Ionicons
                name="trash-outline"
                size={16}
                color={SemanticColors.red}
              />
            )}
          </Pressable>
        </View>
      </View>
      <Modal
        visible={showRegistrations}
        animationType="slide"
        transparent
        onRequestClose={() => setShowRegistrations(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowRegistrations(false)}>
                <Ionicons
                  name="close-outline"
                  size={24}
                  color={Colors.foreground}
                />
              </Pressable>
              <Text style={styles.modalTitle}>المسجلين — {event.title}</Text>
            </View>

            {registrationsQuery.isLoading ? (
              <View style={styles.modalCenter}>
                <ActivityIndicator size="large" color={SemanticColors.green} />
              </View>
            ) : registrationsQuery.isError ? (
              <View style={styles.modalCenter}>
                <Text style={styles.errorText}>تعذر تحميل المسجلين</Text>
              </View>
            ) : !registrationsQuery.data?.length ? (
              <View style={styles.modalCenter}>
                <Ionicons
                  name="people-outline"
                  size={40}
                  color={Colors.mutedForeground}
                />
                <Text style={styles.emptyText}>لا يوجد مسجلون بعد</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {registrationsQuery.data.map((reg) => (
                  <View key={reg.userId} style={styles.registrationRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {reg.fullName.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.registrationInfo}>
                      <Text style={styles.registrationName}>
                        {reg.fullName}
                      </Text>
                      <Text style={styles.registrationMeta}>
                        {reg.major}
                        {reg.studyYear ? ` • السنة ${reg.studyYear}` : ""}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: Dimensions.radiusCard,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  cardHeader: {
    alignItems: "flex-end",
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Dimensions.radiusFull,
  },
  statusText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  cardTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
    textAlign: "right",
  },
  details: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.xs,
  },
  detailText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    color: Colors.mutedForeground,
  },
  progressSection: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  progressCount: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  progressLabel: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    color: Colors.mutedForeground,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: Dimensions.radiusFull,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: Dimensions.radiusFull,
  },
  actions: {
    flexDirection: "row-reverse",
    gap: Spacing.sm,
  },
  viewButton: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.sm,
    borderRadius: Dimensions.radiusButton,
  },
  viewButtonText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    color: Colors.mutedForeground,
  },
  editButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SemanticColors.blue + "15",
    borderRadius: Dimensions.radiusButton,
  },
  deleteButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SemanticColors.red + "15",
    borderRadius: Dimensions.radiusButton,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: Dimensions.radiusCard,
    borderTopRightRadius: Dimensions.radiusCard,
    padding: Spacing.md,
    maxHeight: "75%",
  },
  modalHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
    flex: 1,
    textAlign: "right",
  },
  modalCenter: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    color: Colors.mutedForeground,
  },
  errorText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    color: SemanticColors.red,
  },
  registrationRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: SemanticColors.green + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  mediaWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderTopLeftRadius: Dimensions.baseRadius,
    borderTopRightRadius: Dimensions.baseRadius,
    overflow: "hidden",
    backgroundColor: Colors.secondary,
    marginBottom: Spacing.xs,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: SemanticColors.green,
  },
  registrationInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  registrationName: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
  },
  registrationMeta: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    color: Colors.mutedForeground,
  },
});
