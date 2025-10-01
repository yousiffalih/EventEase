import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";

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
  const router = useRouter();

  useEffect(() => {
    axios
      .get("http://localhost:9020/api/events")
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("❌ Error fetching events:", err))
      .finally(() => setLoading(false));
  }, []);

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
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/event/${item.id}`)} // ✅ التنقل لصفحة التفاصيل
          >
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
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
});
