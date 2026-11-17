# 📚 Book Butler — Backend API (Node.js & Express)

واجهة برمجية خلفية (Backend) متكاملة لمتجر الكتب **Book Butler** مبنية باستخدام **Node.js** و **Express** وقاعدة بيانات **SQLite (Sequelize ORM)** مع دعم رفع صور الكتب وتوليد روابط واتساب الجاهزة للدعم وطلبات الشراء.

---

## 📁 تقسيم ملفات المشروع (Project Structure)

```text
book_butler_backend/
├── src/
│   ├── config/
│   │   └── database.js           # إعدادات الاتصال بقاعدة البيانات SQLite
│   ├── models/
│   │   ├── Admin.js              # نموذج حساب SuperAdmin
│   │   ├── User.js               # نموذج المستخدمين (الاسم الثلاثي، الإيميل، كلمة المرور)
│   │   ├── Category.js           # نموذج أنواع الكتب (خيال علمي، غموض، رومنسي، أكشن...)
│   │   ├── Book.js               # نموذج الكتب (ID، صورة، اسم، وصف، سعر، حسم، ترشيحات أسبوعية/شهرية)
│   │   ├── Favorite.js           # نموذج المفضلة للمستخدمين
│   │   ├── CartItem.js           # نموذج عناصر السلة
│   │   └── index.js              # ربط العلاقات بين الجداول (Associations)
│   ├── controllers/
│   │   ├── adminController.js    # تسجيل دخول SuperAdmin وإحصائيات Dashboard
│   │   ├── authController.js     # تسجيل المستخدمين وتسجيل الدخول بالاسم الثلاثي ورابط الدعم
│   │   ├── categoryController.js # إدارة أنواع الكتب (إضافة/تعديل/حذف/عرض)
│   │   ├── bookController.js     # إدارة الكتب، البحث حسب النوع، والترشيحات الأسبوعية والشهرية
│   │   ├── favoriteController.js # إضافة وعرض الكتب المفضلة
│   │   ├── cartController.js     # إدارة السلة وتوليد رابط طلب الشراء عبر واتساب
│   │   └── storeController.js    # إعدادات المتجر، النبذة التعريفية، وألوان الواجهة
│   ├── middleware/
│   │   ├── authMiddleware.js     # حماية مسارات SuperAdmin ومسارات المستخدمين عبر JWT
│   │   └── uploadMiddleware.js   # رفع وحفظ صور أغلفة الكتب (Multer)
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── bookRoutes.js
│   │   ├── favoriteRoutes.js
│   │   ├── cartRoutes.js
│   │   └── storeRoutes.js
│   ├── utils/
│   │   ├── seedAdmin.js          # إنشاء حساب SuperAdmin وأنواع الكتب الافتراضية تلقائياً
│   │   └── whatsappHelper.js     # توليد روابط واتساب (+963980266994) للدعم وطلب الشراء
│   ├── app.js                    # إعدادات Express والمسارات
│   └── server.js                 # نقطة تشغيل الخادم
├── uploads/books/                # مجلد تخزين صور الكتب المرفوعة
├── .env                          # متغيرات البيئة (Port, JWT Secret, بيانات SuperAdmin)
├── .env.example
└── package.json
```

---

## 🚀 خطوات التشغيل

1. تثبيت الحزم:
   ```bash
   npm install
   ```
2. تشغيل الخادم (سيتم إنشاء قاعدة البيانات وحساب `superadmin` تلقائياً عند أول تشغيل):
   ```bash
   npm run dev
   ```
   - **بيانات الدخول الافتراضية للـ SuperAdmin** (قابلة للتعديل من ملف `.env`):
     - `username`: `superadmin`
     - `password`: `Admin@123456`

---

## 🔗 أهم المسارات البرمجية (API Endpoints)

