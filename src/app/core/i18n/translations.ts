export type Lang = 'en' | 'ar';

export const TRANSLATIONS = {
  en: {
    // Navbar
    'nav.signIn': 'Sign In',
    'nav.joinUs': 'Join Us Now',
    'nav.tripsHistory': 'Trips History',
    'nav.langAriaLabel': 'Switch to Arabic',

    // Main form
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

    // Contact
    'contact.title': 'Contact Us',
    'contact.gmail': 'Gmail',
    'contact.whatsapp': 'Whatsapp',

    // Join modal
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
    'join.next': 'Next',
    'join.back': 'Back',

    // Withdrawal
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

    // Sign In modal
    'signIn.title': 'Welcome Again!',
    'signIn.email': 'Hotel Email',
    'signIn.password': 'Password',
    'signIn.passwordPlaceholder': 'Type Your Password',
    'signIn.forgotPassword': 'Forget Your Password ?',
    'signIn.loading': 'Signing In...',
    'signIn.button': 'Sign In',

    // Forgot Password modal
    'forgotPassword.title': 'Forget Password ?',
    'forgotPassword.subtitle': 'Enter your email to receive reset instructions.',
    'forgotPassword.goBack': 'Go Back',
    'forgotPassword.sendCode': 'Send Code',

    // Verification modal
    'verification.title': 'Enter Verification Code',
    'verification.subtitle': 'We have sent a code to your hotel mail',
    'verification.label': 'Enter Verification Code',
    'verification.noCode': "Didn't receive any code?",
    'verification.resend': 'Resend code',
    'verification.goBack': 'Go Back',
    'verification.sendCode': 'Send Code',

    // Welcome modal
    'welcome.title': 'Welcome Aboard!',
    'welcome.subtitle': 'Your Hotel Account Is Ready',
    'welcome.desc': 'Your account has been successfully created, thank you for joining our partner network.',
    'welcome.gotIt': 'Got it!',

    // Booking Confirmation modal
    'confirm.title': 'Booking Confirmation',
    'confirm.dropOff': 'Drop Off Location',
    'confirm.chooseDest': 'Choose Your Destination',
    'confirm.clientName': 'Client Name',
    'confirm.roomNo': 'Room No.',
    'confirm.manyBags': 'Many bags, or More than 4 people',
    'confirm.tripCost': 'Trip Cost',
    'confirm.tripDuration': 'Trip Duration',
    'confirm.button': 'Confirm Booking & Send Request',
    'confirm.goBack': 'Go Back',

    // Ride Request Sent modal
    'rideSent.title': 'Ride Request Sent!',
    'rideSent.desc': "Your request has been successfully dispatched to drivers. We're finding you a driver and expect your ride to be accepted shortly.",
    'rideSent.gotIt': 'Got it!',
    'rideSent.viewDetails': 'View My Ride Details',

    // Pickup Time modal
    'pickup.title': 'Choose Pickup Time',
    'pickup.schedule': 'Schedule',
    'pickup.goBack': 'Go Back',

    // Scheduled Ride modal
    'scheduled.title': 'Ride Scheduled & Dispatched',
    'scheduled.desc': 'Done! Your trip is successfully scheduled and dispatched to drivers. A driver will confirm and arrive precisely at your selected time.',
    'scheduled.gotIt': 'Got it!',
    'scheduled.viewDetails': 'View My Ride Details',

    // Common
    'common.close': 'Close dialog',
    'financial.Payouts': 'Your Payouts are scheduled on the 1st of every month. Payments are completed within 3 business days from the scheduling date. Your Commission ( 2% ) for each trip.',
    
  },

  ar: {
    // Navbar
    'nav.signIn': 'تسجيل الدخول',
    'nav.joinUs': 'انضم إلينا الآن',
    'nav.tripsHistory': 'سجل الرحلات',
    'nav.langAriaLabel': 'Switch to English',

    // Main form
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

    // Contact
    'contact.title': 'تواصل معنا',
    'contact.gmail': 'Gmail',
    'contact.whatsapp': 'واتساب',

    // Join modal
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
    'join.next': 'التالي',
    'join.back': 'رجوع',

    // Withdrawal
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

    // Sign In modal
    'signIn.title': 'أهلاً بعودتك!',
    'signIn.email': 'البريد الإلكتروني للفندق',
    'signIn.password': 'كلمة المرور',
    'signIn.passwordPlaceholder': 'أدخل كلمة المرور',
    'signIn.forgotPassword': 'نسيت كلمة المرور؟',
    'signIn.loading': 'جارٍ تسجيل الدخول...',
    'signIn.button': 'تسجيل الدخول',

    // Forgot Password modal
    'forgotPassword.title': 'نسيت كلمة المرور؟',
    'forgotPassword.subtitle': 'أدخل بريدك الإلكتروني لاستقبال تعليمات الإعادة.',
    'forgotPassword.goBack': 'العودة',
    'forgotPassword.sendCode': 'إرسال الرمز',

    // Verification modal
    'verification.title': 'أدخل رمز التحقق',
    'verification.subtitle': 'لقد أرسلنا رمزاً إلى بريد فندقك',
    'verification.label': 'أدخل رمز التحقق',
    'verification.noCode': 'لم تستلم أي رمز؟',
    'verification.resend': 'إعادة إرسال الرمز',
    'verification.goBack': 'العودة',
    'verification.sendCode': 'إرسال الرمز',

    // Welcome modal
    'welcome.title': 'أهلاً بك!',
    'welcome.subtitle': 'حساب فندقك جاهز',
    'welcome.desc': 'تم إنشاء حسابك بنجاح، شكراً لانضمامك إلى شبكة شركائنا.',
    'welcome.gotIt': 'فهمت!',

    // Booking Confirmation modal
    'confirm.title': 'تأكيد الحجز',
    'confirm.dropOff': 'موقع التوصيل',
    'confirm.chooseDest': 'اختر وجهتك',
    'confirm.clientName': 'اسم العميل',
    'confirm.roomNo': 'رقم الغرفة',
    'confirm.manyBags': 'حقائب كثيرة، أو أكثر من 4 أشخاص',
    'confirm.tripCost': 'تكلفة الرحلة',
    'confirm.tripDuration': 'مدة الرحلة',
    'confirm.button': 'تأكيد الحجز وإرسال الطلب',
    'confirm.goBack': 'العودة',

    // Ride Request Sent modal
    'rideSent.title': 'تم إرسال طلب الرحلة!',
    'rideSent.desc': 'تم إرسال طلبك بنجاح إلى السائقين. نحن نبحث لك عن سائق ونتوقع قبول رحلتك قريباً.',
    'rideSent.gotIt': 'فهمت!',
    'rideSent.viewDetails': 'عرض تفاصيل رحلتي',

    // Pickup Time modal
    'pickup.title': 'اختر وقت الانطلاق',
    'pickup.schedule': 'جدولة',
    'pickup.goBack': 'العودة',

    // Scheduled Ride modal
    'scheduled.title': 'تم جدولة الرحلة وإرسالها',
    'scheduled.desc': 'تم! تم جدولة رحلتك بنجاح وإرسالها إلى السائقين. سيؤكد السائق ويصل في الوقت المحدد بدقة.',
    'scheduled.gotIt': 'فهمت!',
    'scheduled.viewDetails': 'عرض تفاصيل رحلتي',

    // Common
    'common.close': 'إغلاق النافذة',
    'financial.Payouts': 'يتم جدولة مدفوعاتك في الأول من كل شهر. تكتمل المدفوعات في غضون 3 أيام عمل من تاريخ الجدولة. عمولتك ( 2% ) لكل رحلة.',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS.en;
