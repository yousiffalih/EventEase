import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Button, FlatList, StyleSheet, Alert, ActivityIndicator } from "react-native";
import axios from "axios";
import { useFocusEffect } from "expo-router";
import { API_BASE_URL } from "../../config/api";

interface Reservation {
  id: string;
  eventTitle: string;
  userEmail: string;
  status: string;
}

export default function AdminPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/reservations`);
      setReservations(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    try {
      await axios.put(`${API_BASE_URL}/admin/reservations/${id}/${action}`);
      Alert.alert("✅ Success", `Reservation ${action}ed successfully`);
      fetchReservations();
    } catch (err) {
      Alert.alert("❌ Error", `Failed to ${action} reservation`);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // ✅ Recharger les réservations quand on revient sur la page
  useFocusEffect(
    useCallback(() => {
      fetchReservations();
    }, [fetchReservations])
  );

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
      <Text style={styles.title}>Admin Dashboard</Text>
      <FlatList
        data={reservations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.eventTitle}>{item.eventTitle}</Text>
            <Text>User: {item.userEmail}</Text>
            <Text>Status: {item.status}</Text>
            <View style={styles.actions}>
              <Button title="Approve" color="green" onPress={() => handleAction(item.id, "approve")} />
              <Button title="Reject" color="red" onPress={() => handleAction(item.id, "reject")} />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  eventTitle: { fontSize: 18, fontWeight: "bold" },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
