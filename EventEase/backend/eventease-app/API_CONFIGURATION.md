# 🌐 API Configuration Guide

## 📍 تغيير عنوان الـ Backend API

الملف المسؤول عن عنوان API: **`config/api.ts`**

---

## 🔧 الحالات المختلفة:

### 1️⃣ **التطوير على نفس الجهاز (Web Browser)**

```typescript
export const API_BASE_URL = "http://localhost:9020/api";
```

✅ **متى تستخدمه:**
- عند تشغيل التطبيق في المتصفح (`npm start` ثم فتح `w`)
- Backend و Frontend على نفس الجهاز

---

### 2️⃣ **Android Emulator**

```typescript
export const API_BASE_URL = "http://10.0.2.2:9020/api";
```

✅ **متى تستخدمه:**
- عند تشغيل التطبيق في Android Emulator
- `10.0.2.2` هو عنوان خاص يشير إلى `localhost` للجهاز المضيف

---

### 3️⃣ **هاتف فعلي على نفس الشبكة**

```typescript
export const API_BASE_URL = "http://192.168.1.X:9020/api";
```

✅ **متى تستخدمه:**
- عند تشغيل التطبيق على هاتف حقيقي
- يجب أن يكون الهاتف والكمبيوتر على نفس الـ WiFi

**كيف تعرف IP جهازك؟**

```bash
# Linux/Mac
ifconfig | grep "inet "

# أو
hostname -I

# Windows
ipconfig
```

ابحث عن عنوان مثل: `192.168.1.X` أو `10.0.0.X`

---

### 4️⃣ **Production (Server حقيقي)**

```typescript
export const API_BASE_URL = "https://api.eventease.com/api";
```

✅ **متى تستخدمه:**
- عند نشر التطبيق في Production
- Backend على سيرفر حقيقي

---

## 🚀 كيفية التطبيق

### الخطوة 1: افتح الملف

```bash
cd /home/uha40/Bureau/EventEase/EventEase/backend/eventease-app
nano config/api.ts
```

### الخطوة 2: غيّر العنوان

```typescript
// قبل (عنوان خاطئ)
export const API_BASE_URL = "http://10.6.251.93:9020/api";

// بعد (للتطوير على نفس الجهاز)
export const API_BASE_URL = "http://localhost:9020/api";
```

### الخطوة 3: احفظ وأعد تشغيل التطبيق

```bash
# أوقف التطبيق (Ctrl+C)
# ثم شغّله مرة أخرى
npm start
```

---

## ✅ التحقق من أن Backend يعمل

قبل تشغيل التطبيق، تأكد من أن Backend يعمل:

```bash
# 1. تحقق من أن Backend يعمل
curl http://localhost:9020/api/events

# 2. إذا لم يعمل، شغّله
cd /home/uha40/Bureau/EventEase/EventEase/backend
./mvnw spring-boot:run
```

---

## 🐛 حل المشاكل

### المشكلة: `Network Error` أو `ERR_ADDRESS_UNREACHABLE`

**الأسباب المحتملة:**

1. ❌ Backend غير شغّال
   ```bash
   # الحل: شغّل Backend
   cd backend
   ./mvnw spring-boot:run
   ```

2. ❌ عنوان API خاطئ
   ```bash
   # الحل: تحقق من config/api.ts
   ```

3. ❌ Firewall يمنع الاتصال
   ```bash
   # الحل: أضف استثناء للمنفذ 9020
   sudo ufw allow 9020
   ```

4. ❌ الهاتف والكمبيوتر على شبكات مختلفة
   ```bash
   # الحل: تأكد من أنهما على نفس WiFi
   ```

---

## 📝 ملاحظات

- ✅ **جميع الملفات تم تحديثها** لاستخدام `config/api.ts`
- ✅ **لا حاجة لتغيير أي ملف آخر** - فقط `config/api.ts`
- ✅ **التطبيق يدعم Offline Mode** - يحفظ الحجوزات محلياً إذا كان Backend غير متاح

---

## 🎯 الملفات المحدّثة

```
eventease-app/
├── config/
│   └── api.ts ⭐ (الملف الرئيسي - غيّر العنوان هنا فقط)
│
├── app/(tabs)/
│   ├── event.tsx ✅ (يستخدم API_ENDPOINTS)
│   ├── connect.tsx ✅ (يستخدم API_ENDPOINTS)
│   └── sync.tsx ✅ (يستخدم API_ENDPOINTS)
│
└── API_CONFIGURATION.md 📖 (هذا الملف)
```

---

**آخر تحديث:** 2025-10-21  
**الحالة:** ✅ جاهز للاستخدام
