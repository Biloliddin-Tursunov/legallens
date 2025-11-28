import React, { useState, useRef } from "react";
import { supabase } from "../supabaseClient"; // Supabase sozlamalari
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Send } from "lucide-react";
import styles from "../styles/login.module.css";

// Bot username (start link uchun)
const BOT_USERNAME = "@legallens_bot";
// Backend API manzili (Express serveringiz)
const API_URL = "/api/verify-telegram-code";

const Auth = () => {
    const [authCode, setAuthCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const inputRef = useRef(null);

    // --- KOD O'ZGARISHINI KUZATISH ---
    const handleCodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, ""); // Faqat raqamlar
        if (value.length <= 6) {
            setAuthCode(value);

            // 6 ta raqam bo'lishi bilan avtomatik tekshirishni boshlaymiz
            if (value.length === 6) {
                verifyCode(value);
            }
        }
    };

    // --- KODNI TEKSHIRISH (BACKEND BILAN ULANISH) ---
    const verifyCode = async (codeToCheck) => {
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: codeToCheck }),
            });

            // ⚠️ DEBUG UCHUN: Javobni avval matn sifatida olamiz
            const textResponse = await response.text();
            console.log("Server Javobi:", textResponse); // Konsolga qarang

            if (!textResponse) {
                throw new Error(
                    "Serverdan bo'sh javob keldi. Backend ishlayaptimi?"
                );
            }

            // Matnni JSON ga o'giramiz
            const data = JSON.parse(textResponse);

            if (!response.ok) {
                throw new Error(
                    data.error || "Kod noto'g'ri yoki muddati tugagan."
                );
            }

            // ... Supabase auth va navigatsiya (eski kod bilan bir xil) ...
            const { error } = await supabase.auth.setSession({
                access_token: data.access_token,
                refresh_token: data.refresh_token,
            });

            if (error) throw error;

            setMessage("Muvaffaqiyatli! Tizimga kirilmoqda...");
            setTimeout(() => {
                navigate("/forum");
            }, 500);
        } catch (error) {
            console.error("Login xatosi:", error);
            // Agar JSON parse xatosi bo'lsa, tushunarliroq xabar beramiz
            if (error.message.includes("Unexpected end of JSON")) {
                setMessage(
                    "Server bilan bog'lanishda xatolik (Proxy yoki Port xato)."
                );
            } else {
                setMessage(error.message);
            }
            setAuthCode("");
            inputRef.current?.focus();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* Ikonka */}
                <div className={styles.iconWrapper}>
                    <LockKeyhole size={40} color="#fff" />
                </div>

                <h2 className={styles.title}>Tasdiqlash Kodi</h2>

                <p className={styles.description}>
                    Kirish uchun{" "}
                    <a
                        href={`https://t.me/${BOT_USERNAME.substring(
                            1
                        )}?start=login`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.botLink}>
                        {BOT_USERNAME}{" "}
                        <Send size={14} style={{ marginLeft: 4 }} />
                    </a>{" "}
                    orqali olingan 6 xonali kodni kiriting.
                </p>

                {/* Kod kiritish qismi */}
                <div
                    className={styles.otpWrapper}
                    onClick={() => inputRef.current?.focus()}>
                    {/* Vizual qutichalar */}
                    <div className={styles.otpContainer}>
                        {[...Array(6)].map((_, index) => (
                            <div
                                key={index}
                                className={`${styles.otpBox} ${
                                    authCode.length === index
                                        ? styles.active
                                        : ""
                                } ${
                                    authCode.length > index ? styles.filled : ""
                                } ${
                                    message &&
                                    !message.startsWith("Muvaffaqiyatli")
                                        ? styles.errorBox
                                        : ""
                                }`}>
                                {authCode[index] || ""}
                            </div>
                        ))}
                    </div>

                    {/* Yashirin Input (Telefonda klaviatura chiqishi uchun) */}
                    <input
                        ref={inputRef}
                        type="tel" // Raqamlar klaviaturasi uchun
                        className={styles.hiddenInput}
                        value={authCode}
                        onChange={handleCodeChange}
                        maxLength={6}
                        autoFocus
                        disabled={loading}
                        autoComplete="one-time-code"
                    />
                </div>

                {/* Status Xabarlari */}
                <div className={styles.statusMessage}>
                    {loading && (
                        <span className={styles.loading}>
                            Tekshirilmoqda...
                        </span>
                    )}

                    {!loading && message && (
                        <span
                            className={
                                message.startsWith("Muvaffaqiyatli")
                                    ? styles.success
                                    : styles.error
                            }>
                            {message}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auth;
