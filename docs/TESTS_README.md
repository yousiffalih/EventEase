# 🧪 دليل تشغيل الاختبارات - EventEase

## 📋 المحتويات
1. [المتطلبات الأساسية](#المتطلبات-الأساسية)
2. [إعداد البيئة](#إعداد-البيئة)
3. [تشغيل الاختبارات](#تشغيل-الاختبارات)
4. [شرح الاختبارات](#شرح-الاختبارات)
5. [حل المشاكل](#حل-المشاكل)

---

## 📦 المتطلبات الأساسية

### 1. MongoDB يجب أن يكون يعمل

**الخيار A: استخدام Docker Compose (موصى به)**

```bash
# من مجلد backend
cd /home/uha40/Bureau/EventEase/EventEase/backend
docker-compose up -d mongo
```

**الخيار B: تثبيت MongoDB محلياً**

```bash
sudo apt install mongodb
sudo systemctl start mongodb
```

**الخيار C: استخدام MongoDB Embedded (للاختبارات فقط)**

أضف هذه التبعية في `pom.xml`:

```xml
<dependency>
    <groupId>de.flapdoodle.embed</groupId>
    <artifactId>de.flapdoodle.embed.mongo</artifactId>
    <scope>test</scope>
</dependency>
```

### 2. Java 17 أو أعلى

```bash
java -version
# يجب أن يكون: openjdk version "17" أو أعلى
```

---

## ⚙️ إعداد البيئة

### 1. تشغيل MongoDB

```bash
# تأكد من أن MongoDB يعمل على المنفذ 27017
docker-compose up -d mongo

# تحقق من الاتصال
docker exec -it eventease-mongo mongosh --eval "db.adminCommand('ping')"
```

### 2. تعديل ملف الإعدادات (إذا لزم الأمر)

ملف: `src/test/resources/application-test.properties`

```properties
# إذا كان MongoDB على منفذ مختلف
spring.data.mongodb.uri=mongodb://localhost:27017/eventease_test

# أو إذا كنت تستخدم Docker
spring.data.mongodb.uri=mongodb://root:rootpass@localhost:27018/eventease_test?authSource=admin
```

---

## 🚀 تشغيل الاختبارات

### 1. تشغيل جميع الاختبارات

```bash
cd /home/uha40/Bureau/EventEase/EventEase/backend
./mvnw test
```

### 2. تشغيل اختبارات الحجوزات فقط

```bash
./mvnw test -Dtest=ReservationIntegrationTest
```

### 3. تشغيل اختبارات الأدمن فقط

```bash
./mvnw test -Dtest=AdminReservationIntegrationTest
```

### 4. تشغيل اختبار واحد محدد

```bash
# مثال: اختبار الحالة الطبيعية للحجز
./mvnw test -Dtest=ReservationIntegrationTest#testCasNominal_ReservationAvecPlacesDisponibles
```

### 5. تشغيل مع تقرير مفصل

```bash
./mvnw test -Dtest=ReservationIntegrationTest -DforkCount=0
```

---

## 📊 شرح الاختبارات

### اختبارات الحجوزات (ReservationIntegrationTest)

| Test | الوصف | ما يتم اختباره |
|------|-------|----------------|
| **TC1** | الحالة الطبيعية | مستخدم متصل يحجز حدث فيه أماكن |
| **TC2** | حدث ممتلئ | رفض الحجز عند عدم وجود أماكن |
| **TC3** | مستخدم غير متصل | رفض الحجز بدون token JWT |
| **TC4** | حجز مكرر | منع نفس المستخدم من حجز نفس الحدث مرتين |
| **TC5** | تزامن | مستخدمان يحجزان آخر مكان في نفس الوقت |

### اختبارات الأدمن (AdminReservationIntegrationTest)

| Test | الوصف | ما يتم اختباره |
|------|-------|----------------|
| **TC1** | قبول حجز | الأدمن يقبل حجز → status = APPROVED |
| **TC2** | رفض حجز | الأدمن يرفض حجز مع سبب |
| **TC3** | تسجيل دخول صحيح | أدمن يدخل ببيانات صحيحة |
| **TC4** | تسجيل دخول خاطئ | أدمن ببيانات خاطئة → 401 |
| **TC5** | عرض جميع الحجوزات | الأدمن يرى جميع الحجوزات |
| **TC6** | حجز غير موجود | محاولة قبول حجز غير موجود |
| **TC7** | صلاحيات | مستخدم عادي يحاول الوصول لوظائف الأدمن |
| **TC8** | عزل البيانات | المستخدم يرى حجوزاته فقط |

---

## 🔧 حل المشاكل

### ❌ خطأ: "MongoTimeoutException: Timed out"

**السبب:** MongoDB غير متصل

**الحل:**
```bash
# تشغيل MongoDB
docker-compose up -d mongo

# أو
sudo systemctl start mongodb
```

### ❌ خطأ: "Failed to load ApplicationContext"

**السبب:** مشكلة في الاتصال بقاعدة البيانات

**الحل:**
```bash
# تحقق من أن MongoDB يعمل
docker ps | grep mongo

# تحقق من المنفذ
netstat -tuln | grep 27017

# أو استخدم MongoDB Embedded (أضف التبعية في pom.xml)
```

### ❌ خطأ: "Duplicate key error"

**السبب:** بيانات قديمة في قاعدة البيانات

**الحل:**
```bash
# حذف قاعدة البيانات التجريبية
docker exec -it eventease-mongo mongosh
> use eventease_test
> db.dropDatabase()
```

### ❌ خطأ: "lambda expression must be final"

**السبب:** متغيرات غير final في lambda

**الحل:** تم إصلاحه في الكود - استخدام `final User finalUser2`

---

## 📈 النتائج المتوقعة

عند تشغيل الاختبارات بنجاح، يجب أن ترى:

```
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

---

## 📝 ملاحظات مهمة

### 1. تنظيف قاعدة البيانات

كل اختبار ينظف قاعدة البيانات قبل وبعد التنفيذ:

```java
@BeforeEach
void setUp() {
    reservationRepo.deleteAll();
    eventRepo.deleteAll();
    userRepo.deleteAll();
    // ... إنشاء بيانات تجريبية
}
```

### 2. استخدام MongoDB للاختبار

الاختبارات تستخدم قاعدة بيانات منفصلة:
- **Production:** `eventease`
- **Test:** `eventease_test`

### 3. JWT Tokens

الاختبارات تولد JWT tokens صالحة:

```java
validToken = JwtUtil.generateToken(testUser.getId(), testUser.getRole());
```

### 4. Pattern AAA

جميع الاختبارات تتبع Pattern:
- **GIVEN** (Arrange): تحضير البيانات
- **WHEN** (Act): تنفيذ الإجراء
- **THEN** (Assert): التحقق من النتيجة

---

## 🎯 الخطوات التالية

### 1. إضافة Authorization

حالياً `SecurityConfig` يسمح بجميع الطلبات. يجب إضافة:

```java
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> approve(@PathVariable String id) {
    // ...
}
```

### 2. استخدام Testcontainers

لتشغيل MongoDB تلقائياً مع الاختبارات:

```xml
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>mongodb</artifactId>
    <scope>test</scope>
</dependency>
```

```java
@Testcontainers
public class ReservationIntegrationTest {
    @Container
    static MongoDBContainer mongoDBContainer = new MongoDBContainer("mongo:6");
}
```

### 3. إضافة تقارير Coverage

```bash
./mvnw test jacoco:report
# التقرير في: target/site/jacoco/index.html
```

---

## 📞 المساعدة

إذا واجهت مشاكل:

1. تحقق من أن MongoDB يعمل
2. تحقق من ملف `application-test.properties`
3. راجع السجلات في `target/surefire-reports/`
4. استخدم `-X` للحصول على سجلات مفصلة:
   ```bash
   ./mvnw test -X -Dtest=ReservationIntegrationTest
   ```

---

**آخر تحديث:** 2025-10-20  
**الإصدار:** 1.0
