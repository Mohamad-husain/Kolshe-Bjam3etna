export const adminAccessText = {
  accessOnlyTitle: 'هذه الصفحة مخصصة للإدارة فقط',
  accessOnlyMessage:
    'الحساب الحالي لا يحمل صلاحية إدارة داخل الجلسة الحالية. إذا تمت إضافتك كمسؤول مؤخرًا، سجّل الخروج ثم الدخول مرة أخرى لتحديث التوكن.',
  openDashboardFailed: 'تعذر فتح لوحة الإدارة',
  panelLabel: 'لوحة الإدارة',
  backToProfile: 'العودة إلى الملف الشخصي',
  noAccessError: 'لا تملك صلاحية الوصول إلى لوحة الإدارة',
};

export const adminValidationText = {
  user: 'يرجى تصحيح بيانات المستخدم أولاً',
  news: 'يرجى تصحيح بيانات الخبر أولاً',
  role: 'يرجى تصحيح بيانات الدور أولاً',
  offer: 'يرجى تصحيح بيانات العرض أولاً',
  club: 'يرجى تصحيح بيانات النادي أولاً',
};

export const adminActionText = {
  updateUser: 'تم تحديث بيانات المستخدم',
  updateUserError: 'تعذر تحديث المستخدم',
  deleteUser: 'تم حذف المستخدم',
  deleteUserError: 'تعذر حذف المستخدم',
  toggleUserStatusError: 'تعذر تعديل حالة المستخدم',
  syncEditNewsWarning: 'جاري مزامنة الخبر، حاول تعديل الخبر مرة أخرى بعد لحظات',
  updateNews: 'تم تحديث الخبر',
  publishNewsSuccess: 'تم نشر الخبر بنجاح',
  saveNewsDraft: 'تم حفظ الخبر كمسودة',
  saveNewsError: 'تعذر حفظ الخبر',
  syncDeleteNewsWarning: 'جاري مزامنة الخبر، حاول حذفه مرة أخرى بعد لحظات',
  deleteNews: 'تم حذف الخبر',
  deleteNewsError: 'تعذر حذف الخبر',
  updateRole: 'تم تحديث الدور',
  createRole: 'تمت إضافة الدور',
  saveRoleError: 'تعذر حفظ الدور',
  deleteRole: 'تم إلغاء الدور',
  deleteRoleError: 'تعذر إلغاء الدور',
  updateOffer: 'تم تحديث العرض بنجاح',
  createOffer: 'تمت إضافة العرض بنجاح',
  saveOfferError: 'تعذر حفظ العرض',
  deleteOffer: 'تم حذف العرض',
  deleteOfferError: 'تعذر حذف العرض',
  updateClub: 'تم تحديث بيانات النادي',
  createClub: 'تمت إضافة النادي',
  saveClubError: 'تعذر حفظ النادي',
  deleteClub: 'تم حذف النادي',
  deleteClubError: 'تعذر حذف النادي',
  renewClub: (clubName: string) => `تم تجديد اشتراك ${clubName}`,
  renewClubError: 'تعذر تجديد الاشتراك',
};

export const adminCopy = {
  priceMonthly: '15 د.ا',
  priceYearly: '120 د.ا',
  adminAvatarFallback: 'ع',
  clubAvatarFallback: 'ن',
};
