import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import styles from "../styles/account.module.css";

// Komponentlar
import ProfileHeader from "../components/account/ProfileHeader";
import AccountTabs from "../components/account/AccountTabs";
import MyQuestionsList from "../components/account/MyQuestionsList";
import MyAnswersList from "../components/account/MyAnswersList";
import SavedTermsList from "../components/account/SavedTermsList";
import EditModal from "../components/account/EditModal";

const Account = ({ session }) => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("questions");

    // DATA
    const [myQuestions, setMyQuestions] = useState([]);
    const [myAnswers, setMyAnswers] = useState([]);
    const [savedTerms, setSavedTerms] = useState([]);

    // EDIT MODAL STATE
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null); // { id, title, body, type: 'question' | 'answer' }

    // FETCH DATA
    const fetchData = async () => {
        if (!session?.user) return;
        setLoading(true);

        const tgId = session.user.user_metadata?.telegram_id;
        if (tgId) {
            // 1. User Profil
            const { data: userData } = await supabase
                .from("users")
                .select("*")
                .eq("telegram_id", tgId)
                .maybeSingle();

            if (userData) {
                setProfile(userData);

                // 2. Savollar
                if (activeTab === "questions") {
                    const { data } = await supabase
                        .from("questions")
                        .select("*")
                        .eq("user_id", userData.id)
                        .order("created_at", { ascending: false });
                    setMyQuestions(data || []);
                }

                // 3. Javoblar (Relation bilan)
                if (activeTab === "answers") {
                    const { data } = await supabase
                        .from("answers")
                        .select("*, questions(title)")
                        .eq("user_id", userData.id)
                        .order("created_at", { ascending: false });
                    setMyAnswers(data || []);
                }

                // 4. Saqlangan Atamalar
                if (activeTab === "saved") {
                    const { data } = await supabase
                        .from("saved_terms")
                        .select("id, terms(*)") // saved_terms IDsi va terms ma'lumotlari
                        .eq("user_id", userData.id) // Auth user emas, public.users ID
                        .order("created_at", { ascending: false });
                    setSavedTerms(data || []);
                }
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [session, activeTab]);

    // ACTIONS
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    const handleDelete = async (id, table) => {
        if (!window.confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;

        const { error } = await supabase.from(table).delete().eq("id", id);
        if (!error) fetchData();
        else alert("Xatolik: " + error.message);
    };

    const handleEditOpen = (item, type) => {
        setEditingItem({ ...item, type });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (formData) => {
        const table = editingItem.type === "question" ? "questions" : "answers";
        const updateData = { body: formData.body };

        if (editingItem.type === "question") {
            updateData.title = formData.title;
        }

        const { error } = await supabase
            .from(table)
            .update(updateData)
            .eq("id", editingItem.id);

        if (!error) {
            setIsEditModalOpen(false);
            fetchData();
        } else {
            alert("Saqlashda xatolik: " + error.message);
        }
    };

    if (loading && !profile) {
        return (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
                Yuklanmoqda...
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <ProfileHeader profile={profile} onLogout={handleLogout} />

                <AccountTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                {activeTab === "questions" && (
                    <MyQuestionsList
                        questions={myQuestions}
                        onEdit={(item) => handleEditOpen(item, "question")}
                        onDelete={(id) => handleDelete(id, "questions")}
                    />
                )}

                {activeTab === "answers" && (
                    <MyAnswersList
                        answers={myAnswers}
                        onEdit={(item) => handleEditOpen(item, "answer")}
                        onDelete={(id) => handleDelete(id, "answers")}
                    />
                )}

                {activeTab === "saved" && (
                    <SavedTermsList
                        savedTerms={savedTerms}
                        onRemove={(id) => handleDelete(id, "saved_terms")}
                    />
                )}
            </div>

            <EditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                initialData={editingItem || {}}
                onSave={handleSaveEdit}
                title={
                    editingItem?.type === "question"
                        ? "Savolni tahrirlash"
                        : "Javobni tahrirlash"
                }
            />
        </div>
    );
};

export default Account;
