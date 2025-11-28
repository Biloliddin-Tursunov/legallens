import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import styles from "../styles/forum.module.css"; // Stilni qayta ishlatamiz

const QuestionDetail = ({ session }) => {
    const { id } = useParams();
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [newAnswer, setNewAnswer] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            // Savol
            const { data: q } = await supabase
                .from("questions")
                .select("*")
                .eq("id", id)
                .single();
            setQuestion(q);
            // Javoblar
            const { data: a } = await supabase
                .from("answers")
                .select("*")
                .eq("question_id", id)
                .order("created_at", { ascending: true });
            setAnswers(a || []);
            setLoading(false);
        };
        fetchData();
    }, [id]);

    const handleAnswer = async (e) => {
        e.preventDefault();
        if (!session) return alert("Javob berish uchun kiring!");
        if (!newAnswer.trim()) return;

        setSubmitting(true);
        // User ismi
        const tgId = session.user.user_metadata.telegram_id;
        const { data: userData } = await supabase
            .from("users")
            .select("first_name")
            .eq("telegram_id", tgId)
            .single();

        const { error } = await supabase.from("answers").insert({
            question_id: id,
            user_id: session.user.id,
            author_name: userData?.first_name || "Foydalanuvchi",
            body: newAnswer,
        });

        if (!error) {
            setNewAnswer("");
            // Javoblarni yangilash
            const { data: a } = await supabase
                .from("answers")
                .select("*")
                .eq("question_id", id)
                .order("created_at", { ascending: true });
            setAnswers(a);
        }
        setSubmitting(false);
    };

    if (loading)
        return (
            <div style={{ padding: "50px", textAlign: "center" }}>
                Yuklanmoqda...
            </div>
        );
    if (!question)
        return (
            <div style={{ padding: "50px", textAlign: "center" }}>
                Savol topilmadi
            </div>
        );

    return (
        <div
            style={{
                backgroundColor: "#f8fafc",
                minHeight: "100vh",
                padding: "20px",
            }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <Link
                    to="/forum"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        color: "#64748b",
                        textDecoration: "none",
                        marginBottom: "20px",
                        fontWeight: "500",
                    }}>
                    <ArrowLeft size={18} /> Orqaga
                </Link>

                {/* SAVOL */}
                <div
                    style={{
                        background: "white",
                        padding: "30px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        marginBottom: "30px",
                    }}>
                    <h1
                        style={{
                            fontSize: "1.8rem",
                            color: "#1e293b",
                            marginBottom: "15px",
                        }}>
                        {question.title}
                    </h1>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            color: "#64748b",
                            fontSize: "0.9rem",
                            marginBottom: "20px",
                            paddingBottom: "15px",
                            borderBottom: "1px solid #f1f5f9",
                        }}>
                        <span style={{ fontWeight: "bold", color: "#3b82f6" }}>
                            {question.author_name}
                        </span>
                        <span>
                            {new Date(question.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <p
                        style={{
                            fontSize: "1.1rem",
                            lineHeight: "1.6",
                            color: "#334155",
                            whiteSpace: "pre-wrap",
                        }}>
                        {question.body}
                    </p>
                </div>

                {/* JAVOBLAR */}
                <h3
                    style={{
                        marginBottom: "20px",
                        color: "#1e293b",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                    }}>
                    <MessageCircle size={20} /> Javoblar ({answers.length})
                </h3>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px",
                        marginBottom: "40px",
                    }}>
                    {answers.map((ans) => (
                        <div
                            key={ans.id}
                            style={{
                                background: "white",
                                padding: "20px",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                            }}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: "10px",
                                    fontSize: "0.85rem",
                                }}>
                                <span
                                    style={{
                                        fontWeight: "bold",
                                        color: "#475569",
                                    }}>
                                    {ans.author_name}
                                </span>
                                <span style={{ color: "#94a3b8" }}>
                                    {new Date(ans.created_at).toLocaleString()}
                                </span>
                            </div>
                            <p style={{ color: "#1e293b", lineHeight: "1.5" }}>
                                {ans.body}
                            </p>
                        </div>
                    ))}
                    {answers.length === 0 && (
                        <p style={{ color: "#94a3b8", fontStyle: "italic" }}>
                            Hali hech kim javob bermagan.
                        </p>
                    )}
                </div>

                {/* JAVOB YOZISH FORMASI */}
                {session ? (
                    <form
                        onSubmit={handleAnswer}
                        style={{
                            background: "white",
                            padding: "20px",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            position: "sticky",
                            bottom: "20px",
                            boxShadow: "0 -4px 20px rgba(0,0,0,0.05)",
                        }}>
                        <h4 style={{ marginBottom: "10px", color: "#1e293b" }}>
                            Javob yozish
                        </h4>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <textarea
                                value={newAnswer}
                                onChange={(e) => setNewAnswer(e.target.value)}
                                placeholder="Fikringizni yozing..."
                                required
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    borderRadius: "8px",
                                    border: "1px solid #cbd5e1",
                                    minHeight: "50px",
                                    resize: "vertical",
                                }}
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    background: "#3b82f6",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    width: "50px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                ) : (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "20px",
                            background: "#e0f2fe",
                            borderRadius: "8px",
                            color: "#0369a1",
                        }}>
                        Javob yozish uchun{" "}
                        <Link
                            to="/login"
                            style={{ fontWeight: "bold", color: "inherit" }}>
                            tizimga kiring
                        </Link>
                        .
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionDetail;
