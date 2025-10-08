import React, { useEffect, useState, useCallback } from "react";
import { Tabs, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function Layout() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 🧠 جلب الدور من AsyncStorage
  const fetchRole = async () => {
    const storedRole = await AsyncStorage.getItem("role");
    setRole(storedRole);
    setLoading(false);
  };

  // ✅ تحديث تلقائي كل مرة المستخدم يدخل التبويبات
  useFocusEffect(
    useCallback(() => {
      fetchRole();
    }, [])
  );

  if (loading) return null;

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" color={color} size={20} />
          ),
        }}
      />

      {/* Connect */}
      <Tabs.Screen
        name="connect"
        options={{
          title: "Connect",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" color={color} size={20} />
          ),
        }}
      />

      {/* Events */}
      <Tabs.Screen
        name="event"
        options={{
          title: "Events",
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar" color={color} size={20} />
          ),
        }}
      />

      {/* ✅ Reservations - Only for USER role */}
      <Tabs.Screen
        name="reservations"
        options={{
          title: "Reservations",
          tabBarIcon: ({ color }) => (
            <Ionicons name="list" color={color} size={20} />
          ),
          href: role === "USER" ? undefined : null,
        }}
      />

      {/* ✅ Admin - Only for ADMIN role */}
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="shield-checkmark"
              color={color}
              size={20}
            />
          ),
          href: role === "ADMIN" ? undefined : null,
        }}
      />
    </Tabs>
  );
}
