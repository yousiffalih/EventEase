import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert } from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

 const handleLogin = async () => {
   try {
     const res = await axios.post("http://localhost:9020/api/users/login", {
       email,
       password,
     });

     await AsyncStorage.setItem("token", res.data.token);
     await AsyncStorage.setItem("userId", res.data.userId);

     Alert.alert("✅ Success", "Logged in successfully!");
     router.replace("/event"); // يرجع للأحداث
   } catch (err) {
     Alert.alert("❌ Error", "Invalid credentials");
   }
 };

 // زر Logout
 const handleLogout = async () => {
   await AsyncStorage.removeItem("token");
   await AsyncStorage.removeItem("userId");
   Alert.alert("👋 Logged out");
   router.replace("/event"); // يرجع للأحداث
 };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Login" onPress={handleLogin} />

      <Text style={styles.link} onPress={() => router.push("/signup")}>
        Don't have an account? Signup
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, marginBottom: 15, borderRadius: 8 },
  link: { marginTop: 20, color: "blue", textAlign: "center" },
});
