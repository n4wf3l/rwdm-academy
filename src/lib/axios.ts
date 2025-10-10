// src/lib/axios.ts
import axios from "axios";

export const API_BASE = "http://127.0.0.1:8080";

export const http = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});
