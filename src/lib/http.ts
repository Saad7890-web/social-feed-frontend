import axios from "axios";

const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";
export const API_BASE_URL = rawBaseUrl.replace(/\/$/, "");

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});
