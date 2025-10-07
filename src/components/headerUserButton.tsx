import React from "react";
import { Alert, Pressable, Text } from "react-native";
import { useAuth } from "../context/authContext";
import { useNavigation } from "@react-navigation/native";

export default function HeaderUserButton() {
  const { logout } = useAuth();
  const navigation = useNavigation<any>();

  const onLogout = async () => {
    Alert.alert("ออกจากระบบ", "ต้องการออกจากระบบหรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ออกจากระบบ",
        style: "destructive",
        onPress: async () => {
          await logout();
          // กลับสู่หน้า Login และเคลียร์สแต็ก
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        },
      },
    ]);
  };

  return (
    <Pressable
      onPress={onLogout}
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#f5f5f5",
      })}
      accessibilityLabel="บัญชีผู้ใช้ / ออกจากระบบ"
    >
      <Text style={{ fontSize: 16 }}>👤</Text>
    </Pressable>
  );
}
