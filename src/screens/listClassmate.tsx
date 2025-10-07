import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  Alert,
  Pressable,
} from "react-native";
import { StatusAPI, Classmate } from "../api/status.service";

export default function ClassmatesScreen({ navigation }: any) {
  const [year, setYear] = useState("2565");
  const [items, setItems] = useState<Classmate[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ ตั้งปุ่มบน header ให้แสดงตั้งแต่วินาทีแรกที่หน้าถูก mount
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate("Feed")}
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
            paddingHorizontal: 8,
            paddingVertical: 6,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#2563eb",
            backgroundColor: "#e0f2fe",
          })}
        >
          <Text style={{ color: "#2563eb", fontWeight: "700" }}>Feed</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  const sortByEnrollmentYearDesc = (list: Classmate[]) =>
    [...list].sort(
      (a, b) =>
        Number(b.education?.enrollmentYear ?? 0) -
        Number(a.education?.enrollmentYear ?? 0)
    );

  const fetchClassmates = async (y?: string) => {
    try {
      setLoading(true);
      const yTrim = (y ?? year).trim();

      let data: Classmate[] = [];
      if (yTrim === "") data = await StatusAPI.classmatesAll();
      else data = await StatusAPI.classmatesByYear(yTrim);

      setItems(sortByEnrollmentYearDesc(data));
    } catch (e: any) {
      Alert.alert(
        "โหลดข้อมูลไม่สำเร็จ",
        e?.response?.data?.message || e.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassmates(year);
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Header ภายในหน้า: ลบปุ่ม "ไปหน้า Feed" ออกตามที่ต้องการ */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "700" }}>
          Classmates {year ? `(ปี ${year})` : "(ทุกปี)"}
        </Text>
        {/* ❌ ลบปุ่มเดิมออก */}
      </View>

      {/* ค้นหา/ล้าง */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <TextInput
          value={year}
          onChangeText={setYear}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            padding: 8,
            flex: 1,
          }}
          placeholder="ปีการศึกษา (เช่น 2565) — เว้นว่างเพื่อดูทั้งหมด"
          keyboardType="numeric"
        />
        <Button
          title={loading ? "กำลังโหลด..." : "ค้นหา"}
          onPress={() => fetchClassmates(year)}
          disabled={loading}
        />
        <Button
          title="ล้าง"
          onPress={() => {
            setYear("");
            fetchClassmates("");
          }}
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => it._id}
        renderItem={({ item }) => (
          <View
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 10,
              padding: 12,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontWeight: "600", fontSize: 16 }}>
              {item.firstname} {item.lastname}
            </Text>
            <Text>{item.email}</Text>
            <Text style={{ color: "#666" }}>
              role: {item.role} | type: {item.type}
            </Text>
            <Text style={{ color: "#666" }}>
              major: {item.education?.major ?? "-"} | year:{" "}
              {item.education?.enrollmentYear ?? "-"}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#999", marginTop: 20 }}>
            ไม่พบสมาชิก
          </Text>
        }
      />
    </View>
  );
}
