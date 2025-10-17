import React, { useEffect, useState, useCallback } from "react";
import { isOnline } from "../../utils/network";
import { addReservation, getPendingReservations, markReservationSynced } from "../../utils/database";
import { useFocusEffect, useRouter } from "expo-router";

import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Button,
  Alert
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
  const router = useRouter();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://10.6.251.93:9020/api/events");
      setEvents(res.data);
    } catch (err) {
      console.error("❌ Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Charger les événements au montage
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ✅ Recharger les événements quand on revient sur la page
  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [fetchEvents])
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
          await axios.post("http://10.6.251.93:9020/api/reservations", { eventId, userId });
          Alert.alert("✅ Success", "Reservation sent to server!");
          // ✅ Recharger les événements pour voir les places mises à jour
          await fetchEvents();
        } catch (err) {
          Alert.alert("⚠️ Server error", "Saved locally for sync later.");
          await addReservation(event?.title || "Unknown Event", "PENDING", 1);
        }
      } else {
        await addReservation(event?.title || "Unknown Event", "PENDING", 1);
        Alert.alert("📴 Offline", "Reservation saved locally until you're online.");
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
      {/* زر Logout */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events</Text>
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
