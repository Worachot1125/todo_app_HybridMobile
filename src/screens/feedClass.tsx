import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Alert,
  Pressable,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/authContext";
import { StatusAPI, Status } from "../api/status.service";
import HeaderUserButton from "../components/headerUserButton";

const C = {
  text: "#0f172a",
  sub: "#6b7280",
  like: "#ef4444",
  line: "#e5e7eb",
  card: "#ffffff",
  fab: "#2062e6ff",
  primary: "#2563eb",
};

export default function FeedScreen({ navigation }: any) {
  const { user, token: ctxToken } = useAuth() as any;
  const myId = user?._id;

  const [posts, setPosts] = useState<Status[]>([]);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [showComposer, setShowComposer] = useState(false);
  const [newContent, setNewContent] = useState("");
  const listRef = useRef<FlatList<Status>>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderUserButton />,
      headerTitle: "",
    });
  }, [navigation]);

  const iLiked = (st: Status) =>
    !!myId &&
    Array.isArray(st.like) &&
    st.like.some((uid) => String(uid) === String(myId));

  const loadPosts = async () => {
    try {
      const list = await StatusAPI.listStatus();
      setPosts(list);
    } catch (e: any) {
      Alert.alert("โหลดโพสต์ล้มเหลว", e?.response?.data?.message || e.message);
    }
  };

  const createPost = async () => {
    const text = newContent.trim();
    if (!text) return;
    try {
      const token = ctxToken || (await SecureStore.getItemAsync("token")) || "";
      await StatusAPI.createStatus(text, token);
      setNewContent("");
      setShowComposer(false);
      await loadPosts();
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (e: any) {
      Alert.alert("โพสต์ไม่สำเร็จ", e?.response?.data?.message || e.message);
    }
  };

  const addComment = async (statusId: string) => {
    const text = (commentText[statusId] || "").trim();
    if (!text) return;
    try {
      const token = ctxToken || (await SecureStore.getItemAsync("token")) || "";
      await StatusAPI.addComment(statusId, text, token);
      setCommentText((prev) => ({ ...prev, [statusId]: "" }));
      loadPosts();
    } catch (e: any) {
      Alert.alert("คอมเมนต์ไม่สำเร็จ", e?.response?.data?.message || e.message);
    }
  };

  const onToggleLike = async (statusId: string) => {
    try {
      const curr = posts.find((p) => p._id === statusId);
      const liked = curr ? iLiked(curr) : false;
      const token = ctxToken || (await SecureStore.getItemAsync("token")) || "";
      const updated = await StatusAPI.toggleLike(statusId, liked, token);
      if (!updated) throw new Error("toggleLike failed");
      setPosts((prev) =>
        prev.map((p) => (p._id === statusId ? { ...p, like: updated.like ?? p.like } : p))
      );
    } catch (e: any) {
      Alert.alert("อัปเดตไลก์ไม่สำเร็จ", e?.response?.data?.message || e.message);
    }
  };

  const deletePost = async (statusId: string) => {
    try {
      const token = ctxToken || (await SecureStore.getItemAsync("token")) || "";
      const ok = await StatusAPI.deletePost(statusId, token);
      if (ok) setPosts((prev) => prev.filter((p) => p._id !== statusId));
    } catch (e: any) {
      Alert.alert("ลบโพสต์ไม่สำเร็จ", e?.response?.data?.message || e.message);
    }
  };

  const deleteComment = async (statusId: string, commentId: string) => {
    try {
      const token = ctxToken || (await SecureStore.getItemAsync("token")) || "";
      const ok = await StatusAPI.deleteComment(statusId, commentId, token);
      if (ok) loadPosts();
    } catch (e: any) {
      Alert.alert("ลบคอมเมนต์ไม่สำเร็จ", e?.response?.data?.message || e.message);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const renderPost = ({ item }: { item: Status }) => {
    const liked = iLiked(item);
    const isOwner = item.createdBy?._id === myId;

    return (
      <View style={styles.card}>
        {/* หัวโพสต์ */}
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Text style={{ color: C.primary, fontWeight: "800" }}>
              {item.createdBy?.email?.[0]?.toUpperCase() || "U"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.createdBy?.email ?? "unknown"}</Text>
            <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>

          {isOwner && (
            <Pressable
              onPress={() => deletePost(item._id)}
              style={({ pressed }) => [{ padding: 6, opacity: pressed ? 0.5 : 1 }]}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ef4444" />
            </Pressable>
          )}
        </View>

        {/* เนื้อหา */}
        <Text style={styles.content}>{item.content}</Text>

        {/* เส้นคั่น */}
        <View style={styles.divider} />

        {/* แถว Reaction แบบตัวอย่าง: ❤️ 53 Likes | 💬 5 Comments */}
        <View style={[styles.row, { justifyContent: "space-between" }]}>
          <Pressable
            onPress={() => onToggleLike(item._id)}
            style={({ pressed }) => [styles.act, { opacity: pressed ? 0.6 : 1 }]}
          >
            <MaterialCommunityIcons
              name={liked ? "heart" : "heart-outline"}
              size={18}
              color={liked ? C.like : C.sub}
            />
            <Text style={[styles.actText, liked && { color: C.like }]}>
              {item.like?.length || 0} Likes
            </Text>
          </Pressable>

          <View style={styles.act}>
            <MaterialCommunityIcons name="comment-outline" size={18} color={C.sub} />
            <Text style={styles.actText}>{item.comment?.length || 0} Comments</Text>
          </View>
        </View>

        {/* กล่องคอมเมนต์ (bubble) + ปุ่มลบคอมเมนต์ของตัวเอง */}
        <View style={{ marginTop: 6 }}>
          {item.comment?.map((c, idx) => {
            const canDelete = c.createdBy?._id === myId;
            return (
              <View key={c._id ?? String(idx)} style={styles.commentRow}>
                <View style={[styles.avatar, { width: 28, height: 28, borderRadius: 14, marginRight: 8 }]}>
                  <Text style={{ color: C.primary, fontWeight: "800", fontSize: 12 }}>
                    {c.createdBy?.email?.[0]?.toUpperCase() || "U"}
                  </Text>
                </View>
                <View style={styles.commentBubble}>
                  <Text style={styles.commentAuthor}>{c.createdBy?.email ?? "user"}</Text>
                  <Text style={styles.commentText}>{c.content}</Text>
                </View>
                {canDelete && (
                  <Pressable
                    onPress={() => deleteComment(item._id, c._id!)}
                    style={({ pressed }) => [{ padding: 6, opacity: pressed ? 0.6 : 1 }]}
                  >
                    <MaterialCommunityIcons name="close" size={16} color="#9ca3af" />
                  </Pressable>
                )}
              </View>
            );
          })}

          {/* พิมพ์คอมเมนต์ */}
          <View style={styles.commentInputRow}>
            <TextInput
              placeholder="พิมพ์คอมเมนต์…"
              placeholderTextColor="#94a3b8"
              value={commentText[item._id] ?? ""}
              onChangeText={(t) => setCommentText((prev) => ({ ...prev, [item._id]: t }))}
              style={styles.commentInput}
            />
            <Pressable
              onPress={() => addComment(item._id)}
              style={({ pressed }) => [{ padding: 6, opacity: pressed ? 0.6 : 1 }]}
            >
              <MaterialCommunityIcons name="send" size={18} color={C.primary} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <FlatList
        ref={listRef}
        data={posts}
        keyExtractor={(p) => p._id}
        renderItem={renderPost}
        contentContainerStyle={{ padding: 12, paddingBottom: 96 }}
        onRefresh={loadPosts}
        refreshing={false}
      />

      {/* Floating Action Button (+) */}
      <Pressable
        onPress={() => setShowComposer(true)}
        style={({ pressed }) => [
          styles.fab,
          { transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
        accessibilityLabel="เพิ่มโพสต์ใหม่"
      >
        <MaterialCommunityIcons name="plus" size={28} color="#1f2937" />
      </Pressable>

      {/* Popup Composer */}
      <Modal
        visible={showComposer}
        transparent
        animationType="fade"
        onRequestClose={() => setShowComposer(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          style={styles.modalWrap}
        >
          <Pressable style={styles.backdrop} onPress={() => setShowComposer(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>สร้างโพสต์</Text>
            <TextInput
              value={newContent}
              onChangeText={setNewContent}
              placeholder="คุณกำลังคิดอะไรอยู่?"
              placeholderTextColor="#94a3b8"
              multiline
              style={styles.modalInput}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
              <Pressable onPress={() => setShowComposer(false)} style={styles.btnGhost}>
                <Text style={styles.btnGhostText}>ยกเลิก</Text>
              </Pressable>
              <Pressable onPress={createPost} style={styles.btnPrimary}>
                <Text style={styles.btnPrimaryText}>โพสต์</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

/* ================= Styles ================= */
const styles = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  row: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#e0f2fe",
    alignItems: "center", justifyContent: "center",
    marginRight: 10,
  },
  name: { color: C.text, fontWeight: "700" },
  time: { color: C.sub, fontSize: 12 },
  content: { color: C.text, marginTop: 6, lineHeight: 20 },

  divider: { height: 1, backgroundColor: C.line, marginVertical: 8 },

  act: { flexDirection: "row", alignItems: "center", gap: 6 },
  actText: { color: C.sub, fontWeight: "700" },

  commentRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 8 },
  commentBubble: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  commentAuthor: { color: C.text, fontWeight: "700", fontSize: 12 },
  commentText: { color: C.text, fontSize: 13 },

  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  commentInput: { flex: 1, color: C.text, paddingVertical: 8 },

  fab: {
    position: "absolute",
    right: 18,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.fab,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  // Modal
  modalWrap: { flex: 1, justifyContent: "center" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  modalCard: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
  },
  modalTitle: { fontWeight: "800", fontSize: 16, color: C.text, marginBottom: 8 },
  modalInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    padding: 10,
    color: C.text,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  btnGhost: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },
  btnGhostText: { color: "#374151", fontWeight: "700" },
  btnPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: C.primary,
  },
  btnPrimaryText: { color: "#fff", fontWeight: "800" },
});
