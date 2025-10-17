import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("❌ Error", "Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://10.6.251.93:9020/api/users/login", { email, password });
      await AsyncStorage.setItem("token", res.data.token);
      await AsyncStorage.setItem("userId", res.data.userId);
      await AsyncStorage.setItem("role", res.data.role);

      Alert.alert("✅ Success", "Logged in successfully!");
      router.replace("/(tabs)/event"); // التوجه مباشرة لصفحة الأحداث
    } catch (err) {
      Alert.alert("❌ Error", "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!username || !email || !password) {
      Alert.alert("❌ Error", "Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://10.6.251.93:9020/api/users/signup", {
        username,
        email,
        password,
        role: "USER",
      });
      

      if (res.status === 200) {
        Alert.alert("✅ Success", "Account created successfully! Please login.");
        setIsLogin(true);
        // تنظيف الحقول
        setUsername("");
        setEmail("");
        setPassword("");
      }
    } catch (err: any) {
      Alert.alert("❌ Error", err.response?.data?.message || "Email already exists or server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? "Welcome Back" : "Create Account"}</Text>
      <Text style={styles.subtitle}>
        {isLogin ? "Sign in to your account" : "Sign up to get started"}
      </Text>

      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#999"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#999"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#999"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={isLogin ? handleLogin : handleSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Please Wait..." : isLogin ? "Sign In" : "Create Account"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.switchText} onPress={() => setIsLogin(!isLogin)}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <Text style={styles.switchLink}>
          {isLogin ? "Sign Up" : "Sign In"}
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8f9fa"
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#2c3e50"
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
    color: "#7f8c8d"
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2ecc71",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#95a5a6",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold"
  },
  switchText: {
    marginTop: 20,
    color: "#34495e",
    textAlign: "center",
    fontSize: 16,
  },
  switchLink: {
    color: "#3498db",
    fontWeight: "bold",
  },
});
