import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';
import { useEditProfileScreen } from '@/hooks/edit-profile/use-edit-profile-screen';
import { useAdminEditProfileTheme } from '@/lib/edit-profile/edit-profile-theme';
import { getEditProfileErrorMessage } from '@/lib/edit-profile/edit-profile-utils';
import { FontFamily, FontWeight } from '@/styles/ui-theme';

import { EditProfileHero } from './EditProfileHero';
import { EditProfileInfoBanner } from './EditProfileInfoBanner';
import { EditProfileTabs } from './EditProfileTabs';
import { EditProfileToastBanner } from './EditProfileToast';
import { AcademicInfoSection } from './sections/AcademicInfoSection';
import { PersonalInfoSection } from './sections/PersonalInfoSection';
import { SecuritySection } from './sections/SecuritySection';

export function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tab?: string }>();
  const theme = useAdminEditProfileTheme();
  const { user, signIn } = useAuth();
  const editProfile = useEditProfileScreen({
    requestedTab: params.tab,
    signIn,
    user,
  });
  const { form } = editProfile;
  const { errors } = form.formState;

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.heroBackground }]}
      edges={['top']}
    >
      <StatusBar style="light" />

      <View style={[styles.container, { backgroundColor: theme.pageBackground }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoider}
        >
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            <EditProfileHero
              avatarUri={editProfile.currentAvatarUri}
              isSaving={editProfile.isSaving}
              onBack={editProfile.handleGoBack}
              onPickImage={() => {
                void editProfile.handlePickImage();
              }}
              onSave={editProfile.handleSaveActiveTab}
              theme={theme}
              topInset={insets.top}
            />

            <View style={[styles.body, { backgroundColor: theme.pageBackground }]}>
              <View style={styles.tabsWrap}>
                <EditProfileTabs
                  activeTab={editProfile.activeTab}
                  onChange={editProfile.handleTabChange}
                  theme={theme}
                />
              </View>

              <View style={styles.section}>
                {editProfile.profileQuery.isError ? (
                  <EditProfileInfoBanner
                    text={getEditProfileErrorMessage(
                      editProfile.profileQuery.error,
                      'تعذر تحميل بيانات الملف حالياً.',
                    )}
                    theme={theme}
                    tone="error"
                  />
                ) : null}

                {editProfile.activeTab === 'personal' ? (
                  <PersonalInfoSection
                    bioLength={editProfile.watchedBioLength}
                    control={form.control}
                    errors={errors}
                    onDirty={editProfile.clearSavedState}
                    profileImageError={errors.profileImage?.message}
                    theme={theme}
                  />
                ) : null}

                {editProfile.activeTab === 'academic' ? (
                  <AcademicInfoSection
                    control={form.control}
                    errors={errors}
                    isUniversitiesLoading={editProfile.universitiesQuery.isLoading}
                    majorOptions={editProfile.majorOptions}
                    onCloseSelects={editProfile.closeSelects}
                    onDirty={editProfile.clearSavedState}
                    onToggleSelect={editProfile.toggleSelect}
                    openSelect={editProfile.openSelect}
                    setValue={form.setValue}
                    theme={theme}
                    universities={editProfile.universities}
                    universityOptions={editProfile.universityOptions}
                  />
                ) : null}

                {editProfile.activeTab === 'security' ? (
                  <SecuritySection
                    control={form.control}
                    errors={errors}
                    getValues={form.getValues}
                    hasPasswordInput={editProfile.hasPasswordInput}
                    onDirty={editProfile.clearSavedState}
                    theme={theme}
                    visibility={editProfile.securityVisibility}
                  />
                ) : null}

                <Pressable
                  disabled={editProfile.isSaving}
                  onPress={editProfile.handleSaveActiveTab}
                  style={(state) => {
                    const hovered = (state as { hovered?: boolean }).hovered === true;

                    return [
                      styles.saveButton,
                      {
                        backgroundColor: editProfile.isSaving
                          ? theme.primaryPressed
                          : theme.primary,
                        shadowColor: theme.primary,
                      },
                      hovered && !editProfile.isSaving && styles.hovered,
                      state.pressed && !editProfile.isSaving && styles.pressed,
                    ];
                  }}
                >
                  <Text style={styles.saveButtonText}>{editProfile.buttonLabel}</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <EditProfileToastBanner
          bottomInset={insets.bottom}
          theme={theme}
          toast={editProfile.toast}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardAvoider: {
    flex: 1,
  },
  content: {
    backgroundColor: 'transparent',
  },
  body: {
    flex: 1,
    marginTop: -2,
  },
  tabsWrap: {
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  section: {
    gap: 18,
    paddingHorizontal: 24,
    paddingTop: 22,
  },
  saveButton: {
    minHeight: 70,
    borderRadius: 24,
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
    elevation: 7,
  },
  saveButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontFamily: FontFamily.cairo,
    fontSize: 18,
    fontWeight: FontWeight.bold,
  },
  hovered: {
    opacity: 0.94,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
});
