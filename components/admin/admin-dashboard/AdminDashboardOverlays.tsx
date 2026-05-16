import { Text, View } from 'react-native';

import {
  AdminBadge,
  AdminBottomSheet,
  AdminCard,
  AdminConfirmDialog,
  AdminPrimaryButton,
  AdminSelectField,
  AdminSegmentedOptions,
  AdminSwitchRow,
  AdminTextField,
  AdminUploadField,
} from '@/components/admin/admin-primitives';
import { AdminChipGroup } from '@/components/admin/admin-entities';
import {
  adminNewsCategories,
  adminOfferCategories,
  toEnglishDigits,
} from '@/lib/admin/admin-config';
import type { AdminClubSubscriptionType, AdminOfferType, AdminRoleValue, AdminUserStatus } from '@/types/admin';

import type { AdminDashboardController } from './use-admin-dashboard-controller';
import { styles } from './styles';

type AdminDashboardOverlaysProps = {
  controller: AdminDashboardController;
};

export function AdminDashboardOverlays({ controller }: AdminDashboardOverlaysProps) {
  const {
    theme,
    universities,
    editingUser,
    userForm,
    setUserForm,
    userErrors,
    closeUserEditor,
    syncUserForm,
    showUserValidation,
    handleSaveUser,
    deletingUser,
    setDeletingUser,
    deleteUser,
    newsEditorVisible,
    editingNews,
    newsForm,
    setNewsForm,
    newsErrors,
    newsImagePreview,
    closeNewsEditor,
    syncNewsForm,
    showNewsValidation,
    handlePickNewsImage,
    handleSaveNews,
    deletingNews,
    setDeletingNews,
    deleteNews,
    roleEditorVisible,
    editingRole,
    roleForm,
    roleErrors,
    selectedRoleOption,
    roleOptions,
    roleScopes,
    closeRoleEditor,
    syncRoleForm,
    showRoleValidation,
    handleSaveRole,
    deletingRole,
    setDeletingRole,
    deleteRole,
    offerEditorVisible,
    editingOffer,
    offerForm,
    setOfferForm,
    offerErrors,
    closeOfferEditor,
    syncOfferForm,
    showOfferValidation,
    handleSaveOffer,
    deletingOffer,
    setDeletingOffer,
    deleteOffer,
    clubEditorVisible,
    editingClub,
    clubForm,
    setClubForm,
    clubErrors,
    closeClubEditor,
    syncClubForm,
    showClubValidation,
    handleSaveClub,
    deletingClub,
    setDeletingClub,
    deleteClub,
    renewingClub,
    setRenewingClub,
    renewType,
    setRenewType,
    handleRenewClub,
    getRoleOptionByValue,
  } = controller;

  return (
    <>
      <AdminBottomSheet
        theme={theme}
        visible={editingUser !== null}
        title="تعديل المستخدم"
        onClose={closeUserEditor}
      >
        <AdminTextField
          theme={theme}
          label="الاسم *"
          error={userErrors.fullName}
          value={userForm.fullName}
          onChangeText={(value: string) => {
            syncUserForm({ fullName: value });
          }}
          onBlur={showUserValidation}
          maxLength={18}
        />
        <AdminTextField
          theme={theme}
          label="البريد الإلكتروني *"
          error={userErrors.email}
          value={userForm.email}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(value: string) => {
            syncUserForm({ email: value });
          }}
          onBlur={showUserValidation}
        />
        <AdminTextField
          theme={theme}
          label="الجامعة"
          error={userErrors.universityName}
          value={userForm.universityName}
          onChangeText={(value: string) => {
            syncUserForm({ universityName: value });
          }}
          onBlur={showUserValidation}
        />
        <AdminSegmentedOptions
          theme={theme}
          value={userForm.isBlocked ? 'blocked' : 'active'}
          onChange={(value: AdminUserStatus) =>
            setUserForm((current) => ({ ...current, isBlocked: value === 'blocked' }))
          }
          options={[
            { value: 'active', label: 'نشط', accent: theme.success },
            { value: 'blocked', label: 'موقوف', accent: theme.danger },
          ]}
        />
        {universities?.length ? (
          <AdminChipGroup
            theme={theme}
            value={userForm.universityName}
            onChange={(value) => {
              const selected = universities.find((item) => item.name === value);
              syncUserForm({
                universityId: selected?.id ?? userForm.universityId,
                universityName: value,
              });
            }}
            options={universities.slice(0, 5).map((item) => item.name)}
          />
        ) : null}
        <AdminPrimaryButton
          theme={theme}
          label="حفظ التغييرات"
          icon="save-outline"
          onPress={() => void handleSaveUser()}
        />
      </AdminBottomSheet>

      <AdminBottomSheet
        theme={theme}
        visible={newsEditorVisible}
        title={editingNews ? 'تعديل الخبر' : 'خبر جديد'}
        backdropStyle={styles.roleSheetBackdrop}
        sheetStyle={styles.roleSheet}
        contentContainerStyle={styles.roleSheetContent}
        showsVerticalScrollIndicator
        onClose={closeNewsEditor}
      >
        <AdminUploadField
          theme={theme}
          imageUri={newsImagePreview}
          onPress={() => void handlePickNewsImage()}
        />
        <AdminTextField
          theme={theme}
          label="عنوان الخبر الرئيسي *"
          error={newsErrors.title}
          value={newsForm.title}
          onChangeText={(value: string) => {
            syncNewsForm({ title: value });
          }}
          onBlur={showNewsValidation}
          placeholder="مثال: تأجيل امتحانات الفصل الأول أسبوعاً"
        />
        <AdminTextField
          theme={theme}
          label="المصدر *"
          error={newsErrors.source}
          value={newsForm.source}
          onChangeText={(value: string) => {
            syncNewsForm({ source: value });
          }}
          onBlur={showNewsValidation}
          placeholder="مثال: عمادة شؤون الطلبة"
        />
        <View style={styles.fieldSection}>
          <Text style={[styles.sectionLabel, { color: theme.mutedText }]}>التصنيف</Text>
          <AdminChipGroup
            theme={theme}
            value={newsForm.category}
            onChange={(value: string) =>
              setNewsForm((current) => ({ ...current, category: value }))
            }
            options={adminNewsCategories}
          />
        </View>
        <AdminTextField
          theme={theme}
          error={newsErrors.content}
          label={`\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u062e\u0628\u0631 * ${toEnglishDigits(newsForm.content.length)}/800`}
          value={newsForm.content}
          onChangeText={(value: string) => {
            syncNewsForm({ content: value });
          }}
          onBlur={showNewsValidation}
          placeholder="اكتب تفاصيل الخبر بوضوح وإيجاز..."
          multiline
        />
        <AdminSwitchRow
          theme={theme}
          title="تمييز كخبر عاجل"
          subtitle="يرسل إشعاراً فورياً لجميع الطلبة"
          value={newsForm.isImportant}
          onValueChange={(value) =>
            setNewsForm((current) => ({ ...current, isImportant: value }))
          }
          accent={theme.danger}
        />
        <AdminSwitchRow
          theme={theme}
          title="نشر الخبر مباشرة"
          subtitle="يعرض الخبر فوراً في التطبيق"
          value={newsForm.isPublished}
          onValueChange={(value) =>
            setNewsForm((current) => ({ ...current, isPublished: value }))
          }
          accent={theme.primary}
        />
        <AdminCard theme={theme}>
          <View style={styles.previewHeader}>
            <Text style={[styles.previewHeaderText, { color: theme.primary }]}>معاينة</Text>
            {newsForm.isImportant ? (
              <AdminBadge theme={theme} label="عاجل" accent={theme.danger} />
            ) : null}
          </View>
          <Text style={[styles.previewTitle, { color: theme.heading }]}>
            {newsForm.title || 'عنوان الخبر'}
          </Text>
          <Text style={[styles.previewMeta, { color: theme.mutedText }]}>
            {`${newsForm.source || '\u0627\u0644\u0645\u0635\u062f\u0631'} - \u0627\u0644\u0622\u0646`}
          </Text>
        </AdminCard>
        <AdminPrimaryButton
          theme={theme}
          label={newsForm.isPublished ? 'نشر الخبر الآن' : 'حفظ كمسودة'}
          icon={newsForm.isPublished ? 'paper-plane-outline' : 'save-outline'}
          onPress={() => void handleSaveNews(newsForm.isPublished)}
        />
      </AdminBottomSheet>

      <AdminBottomSheet
        theme={theme}
        visible={roleEditorVisible}
        title={
          editingRole ? `\u062a\u0639\u062f\u064a\u0644 \u062f\u0648\u0631: ${editingRole.fullName}` : 'إضافة دور جديد'
        }
        backdropStyle={styles.roleSheetBackdrop}
        sheetStyle={styles.roleSheet}
        contentContainerStyle={styles.roleSheetContent}
        onClose={closeRoleEditor}
      >
        {!editingRole ? (
          <AdminTextField
            theme={theme}
            label="البريد الجامعي"
            error={roleErrors.email}
            value={roleForm.email}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(value: string) => {
              syncRoleForm({ email: value });
            }}
            onBlur={showRoleValidation}
            placeholder="example@ju.edu.jo"
          />
        ) : null}
        <AdminSegmentedOptions
          theme={theme}
          value={roleForm.role}
          onChange={(value: AdminRoleValue) => {
            syncRoleForm({
              role: value,
              scopeId: getRoleOptionByValue(value).requiresScope
                ? roleForm.scopeId ?? roleScopes[0]?.id ?? null
                : null,
            });
          }}
          columns={roleOptions.length === 3 ? 3 : 2}
          options={roleOptions.map((option) => ({
            value: option.value,
            label: option.label,
            accent: option.color,
            icon:
              option.value === 'superAdmin'
                ? 'shield-checkmark-outline'
                : option.value === 'Coordinator'
                  ? 'calendar-outline'
                  : 'shield-outline',
          }))}
        />
        {selectedRoleOption.requiresScope ? (
          <AdminSelectField
            theme={theme}
            label={selectedRoleOption.scopeLabel ?? 'الفعالية المخصصة'}
            value={String(roleForm.scopeId ?? roleScopes[0]?.id ?? '')}
            onChange={(value: string) => {
              syncRoleForm({ scopeId: Number(value) });
            }}
            options={roleScopes.map((item) => ({
              value: String(item.id),
              label: item.name,
            }))}
            placeholder="اختر الفعالية"
            accent={selectedRoleOption.color}
          />
        ) : null}
        {roleErrors.scopeId ? (
          <Text style={[styles.inlineError, { color: theme.danger }]}>
            {roleErrors.scopeId}
          </Text>
        ) : null}
        <AdminCard
          theme={theme}
          style={[
            styles.permissionsCard,
            { backgroundColor: `${selectedRoleOption.color}14` },
          ]}
        >
          <Text style={[styles.permissionsTitle, { color: selectedRoleOption.color }]}>
            الصلاحيات الممنوحة:
          </Text>
          <View style={styles.permissionsWrapLocal}>
            {selectedRoleOption.permissions.map((permission) => (
              <Text
                numberOfLines={1}
                key={permission}
                style={[
                  styles.permissionChipText,
                  {
                    color: selectedRoleOption.color,
                    backgroundColor: `${selectedRoleOption.color}12`,
                  },
                ]}
              >
                {permission}
              </Text>
            ))}
          </View>
        </AdminCard>
        <AdminPrimaryButton
          theme={theme}
          label={editingRole ? 'حفظ التغييرات' : 'تأكيد وإضافة الدور'}
          icon="save-outline"
          onPress={() => void handleSaveRole()}
        />
      </AdminBottomSheet>

      <AdminBottomSheet
        theme={theme}
        visible={offerEditorVisible}
        title={editingOffer ? 'تعديل الفعالية' : 'إضافة فعالية جديدة'}
        backdropStyle={styles.roleSheetBackdrop}
        sheetStyle={styles.roleSheet}
        contentContainerStyle={styles.roleSheetContent}
        showsVerticalScrollIndicator
        onClose={closeOfferEditor}
      >
        <AdminSegmentedOptions
          theme={theme}
          value={offerForm.type}
          onChange={(value: AdminOfferType) =>
            setOfferForm((current) => ({ ...current, type: value }))
          }
          options={[
            {
              value: 'academy',
              label: 'أكاديمية',
              accent: theme.violet,
              icon: 'school-outline',
            },
            {
              value: 'store',
              label: 'متجر',
              accent: theme.warning,
              icon: 'storefront-outline',
            },
          ]}
        />
        <AdminTextField
          theme={theme}
          label="الاسم *"
          error={offerErrors.partnerName}
          value={offerForm.partnerName}
          onChangeText={(value: string) => {
            syncOfferForm({ partnerName: value });
          }}
          onBlur={showOfferValidation}
          placeholder="اسم الأكاديمية / المتجر"
        />
        <AdminTextField
          theme={theme}
          label="التصنيف"
          value={offerForm.category}
          onChangeText={(value: string) =>
            setOfferForm((current) => ({ ...current, category: value }))
          }
        />
        <AdminChipGroup
          theme={theme}
          value={offerForm.category}
          onChange={(value: string) =>
            setOfferForm((current) => ({ ...current, category: value }))
          }
          options={adminOfferCategories}
        />
        <AdminTextField
          theme={theme}
          label="عنوان العرض *"
          error={offerErrors.title}
          value={offerForm.title}
          onChangeText={(value: string) => {
            syncOfferForm({ title: value });
          }}
          onBlur={showOfferValidation}
          placeholder="مثال: خصم %40 على دورة Flutter"
        />
        <AdminTextField
          theme={theme}
          label="تفاصيل العرض"
          error={offerErrors.description}
          value={offerForm.description}
          onChangeText={(value: string) => {
            syncOfferForm({ description: value });
          }}
          onBlur={showOfferValidation}
          placeholder="تفاصيل إضافية عن العرض..."
          multiline
        />
        <AdminTextField
          theme={theme}
          label="الموقع"
          error={offerErrors.location}
          value={offerForm.location}
          onChangeText={(value: string) => {
            syncOfferForm({ location: value });
          }}
          onBlur={showOfferValidation}
        />
        <AdminTextField
          theme={theme}
          label="رقم التواصل"
          error={offerErrors.phone}
          value={offerForm.phone}
          keyboardType="phone-pad"
          onChangeText={(value: string) => {
            syncOfferForm({ phone: value });
          }}
          onBlur={showOfferValidation}
        />
        <AdminTextField
          theme={theme}
          label="البريد الإلكتروني"
          error={offerErrors.email}
          value={offerForm.email}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(value: string) => {
            syncOfferForm({ email: value });
          }}
          onBlur={showOfferValidation}
        />
        <AdminTextField
          theme={theme}
          label="تاريخ الانتهاء"
          error={offerErrors.expireDateUtc}
          value={toEnglishDigits(offerForm.expireDateUtc)}
          onChangeText={(value: string) => {
            syncOfferForm({ expireDateUtc: value });
          }}
          onBlur={showOfferValidation}
          placeholder="YYYY-MM-DD"
        />
        <AdminTextField
          theme={theme}
          label="نسبة الخصم %"
          error={offerErrors.discountPercent}
          value={toEnglishDigits(String(offerForm.discountPercent))}
          keyboardType="numeric"
          onChangeText={(value: string) => {
            syncOfferForm({ discountPercent: Number(value || 0) });
          }}
          onBlur={showOfferValidation}
        />
        <AdminSwitchRow
          theme={theme}
          title="نشر العرض في الصفحة الرئيسية"
          subtitle="يعرض العرض في نافذة التطبيق العامة"
          value={offerForm.showOnHomePage}
          onValueChange={(value) =>
            setOfferForm((current) => ({ ...current, showOnHomePage: value }))
          }
          accent={theme.primary}
        />
        <AdminPrimaryButton
          theme={theme}
          label={
            editingOffer ? 'حفظ التغييرات' : 'نشر العرض في الصفحة الرئيسية'
          }
          icon="paper-plane-outline"
          onPress={() => void handleSaveOffer()}
        />
      </AdminBottomSheet>

      <AdminBottomSheet
        theme={theme}
        visible={clubEditorVisible}
        backdropStyle={styles.roleSheetBackdrop}
        sheetStyle={styles.roleSheet}
        contentContainerStyle={styles.roleSheetContent}
        title={editingClub ? 'تعديل النادي' : 'إضافة نادي'}
        onClose={closeClubEditor}
      >
        <AdminTextField
          theme={theme}
          label="اسم النادي *"
          error={clubErrors.name}
          value={clubForm.name}
          onChangeText={(value: string) => {
            syncClubForm({ name: value });
          }}
          onBlur={showClubValidation}
          placeholder="مثال: نادي البرمجة"
        />
        <AdminTextField
          theme={theme}
          label="الجامعة"
          error={clubErrors.universityName}
          value={clubForm.universityName}
          onChangeText={(value: string) => {
            syncClubForm({ universityName: value });
          }}
          onBlur={showClubValidation}
        />
        <AdminTextField
          theme={theme}
          label="اسم المسؤول"
          error={clubErrors.managerName}
          value={clubForm.managerName}
          onChangeText={(value: string) => {
            syncClubForm({ managerName: value });
          }}
          onBlur={showClubValidation}
          maxLength={18}
        />
        <AdminTextField
          theme={theme}
          label="البريد الإلكتروني"
          error={clubErrors.managerEmail}
          value={clubForm.managerEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(value: string) => {
            syncClubForm({ managerEmail: value });
          }}
          onBlur={showClubValidation}
        />
        <View style={styles.fieldSection}>
          <Text style={[styles.sectionLabel, { color: theme.mutedText }]}>
            نوع الاشتراك
          </Text>
          <AdminSegmentedOptions
            theme={theme}
            value={clubForm.subscriptionType}
            onChange={(value: AdminClubSubscriptionType) =>
              setClubForm((current) => ({ ...current, subscriptionType: value }))
            }
            options={[
              { value: 'monthly', label: 'شهري - 15 شيقل', accent: theme.primary },
              { value: 'yearly', label: 'سنوي - 120 شيقل', accent: theme.primary },
            ]}
          />
        </View>
        <AdminPrimaryButton
          theme={theme}
          label={editingClub ? 'حفظ التغييرات' : 'إضافة وتفعيل الاشتراك'}
          icon="save-outline"
          onPress={() => void handleSaveClub()}
        />
      </AdminBottomSheet>

      <AdminConfirmDialog
        theme={theme}
        visible={deletingUser !== null}
        icon="trash-outline"
        accent={theme.danger}
        title="حذف المستخدم"
        subtitle={deletingUser?.fullName}
        description="هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="نعم، احذف"
        onConfirm={() => {
          if (deletingUser) {
            void deleteUser(deletingUser);
          }
          setDeletingUser(null);
        }}
        onCancel={() => setDeletingUser(null)}
      />
      <AdminConfirmDialog
        theme={theme}
        visible={deletingNews !== null}
        icon="trash-outline"
        accent={theme.danger}
        title="حذف الخبر"
        subtitle={deletingNews?.title}
        description="هل أنت متأكد من حذف هذا الخبر؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="نعم، احذف"
        onConfirm={() => {
          if (deletingNews) {
            void deleteNews(deletingNews);
          }
          setDeletingNews(null);
        }}
        onCancel={() => setDeletingNews(null)}
      />
      <AdminConfirmDialog
        theme={theme}
        visible={deletingRole !== null}
        icon="trash-outline"
        accent={theme.danger}
        title="إلغاء الدور"
        description="هل أنت متأكد من إلغاء دور هذا المستخدم؟ سيفقد جميع الصلاحيات الممنوحة له."
        confirmLabel="نعم، إلغاء الدور"
        onConfirm={() => {
          if (deletingRole) {
            void deleteRole(deletingRole);
          }
          setDeletingRole(null);
        }}
        onCancel={() => setDeletingRole(null)}
      />
      <AdminConfirmDialog
        theme={theme}
        visible={deletingOffer !== null}
        icon="trash-outline"
        accent={theme.danger}
        title="حذف العرض"
        subtitle={deletingOffer?.title}
        description="هل أنت متأكد من حذف هذا العرض؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="نعم، احذف"
        onConfirm={() => {
          if (deletingOffer) {
            void deleteOffer(deletingOffer);
          }
          setDeletingOffer(null);
        }}
        onCancel={() => setDeletingOffer(null)}
      />
      <AdminConfirmDialog
        theme={theme}
        visible={deletingClub !== null}
        icon="trash-outline"
        accent={theme.danger}
        title="حذف النادي"
        subtitle={deletingClub?.name}
        description="هل أنت متأكد من حذف هذا النادي؟ سيتم إلغاء الاشتراك المرتبط به نهائياً."
        confirmLabel="نعم، احذف"
        onConfirm={() => {
          if (deletingClub) {
            void deleteClub(deletingClub);
          }
          setDeletingClub(null);
        }}
        onCancel={() => setDeletingClub(null)}
      />
      <AdminConfirmDialog
        theme={theme}
        visible={renewingClub !== null}
        icon="refresh-outline"
        accent={theme.primary}
        title="تجديد الاشتراك"
        subtitle={renewingClub?.name}
        subtitleColor={theme.primary}
        description="سيتم تمديد الاشتراك بحسب الخطة المختارة."
        confirmLabel="تأكيد التجديد"
        confirmTone="primary"
        onConfirm={() => void handleRenewClub()}
        onCancel={() => setRenewingClub(null)}
      />
      {renewingClub ? (
        <View style={styles.renewFloating}>
          <AdminCard theme={theme}>
            <Text style={[styles.renewLabel, { color: theme.mutedText }]}>
              اختر خطة التجديد
            </Text>
            <AdminSegmentedOptions
              theme={theme}
              value={renewType}
              onChange={setRenewType}
              options={[
                { value: 'monthly', label: 'شهري - 15 شيقل', accent: theme.primary },
                { value: 'yearly', label: 'سنوي - 120 شيقل', accent: theme.primary },
              ]}
            />
          </AdminCard>
        </View>
      ) : null}
    </>
  );
}
