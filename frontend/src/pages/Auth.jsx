import React, { useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { Scale } from "lucide-react";
import styles from "../styles/login.module.css";

// DIQQAT: Bot username'ingizni kiriting!
const BOT_USERNAME = "@legallens_bot";
// Express server manzilini to'g'irlang.
const API_URL = "/api/verify-telegram-code";

const Auth = () => {
    const [authCode, setAuthCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const inputRef = useRef(null);

    const handleCodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length <= 6) {
            setAuthCode(value);
            if (value.length === 6) {
                // Avtomatik tasdiqlash uchun
                setTimeout(() => verifyCode(e), 50);
            }
        }
    };

    // --- KODNI TEKSHIRISH VA KIRISH FUNKSIYASI ---
    const verifyCode = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        const codeToCheck = authCode;

        if (codeToCheck.length !== 6) {
            setMessage("Iltimos, 6 xonali kodni to'liq kiriting.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            // --- 1. EXPRESS BACKENDGA API CALL ---
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: codeToCheck }), // Kiritilgan kodni yuboramiz
            });

            const data = await response.json();

            if (!response.ok) {
                // Serverdan kelgan xato xabarini ko'rsatish
                throw new Error(
                    data.error || "Tizimga kirishda noma'lum xato yuz berdi."
                );
            }

            // --- 2. AUTHENTICATIONNI YAKUNLASH ---
            // Bu yerda server sizga agar kod to'g'ri bo'lsa, JWT tokenini (access_token va refresh_token) yuborishi kerak.

            /*
            // AGAR SERVER TOKENDARNI QAYTARSANG:
            await supabase.auth.setSession({ 
                access_token: data.access_token,
                refresh_token: data.refresh_token 
            });
            */

            setMessage("Muvaffaqiyatli! Forumga yo'naltirilmoqda...");
            navigate("/forum");
        } catch (error) {
            setMessage("Kirish xatoligi: " + error.message);
            setAuthCode("");
            inputRef.current?.focus();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={`${styles.card} ${styles.centeredContent}`}>
                <Scale
                    size={50}
                    color="var(--color-primary)"
                    style={{ marginBottom: "0.75rem" }}
                />

                <h2
                    className={styles.title}
                    style={{ fontSize: "1.8rem", marginTop: "0.5rem" }}>
                    Kirish Kodingiz
                </h2>

                <p
                    className={styles.meta}
                    style={{ marginBottom: "2rem", maxWidth: "300px" }}>
                    <a
                        href={`https://t.me/${BOT_USERNAME.substring(
                            1
                        )}?start=login`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.telegramLink}>
                        {BOT_USERNAME}
                    </a>
                    Telegram botiga kiring va kodingizni oling.
                </p>

                <form onSubmit={verifyCode} className={styles.formCode}>
                    <div
                        className={styles.otpContainer}
                        onClick={() => inputRef.current?.focus()}>
                        {[...Array(6)].map((_, index) => (
                            <div
                                key={index}
                                className={`${styles.otpBox} ${
                                    authCode.length === index
                                        ? styles.otpActive
                                        : ""
                                } ${
                                    authCode.length > index && styles.otpFilled
                                }`}>
                                {authCode[index] || ""}
                            </div>
                        ))}
                    </div>

                    <input
                        ref={inputRef}
                        type="tel"
                        className={styles.hiddenInput}
                        value={authCode}
                        onChange={handleCodeChange}
                        maxLength={6}
                        autoFocus
                        disabled={loading}
                    />

                    {message && (
                        <p
                            className={styles.error}
                            style={{
                                color: message.startsWith("Muvaffaqiyatli")
                                    ? "green"
                                    : "red",
                            }}>
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={loading || authCode.length !== 6}
                        style={{ marginTop: "2rem" }}>
                        {loading ? "Tekshirilmoqda..." : "Kirish"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Auth;
