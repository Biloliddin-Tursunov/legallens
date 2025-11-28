import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, User, Archive } from "lucide-react";
// Agar css moduli kerak bo'lmasa, o'chirib tashlang yoki yo'lini to'g'rilang
import styles from "../styles/forum.module.css";

const Account = ({ session }) => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [myQuestions, setMyQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Chiqish funksiyasi
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    useEffect(() => {
        const fetchData = async () => {
            if (session?.user) {
                // 1. Telegram ID ni sessiyadan olamiz
                const tgId = session.user.user_metadata?.telegram_id;

                if (tgId) {
                    // 2. Bazadan shu Telegram ID ga ega userni topamiz
                    const { data: userData } = await supabase
                        .from("users")
                        .select("*")
                        .eq("telegram_id", tgId)
                        .maybeSingle();

                    if (userData) {
                        setProfile(userData);

                        // 3. 🔥 MUHIM: Savollarni Auth ID emas, Bazadagi ID (userData.id) orqali olamiz
                        const { data: questions } = await supabase
                            .from("questions")
                            .select("*")
                            .eq("user_id", userData.id) // <--- O'ZGARISH SHU YERDA
                            .order("created_at", { ascending: false });

                        setMyQuestions(questions || []);
                    }
                }
                setLoading(false);
            }
        };
        fetchData();
    }, [session]);

    if (loading)
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "50px",
                    fontSize: "1.2rem",
                    color: "#666",
                }}>
                Yuklanmoqda...
            </div>
        );

    return (
        <div
            style={{
                backgroundColor: "#f8fafc",
                minHeight: "100vh",
                padding: "40px 20px",
            }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                {/* --- PROFIL QISMI --- */}
                <div
                    style={{
                        background: "white",
                        padding: "30px",
                        borderRadius: "16px",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                        marginBottom: "30px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "20px",
                    }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "20px",
                        }}>
                        <div
                            style={{
                                width: "80px",
                                height: "80px",
                                background: "#e0f2fe",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#0284c7",
                            }}>
                            <User size={40} />
                        </div>
                        <div>
                            <h1
                                style={{
                                    fontSize: "1.5rem",
                                    margin: 0,
                                    color: "#1e293b",
                                }}>
                                {profile?.first_name || "Foydalanuvchi"}
                            </h1>
                            <p style={{ color: "#64748b", marginTop: "5px" }}>
                                {profile?.phone_number || "Telefon raqam yo'q"}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "12px 24px",
                            background: "#fee2e2",
                            color: "#ef4444",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            fontSize: "0.95rem",
                        }}>
                        <LogOut size={18} /> Chiqish
                    </button>
                </div>

                {/* --- MENING SAVOLLARIM --- */}
                <h2
                    style={{
                        marginBottom: "20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        color: "#334155",
                    }}>
                    <Archive size={24} /> Mening Savollarim
                </h2>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px",
                    }}>
                    {myQuestions.length === 0 ? (
                        <p
                            style={{
                                color: "#64748b",
                                textAlign: "center",
                                padding: "20px",
                                background: "white",
                                borderRadius: "12px",
                            }}>
                            Siz hali savol bermagansiz.
                        </p>
                    ) : (
                        myQuestions.map((q) => (
                            <div
                                key={q.id}
                                style={{
                                    background: "white",
                                    padding: "20px",
                                    borderRadius: "12px",
                                    border: "1px solid #e2e8f0",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                }}>
                                <Link
                                    to={`/forum/${q.id}`}
                                    style={{
                                        textDecoration: "none",
                                        color: "#1e293b",
                                    }}>
                                    <h3
                                        style={{
                                            margin: "0 0 8px 0",
                                            fontSize: "1.15rem",
                                        }}>
                                        {q.title}
                                    </h3>
                                </Link>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        fontSize: "0.85rem",
                                        color: "#94a3b8",
                                    }}>
                                    <span>
                                        {new Date(
                                            q.created_at
                                        ).toLocaleDateString()}
                                    </span>
                                    <Link
                                        to={`/forum/${q.id}`}
                                        style={{
                                            color: "#3b82f6",
                                            textDecoration: "none",
                                        }}>
                                        Ko'rish &rarr;
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Account;
