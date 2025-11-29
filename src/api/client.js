// src/api/client.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
