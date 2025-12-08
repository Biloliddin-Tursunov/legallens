import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
// Scale (Tarozi) ikonkasini logo sifatida ishlatamiz
import { User, MessageSquare, LogIn } from "lucide-react";
import Logo from "../assets/logo.png";

const Navigation = () => {
    const [session, setSession] = useState(null);
    const location = useLocation();
    const path = location.pathname;

    useEffect(() => {
        supabase.auth
            .getSession()
            .then(({ data: { session } }) => setSession(session));
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
        return () => subscription.unsubscribe();
    }, []);

    if (path === "/login" || path === "/admin/login") return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%", // Butun enini egallaydi
                padding: "20px 40px",
                zIndex: 9999,
                display: "flex",
                justifyContent: "space-between", // Logo chapda, tugmalar o'ngda
                alignItems: "center",
                pointerEvents: "none", // O'rtadagi bo'sh joy saytni bosishga xalaqit bermasligi uchun
            }}>
            {/* 1. CHAP TOMON: LOGO (Bosh sahifa vazifasini bajaradi) */}
            <Link
                to="/"
                style={{
                    pointerEvents: "auto", // Logo bosiladigan bo'lishi kerak
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "#014b8a",
                    padding: "4px 4px",
                    borderRadius: "12px",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    border: "1px solid rgba(255,255,255,0.5)",
                    transition: "transform 0.2s",
                }}>
                <img
                    src={Logo}
                    style={{
                        width: "80px",
                    }}
                />
            </Link>

            {/* 2. O'NG TOMON: NAVIGATSIYA TUGMALARI */}
            <div
                style={{
                    display: "flex",
                    gap: "12px",
                    pointerEvents: "auto", // Tugmalar bosiladigan bo'lishi kerak
                }}>
                {/* FORUM TUGMASI */}
                {!path.startsWith("/forum") && (
                    <Link
                        to="/forum"
                        style={{
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontWeight: "600",
                            color: "white",
                            background: "#3b82f6",
                            padding: "10px 16px",
                            borderRadius: "30px",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                            fontSize: "0.9rem",
                            border: "1px solid rgba(255,255,255,0.2)",
                        }}>
                        <MessageSquare size={18} />
                        <span>Forum</span>
                    </Link>
                )}

                {/* KABINET / KIRISH TUGMASI */}
                {path !== "/account" &&
                    (session ? (
                        <Link
                            to="/account"
                            style={{
                                textDecoration: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontWeight: "600",
                                color: "white",
                                background: "#10b981",
                                padding: "10px 16px",
                                borderRadius: "30px",
                                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                                fontSize: "0.9rem",
                                border: "1px solid rgba(255,255,255,0.2)",
                            }}>
                            <User size={18} />
                            <span>Kabinet</span>
                        </Link>
                    ) : (
                        <Link
                            to="/login"
                            style={{
                                textDecoration: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontWeight: "600",
                                color: "#1e293b",
                                background: "rgba(255, 255, 255, 0.9)",
                                padding: "10px 20px",
                                borderRadius: "30px",
                                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                                fontSize: "0.9rem",
                            }}>
                            <LogIn size={18} />
                            <span>Kirish</span>
                        </Link>
                    ))}
            </div>
        </div>
    );
};

export default Navigation;
