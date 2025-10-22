/**
 * 🌐 API Configuration
 * 
 * تغيير عنوان API حسب البيئة:
 * - localhost:9020 للتطوير على نفس الجهاز
 * - 10.0.2.2:9020 للـ Android Emulator
 * - IP الجهاز للهاتف الفعلي على نفس الشبكة
 */

// 🔧 غيّر هذا العنوان حسب حالتك:
export const API_BASE_URL = "http://10.6.251.184:9020/api"; // ✅ للهاتف الفعلي

// بدائل أخرى:
// export const API_BASE_URL = "http://localhost:9020/api"; // Web/Desktop
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
