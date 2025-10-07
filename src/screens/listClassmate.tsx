import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Alert,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusAPI, Classmate } from "../api/status.service";
import HeaderUserButton from "../components/headerUserButton";

const C = {
  primary: "#2563eb",
  primary2: "#7c3aed",
  bgCard: "#ffffff",
  text: "#0f172a",
  sub: "#64748b",
  border: "rgba(255,255,255,0.55)",
  chipBg: "#ffffff",
};

export default function ClassmatesScreen({ navigation }: any) {
  const [year, setYear] = useState("2565");
  const [items, setItems] = useState<Classmate[]>([]);
  const [loading, setLoading] = useState(false);

  // Header: ซ้าย = Feed, ขวา = user/logout
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: "transparent" },
      headerTransparent: true,
      headerTitle: "",
      headerLeft: () => (
        <Pressable
          onPress={() => navigation.navigate("Feed")}
          style={({ pressed }) => [
            styles.headerBtn,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Text style={styles.headerBtnText}>Feed</Text>
        </Pressable>
      ),
      headerRight: () => <HeaderUserButton />,
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
    <LinearGradient
      colors={[C.primary, C.primary2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.fill}
    >
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <View style={styles.screenPad}>
          {/* Title + Year chip */}
          <View style={{ marginTop: 12, marginBottom: 10 }}>
            <Text style={styles.title}>Classmates</Text>
            <Text style={styles.subtitle}>
              {year ? `ปีการศึกษา ${year}` : "ทุกปีการศึกษา"}
            </Text>
          </View>

          {/* Search row */}
          <View style={styles.searchRow}>
            <View style={styles.chipInputWrap}>
              <TextInput
                value={year}
                onChangeText={setYear}
                placeholder="ปี เช่น 2565 (เว้นว่างเพื่อดูทั้งหมด)"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <Pressable
              onPress={() => fetchClassmates(year)}
              disabled={loading}
              style={({ pressed }) => [
                styles.primaryBtn,
                { opacity: loading || pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.primaryBtnText}>
                {loading ? "กำลังค้นหา..." : "ค้นหา"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setYear("");
                fetchClassmates("");
              }}
              style={({ pressed }) => [
                styles.ghostBtn,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={styles.ghostBtnText}>ล้าง</Text>
            </Pressable>
          </View>

          {/* List */}
          <FlatList
            data={items}
            keyExtractor={(it) => it._id}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={styles.avatar}>
                    <Text style={{ color: C.primary, fontWeight: "800" }}>
                      {item.firstname?.[0]?.toUpperCase() || "U"}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>
                      {item.firstname} {item.lastname}
                    </Text>
                    <Text style={styles.email}>{item.email}</Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <InfoPill label="role" value={item.role} />
                  <InfoPill label="type" value={item.type} />
                </View>

                <View style={styles.metaRow}>
                  <InfoPill
                    label="major"
                    value={item.education?.major ?? "-"}
                  />
                  <InfoPill
                    label="year"
                    value={item.education?.enrollmentYear ?? "-"}
                  />
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>ไม่พบสมาชิก</Text>}
          />
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

/* ---------- Sub Components ---------- */
function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={styles.pillValue}>{value}</Text>
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  fill: { flex: 1 },
  screenPad: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 84, // เผื่อ header โปร่งใส
  },

  // Header buttons
  headerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginLeft: 10,
  },
  headerBtnText: { color: "#fff", fontWeight: "700" },

  // Titles
  title: { color: "#fff", fontSize: 24, fontWeight: "800" },
  subtitle: { color: "rgba(255,255,255,0.9)", marginTop: 2 },

  // Search area
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    marginBottom: 12,
  },
  chipInputWrap: {
    flex: 1,
    backgroundColor: C.chipBg,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  input: { color: C.text, fontSize: 14, paddingVertical: 2 },

  primaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.9)",
  },
  primaryBtnText: { color: C.primary, fontWeight: "800" },

  ghostBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.9)",
  },
  ghostBtnText: { color: "#fff", fontWeight: "700" },

  // Cards
  card: {
    backgroundColor: C.bgCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  name: { color: C.text, fontWeight: "700", fontSize: 16 },
  email: { color: C.sub, fontSize: 12 },

  metaRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  pillLabel: {
    color: C.sub,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  pillValue: { color: C.text, fontSize: 12, fontWeight: "600" },

  empty: { textAlign: "center", color: "#e5e7eb", marginTop: 20 },
});
