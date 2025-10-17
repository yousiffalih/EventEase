import React, { useState } from "react";
import { View, Text, Button, Alert, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPendingReservations, markReservationSynced } from "../../utils/database";
import { isOnline } from "../../utils/network";

export default function SyncPage() {
  const [loading, setLoading] = useState(false);

  const syncReservations = async () => {
    setLoading(true);
    const online = await isOnline();
    if (!online) {
      Alert.alert("📴 Offline", "You're offline, connect to sync.");
      setLoading(false);
      return;
    }

    const pending = await getPendingReservations();
    if (pending.length === 0) {
      Alert.alert("✅ No Pending", "Everything is already synced!");
      setLoading(false);
      return;
    }

    const userId = await AsyncStorage.getItem("userId");

    for (const r of pending) {
      try {
        await axios.post("http://10.6.251.93:9020/api/reservations", {
          eventTitle: r.eventTitle,
          userId,
        });
        await markReservationSynced(r.id);
      } catch (err) {
        console.error("❌ Failed to sync reservation:", r.id);
      }
    }

    Alert.alert("✅ Done", "All pending reservations have been synced!");
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔄 Synchronization</Text>
      <Text style={styles.subtitle}>
        This will send all offline reservations to the remote server.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2ecc71" />
      ) : (
        <Button title="Sync Now" onPress={syncReservations} color="#2ecc71" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { color: "#7f8c8d", textAlign: "center", marginBottom: 30 },
});