### 1. لوحة تحكم المشرف (SuperAdmin)
| Method | Endpoint | الوصف | الحماية |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/login` | تسجيل دخول SuperAdmin (`username`, `password`) | عام |
| `GET` | `/api/admin/dashboard` | إحصائيات لوحة التحكم وآخر الكتب المضافة | SuperAdmin |

### 2. أنواع الكتب (Categories / Genres)
| Method | Endpoint | الوصف | الحماية |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | عرض جميع أنواع الكتب (خيال علمي، غموض، رومنسي، أكشن...) | عام |
| `POST` | `/api/categories` | إضافة نوع جديد (`name`, `description`) | SuperAdmin |
| `PUT` | `/api/categories/:id` | تعديل نوع كتاب | SuperAdmin |
| `DELETE` | `/api/categories/:id` | حذف نوع كتاب | SuperAdmin |

### 3. الكتب والترشيحات والبحث (Books & Recommendations)
| Method | Endpoint | الوصف | الحماية |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/books` | عرض جميع الكتب + البحث (`?search=...`) + الفلترة حسب النوع (`?categoryId=1` أو `?category=خيال علمي`) أو الحسم (`?discounted=true`) | عام |
| `GET` | `/api/books/recommendations` | عرض قائمتي **الترشيحات الأسبوعية** و **الترشيحات الشهرية** | عام |
| `GET` | `/api/books/:id` | عرض تفاصيل كتاب محدد عبر الـ ID الخاص به | عام |
| `POST` | `/api/books` | إضافة كتاب (`form-data`: `image`, `title`, `description`, `price`, `discountPercentage`, `isWeeklyPick`, `isMonthlyPick`, `categoryIds`) | SuperAdmin |
| `PUT` | `/api/books/:id` | تعديل بيانات كتاب أو نسبة الحسم أو أنواعه | SuperAdmin |
| `PATCH` | `/api/books/:id/recommendations` | إضافة/إزالة الكتاب من الترشيحات الأسبوعية أو الشهرية | SuperAdmin |
| `DELETE` | `/api/books/:id` | حذف كتاب | SuperAdmin |

### 4. حسابات المستخدمين والدعم الفني (Users & Support)
| Method | Endpoint | الوصف | الحماية |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | إنشاء حساب (`email`, `fullName` [الاسم الثلاثي], `password`, `confirmPassword`) | عام |
| `POST` | `/api/auth/login` | تسجيل الدخول باستخدام (`fullName` [الاسم الثلاثي], `password`) | عام |
| `GET` | `/api/auth/profile` | عرض بيانات الملف الشخصي للمستخدم | User |
| `GET` | `/api/auth/support` | جلب رابط واتساب الدعم المباشر للرقم `+963980266994` بالرسالة المطلوبة | عام |

### 5. المفضلة والسلة وطلب الشراء عبر واتساب (Favorites & Cart)
| Method | Endpoint | الوصف | الحماية |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/favorites` | عرض كتب المستخدم المفضلة | User |
| `POST` | `/api/favorites/:bookId` | إضافة أو إزالة كتاب من المفضلة | User |
| `GET` | `/api/cart` | عرض محتويات السلة مع حساب السعر الأصلي والسعر بعد الحسم | User |
| `POST` | `/api/cart` | إضافة كتاب إلى السلة (`bookId`, `quantity`) | User |
| `PUT` | `/api/cart/:itemId` | تعديل الكمية في السلة | User |
| `DELETE` | `/api/cart/:itemId` | حذف كتاب من السلة | User |
| `POST` | `/api/cart/checkout-whatsapp` | توليد رابط واتساب لطلب شراء جميع الكتب الموجودة في السلة بالرسالة المطلوبة | User |

### 6. إعدادات المتجر والواجهة (Store Config)
| Method | Endpoint | الوصف |
| :--- | :--- | :--- |
| `GET` | `/api/store/config` | يرجع نبذة تعريف متجر **Book Butler**، ألوان التصميم (`Colors`)، ورابط واتساب الدعم |
