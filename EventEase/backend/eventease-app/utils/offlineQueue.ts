import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const QUEUE_KEY = 'offline_reservations_queue';

interface QueuedReservation {
  id: string;
  eventId: string;
  userId: string;
  eventTitle: string;
  timestamp: number;
  retryCount: number;
}

// Add reservation to offline queue
export const addToQueue = async (eventId: string, userId: string, eventTitle: string) => {
  try {
    const queue = await getQueue();
    const newReservation: QueuedReservation = {
      id: `${Date.now()}-${Math.random()}`,
      eventId,
      userId,
      eventTitle,
      timestamp: Date.now(),
      retryCount: 0,
    };
    
    queue.push(newReservation);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    console.log('📥 Added to offline queue:', eventTitle);
    return newReservation;
  } catch (error) {
    console.error('❌ Error adding to queue:', error);
    throw error;
  }
};

// Get all queued reservations
export const getQueue = async (): Promise<QueuedReservation[]> => {
  try {
    const queueStr = await AsyncStorage.getItem(QUEUE_KEY);
    return queueStr ? JSON.parse(queueStr) : [];
  } catch (error) {
    console.error('❌ Error getting queue:', error);
    return [];
  }
};

// Remove reservation from queue
export const removeFromQueue = async (id: string) => {
  try {
    const queue = await getQueue();
    const filtered = queue.filter(item => item.id !== id);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
    console.log('✅ Removed from queue:', id);
  } catch (error) {
    console.error('❌ Error removing from queue:', error);
  }
};

// Process queue - send all pending reservations
export const processQueue = async (): Promise<{ success: number; failed: number }> => {
  const queue = await getQueue();
  let success = 0;
  let failed = 0;

  console.log(`🔄 Processing ${queue.length} queued reservations...`);

  for (const reservation of queue) {
    try {
      await axios.post(API_ENDPOINTS.RESERVATIONS, {
        eventId: reservation.eventId,
        userId: reservation.userId,
      });
      
      await removeFromQueue(reservation.id);
      success++;
      console.log(`✅ Sent: ${reservation.eventTitle}`);
    } catch (error: any) {
      failed++;
      console.error(`❌ Failed: ${reservation.eventTitle}`, error.response?.status);
      
      // Update retry count
      reservation.retryCount++;
      if (reservation.retryCount >= 3) {
        // Remove after 3 failed attempts
        await removeFromQueue(reservation.id);
        console.log(`🗑️ Removed after 3 failed attempts: ${reservation.eventTitle}`);
      }
    }
  }

  return { success, failed };
};

// Start listening for network changes
export const startNetworkListener = (onConnectionRestored: () => void) => {
  const unsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected) {
      console.log('🌐 Connection restored');
      onConnectionRestored();
    } else {
      console.log('📴 Connection lost');
    }
  });

  return unsubscribe;
};

// Check if there are pending reservations
export const hasPendingReservations = async (): Promise<boolean> => {
  const queue = await getQueue();
  return queue.length > 0;
};

// Get count of pending reservations
export const getPendingCount = async (): Promise<number> => {
  const queue = await getQueue();
  return queue.length;
};
