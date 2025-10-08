import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";

interface Reservation {
  id: string;
  eventTitle: string;
  status: string; // PENDING, ACCEPTED, REJECTED
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchReservations = async () => {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) {
      Alert.alert("❌ Error", "You must login first!");
      router.replace("/connect");
      return;
    }

    try {
      const res = await axios.get(`http://localhost:9020/api/reservations/user/${userId}`);
      setReservations(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert("❌ Error", "Could not load reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (reservationId: string) => {
    try {
      await axios.delete(`http://localhost:9020/api/reservations/${reservationId}`);
      Alert.alert("✅ Success", "Reservation cancelled!");
      fetchReservations(); // تحديث القائمة
    } catch (err) {
      console.error(err);
      Alert.alert("❌ Error", "Failed to cancel reservation");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text>Loading reservations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Reservations</Text>
      <FlatList
        data={reservations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.eventTitle}>{item.eventTitle}</Text>
            <Text>
              Status:{" "}
              <Text
                style={{
                  color:
                    item.status === "ACCEPTED"
                      ? "green"
                      : item.status === "REJECTED"
                      ? "red"
                      : "orange",
                }}
              >
                {item.status}
              </Text>
            </Text>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancel(item.id)}
            >
              <Text style={styles.cancelText}>❌ Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    elevation: 2,
  },
  eventTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  cancelButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#ff4d4d",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelText: { color: "#fff", fontWeight: "bold" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
