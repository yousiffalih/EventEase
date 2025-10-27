// Web version - SQLite not supported
console.warn("⚠️ SQLite not supported on web.");

// إنشاء الجداول
export const initDB = async () => {
  console.warn("SQLite not available on web");
};

// 🟢 إضافة حدث
export const addEvent = async (title: string, description: string, date: string, capacity: number) => {
  console.warn("SQLite not available on web");
};

// 🔵 جلب جميع الأحداث
export const getEvents = async (): Promise<any[]> => {
  console.warn("SQLite not available on web");
  return [];
};

// 🟣 إضافة حجز
export const addReservation = async (eventTitle: string, status: string, pending_sync = 0) => {
  console.warn("SQLite not available on web");
};

// 🟠 جلب جميع الحجوزات
export const getReservations = async (): Promise<any[]> => {
  console.warn("SQLite not available on web");
  return [];
};

// 🟠 جلب الحجوزات الغير متزامنة
export const getPendingReservations = async (): Promise<any[]> => {
  console.warn("SQLite not available on web");
  return [];
};

// 🟢 تحديث حالة التزامن بعد الإرسال
export const markReservationSynced = async (id: number) => {
  console.warn("SQLite not available on web");
};

// 🔵 حذف جميع الحجوزات المحلية
export const clearLocalReservations = async () => {
  console.warn("SQLite not available on web");
};
