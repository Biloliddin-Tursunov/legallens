import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { ChevronDown } from "lucide-react";
import styles from "../styles/forum.module.css";

// Komponentlar
import ForumSidebar from "../components/forum/ForumSidebar";
import QuestionCard from "../components/forum/QuestionCard";
import ForumHeader from "../components/forum/ForumHeader";
import AskQuestionModal from "../components/forum/AskQuestionModal";

const ITEMS_PER_PAGE = 20;

const Forum = ({ session }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchQuestions(0, "");
    }, []);

    const fetchQuestions = async (pageNumber, queryStr) => {
        if (pageNumber === 0) setLoading(true);
        try {
            let query = supabase
                .from("questions")
                .select("*, answers(count)", { count: "exact" })
                .order("created_at", { ascending: false });

            if (queryStr) {
                query = query.or(
                    `title.ilike.%${queryStr}%,body.ilike.%${queryStr}%`
                );
            }

            const from = pageNumber * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;
            const { data, error } = await query.range(from, to);

            if (error) throw error;

            if (data) {
                if (pageNumber === 0) setQuestions(data);
                else setQuestions((prev) => [...prev, ...data]);
                setHasMore(data.length === ITEMS_PER_PAGE);
            }
        } catch (e) {
            console.error("Xatolik:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(0);
        fetchQuestions(0, searchQuery);
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchQuestions(nextPage, searchQuery);
    };

    const handleAddQuestion = async (title, body) => {
        setSubmitting(true);
        const tgId = session.user.user_metadata?.telegram_id;

        const { data: publicUser } = await supabase
            .from("users")
            .select("id, first_name")
            .eq("telegram_id", tgId)
            .single();

        if (!publicUser) {
            setSubmitting(false);
            return alert("Foydalanuvchi topilmadi. Qayta kiring.");
        }

        const { error } = await supabase.from("questions").insert({
            user_id: publicUser.id,
            author_name: publicUser.first_name || "Foydalanuvchi",
            title,
            body,
            tags: ["Umumiy"],
        });

        if (!error) {
            setIsModalOpen(false);
            setPage(0);
            fetchQuestions(0, searchQuery);
        } else {
            alert(error.message);
        }
        setSubmitting(false);
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <ForumHeader
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onSearch={handleSearch}
                    onOpenModal={() => setIsModalOpen(true)}
                    session={session}
                />

                <div className={styles.mainGrid}>
                    <div className={styles.questionsList}>
                        {loading && page === 0 ? (
                            <div className="text-center py-10">
                                Yuklanmoqda...
                            </div>
                        ) : questions.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                Savollar topilmadi.
                            </div>
                        ) : (
                            questions.map((q) => (
                                <QuestionCard key={q.id} question={q} />
                            ))
                        )}

                        {hasMore && !loading && questions.length > 0 && (
                            <button
                                className={styles.loadMoreBtn}
                                onClick={handleLoadMore}>
                                <ChevronDown
                                    size={18}
                                    style={{ display: "inline" }}
                                />{" "}
                                Yana yuklash
                            </button>
                        )}
                    </div>

                    <ForumSidebar />
                </div>
            </div>

            <AskQuestionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddQuestion}
                submitting={submitting}
            />
        </div>
    );
};

export default Forum;
