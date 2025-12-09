import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { ArrowLeft, MessageCircle, User } from "lucide-react";
import styles from "../styles/forum.module.css";

// Komponentlar
import AnswerItem from "../components/forum/AnswerItem";
import AnswerForm from "../components/forum/AnswerForm";

const QuestionDetail = ({ session }) => {
    const { id } = useParams();
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const { data: q } = await supabase
                .from("questions")
                .select("*")
                .eq("id", id)
                .single();
            setQuestion(q);
            if (q) fetchAnswers();
            setLoading(false);
        };
        fetchData();
    }, [id]);

    const fetchAnswers = async () => {
        const { data: a } = await supabase
            .from("answers")
            .select("*")
            .eq("question_id", id)
            .order("created_at", { ascending: true });
        setAnswers(a || []);
    };

    const handleAnswerSubmit = async (answerText, onSuccess) => {
        setSubmitting(true);
        try {
            const tgId = session.user.user_metadata?.telegram_id;
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("id, first_name")
                .eq("telegram_id", tgId)
                .single();

            if (userError || !userData) {
                alert("Foydalanuvchi bazada topilmadi. Qayta kiring.");
                setSubmitting(false);
                return;
            }

            const { error } = await supabase.from("answers").insert({
                question_id: id,
                user_id: userData.id,
                author_name: userData.first_name || "Foydalanuvchi",
                body: answerText,
            });

            if (error) {
                alert("Xatolik: " + error.message);
            } else {
                fetchAnswers();
                onSuccess(); // Inputni tozalash
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center p-10">Yuklanmoqda...</div>;
    if (!question)
        return <div className="text-center p-10">Savol topilmadi</div>;

    return (
        <div className={styles.page}>
            <div className={styles.container} style={{ maxWidth: "900px" }}>
                <Link to="/forum" className={styles.backLink}>
                    <ArrowLeft size={18} /> Forumga qaytish
                </Link>

                {/* SAVOL */}
                <div className={styles.detailCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.answerAuthorBadge}>
                            <div
                                className={styles.avatarPlaceholder}
                                style={{
                                    background: "#e0f2fe",
                                    color: "#0284c7",
                                }}>
                                <User size={20} />
                            </div>
                            <div>
                                <span className="font-bold text-slate-700 block">
                                    {question.author_name}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {new Date(
                                        question.created_at
                                    ).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                    <h1 className={styles.detailTitle}>{question.title}</h1>
                    <div className={styles.detailBody}>{question.body}</div>
                </div>

                {/* JAVOBLAR */}
                <div className={styles.answersSection}>
                    <h3 className={styles.answersTitle}>
                        <MessageCircle className="text-blue-500" />
                        Javoblar ({answers.length})
                    </h3>

                    {answers.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400 mb-10">
                            Hali hech kim javob bermagan. Birinchi bo'ling!
                        </div>
                    ) : (
                        answers.map((ans) => (
                            <AnswerItem key={ans.id} answer={ans} />
                        ))
                    )}
                </div>

                {/* FORM */}
                <AnswerForm
                    session={session}
                    onSubmit={handleAnswerSubmit}
                    submitting={submitting}
                />
            </div>
        </div>
    );
};

export default QuestionDetail;
