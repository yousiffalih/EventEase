/**
 * 🌐 API Configuration
 * 
 * تغيير عنوان API حسب البيئة:
 * - localhost:9020 للتطوير على نفس الجهاز
 * - 10.0.2.2:9020 للـ Android Emulator
 * - IP الجهاز للهاتف الفعلي على نفس الشبكة
 */

import { Platform } from 'react-native';

// 🔧 تبديل تلقائي بين Web والهاتف:
export const API_BASE_URL = Platform.OS === 'web' 
  ? "http://localhost:9020/api"           // ✅ Web/Desktop
  : "http://10.29.252.32:9020/api";       // ✅ Mobile (IP الحالي)

// بدائل أخرى:
// export const API_BASE_URL = "http://10.0.2.2:9020/api"; // Android Emulator

export const API_ENDPOINTS = {
  // Events
  EVENTS: `${API_BASE_URL}/events`,
  
  // Users
  LOGIN: `${API_BASE_URL}/users/login`,
  SIGNUP: `${API_BASE_URL}/users/signup`,
  
  // Reservations
  RESERVATIONS: `${API_BASE_URL}/reservations`,
};
