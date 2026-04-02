import { SettingsRow } from './SettingsRow';
import { SettingsSection } from './SettingsSection';
import { SemanticColors } from '@/styles/ui-theme';

type SettingsAccountSectionProps = {
  onEditProfile: () => void;
  onChangeUniversity: () => void;
};

export function SettingsAccountSection({
  onEditProfile,
  onChangeUniversity,
}: SettingsAccountSectionProps) {
  return (
    <SettingsSection title="الحساب">
      <SettingsRow
        icon="person-outline"
        iconBackgroundColor={SemanticColors.blue}
        title="تعديل الملف الشخصي"
        onPress={onEditProfile}
      />
      <SettingsRow
        icon="globe-outline"
        iconBackgroundColor={SemanticColors.lightBlue}
        title="تغيير الجامعة"
        onPress={onChangeUniversity}
      />
      <SettingsRow
        icon="information-circle-outline"
        iconBackgroundColor="#8e8e93"
        title="عن التطبيق"
        description="كلشي بجامعتنا • الإصدار 1.0.0"
        showChevron={false}
      />
    </SettingsSection>
  );
}
