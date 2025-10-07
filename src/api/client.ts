// src/api/client.ts
import axios, { AxiosRequestHeaders } from "axios";
import * as SecureStore from "expo-secure-store";
import { CLASSROOM_API_KEY, BASE_URL } from "@env";

const BASE = (BASE_URL || "").replace(/\/+$/, "");

export const api = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const h: AxiosRequestHeaders = (config.headers as AxiosRequestHeaders) ?? {};
  if (CLASSROOM_API_KEY) h["x-api-key"] = CLASSROOM_API_KEY;
  const token = await SecureStore.getItemAsync("token");
  if (token) h.Authorization = `Bearer ${token}`;
  config.headers = h;

  // debug ช่วยจับ path ผิด
  if (!config.baseURL) console.warn("⚠️ No baseURL set!");
  return config;
});
