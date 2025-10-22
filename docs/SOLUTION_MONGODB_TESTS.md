# 🔧 حل مشكلة MongoDB في الاختبارات

## 📋 المشكلة

عند تشغيل الاختبارات، يظهر الخطأ:
```
The connection string is invalid. Connection strings must start with either 'mongodb://' or 'mongodb+srv://'
```

**السبب:** ملف `application.properties` يستخدم متغير بيئة `${SPRING_DATA_MONGODB_URI}` غير معرّف.

---

## ✅ الحل المطبّق

تم إضافة **MongoDB Embedded** الذي يعمل تلقائياً بدون الحاجة لتثبيت MongoDB!

### 1. إضافة التبعية في `pom.xml`

```xml
<!-- MongoDB Embedded للاختبارات -->
<dependency>
    <groupId>de.flapdoodle.embed</groupId>
    <artifactId>de.flapdoodle.embed.mongo.spring30x</artifactId>
    <version>4.9.2</version>
    <scope>test</scope>
</dependency>
```

### 2. تحديث `application-test.properties`

```properties
# MongoDB Embedded - يعمل تلقائياً
de.flapdoodle.mongodb.embedded.version=6.0.5
```

### 3. تحديث `BackendApplicationTests.java`

```java
@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
class BackendApplicationTests {
    @Test
    void contextLoads() {
        // ✅ يتحقق من تحميل Spring Context
    }
}
```

---

## 🚀 كيفية تشغيل الاختبارات

### الطريقة 1: MongoDB Embedded (موصى به - لا يحتاج تثبيت)

```bash
# تشغيل جميع الاختبارات
./mvnw test

# اختبارات الحجوزات فقط
./mvnw test -Dtest=ReservationIntegrationTest

# اختبارات الأدمن فقط
./mvnw test -Dtest=AdminReservationIntegrationTest
```

**المميزات:**
- ✅ لا يحتاج تثبيت MongoDB
- ✅ يعمل على أي جهاز مباشرة
- ✅ سريع وخفيف
- ✅ ينظف نفسه تلقائياً

### الطريقة 2: MongoDB خارجي (إذا كنت تفضل ذلك)

**الخطوة 1:** علّق السطر في `application-test.properties`:

```properties
# de.flapdoodle.mongodb.embedded.version=6.0.5
spring.data.mongodb.uri=mongodb://localhost:27017/eventease_test
```

**الخطوة 2:** شغّل MongoDB:

```bash
# باستخدام Docker
docker compose up -d mongo

# أو محلياً
sudo systemctl start mongodb
```

**الخطوة 3:** شغّل الاختبارات:

```bash
./mvnw test
```

---

## 📊 الاختبارات المتوفرة

### 1. ReservationIntegrationTest (5 اختبارات)

| Test | الوصف |
|------|-------|
| TC1 | حجز ناجح مع أماكن متاحة |
| TC2 | رفض حجز لحدث ممتلئ |
| TC3 | رفض حجز بدون تسجيل دخول |
| TC4 | منع الحجز المكرر |
| TC5 | تزامن - مستخدمان يحجزان آخر مكان |

### 2. AdminReservationIntegrationTest (8 اختبارات)

| Test | الوصف |
|------|-------|
| TC1 | قبول حجز |
| TC2 | رفض حجز مع سبب |
| TC3 | تسجيل دخول صحيح |
| TC4 | تسجيل دخول خاطئ |
| TC5 | عرض جميع الحجوزات |
| TC6 | حجز غير موجود |
| TC7 | صلاحيات المستخدم |
| TC8 | عزل البيانات |

---

## 🔍 التحقق من نجاح الاختبارات

### النتيجة المتوقعة:

```
[INFO] Tests run: 13, Failures: 0, Errors: 0, Skipped: 0
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

### إذا فشلت الاختبارات:

1. **تحقق من السجلات:**
   ```bash
   cat target/surefire-reports/*.txt
   ```

2. **تشغيل مع تفاصيل:**
   ```bash
   ./mvnw test -X
   ```

3. **تنظيف وإعادة البناء:**
   ```bash
   ./mvnw clean test
   ```

---

## 📁 الملفات المعدّلة

```
backend/
├── pom.xml
│   └── ✅ أضيفت تبعية MongoDB Embedded
│
├── src/test/resources/application-test.properties
│   └── ✅ إعدادات MongoDB Embedded
│
└── src/test/java/com/eventease/backend/
    ├── BackendApplicationTests.java
    │   └── ✅ أضيف @TestPropertySource
    │
    ├── reservation/ReservationIntegrationTest.java
    │   └── ✅ 5 اختبارات كاملة
    │
    └── admin/AdminReservationIntegrationTest.java
        └── ✅ 8 اختبارات كاملة
```

---

## 💡 نصائح

### 1. تسريع الاختبارات

```bash
# تشغيل متوازي
./mvnw test -T 4

# تخطي التنظيف
./mvnw test -DskipClean=true
```

### 2. تشغيل اختبار واحد

```bash
./mvnw test -Dtest=ReservationIntegrationTest#testCasNominal_ReservationAvecPlacesDisponibles
```

### 3. تقرير التغطية (Coverage)

```bash
./mvnw test jacoco:report
# التقرير في: target/site/jacoco/index.html
```

---

## 🎯 الخلاصة

✅ **MongoDB Embedded مثبّت ومُعدّ**  
✅ **13 اختبار تكامل جاهز**  
✅ **لا يحتاج تثبيت MongoDB خارجي**  
✅ **يعمل على أي جهاز مباشرة**  
✅ **جاهز للتشغيل والتسليم**

---

## 📞 المساعدة

إذا واجهت مشاكل:

1. تأكد من Java 17 أو أعلى: `java -version`
2. نظّف المشروع: `./mvnw clean`
3. حدّث التبعيات: `./mvnw dependency:resolve`
4. راجع السجلات في `target/surefire-reports/`

---

**آخر تحديث:** 2025-10-20  
**الإصدار:** 1.0  
**الحالة:** ✅ جاهز للاستخدام
