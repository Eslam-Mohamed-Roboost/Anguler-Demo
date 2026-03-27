export type Lang = 'en' | 'ar';

export const TRANSLATIONS = {
  en: {
    // ── Navbar ────────────────────────────────────────────────────────────
    'nav.signIn': 'Sign In',
    'nav.joinUs': 'Join Us Now',
    'nav.tripsHistory': 'Trips History',
    'nav.langAriaLabel': 'Switch to Arabic',
    'nav.mainNavAriaLabel': 'Main navigation',
    'nav.phoneNotificationsAriaLabel': 'Phone notifications',
    'nav.bellNotificationsAriaLabel': 'Bell notifications',
    'nav.myProfile': 'My Profile',
    'nav.financialReports': 'Financial Reports',
    'nav.logout': 'Logout',

    // ── Booking form ──────────────────────────────────────────────────────
    'form.dropOff': 'Drop off Location',
    'form.chooseDest': 'Choose Your Destination',
    'form.clientName': 'Client Name',
    'form.clientNamePlaceholder': 'ex: Hesham Mousa',
    'form.roomNo': 'Room No.',
    'form.roomNoPlaceholder': 'ex: 24',
    'form.manyBags': 'Many bags, or more than 4 people',
    'form.chooseCar': 'Choose Your Car',
    'form.bookNow': 'Book Your Ride Now',
    'form.schedule': 'Schedule Your Ride',

    // ── Contact ───────────────────────────────────────────────────────────
    'contact.title': 'Contact Us',
    'contact.gmail': 'Gmail',
    'contact.whatsapp': 'Whatsapp',

    // ── Join Us modal ─────────────────────────────────────────────────────
    'join.title': 'Join Us Now',
    'join.info': 'Join us today to start earning commissions ( 2% ) on every ride you book for your guests. More bookings, more rewards.',
    'join.hotelName': 'Hotel Name',
    'join.hotelNamePlaceholder': 'Put Hotel Name here',
    'join.city': 'City',
    'join.cityPlaceholder': 'Select city',
    'join.address': 'Address',
    'join.addressPlaceholder': 'Put Hotel location link here or type it in details',
    'join.phone': 'Hotel Phone Number',
    'join.phonePlaceholder': 'Put Hotel Phone Number here',
    'join.email': 'Hotel Email',
    'join.emailPlaceholder': 'example@gmail.com',
    'join.password': 'Password',
    'join.passwordPlaceholder': 'Enter your password',
    'join.changePhoto': 'Change photo',
    'join.next': 'Next',
    'join.back': 'Back',

    // ── Withdrawal (join flow) ────────────────────────────────────────────
    'withdrawal.title': 'Withdrawal Details',
    'withdrawal.warning': 'Secure your payouts. Add your details to receive your 2% commissions automatically on the 1st of every month via our encrypted system.',
    'withdrawal.accountHolder': 'Account Holder Name',
    'withdrawal.accountHolderPlaceholder': 'Put Account Holder Name',
    'withdrawal.bankName': 'Bank Name',
    'withdrawal.bankNamePlaceholder': 'Select bank',
    'withdrawal.iban': 'IBAN',
    'withdrawal.ibanPlaceholder': 'Put Your IBAN here',
    'withdrawal.swiftCode': 'Swift Code / BIC',
    'withdrawal.swiftCodePlaceholder': 'Put Your Swift Code here',
    'withdrawal.registering': 'Registering...',
    'withdrawal.joinNow': 'Join Us Now',

    // ── Sign In modal ─────────────────────────────────────────────────────
    'signIn.title': 'Welcome Again!',
    'signIn.email': 'Hotel Email',
    'signIn.password': 'Password',
    'signIn.passwordPlaceholder': 'Type Your Password',
    'signIn.forgotPassword': 'Forget Your Password ?',
    'signIn.loading': 'Signing In...',
    'signIn.button': 'Sign In',

    // ── Forgot Password modal ─────────────────────────────────────────────
    'forgotPassword.title': 'Forget Password ?',
    'forgotPassword.subtitle': 'Enter your email to receive reset instructions.',
    'forgotPassword.goBack': 'Go Back',
    'forgotPassword.sendCode': 'Send Code',
    'forgotPassword.sending': 'Sending...',

    // ── Verification modal ────────────────────────────────────────────────
    'verification.title': 'Enter Verification Code',
    'verification.subtitle': 'We have sent a code to your hotel mail',
    'verification.label': 'Enter Verification Code',
    'verification.noCode': "Didn't receive any code?",
    'verification.resend': 'Resend code',
    'verification.goBack': 'Go Back',
    'verification.sendCode': 'Verify',
    'verification.verifying': 'Verifying...',
    'resetPassword.title': 'Reset Password',
    'resetPassword.subtitle': 'Enter your new password below.',
    'resetPassword.newPassword': 'New Password',
    'resetPassword.newPasswordPlaceholder': 'Enter new password',
    'resetPassword.confirmPassword': 'Confirm Password',
    'resetPassword.confirmPasswordPlaceholder': 'Confirm new password',
    'resetPassword.submit': 'Reset Password',
    'resetPassword.submitting': 'Resetting...',

    // ── Welcome modal ─────────────────────────────────────────────────────
    'welcome.title': 'Welcome Aboard!',
    'welcome.subtitle': 'Your Hotel Account Is Ready',
    'welcome.desc': 'Your account has been successfully created, thank you for joining our partner network.',
    'welcome.gotIt': 'Got it!',

    // ── Booking Confirmation modal ────────────────────────────────────────
    'confirm.title': 'Booking Confirmation',
    'confirm.dropOff': 'Drop Off Location',
    'confirm.chooseDest': 'Choose Your Destination',
    'confirm.clientName': 'Client Name',
    'confirm.roomNo': 'Room No.',
    'confirm.manyBags': 'Many bags, or More than 4 people',
    'confirm.tripCost': 'Trip Cost',
    'confirm.tripDuration': 'Trip Duration',
    'confirm.vehicle': 'Vehicle Type',
    'confirm.creating': 'Sending Request...',
    'confirm.button': 'Confirm Booking & Send Request',
    'confirm.goBack': 'Go Back',
    'common.yes': 'Yes',
    'common.no': 'No',

    // ── Ride Request Sent modal ───────────────────────────────────────────
    'rideSent.title': 'Ride Request Sent!',
    'rideSent.desc': "Your request has been successfully dispatched to drivers. We're finding you a driver and expect your ride to be accepted shortly.",
    'rideSent.gotIt': 'Got it!',
    'rideSent.viewDetails': 'View My Ride Details',

    // ── Pickup Time modal ─────────────────────────────────────────────────
    'pickup.title': 'Choose Pickup Time',
    'pickup.schedule': 'Schedule',
    'pickup.goBack': 'Go Back',

    // ── Scheduled Ride modal ──────────────────────────────────────────────
    'scheduled.title': 'Ride Scheduled & Dispatched',
    'scheduled.desc': 'Done! Your trip is successfully scheduled and dispatched to drivers. A driver will confirm and arrive precisely at your selected time.',
    'scheduled.gotIt': 'Got it!',
    'scheduled.viewDetails': 'View My Ride Details',

    // ── Common ────────────────────────────────────────────────────────────
    'common.close': 'Close dialog',

    // ── Shared table / list ───────────────────────────────────────────────
    'Search': 'Search',
    'Export': 'Export',
    'filter.Filter': 'Filter',
    'filter.ClearSort': 'Clear Sort',
    'shared.pagination.label': 'Pagination navigation',
    'shared.pagination.prev': 'Previous page',
    'shared.pagination.next': 'Next page',
    'shared.pagination.current': 'current page',

    // table column headers
    'TripID': 'Trip ID',
    'Driver': 'Driver',
    'Guest': 'Guest',
    'Guest Name': 'Guest Name',
    'Room No.': 'Room No.',
    'Route': 'Route',
    'Status': 'Status',
    'Duration': 'Duration',
    'Fare': 'Fare',
    'Start.End.Date': 'Start / End Date',
    'Trip.Profit': 'Trip Profit (2%)',
    'Commulative.Profit': 'Cumulative Profit',
    'Actions': 'Actions',

    // units
    'unit.min': 'min',
    'unit.km': 'km',
    'riderHistory.commission': 'Comm.',
    'riderHistory.viewDetails': 'View trip details',

    // ── Financial History page ────────────────────────────────────────────
    'financial.Payouts': 'Your Payouts are scheduled on the 1st of every month. Payments are completed within 3 business days from the scheduling date. Your Commission ( 2% ) for each trip.',
    'financial.FinancialHistory': 'Financial History',
    'riderHistory.title': 'Trips History',

    // ── Trip Details page ─────────────────────────────────────────────────
    'tripDetails.title': 'Trip Details',
    'tripDetails.tripId': 'Trip ID',
    'tripDetails.passenger': 'Passenger Name',
    'tripDetails.fare': 'Fare',
    'tripDetails.driver': 'Driver',
    'tripDetails.startDate': 'Start Date',
    'tripDetails.endDate': 'End Date',
    'tripDetails.destinations': 'Destinations',
    'tripDetails.payment': 'Payment',
    'tripDetails.carType': 'Car Type',
    'tripDetails.hotel': 'Hotel',
    'tripDetails.driverProfit': 'Driver Profit',
    'tripDetails.appProfit': 'App Profit',
    'tripDetails.duration': 'Duration & Distance',

    // ── Profile page ──────────────────────────────────────────────────────
    'profile.hotelInfo': 'Hotel Info.',
    'profile.password': 'Password',
    'profile.withdrawalDetails': 'Withdrawal Details',
    'profile.name': 'Name',
    'profile.city': 'City',
    'profile.address': 'Address',
    'profile.phone': 'Hotel Phone Number',
    'profile.email': 'Hotel Email',
    'profile.editDetails': 'Edit Hotel Details',
    'profile.updatePassword': 'Update Password',
    'profile.updateDetails': 'Update Details',
    'profile.currentPassword': 'Current Password',
    'profile.newPassword': 'New Password',
    'profile.confirmPassword': 'Confirm New Password',
    'profile.currentPasswordPlaceholder': 'Enter current password',
    'profile.newPasswordPlaceholder': 'Enter new password',
    'profile.confirmPasswordPlaceholder': 'Confirm new password',
    'profile.accountNumber': 'Account Number',
    'profile.swiftCode': 'SWIFT Code',

    // ── Message Panel ─────────────────────────────────────────────────────
    'messages.title': 'Messages',
    'messages.unread': 'Unread',
    'messages.read': 'Read',
    'messages.empty': 'No messages',
    'messages.emptyDesc': "You don't have any messages at the moment.",
    'messages.closeAriaLabel': 'Close message panel',

    // ── Billing / Notifications Panel ─────────────────────────────────────
    'billing.title': 'Notifications',
    'billing.empty': 'No billing items',
    'billing.emptyDesc': "You don't have any invoices or bills at the moment.",
    'billing.closeAriaLabel': 'Close billing panel',

    // ── Hotel Details page ────────────────────────────────────────────────
    'hotelDetails.retry': 'Retry',
    'hotelDetails.title': 'Hotel Integration',
    'hotelDetails.payoutInfo': 'Monthly payouts: Scheduled for the 1st. Deadline for completion is 3 business days.',
  },

  ar: {
    // ── Navbar ────────────────────────────────────────────────────────────
    'nav.signIn': 'تسجيل الدخول',
    'nav.joinUs': 'انضم إلينا الآن',
    'nav.tripsHistory': 'سجل الرحلات',
    'nav.langAriaLabel': 'Switch to English',
    'nav.mainNavAriaLabel': 'التنقل الرئيسي',
    'nav.phoneNotificationsAriaLabel': 'إشعارات الهاتف',
    'nav.bellNotificationsAriaLabel': 'إشعارات الجرس',
    'nav.myProfile': 'ملفي الشخصي',
    'nav.financialReports': 'التقارير المالية',
    'nav.logout': 'تسجيل الخروج',

    // ── Booking form ──────────────────────────────────────────────────────
    'form.dropOff': 'موقع التوصيل',
    'form.chooseDest': 'اختر وجهتك',
    'form.clientName': 'اسم العميل',
    'form.clientNamePlaceholder': 'مثال: هشام موسى',
    'form.roomNo': 'رقم الغرفة',
    'form.roomNoPlaceholder': 'مثال: 24',
    'form.manyBags': 'حقائب كثيرة، أو أكثر من 4 أشخاص',
    'form.chooseCar': 'اختر سيارتك',
    'form.bookNow': 'احجز رحلتك الآن',
    'form.schedule': 'جدول رحلتك',

    // ── Contact ───────────────────────────────────────────────────────────
    'contact.title': 'تواصل معنا',
    'contact.gmail': 'Gmail',
    'contact.whatsapp': 'واتساب',

    // ── Join Us modal ─────────────────────────────────────────────────────
    'join.title': 'انضم إلينا الآن',
    'join.info': 'انضم إلينا اليوم وابدأ في كسب العمولات ( 2% ) على كل رحلة تحجزها لضيوفك. المزيد من الحجوزات، المزيد من المكافآت.',
    'join.hotelName': 'اسم الفندق',
    'join.hotelNamePlaceholder': 'أدخل اسم الفندق هنا',
    'join.city': 'المدينة',
    'join.cityPlaceholder': 'اختر المدينة',
    'join.address': 'العنوان',
    'join.addressPlaceholder': 'أدخل رابط موقع الفندق أو اكتبه بالتفصيل',
    'join.phone': 'رقم هاتف الفندق',
    'join.phonePlaceholder': 'أدخل رقم هاتف الفندق هنا',
    'join.email': 'البريد الإلكتروني للفندق',
    'join.emailPlaceholder': 'example@gmail.com',
    'join.password': 'كلمة المرور',
    'join.passwordPlaceholder': 'أدخل كلمة المرور',
    'join.changePhoto': 'تغيير الصورة',
    'join.next': 'التالي',
    'join.back': 'رجوع',

    // ── Withdrawal (join flow) ────────────────────────────────────────────
    'withdrawal.title': 'تفاصيل السحب',
    'withdrawal.warning': 'أمّن مدفوعاتك. أضف بياناتك لتلقي عمولاتك البالغة 2% تلقائياً في الأول من كل شهر عبر نظامنا المشفر.',
    'withdrawal.accountHolder': 'اسم صاحب الحساب',
    'withdrawal.accountHolderPlaceholder': 'أدخل اسم صاحب الحساب',
    'withdrawal.bankName': 'اسم البنك',
    'withdrawal.bankNamePlaceholder': 'اختر البنك',
    'withdrawal.iban': 'IBAN',
    'withdrawal.ibanPlaceholder': 'أدخل رقم IBAN الخاص بك هنا',
    'withdrawal.swiftCode': 'Swift Code / BIC',
    'withdrawal.swiftCodePlaceholder': 'أدخل رمز Swift الخاص بك هنا',
    'withdrawal.registering': 'جارٍ التسجيل...',
    'withdrawal.joinNow': 'انضم إلينا الآن',

    // ── Sign In modal ─────────────────────────────────────────────────────
    'signIn.title': 'أهلاً بعودتك!',
    'signIn.email': 'البريد الإلكتروني للفندق',
    'signIn.password': 'كلمة المرور',
    'signIn.passwordPlaceholder': 'أدخل كلمة المرور',
    'signIn.forgotPassword': 'نسيت كلمة المرور؟',
    'signIn.loading': 'جارٍ تسجيل الدخول...',
    'signIn.button': 'تسجيل الدخول',

    // ── Forgot Password modal ─────────────────────────────────────────────
    'forgotPassword.title': 'نسيت كلمة المرور؟',
    'forgotPassword.subtitle': 'أدخل بريدك الإلكتروني لاستقبال تعليمات الإعادة.',
    'forgotPassword.goBack': 'العودة',
    'forgotPassword.sendCode': 'إرسال الرمز',
    'forgotPassword.sending': 'جارٍ الإرسال...',

    // ── Verification modal ────────────────────────────────────────────────
    'verification.title': 'أدخل رمز التحقق',
    'verification.subtitle': 'لقد أرسلنا رمزاً إلى بريد فندقك',
    'verification.label': 'أدخل رمز التحقق',
    'verification.noCode': 'لم تستلم أي رمز؟',
    'verification.resend': 'إعادة إرسال الرمز',
    'verification.goBack': 'العودة',
    'verification.sendCode': 'تحقق',
    'verification.verifying': 'جارٍ التحقق...',
    'resetPassword.title': 'إعادة تعيين كلمة المرور',
    'resetPassword.subtitle': 'أدخل كلمة المرور الجديدة أدناه.',
    'resetPassword.newPassword': 'كلمة المرور الجديدة',
    'resetPassword.newPasswordPlaceholder': 'أدخل كلمة المرور الجديدة',
    'resetPassword.confirmPassword': 'تأكيد كلمة المرور',
    'resetPassword.confirmPasswordPlaceholder': 'أكد كلمة المرور الجديدة',
    'resetPassword.submit': 'إعادة تعيين كلمة المرور',
    'resetPassword.submitting': 'جارٍ الإعادة...',

    // ── Welcome modal ─────────────────────────────────────────────────────
    'welcome.title': 'أهلاً بك!',
    'welcome.subtitle': 'حساب فندقك جاهز',
    'welcome.desc': 'تم إنشاء حسابك بنجاح، شكراً لانضمامك إلى شبكة شركائنا.',
    'welcome.gotIt': 'فهمت!',

    // ── Booking Confirmation modal ────────────────────────────────────────
    'confirm.title': 'تأكيد الحجز',
    'confirm.dropOff': 'موقع التوصيل',
    'confirm.chooseDest': 'اختر وجهتك',
    'confirm.clientName': 'اسم العميل',
    'confirm.roomNo': 'رقم الغرفة',
    'confirm.manyBags': 'حقائب كثيرة، أو أكثر من 4 أشخاص',
    'confirm.tripCost': 'تكلفة الرحلة',
    'confirm.tripDuration': 'مدة الرحلة',
    'confirm.vehicle': 'نوع المركبة',
    'confirm.creating': 'جارٍ الإرسال...',
    'confirm.button': 'تأكيد الحجز وإرسال الطلب',
    'confirm.goBack': 'العودة',
    'common.yes': 'نعم',
    'common.no': 'لا',

    // ── Ride Request Sent modal ───────────────────────────────────────────
    'rideSent.title': 'تم إرسال طلب الرحلة!',
    'rideSent.desc': 'تم إرسال طلبك بنجاح إلى السائقين. نحن نبحث لك عن سائق ونتوقع قبول رحلتك قريباً.',
    'rideSent.gotIt': 'فهمت!',
    'rideSent.viewDetails': 'عرض تفاصيل رحلتي',

    // ── Pickup Time modal ─────────────────────────────────────────────────
    'pickup.title': 'اختر وقت الانطلاق',
    'pickup.schedule': 'جدولة',
    'pickup.goBack': 'العودة',

    // ── Scheduled Ride modal ──────────────────────────────────────────────
    'scheduled.title': 'تم جدولة الرحلة وإرسالها',
    'scheduled.desc': 'تم! تم جدولة رحلتك بنجاح وإرسالها إلى السائقين. سيؤكد السائق ويصل في الوقت المحدد بدقة.',
    'scheduled.gotIt': 'فهمت!',
    'scheduled.viewDetails': 'عرض تفاصيل رحلتي',

    // ── Common ────────────────────────────────────────────────────────────
    'common.close': 'إغلاق النافذة',

    // ── Shared table / list ───────────────────────────────────────────────
    'Search': 'بحث',
    'Export': 'تصدير',
    'filter.Filter': 'تصفية',
    'filter.ClearSort': 'مسح الفرز',
    'shared.pagination.label': 'التنقل بين الصفحات',
    'shared.pagination.prev': 'الصفحة السابقة',
    'shared.pagination.next': 'الصفحة التالية',
    'shared.pagination.current': 'الصفحة الحالية',

    // table column headers
    'TripID': 'رقم الرحلة',
    'Driver': 'السائق',
    'Guest': 'الضيف',
    'Guest Name': 'اسم الضيف',
    'Room No.': 'رقم الغرفة',
    'Route': 'الطريق',
    'Status': 'الحالة',
    'Duration': 'المدة',
    'Fare': 'الأجرة',
    'Start.End.Date': 'بداية / نهاية',
    'Trip.Profit': 'ربح الرحلة (2%)',
    'Commulative.Profit': 'الربح التراكمي',
    'Actions': 'الإجراءات',

    // units
    'unit.min': 'دقيقة',
    'unit.km': 'كم',
    'riderHistory.commission': 'عمولة',
    'riderHistory.viewDetails': 'عرض تفاصيل الرحلة',

    // ── Financial History page ────────────────────────────────────────────
    'financial.Payouts': 'يتم جدولة مدفوعاتك في الأول من كل شهر. تكتمل المدفوعات في غضون 3 أيام عمل من تاريخ الجدولة. عمولتك ( 2% ) لكل رحلة.',
    'financial.FinancialHistory': 'السجل المالي',
    'riderHistory.title': 'سجل الرحلات',

    // ── Trip Details page ─────────────────────────────────────────────────
    'tripDetails.title': 'تفاصيل الرحلة',
    'tripDetails.tripId': 'رقم الرحلة',
    'tripDetails.passenger': 'اسم المسافر',
    'tripDetails.fare': 'الأجرة',
    'tripDetails.driver': 'السائق',
    'tripDetails.startDate': 'تاريخ البداية',
    'tripDetails.endDate': 'تاريخ النهاية',
    'tripDetails.destinations': 'الوجهات',
    'tripDetails.payment': 'طريقة الدفع',
    'tripDetails.carType': 'نوع السيارة',
    'tripDetails.hotel': 'الفندق',
    'tripDetails.driverProfit': 'أرباح السائق',
    'tripDetails.appProfit': 'أرباح التطبيق',
    'tripDetails.duration': 'المدة والمسافة',

    // ── Profile page ──────────────────────────────────────────────────────
    'profile.hotelInfo': 'معلومات الفندق',
    'profile.password': 'كلمة المرور',
    'profile.withdrawalDetails': 'تفاصيل السحب',
    'profile.name': 'الاسم',
    'profile.city': 'المدينة',
    'profile.address': 'العنوان',
    'profile.phone': 'رقم هاتف الفندق',
    'profile.email': 'البريد الإلكتروني للفندق',
    'profile.editDetails': 'تعديل بيانات الفندق',
    'profile.updatePassword': 'تحديث كلمة المرور',
    'profile.updateDetails': 'تحديث البيانات',
    'profile.currentPassword': 'كلمة المرور الحالية',
    'profile.newPassword': 'كلمة المرور الجديدة',
    'profile.confirmPassword': 'تأكيد كلمة المرور الجديدة',
    'profile.currentPasswordPlaceholder': 'أدخل كلمة المرور الحالية',
    'profile.newPasswordPlaceholder': 'أدخل كلمة المرور الجديدة',
    'profile.confirmPasswordPlaceholder': 'تأكيد كلمة المرور الجديدة',
    'profile.accountNumber': 'رقم الحساب',
    'profile.swiftCode': 'رمز SWIFT',

    // ── Message Panel ─────────────────────────────────────────────────────
    'messages.title': 'الرسائل',
    'messages.unread': 'غير مقروء',
    'messages.read': 'مقروء',
    'messages.empty': 'لا توجد رسائل',
    'messages.emptyDesc': 'ليس لديك أي رسائل في الوقت الحالي.',
    'messages.closeAriaLabel': 'إغلاق لوحة الرسائل',

    // ── Billing / Notifications Panel ─────────────────────────────────────
    'billing.title': 'الإشعارات',
    'billing.empty': 'لا توجد فواتير',
    'billing.emptyDesc': 'ليس لديك أي فواتير أو مدفوعات في الوقت الحالي.',
    'billing.closeAriaLabel': 'إغلاق لوحة الإشعارات',

    // ── Hotel Details page ────────────────────────────────────────────────
    'hotelDetails.retry': 'إعادة المحاولة',
    'hotelDetails.title': 'تكامل الفندق',
    'hotelDetails.payoutInfo': 'المدفوعات الشهرية: مجدولة في اليوم الأول. الموعد النهائي للإتمام هو 3 أيام عمل.',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS.en;
