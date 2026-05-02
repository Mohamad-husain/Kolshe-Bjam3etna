import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
} from "@/styles/ui-theme";
import { ProfileActionChip } from "./profile-action-chip";
import { ProfileStatCard } from "./profile-stat-card";

type ProfileHeroProps = {
  topInset: number;
  summary: {
    fullName: string;
    major: string;
    universityName: string;
    studyYear: string;
    detailText: string;
    profileImageUri: string | null;
    avatarInitial: string;
    avatarColor: string;
  };
  onOpenExploreTab: (
    tab: "services" | "marketplace" | "exchange" | "events",
  ) => void;
  showAdminAction?: boolean;
  onOpenAdmin: () => void;
  onOpenSettings: () => void;
  onEditProfile: () => void;
  onOpenCoordinator: () => void;
};

export function ProfileHero({
  topInset,
  summary,
  showAdminAction = false,
  onOpenAdmin,
  onOpenSettings,
  onEditProfile,
  onOpenCoordinator,
}: ProfileHeroProps) {
  return (
    <>
      <View style={styles.hero}>
        <View style={styles.heroGlowPrimary} />
        <View style={styles.heroGlowSecondary} />
        <View style={styles.heroGlowTertiary} />
        <View style={styles.heroDotOne} />
        <View style={styles.heroDotTwo} />
        <View style={styles.heroDotThree} />

        <View style={[styles.heroActions, { paddingTop: topInset + 4 }]}>
          <ProfileActionChip
            label="الفعاليات"
            icon="calendar-outline"
            onPress={() => onOpenCoordinator()}
          />
          {showAdminAction ? (
            <ProfileActionChip
              label="الإدارة"
              icon="shield-checkmark-outline"
              onPress={onOpenAdmin}
            />
          ) : null}
          <Pressable
            onPress={onOpenSettings}
            style={({ pressed }) => [
              styles.circleIconButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="settings-outline" size={18} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      <View style={styles.profileCardWrap}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarShell}>
                {summary.profileImageUri ? (
                  <Image
                    source={{ uri: summary.profileImageUri }}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.avatarFallback,
                      { backgroundColor: `${summary.avatarColor}20` },
                    ]}
                  >
                    <Ionicons
                      name="person-outline"
                      size={44}
                      color="rgba(134, 142, 160, 0.82)"
                    />
                  </View>
                )}
              </View>

              <View style={styles.onlineDot}>
                {summary.profileImageUri ? null : (
                  <Text style={styles.onlineInitial}>
                    {summary.avatarInitial}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.nameText}>{summary.fullName}</Text>
              <Text style={styles.roleText}>{summary.major}</Text>

              <View style={styles.infoRows}>
                <View style={styles.infoLine}>
                  <Ionicons
                    name="star-outline"
                    size={13}
                    color={Colors.mutedForeground}
                  />
                  <Text style={styles.infoText}>{summary.universityName}</Text>
                </View>
                <View style={styles.infoLine}>
                  <Ionicons
                    name="location-outline"
                    size={13}
                    color={Colors.mutedForeground}
                  />
                  <Text style={styles.infoText}>
                    {summary.studyYear} • {summary.detailText}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.profileDivider} />

          <View style={styles.statsRow}>
            <ProfileStatCard label="المبيعات" value="5" />
            <ProfileStatCard label="المهام" value="12" />
            <ProfileStatCard label="التقييم" value="4.9" highlight />
          </View>

          <Pressable
            onPress={onEditProfile}
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="create-outline" size={17} color={Colors.primary} />
            <Text style={styles.editButtonText}>تعديل الملف الشخصي</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 210,
    backgroundColor: Colors.primary,
    overflow: "hidden",
  },
  heroGlowPrimary: {
    position: "absolute",
    top: -90,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  heroGlowSecondary: {
    position: "absolute",
    bottom: -120,
    left: -36,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  heroGlowTertiary: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  heroDotOne: {
    position: "absolute",
    top: 58,
    left: 38,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  heroDotTwo: {
    position: "absolute",
    top: 92,
    left: 120,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  heroDotThree: {
    position: "absolute",
    top: 42,
    right: 44,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  heroActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
  },
  circleIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  profileCardWrap: {
    marginTop: -78,
    paddingHorizontal: 18,
  },
  profileCard: {
    borderRadius: 34,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "rgba(60,60,67,0.06)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 8,
  },
  profileHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 16,
  },
  avatarWrap: {
    width: 108,
    height: 108,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarShell: {
    width: 98,
    height: 98,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(37,99,235,0.09)",
    shadowColor: "#93c5fd",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 3,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    position: "absolute",
    bottom: 8,
    left: 6,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SemanticColors.green,
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  onlineInitial: {
    color: "#ffffff",
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xxs,
    fontWeight: FontWeight.bold,
  },
  profileInfo: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  nameText: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: 17,
    fontWeight: FontWeight.extrabold,
    textAlign: "right",
  },
  roleText: {
    marginTop: 4,
    color: Colors.primary,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textAlign: "right",
  },
  infoRows: {
    marginTop: 8,
    alignItems: "flex-end",
    gap: 4,
  },
  infoLine: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    color: Colors.mutedForeground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.x11,
    fontWeight: FontWeight.medium,
    textAlign: "right",
  },
  profileDivider: {
    height: 1,
    marginVertical: 18,
    backgroundColor: "rgba(60,60,67,0.08)",
  },
  statsRow: {
    flexDirection: "row-reverse",
    gap: 10,
  },
  editButton: {
    minHeight: 44,
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: "rgba(37,99,235,0.10)",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  editButtonText: {
    color: Colors.primary,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
