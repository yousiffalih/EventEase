import React, { useEffect, useState, useCallback } from "react";
import { isOnline } from "../../utils/network";
import { useFocusEffect, useRouter } from "expo-router";
import { API_ENDPOINTS } from "../../config/api";
import { addToQueue, processQueue, startNetworkListener, getPendingCount } from "../../utils/offlineQueue";

import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Button,
  Alert,
  Platform
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  capacity: number;
  available: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const router = useRouter();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.EVENTS);
      setEvents(res.data);
    } catch (err) {
      console.error("❌ Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update pending count
  const updatePendingCount = useCallback(async () => {
    const count = await getPendingCount();
    setPendingCount(count);
  }, []);

  // Process queue when connection is restored
  const handleConnectionRestored = useCallback(async () => {
    console.log('🌐 Connection restored, processing queue...');
    const result = await processQueue();
    if (result.success > 0) {
      Alert.alert(
        "✅ Reservations Sent",
        `${result.success} reservation(s) sent successfully!`
      );
      await fetchEvents(); // Refresh events
      await updatePendingCount();
    }
  }, [fetchEvents, updatePendingCount]);

  // Setup network listener
  useEffect(() => {
    const unsubscribe = startNetworkListener(handleConnectionRestored);
    return () => unsubscribe();
  }, [handleConnectionRestored]);

  // Load events and pending count on mount
  useEffect(() => {
    fetchEvents();
    updatePendingCount();
  }, [fetchEvents, updatePendingCount]);

  // Reload when returning to page
  useFocusEffect(
    useCallback(() => {
      fetchEvents();
      updatePendingCount();
    }, [fetchEvents, updatePendingCount])
  );
  

  const handleReserve = async (eventId: string) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("❌ Error", "You must login first!");
        return;
      }
  
      const event = events.find((e) => e.id === eventId);
      const online = await isOnline();
  
      if (online) {
        try {
          await axios.post(API_ENDPOINTS.RESERVATIONS, { eventId, userId });
          Alert.alert("✅ Success", "Reservation sent to server!");
          await fetchEvents();
          await updatePendingCount();
        } catch (err: any) {
          // Handle specific HTTP errors
          if (err.response?.status === 409) {
            Alert.alert("⚠️ Duplicate", "You already have a reservation for this event.");
          } else if (err.response?.status === 400) {
            Alert.alert("⚠️ Full", err.response?.data || "No more places available.");
          } else if (err.response?.status === 404) {
            Alert.alert("❌ Error", "Event not found.");
          } else {
            // Server error - add to queue for retry
            if (Platform.OS !== 'web') {
              await addToQueue(eventId, userId, event?.title || "Unknown Event");
              await updatePendingCount();
              Alert.alert(
                "⏳ Queued",
                "Server error. Reservation queued and will be sent when connection is stable."
              );
            } else {
              Alert.alert("❌ Server error", "Please try again later.");
            }
          }
        }
      } else {
        // Offline mode - add to queue
        if (Platform.OS !== 'web') {
          await addToQueue(eventId, userId, event?.title || "Unknown Event");
          await updatePendingCount();
          Alert.alert(
            "⏳ Waiting for Connection",
            `Reservation for "${event?.title}" is queued.\n\nIt will be sent automatically when internet connection is restored.`
          );
        } else {
          Alert.alert("📴 Offline", "You need an internet connection to make reservations.");
        }
      }
  
      setSelectedEvent(null);
    } catch (err) {
      console.error("❌ Error:", err);
      Alert.alert("❌ Error", "Unexpected error while reserving.");
    }
  };
  

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userId");
    Alert.alert("👋 Logged out", "You have been logged out successfully");
    router.replace("/connect"); // يرجعه للـ login
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Logout and Pending Count */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Events</Text>
          {pendingCount > 0 && (
            <Text style={styles.pendingText}>
              ⏳ {pendingCount} reservation{pendingCount > 1 ? 's' : ''} waiting...
            </Text>
          )}
        </View>
        <Button title="Logout" onPress={handleLogout} color="red" />
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => setSelectedEvent(item)}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text>Date: {new Date(item.date).toLocaleDateString()}</Text>
            <Text>
              Available: {item.available}/{item.capacity}
            </Text>
            <Text style={styles.link}>👉 View Details</Text>
          </TouchableOpacity>
        )}
      />

      {/* ✅ Modal لعرض التفاصيل */}
      <Modal visible={!!selectedEvent} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedEvent && (
              <>
                <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                <Text>{selectedEvent.description}</Text>
                <Text>Date: {new Date(selectedEvent.date).toLocaleString()}</Text>
                <Text>
                  Available: {selectedEvent.available}/{selectedEvent.capacity}
                </Text>

                <Button
                  title="Reserve"
                  onPress={() => handleReserve(selectedEvent.id)}
                  disabled={selectedEvent.available <= 0}
                />
                <Button title="Close" onPress={() => setSelectedEvent(null)} color="red" />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#2c3e50" },
  pendingText: { 
    fontSize: 12, 
    color: "#f39c12", 
    marginTop: 4,
    fontWeight: "600"
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  link: { marginTop: 10, color: "blue", fontWeight: "bold" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
});
