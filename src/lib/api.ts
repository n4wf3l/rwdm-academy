// src/lib/api.ts
export const API_BASE = "http://127.0.0.1:8080";

export async function apiFetch(input: string, init?: RequestInit) {
  const url = input.startsWith("http")
    ? input
    : `${API_BASE}${input.startsWith("/") ? "" : "/"}${input}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} on ${url}${text ? ` — ${text}` : ""}`);
  }
  return res;
}
