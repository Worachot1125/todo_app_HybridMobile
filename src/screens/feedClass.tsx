import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "../context/authContext";
import { StatusAPI, Status } from "../api/status.service";

export default function FeedScreen({ navigation }: any) {
  const { user, token: ctxToken } = useAuth() as any;
  const myId = user?._id;

  const [posts, setPosts] = useState<Status[]>([]);
  const [content, setContent] = useState("");
  const [commentText, setCommentText] = useState<Record<string, string>>({});

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
    if (!content.trim()) return;
    try {
      const token = ctxToken || (await SecureStore.getItemAsync("token")) || "";
      await StatusAPI.createStatus(content, token);
      setContent("");
      loadPosts();
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
      const isLiked = curr ? iLiked(curr) : false;
      const token = ctxToken || (await SecureStore.getItemAsync("token")) || "";

      const updated = await StatusAPI.toggleLike(statusId, isLiked, token);
      if (!updated) throw new Error("toggleLike failed");

      // อัปเดตเฉพาะโพสต์ที่กด
      setPosts((prev) =>
        prev.map((p) =>
          p._id === statusId ? { ...p, like: updated.like ?? p.like } : p
        )
      );
    } catch (e: any) {
      Alert.alert(
        "อัปเดตไลก์ไม่สำเร็จ",
        e?.response?.data?.message || e.message
      );
    }
  };

  // ลบโพสต์/คอมเมนต์ (เฉพาะเจ้าของ)
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
      Alert.alert(
        "ลบคอมเมนต์ไม่สำเร็จ",
        e?.response?.data?.message || e.message
      );
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "700" }}>ฟีดสถานะ</Text>
      </View>

      {/* โพสต์ใหม่ */}
      <View
        style={{
          borderWidth: 1,
          borderRadius: 10,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <TextInput
          placeholder="คุณกำลังคิดอะไรอยู่?"
          value={content}
          onChangeText={setContent}
          style={{ borderWidth: 1, borderRadius: 8, padding: 8, minHeight: 80 }}
          multiline
        />
        <View style={{ height: 8 }} />
        <Button title="โพสต์" onPress={createPost} />
      </View>

      {/* รายการโพสต์ */}
      <FlatList
        data={posts}
        keyExtractor={(p) => p._id}
        renderItem={({ item }) => {
          const liked = iLiked(item);
          const isOwner = item.createdBy?._id === myId;
          return (
            <View
              style={{
                borderWidth: 1,
                borderRadius: 10,
                padding: 12,
                marginBottom: 10,
              }}
            >
              <Text style={{ fontWeight: "600" }}>
                {item.createdBy?.email ?? "unknown"}
              </Text>
              <Text style={{ color: "#666", marginTop: 2, marginBottom: 6 }}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
              <Text style={{ marginBottom: 8 }}>{item.content}</Text>

              {/* Like/Unlike */}
              <TouchableOpacity
                onPress={() => onToggleLike(item._id)}
                style={{
                  marginTop: 6,
                  backgroundColor: liked ? "#fee2e2" : "#e0f2fe",
                  borderRadius: 8,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{
                    color: liked ? "#dc2626" : "#2563eb",
                    fontWeight: "600",
                  }}
                >
                  {liked ? "💔 Unlike" : "❤️ Like"} ({item.like?.length ?? 0})
                </Text>
              </TouchableOpacity>

              {/* ลบโพสต์ (เจ้าของเท่านั้น) */}
              {isOwner && (
                <Button
                  title="🗑️ ลบโพสต์"
                  color="#dc2626"
                  onPress={() => deletePost(item._id)}
                />
              )}

              {/* คอมเมนต์ */}
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontWeight: "600", marginBottom: 4 }}>
                  ความคิดเห็น
                </Text>
                <FlatList
                  data={item.comment || []}
                  keyExtractor={(c, i) => c._id ?? String(i)}
                  renderItem={({ item: c }) => {
                    const canDelete = c.createdBy?._id === myId;
                    return (
                      <View
                        style={{
                          paddingVertical: 4,
                          borderBottomWidth: 0.5,
                          borderBottomColor: "#ddd",
                        }}
                      >
                        <Text style={{ fontWeight: "500" }}>
                          {c.createdBy?.email ?? "user"}
                        </Text>
                        <Text style={{ color: "#444" }}>{c.content}</Text>
                        {canDelete && (
                          <Button
                            title="ลบ"
                            color="#dc2626"
                            onPress={() => deleteComment(item._id, c._id!)}
                          />
                        )}
                      </View>
                    );
                  }}
                  ListEmptyComponent={
                    <Text style={{ color: "#777" }}>ยังไม่มีคอมเมนต์</Text>
                  }
                />
                <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                  <TextInput
                    placeholder="พิมพ์คอมเมนต์"
                    value={commentText[item._id] ?? ""}
                    onChangeText={(t) =>
                      setCommentText((prev) => ({ ...prev, [item._id]: t }))
                    }
                    style={{
                      borderWidth: 1,
                      borderRadius: 8,
                      padding: 8,
                      flex: 1,
                    }}
                  />
                  <Button title="ส่ง" onPress={() => addComment(item._id)} />
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
