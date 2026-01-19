// bot/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const CHANNEL_ID = Deno.env.get("EROM_CHANNEL_ID") ?? ""; 
const APP_URL = "https://erom.tech4ag.my";
const CH_URL = Deno.env.get("EROM_CHANNEL_URL") ?? "";

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const ROOM_OPTIONS = [
  "PKG Ganun - Bilik Kursus (30 orang)",
  "PKG Melekek - Bilik Kuliah 1 (20 orang)",
  "PKG Masjid Tanah - Bilik Seri Cempaka (24 orang)",
  "PKG Masjid Tanah - Bilik Seri Melur (18 orang)",
  "PKG Masjid Tanah - Bilik Pendidikan Digital (12 orang)",
  "Bilik Mesyuarat PPDAG di SK Alor Gajah 1 (40 orang)",
  "Bilik Mesyuarat Utama PPDAG (73 orang)",
  "Bilik Mesyuarat Kecil PPDAG (15 orang)",
  "Makmal Komputer PPDAG (31 orang)",
  "Bilik Seminar PPDAG (22 orang)",
  "Bilik Temuduga PPDAG (4 orang)",
  "Bilik Runding Cara PPDAG (4 orang)",
  "Kafeteria PPDAG (30 orang)"
];

// === TELEGRAM HELPERS ===
async function tgCall(method: string, payload: any) {
  try {
    const res = await fetch(`${TELEGRAM_API}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (e) {
    console.error("TG Call Error:", e);
  }
}

async function sendMessage(chatId: string | number, text: string, extra = {}) {
  await tgCall("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    ...extra
  });
}

async function answerCallback(id: string, text = "") {
  await tgCall("answerCallbackQuery", { callback_query_id: id, text });
}

async function editMarkup(chatId: number, messageId: number) {
  await tgCall("editMessageReplyMarkup", {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: { inline_keyboard: [] }
  });
}

// === KEYBOARDS ===
function startKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "Pengguna", callback_data: "role:user" }],
      [{ text: "PIC Bilik", callback_data: "role:pic" }]
    ]
  };
}

function closeKeyboard() {
  return {
    inline_keyboard: [[{ text: "Tutup", callback_data: "close" }]]
  };
}

function roomsKeyboard(rooms: string[]) {
  const rows = rooms.map(r => [{ text: r, callback_data: `pick:${r.substring(0, 50)}` }]);
  rows.push([{ text: "Tutup", callback_data: "close" }]);
  return { inline_keyboard: rows };
}

// === LOGIK DATABASE (erom_pic) ===
async function getTakenRooms() {
  const { data, error } = await supabase.from("erom_pic").select("bilik");
  if (error || !data) return new Set();
  return new Set(data.map((r: any) => r.bilik));
}

async function assignRoom(telegramId: number, username: string | undefined, roomPart: string) {
  const fullRoomName = ROOM_OPTIONS.find(r => r.startsWith(roomPart));
  if (!fullRoomName) return { ok: false, reason: "Bilik tidak ditemui." };

  const { data: existing, error: errExist } = await supabase
    .from("erom_pic")
    .select("bilik")
    .eq("bilik", fullRoomName)
    .limit(1);

  if (errExist) return { ok: false, reason: errExist.message };
  if (existing && existing.length > 0) return { ok: false, reason: "Bilik ini telah ada PIC." };

  const { error } = await supabase.from("erom_pic").insert([{
    telegram_id: telegramId,
    telegram_username: username ?? null,
    bilik: fullRoomName,
    is_pic: true
  }]);

  if (error) return { ok: false, reason: error.message };
  return { ok: true, roomName: fullRoomName };
}

async function listMyRooms(telegramId: number) {
  const { data, error } = await supabase.from("erom_pic").select("bilik").eq("telegram_id", telegramId);
  if (error || !data) return [];
  return data.map((r: any) => r.bilik);
}

// === NOTIFIKASI TEMPAHAN KE CHANNEL ===
async function sendBookingNotification(record: any) {
  if (!CHANNEL_ID) {
    console.error("Tiada CHANNEL_ID disetkan!");
    return;
  }

  // Cari Username PIC jika ada
  let picInfo = "Tiada PIC";
  const { data: picData } = await supabase
    .from("erom_pic")
    .select("telegram_username")
    .eq("bilik", record.room)
    .single();

  if (picData?.telegram_username) {
    picInfo = `@${picData.telegram_username}`;
  }

  const message = `
📢 <b>TEMPAHAN BARU DITERIMA</b>

🏛 <b>Bilik:</b> ${record.room}
📅 <b>Tarikh:</b> ${record.booking_date}
⏰ <b>Masa:</b> ${record.start_time.slice(0,5)} - ${record.end_time.slice(0,5)}
📝 <b>Tujuan:</b> ${record.purpose}
👤 <b>Penempah:</b> ${record.booker_name}
🏢 <b>Sektor:</b> ${record.sector}
👮 <b>PIC Bilik:</b> ${picInfo}

<i>Sila semak aplikasi untuk maklumat lanjut.</i>
`;

  await sendMessage(CHANNEL_ID, message);
}

// === HANDLERS ===
async function handleStart(chatId: number) {
  await sendMessage(chatId, "<b>eROM@AG Bot</b>\nSelamat datang. Sila pilih peranan anda:", { reply_markup: startKeyboard() });
}

async function handleUserInfo(chatId: number) {
  const text = `ℹ️ <b>Info Sistem</b>\n\n• Aplikasi Web: ${APP_URL}\n• Saluran Notifikasi: ${CH_URL}`;
  await sendMessage(chatId, text, { reply_markup: closeKeyboard() });
}

async function handleAvailableRooms(chatId: number) {
  const taken = await getTakenRooms();
  const available = ROOM_OPTIONS.filter(r => !taken.has(r));
  if (available.length === 0) {
    await sendMessage(chatId, "Semua bilik sudah mempunyai PIC.", { reply_markup: closeKeyboard() });
  } else {
    await sendMessage(chatId, "Sila pilih bilik untuk didaftarkan sebagai PIC:", { reply_markup: roomsKeyboard(available) });
  }
}

async function handlePickRoom(cb: any) {
  const chatId = cb.message.chat.id;
  const messageId = cb.message.message_id;
  const user = cb.from;
  const roomPart = cb.data.slice("pick:".length);

  const res = await assignRoom(user.id, user.username, roomPart);

  if (res.ok) {
    await answerCallback(cb.id, "Berjaya didaftarkan!");
    await editMarkup(chatId, messageId);
    const mine = await listMyRooms(user.id);
    const text = `✅ <b>Pendaftaran Berjaya</b>\n\nAnda kini PIC untuk:\n<b>${res.roomName}</b>\n\nSenarai bilik anda:\n${mine.map((x: string) => `• ${x}`).join("\n")}`;
    await sendMessage(chatId, text, { reply_markup: closeKeyboard() });
  } else {
    await answerCallback(cb.id, res.reason ?? "Gagal.");
  }
}

async function handleStatus(msg: any) {
  const chatId = msg.chat.id;
  const mine = await listMyRooms(msg.from.id);
  if (mine.length === 0) {
    await sendMessage(chatId, "Anda belum mendaftar sebagai PIC mana-mana bilik.", { reply_markup: closeKeyboard() });
  } else {
    const text = "📋 <b>Status PIC</b>\n\nBilik di bawah kendalian anda:\n" + mine.map((x: string) => `• ${x}`).join("\n");
    await sendMessage(chatId, text, { reply_markup: closeKeyboard() });
  }
}

// === SERVER UTAMA (DENO) ===
Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Bot Active");

  try {
    const payload = await req.json();

    // 1. JIKA DARI SUPABASE (WEBHOOK)
    if (payload.type === 'INSERT' && payload.table === 'erom_bookings') {
      await sendBookingNotification(payload.record);
      return new Response("Notified");
    }

    // 2. JIKA DARI TELEGRAM (USER INTERACTION)
    if (payload.message) {
      const msg = payload.message;
      const chatId = msg.chat.id;
      const text = msg.text ?? "";

      if (text.startsWith("/start")) await handleStart(chatId);
      else if (text.startsWith("/bilik")) await handleAvailableRooms(chatId);
      else if (text.startsWith("/status")) await handleStatus(msg);
      else await handleStart(chatId);
      return new Response("OK");
    }
    
    if (payload.callback_query) {
      const cb = payload.callback_query;
      const data = cb.data ?? "";
      const chatId = cb.message.chat.id;

      if (data === "role:user") {
        await answerCallback(cb.id);
        await handleUserInfo(chatId);
      } else if (data === "role:pic") {
        await answerCallback(cb.id);
        await handleAvailableRooms(chatId);
      } else if (data.startsWith("pick:")) {
        await handlePickRoom(cb);
      } else if (data === "close") {
        await answerCallback(cb.id, "Ditutup");
        await editMarkup(chatId, cb.message.message_id);
      }
      return new Response("OK");
    }

  } catch (e) {
    console.error("Error:", e);
  }

  return new Response("OK");
});