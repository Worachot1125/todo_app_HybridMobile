import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState('worachot.t@kkumail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    try {
      setLoading(true);
      await login(email.trim(), password);
      navigation.replace('Classmates');
    } catch (e: any) {
      Alert.alert('เข้าสู่ระบบไม่สำเร็จ', e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#2563eb', '#7c3aed']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.fill}
    >
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <View style={styles.container}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <Ionicons name="person" size={42} color="#2563eb" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Welcome Back</Text>

          {/* Email */}
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={18} color="#6b7280" style={styles.inputIcon} />
            <TextInput
              placeholder="Username"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />
          </View>

          {/* Password */}
          <View style={[styles.inputWrap, { marginTop: 12 }]}>
            <Ionicons name="lock-closed-outline" size={18} color="#6b7280" style={styles.inputIcon} />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />
          </View>

          {/* Login button */}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [
              styles.loginBtn,
              { opacity: loading || pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.loginText}>{loading ? 'Signing in...' : 'Login'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  avatar: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    color: '#111827',
    paddingVertical: 2,
    fontSize: 15,
  },
  loginBtn: {
    marginTop: 18,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  loginText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
