import React, { useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import {
    LockKeyhole,
    Send,
    Loader2,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import styles from "../styles/login.module.css";

const BOT_USERNAME = "@legallens_bot";
const API_URL =
    "https://api-legallens-uz.onrender.com/api/verify-telegram-code";

const Login = () => {
    const [authCode, setAuthCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: "", text: "" }); // type: 'error' | 'success' | 'loading'

    const navigate = useNavigate();
    const inputRef = useRef(null);

    const handleCodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length <= 6) {
            setAuthCode(value);
            setStatus({ type: "", text: "" }); // Yozish boshlanganda xatoni tozalash

            if (value.length === 6) {
                verifyCode(value);
            }
        }
    };

    const verifyCode = async (codeToCheck) => {
        setLoading(true);
        setStatus({ type: "loading", text: "Kod tekshirilmoqda..." });

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: codeToCheck }),
            });

            const textResponse = await response.text();

            if (!textResponse) throw new Error("Serverdan javob kelmadi.");

            let data;
            try {
                data = JSON.parse(textResponse);
            } catch {
                throw new Error("Tizim xatoligi (Invalid JSON).");
            }

            if (!response.ok) {
                throw new Error(data.error || "Kod noto'g'ri.");
            }

            const { error } = await supabase.auth.setSession({
                access_token: data.access_token,
                refresh_token: data.refresh_token,
            });

            if (error) throw error;

            setStatus({
                type: "success",
                text: "Muvaffaqiyatli! Kirilmoqda...",
            });

            setTimeout(() => {
                navigate("/forum");
            }, 800);
        } catch (error) {
            console.error("Login xatosi:", error);
            setStatus({
                type: "error",
                text: error.message.includes("JSON")
                    ? "Server xatosi."
                    : error.message,
            });
            setAuthCode(""); // Xato bo'lsa kodni o'chirish
            inputRef.current?.focus();
        } finally {
            setLoading(false);
        }
    };

    // Dinamik klasslarni aniqlash
    const getBoxClass = (index) => {
        let classes = styles.otpBox;
        if (status.type === "error") classes += ` ${styles.errorBox}`;
        else if (status.type === "success") classes += ` ${styles.successBox}`;
        else if (authCode.length === index) classes += ` ${styles.active}`;
        else if (authCode.length > index) classes += ` ${styles.filled}`;
        return classes;
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <LockKeyhole size={32} color="#fff" />
                    </div>
                    <h2 className={styles.title}>Xush kelibsiz!</h2>
                    <p className={styles.description}>
                        Kirish uchun avval Telegram botdan kod oling:
                    </p>

                    {/* Telegram Button (UX Improvement) */}
                    <a
                        href={`https://t.me/${BOT_USERNAME.substring(
                            1
                        )}?start=login`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.telegramBtn}>
                        <Send size={18} />
                        Kod olish (Telegram)
                    </a>
                </div>

                {/* Input Area */}
                <div
                    style={{
                        marginBottom: "10px",
                        fontSize: "0.9rem",
                        color: "#64748b",
                    }}>
                    6 xonali kodni kiriting:
                </div>

                <div
                    className={styles.otpWrapper}
                    onClick={() => inputRef.current?.focus()}>
                    <div className={styles.otpContainer}>
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className={getBoxClass(index)}>
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
                        disabled={loading || status.type === "success"}
                        autoComplete="one-time-code"
                    />
                </div>

                {/* Status Messages */}
                <div className={styles.statusMessage}>
                    {loading && (
                        <div className={styles.loading}>
                            <Loader2 size={18} className={styles.spinner} />{" "}
                            Tekshirilmoqda...
                        </div>
                    )}
                    {status.type === "error" && (
                        <div className={styles.error}>
                            <AlertCircle
                                size={18}
                                style={{
                                    display: "inline",
                                    marginRight: 5,
                                    verticalAlign: "text-bottom",
                                }}
                            />
                            {status.text}
                        </div>
                    )}
                    {status.type === "success" && (
                        <div className={styles.success}>
                            <CheckCircle
                                size={18}
                                style={{
                                    display: "inline",
                                    marginRight: 5,
                                    verticalAlign: "text-bottom",
                                }}
                            />
                            {status.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
