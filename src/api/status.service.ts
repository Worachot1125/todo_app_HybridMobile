// src/api/status.service.ts
import { api } from "./client";
import * as SecureStore from "expo-secure-store";

async function ensureToken(passedToken?: string) {
  if (passedToken && passedToken.trim()) return passedToken;
  const stored = await SecureStore.getItemAsync("token");
  return stored ?? "";
}

// ==== Types (ปรับตาม response จริงได้) ====
export type User = {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  type: string;
  confirmed: boolean;
  image?: string;
  token?: string; // สำหรับ Signin
};

export type Comment = {
  _id?: string;
  content: string;
  createdBy: { _id: string; email: string; image?: string };
  like: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type Status = {
  _id: string;
  content: string;
  createdBy: { _id: string; email: string; image?: string };
  like: string[]; // userId[]
  comment: Comment[];
  createdAt: string;
  updatedAt?: string;
};

export type Classmate = {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  type: string;
  education?: {
    major?: string;
    enrollmentYear?: string; // e.g. "2565"
    studentId?: string;
  };
};

// ==== Service รวมทุก API ที่ใช้ในแอพ ====
export const StatusAPI = {
  // ---------- Auth ----------
  async signin(email: string, password: string) {
    const res = await api.post("/api/classroom/signin", { email, password });
    // response ตัวอย่าง: { data: { ...user, token: '...' } }
    return res?.data?.data as User;
  },

  // ---------- Classmates ----------
  async classmatesAll() {
    const r = await api.get("/api/classroom/class");
    return Array.isArray(r.data) ? r.data : r.data?.data || [];
  },
  async classmatesByYear(year: string | number) {
    const r = await api.get(`/api/classroom/class/${year}`);
    return Array.isArray(r.data) ? r.data : r.data?.data || [];
  },

  // ---------- Feed: Status ----------
  async listStatus() {
    const r = await api.get("/api/classroom/status");
    return Array.isArray(r.data)
      ? (r.data as Status[])
      : (r.data?.data as Status[]) || [];
  },
  async createStatus(content: string, token?: string) {
    const auth = await ensureToken(token);
    const r = await api.post(
      "/api/classroom/status",
      { content },
      { headers: { Authorization: `Bearer ${auth}` } }
    );
    return r?.data?.data as Status;
  },

  // ---------- Comment ----------
  async addComment(statusId: string, content: string, token?: string) {
    const auth = await ensureToken(token);
    const r = await api.post(
      "/api/classroom/comment",
      { statusId, content },
      { headers: { Authorization: `Bearer ${auth}` } }
    );
    return r?.data?.data as Status; // server ส่ง status ล่าสุดทั้งก้อนกลับมา
  },

  // ✅ Like/Unlike (POST = like, DELETE = unlike)
  async toggleLike(statusId: string, isLiked: boolean, token?: string) {
    try {
      const auth = await ensureToken(token);
      const method = isLiked ? "delete" : "post";
      const res = await api.request({
        url: "/api/classroom/like",
        method,
        data: { statusId },
        headers: { Authorization: `Bearer ${auth}` },
      });
      return res?.data?.data as Status; // status ล่าสุด
    } catch (error) {
      console.error("❌ toggleLike error:", error);
      return null;
    }
  },

  // 🗑️ ลบโพสต์ของตัวเอง
  async deletePost(statusId: string, token?: string) {
    try {
      const auth = await ensureToken(token);
      const res = await api.delete(`/api/classroom/status/${statusId}`, {
        headers: { Authorization: `Bearer ${auth}` },
      });
      return res?.data?.data as Status | null;
    } catch (error: any) {
      if (error.response) {
        console.error("❌ [deletePost] Response Error:", {
          status: error.response.status,
          data: error.response.data,
        });
      } else {
        console.error("❌ [deletePost] Error:", error.message);
      }
      return null;
    }
  },

  // 💬 ลบคอมเมนต์ของตัวเอง
  async deleteComment(statusId: string, commentId: string, token?: string) {
    try {
      const auth = await ensureToken(token);
      // axios รองรับ body ใน DELETE ผ่าน key data
      const res = await api.delete(`/api/classroom/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${auth}` },
        data: { statusId },
      });
      return res?.data?.data as Status | null;
    } catch (error: any) {
      if (error.response) {
        console.error("❌ [deleteComment] Response Error:", {
          status: error.response.status,
          data: error.response.data,
        });
      } else {
        console.error("❌ [deleteComment] Error:", error.message);
      }
      return null;
    }
  },
};
