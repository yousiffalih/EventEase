import React, { useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface EventDetail {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  available: number;
}

export default function EventDetailsPage() {
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    axios
      .get(`http://localhost:9020/api/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch(() => Alert.alert("❌ Error", "Failed to fetch event details"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReserve = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("❌ Error", "You must login first!");
        return;
      }

      await axios.post("http://localhost:9020/api/reservations", {
        eventId: id,
        userId: userId,
      });

      Alert.alert("✅ Success", "Reservation created successfully!");
      router.push("/reservations");
    } catch (err: any) {
      Alert.alert("❌ Error", err.response?.data || "Reservation failed");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text>Loading event details...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <Text>❌ Event not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event.title}</Text>
      <Text>{event.description}</Text>
      <Text>Date: {new Date(event.date).toLocaleString()}</Text>
      <Text>Location: {event.location}</Text>
      <Text>Available: {event.available} / {event.capacity}</Text>

      <Button title="Reserve a Place" onPress={handleReserve} disabled={event.available <= 0} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
