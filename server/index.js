// server/index.js (Yangi va to'liq versiya)
import "dotenv/config";
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

// --- ROUTE/UTILITY IMPORTS ---
import telegramRoutes from "./routes/telegramRoutes.js";
// -----------------------------

// --- SUPABASE ADMIN KLIENTI ---
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } }
);
export { supabaseAdmin }; // Boshqa fayllar foydalanishi uchun export qilamiz
// --------------------------------

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware'lar
app.use(
    cors({
        origin: "http://localhost:5173", // <-- REACT ISHCHIL PORTI
        methods: ["GET", "POST"],
    })
);
app.use(express.json());

// --- ROUTE ULANISHI ---
// 1. Telegram Webhook (Kod yaratish)
app.use("/webhook", telegramRoutes);

// 2. TELEGRAM KODNI TEKSHIRISH (React Frontend uchun)
app.post("/api/verify-telegram-code", async (req, res) => {
    const { code } = req.body;

    if (!code || code.length !== 6) {
        return res.status(400).json({ error: "Kod to'liq emas." });
    }

    try {
        // 1. KODNI TEKSHIRISH (Service Role)
        const { data: codeData } = await supabaseAdmin
            .from("auth_codes")
            .select("telegram_id, is_used, code_expires_at")
            .eq("auth_code", code)
            .single();

        if (
            !codeData ||
            codeData.is_used ||
            new Date(codeData.code_expires_at) < new Date()
        ) {
            return res.status(401).json({
                error: "Kod noto'g'ri, muddati o'tgan yoki ishlatilgan.",
            });
        }

        // 2. KODNI ISHLATILGAN DEB BELGILASH
        await supabaseAdmin
            .from("auth_codes")
            .update({ is_used: true })
            .eq("auth_code", code);

        // 3. FOYDALANUVCHI KIRISHINI YAKUNLASH
        // DIQQAT: Bu qismda Supabase foydalanuvchisini topib, uning ID siga asoslangan
        // sessiya (JWT) yaratish kerak. Bu eng qiyin qadam.

        // Simulyatsiya: Haqiqiy kirish tokenini yuboring.
        const MOCK_ACCESS_TOKEN = "MOCK_SESSION_JWT_FOR_USER";

        // Realdagi javob (React setSession() qilish uchun)
        return res.json({
            success: true,
            access_token: MOCK_ACCESS_TOKEN,
            refresh_token: "MOCK_REFRESH_TOKEN", // Refresh token ham kerak
            user_id: codeData.telegram_id, // Frontendga qaysi user ekanini aytamiz
        });
    } catch (error) {
        console.error("Kirish xatosi:", error);
        res.status(500).json({ error: "Server xatosi." });
    }
});

// --- SERVERNI ISHGA TUSHIRISH ---
app.listen(PORT, () => {
    console.log(`Express serveri ${PORT} portida ishlamoqda`);
});
