// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
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
      navigation.replace('Classmates'); // เข้าสู่หน้าแรกหลังล็อกอิน
    } catch (e: any) {
      console.error('LOGIN ERROR:', e);
      Alert.alert('เข้าสู่ระบบไม่สำเร็จ', e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 20 }}>
        เข้าสู่ระบบ
      </Text>

      <TextInput
        placeholder="อีเมล"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 12 }}
      />
      <TextInput
        placeholder="รหัสผ่าน"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 12 }}
      />

      <Button title={loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'} onPress={handleLogin} disabled={loading} />
    </View>
  );
}
