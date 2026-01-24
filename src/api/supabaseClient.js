// src/api/supabaseClient.js

// KEMASKINI: Menggunakan teknik 'Namespace Import' untuk menangani isu JSDelivr
// Ini menyelesaikan ralat "does not provide an export named createClient"
import * as supabaseDist from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Logik 'Fallback': Ambil createClient dari export biasa ATAU dari default export
const createClient = supabaseDist.createClient || supabaseDist.default?.createClient;

// Semakan keselamatan (Debugging jika masih gagal)
if (!createClient) {
  console.error("CRITICAL: Gagal memuatkan fungsi createClient dari CDN Supabase.");
}

// KONFIGURASI SUPABASE SELF-HOSTED
const SUPABASE_URL = "https://appppdag.cloud";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzYzMzczNjQ1LCJleHAiOjIwNzg3MzM2NDV9.vZOedqJzUn01PjwfaQp7VvRzSm4aRMr21QblPDK8AoY";

// Inisialisasi Client
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Wrapper untuk memudahkan panggilan dalam app.js
export const supa = {
  rpc: (fnName, params) => client.rpc(fnName, params),
  from: (tableName) => client.from(tableName)
};