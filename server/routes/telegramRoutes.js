// server/routes/telegramRoutes.js
import express from "express";
import axios from "axios";
import "dotenv/config";
import { supabaseAdmin } from "../index.js";
import { generateOtpCode, getExpirationTime } from "../utils/authUtils.js";

const router = express.Router();

// --- TELEGRAM API SETUP ---
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
// --------------------------

// --- KODNI TELEGRAM ORQALI YUBORISH FUNKSIYASI ---
const sendCodeToTelegram = async (chatId, code) => {
    const messageText = `🔑 Sizning LegalLens Kirish Kodingiz:\n\n*${code}*\n\nKod 5 daqiqa davomida amal qiladi. Uni saytga kiriting.`;

    try {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: messageText,
            parse_mode: "Markdown",
        });
        console.log(`[Telegram] Kod ${chatId} ga yuborildi.`);
        return true;
    } catch (error) {
        console.error(
            "Telegramga yuborishda xato:",
            error.response?.data || error.message
        );
        return false;
    }
};

/**
 * POST /webhook/telegram
 * Bot'dan kelgan so'rovlarni qabul qiladi (Kodni yaratish va yuborish)
 */
router.post("/webhook/telegram", async (req, res) => {
    // Haqiqiy Bot Webhook'dan Chat ID ni oling
    // Bu qismda sizning Bot hostingingiz / webhookingizdan kelgan req.body.message.from.id bo'lishi kerak.

    // DIQQAT: O'ZINGIZNING TELEGRAM CHAT ID'ingizni shu yerga kiriting!
    // Test uchun Bot bilan suhbatlashganingizdan keyin uchinchi tomon service (masalan, @userinfobot) orqali olish mumkin.
    const CHAT_ID_TO_SEND = "YOUR_TEST_USER_CHAT_ID";
    const action = req.body.action || "login";

    if (CHAT_ID_TO_SEND === "YOUR_TEST_USER_CHAT_ID") {
        // Agar bu shart bajarilsa, demak real CHAT ID o'rnatilmagan
        return res
            .status(400)
            .json({
                error: "Test uchun CHAT_ID_TO_SEND o'rnatilmadi. Botga xabar yuborish mumkin emas.",
            });
    }

    try {
        const newCode = generateOtpCode();
        const expiresAt = getExpirationTime();

        // 1. KODNI BAZAGA YOZISH/YANGILASH (ADMIN HUQUQI BILAN)
        // Biz Telegram ID ni MOCK deb oldik, siz uni CHAT_ID_TO_SEND deb ishlating
        const MOCK_TELEGRAM_ID = CHAT_ID_TO_SEND;

        const { error: upsertError } = await supabaseAdmin
            .from("auth_codes")
            .upsert(
                {
                    telegram_id: MOCK_TELEGRAM_ID,
                    auth_code: newCode,
                    code_expires_at: expiresAt,
                    is_used: false,
                    created_at: new Date().toISOString(),
                },
                { onConflict: "telegram_id" }
            );

        if (upsertError) throw upsertError;

        // 2. KODNI TELEGRAM ORQALI YUBORISH
        const isSent = await sendCodeToTelegram(CHAT_ID_TO_SEND, newCode);

        if (!isSent) {
            return res
                .status(500)
                .json({
                    success: false,
                    message:
                        "Kod yaratildi, lekin Telegramga yuborishda xato yuz berdi (Token yoki Chat ID xato).",
                });
        }

        console.log(
            `[BOT ACTION: ${action}] Yangi kod yaratildi va yuborildi: ${newCode}`
        );

        res.status(200).json({
            success: true,
            message: `Yangi kod yaratildi va ${CHAT_ID_TO_SEND} ga yuborildi.`,
        });
    } catch (error) {
        console.error("Kod yaratish va yuborish xatosi:", error);
        res.status(500).json({
            error: "Server xatosi: Ma'lumot bazasiga yozishda xato.",
        });
    }
});

export default router;
