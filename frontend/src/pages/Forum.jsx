import React, { useState, useEffect } from "react";
import { MessageSquare, X, Search, Hash, Zap, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import styles from "../styles/forum.module.css";

const ForumSidebar = () => (
    <div className={styles.sidebar}>
        <div className={styles.sidebarCard}>
            <h4 className={styles.cardTitle}>Mashhur teglar</h4>
            <div className={styles.tagList}>
                {["Jinoyat", "Mulk", "Aliment", "Tergov", "Mehnat"].map(
                    (tag) => (
                        <span key={tag} className={styles.tag}>
                            <Hash size={12} /> {tag}
                        </span>
                    )
                )}
            </div>
        </div>
        <div className={styles.sidebarCard}>
            <h4 className={styles.cardTitle}>Qoidalar</h4>
            <ul className={styles.ruleList}>
                <li>
                    <Zap size={14} className={styles.ruleIcon} /> Avval
                    qidiring.
                </li>
                <li>
                    <Zap size={14} className={styles.ruleIcon} /> Savolni qisqa
                    yozing.
                </li>
            </ul>
        </div>
    </div>
);

const Forum = ({ session }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newBody, setNewBody] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // --- MA'LUMOT OLISH ---
    const fetchQuestions = async () => {
        try {
            const { data, error } = await supabase
                .from("questions")
                .select("*")
                .order("created_at", { ascending: false });

            if (!error) {
                setQuestions(data || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    // --- SAVOL QO'SHISH (TUZATILGAN QISM) ---
    const handleAddQuestion = async (e) => {
        e.preventDefault();
        if (!session) return alert("Kirish kerak!");
        setSubmitting(true);

        const tgId = session.user.user_metadata?.telegram_id;

        // 1. HAQIQIY USER ID NI TOPISH
        // Biz Auth ID ni emas, public.users jadvalidagi ID ni ishlatishimiz kerak
        const { data: publicUser, error: userError } = await supabase
            .from("users")
            .select("id, first_name")
            .eq("telegram_id", tgId)
            .single();

        if (userError || !publicUser) {
            setSubmitting(false);
            return alert("Foydalanuvchi bazada topilmadi. Qayta login qiling.");
        }

        // 2. SAVOLNI SAQLASH (publicUser.id bilan)
        const { error } = await supabase.from("questions").insert({
            user_id: publicUser.id, // 🔥 TUZATILDI: session.user.id EMAS!
            author_name: publicUser.first_name || "Foydalanuvchi",
            title: newTitle,
            body: newBody,
            tags: ["Umumiy"],
        });

        if (!error) {
            setNewTitle("");
            setNewBody("");
            setIsModalOpen(false);
            fetchQuestions();
        } else {
            console.error(error);
            alert("Xatolik: " + error.message);
        }
        setSubmitting(false);
    };

    const filteredQuestions = questions.filter(
        (q) =>
            (q.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (q.body || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={styles.page}>
            <header
                className={styles.forumHeader}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "20px",
                    paddingBottom: "40px",
                }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                    }}>
                    <MessageSquare size={36} className={styles.headerIcon} />
                    <h1 className={styles.headerTitle} style={{ margin: 0 }}>
                        Yuridik Forum
                    </h1>
                </div>

                <div
                    style={{
                        display: "flex",
                        width: "100%",
                        maxWidth: "800px",
                        gap: "10px",
                        background: "rgba(255,255,255,0.15)",
                        padding: "10px",
                        borderRadius: "12px",
                        backdropFilter: "blur(5px)",
                    }}>
                    <div style={{ position: "relative", flex: 1 }}>
                        <Search
                            size={18}
                            style={{
                                position: "absolute",
                                left: "12px",
                                top: "12px",
                                color: "#64748b",
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Savollarni qidirish..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px 10px 10px 40px",
                                borderRadius: "8px",
                                border: "none",
                                fontSize: "1rem",
                                outline: "none",
                                background: "white",
                            }}
                        />
                    </div>
                    <button
                        onClick={() =>
                            session
                                ? setIsModalOpen(true)
                                : alert("Savol berish uchun tizimga kiring")
                        }
                        style={{
                            padding: "0 20px",
                            background: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            whiteSpace: "nowrap",
                        }}>
                        <Plus size={18} /> Savol Berish
                    </button>
                </div>
            </header>

            <div className={styles.mainContent}>
                <div className={styles.grid}>
                    <div className={styles.questionList}>
                        {loading ? (
                            <p style={{ textAlign: "center", padding: "20px" }}>
                                Yuklanmoqda...
                            </p>
                        ) : filteredQuestions.length === 0 ? (
                            <p
                                style={{
                                    textAlign: "center",
                                    padding: "20px",
                                    color: "#666",
                                }}>
                                Savollar topilmadi.
                            </p>
                        ) : (
                            filteredQuestions.map((q) => (
                                <div
                                    key={q.id}
                                    className={styles.questionCard}
                                    style={{
                                        background: "white",
                                        padding: "20px",
                                        borderRadius: "12px",
                                        border: "1px solid #e2e8f0",
                                        marginBottom: "15px",
                                    }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            marginBottom: "10px",
                                            fontSize: "0.9rem",
                                            color: "#64748b",
                                        }}>
                                        <span
                                            style={{
                                                fontWeight: "bold",
                                                color: "#3b82f6",
                                            }}>
                                            {q.author_name}
                                        </span>
                                        <span>
                                            {new Date(
                                                q.created_at
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <Link
                                        to={`/forum/${q.id}`}
                                        style={{
                                            textDecoration: "none",
                                            color: "#1e293b",
                                        }}>
                                        <h3
                                            style={{
                                                fontSize: "1.2rem",
                                                marginBottom: "10px",
                                            }}>
                                            {q.title}
                                        </h3>
                                    </Link>
                                    <p
                                        style={{
                                            color: "#475569",
                                            fontSize: "0.95rem",
                                            lineHeight: "1.5",
                                        }}>
                                        {q.body.length > 100
                                            ? q.body.substring(0, 100) + "..."
                                            : q.body}
                                    </p>
                                    <div style={{ marginTop: "15px" }}>
                                        <Link
                                            to={`/forum/${q.id}`}
                                            style={{
                                                color: "#2563eb",
                                                fontWeight: "500",
                                                textDecoration: "none",
                                            }}>
                                            Batafsil &rarr;
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <ForumSidebar />
                </div>
            </div>

            {isModalOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999,
                    }}>
                    <div
                        style={{
                            background: "white",
                            padding: "30px",
                            borderRadius: "12px",
                            width: "90%",
                            maxWidth: "500px",
                            position: "relative",
                        }}>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{
                                position: "absolute",
                                top: "15px",
                                right: "15px",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#64748b",
                            }}>
                            <X size={24} />
                        </button>
                        <h2 style={{ marginBottom: "20px", color: "#1e293b" }}>
                            Yangi savol
                        </h2>
                        <form onSubmit={handleAddQuestion}>
                            <input
                                required
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Mavzu"
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    marginBottom: "15px",
                                    borderRadius: "6px",
                                    border: "1px solid #cbd5e1",
                                }}
                            />
                            <textarea
                                required
                                value={newBody}
                                onChange={(e) => setNewBody(e.target.value)}
                                placeholder="Matn..."
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    minHeight: "120px",
                                    borderRadius: "6px",
                                    border: "1px solid #cbd5e1",
                                    marginBottom: "20px",
                                }}
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    background: "#3b82f6",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                }}>
                                Joylash
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Forum;
