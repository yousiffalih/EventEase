import * as SQLite from "expo-sqlite";

// فتح قاعدة البيانات (Native only - iOS/Android)
const db = SQLite.openDatabaseSync("eventease.db");

// إنشاء الجداول
export const initDB = async () => {
  if (!db) return;

  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      date TEXT,
      capacity INTEGER,
      available INTEGER
    );`
  );
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eventTitle TEXT,
      status TEXT,
      pending_sync INTEGER DEFAULT 0
    );`
  );
  
};

// 🟢 إضافة حدث
export const addEvent = async (title: string, description: string, date: string, capacity: number) => {
  if (!db) return;
  await db.runAsync(
    `INSERT INTO events (title, description, date, capacity, available) VALUES (?, ?, ?, ?, ?);`,
    [title, description, date, capacity, capacity]
  );
};

// 🔵 جلب جميع الأحداث
export const getEvents = async (): Promise<any[]> => {
  if (!db) return [];
  const result = await db.getAllAsync("SELECT * FROM events;");
  return result;
};

export const addReservation = async (eventTitle: string, status: string, pending_sync = 0) => {
  if (!db) return;
  await db.runAsync(
    `INSERT INTO reservations (eventTitle, status, pending_sync) VALUES (?, ?, ?);`,
    [eventTitle, status, pending_sync]
  );
};


// 🟠 جلب جميع الحجوزات
export const getReservations = async (): Promise<any[]> => {
  if (!db) return [];
  const result = await db.getAllAsync("SELECT * FROM reservations;");
  return result;
};
// 🟠 جلب الحجوزات الغير متزامنة
export const getPendingReservations = async (): Promise<any[]> => {
  if (!db) return [];
  const result = await db.getAllAsync("SELECT * FROM reservations WHERE pending_sync = 1;");
  return result;
};

// 🟢 تحديث حالة التزامن بعد الإرسال
export const markReservationSynced = async (id: number) => {
  if (!db) return;
  await db.runAsync(`UPDATE reservations SET pending_sync = 0 WHERE id = ?;`, [id]);
};

// 🔵 حذف جميع الحجوزات المحلية (اختياري للتجارب)
export const clearLocalReservations = async () => {
  if (!db) return;
  await db.execAsync("DELETE FROM reservations;");
};
