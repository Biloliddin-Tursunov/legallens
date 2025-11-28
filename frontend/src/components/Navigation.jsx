import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { User, MessageSquare, LogIn, Home } from "lucide-react";

const Navigation = () => {
    const [session, setSession] = useState(null);
    const location = useLocation();
    const path = location.pathname; // Hozirgi manzil

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

    // Login sahifalarida navigatsiya ko'rinmasin (xohishga ko'ra)
    if (path === "/login" || path === "/admin/login") return null;

    return (
        <div
            style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                zIndex: 9999,
                display: "flex",
                gap: "12px",
                alignItems: "center",
            }}>
            {/* 1. BOSH SAHIFAGA QAYTISH TUGMASI */}
            {/* Agar Bosh sahifada (/) bo'lsak, bu tugma ko'rinmaydi */}
            {path !== "/" && (
                <Link
                    to="/"
                    style={{
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: "600",
                        color: "#1e293b",
                        background: "rgba(255, 255, 255, 0.9)",
                        padding: "10px 16px",
                        borderRadius: "30px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        fontSize: "0.9rem",
                        border: "1px solid rgba(255,255,255,0.5)",
                        backdropFilter: "blur(5px)",
                    }}>
                    <Home size={18} />
                    <span>Bosh sahifa</span>
                </Link>
            )}

            {/* 2. FORUM TUGMASI */}
            {/* Agar Forumda (/forum...) bo'lsak, bu tugma ko'rinmaydi */}
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

            {/* 3. LOGIN / KABINET TUGMASI */}
            {/* Agar Account (/account) sahifasida bo'lsak, bu tugma ko'rinmaydi */}
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
    );
};

export default Navigation;
