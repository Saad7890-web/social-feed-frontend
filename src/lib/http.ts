import axios from "axios";

const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  "https://social-feed-backend-5q1x.onrender.com/api";
export const API_BASE_URL = rawBaseUrl.replace(/\/$/, "");

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});
