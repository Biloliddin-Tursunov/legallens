import React from "react";
import { MessageSquare, Zap, Hash } from "lucide-react";
import Header from "../components/Header"; // Header mavjud bo'lgani uchun uni qisqartirilgan holda ishlatamiz
import styles from "../styles/forum.module.css";

// Savol kartochkasining oddiygina namunasini yaratamiz
const QuestionCard = ({ title, tags, answers, views, author, time }) => (
    <div className={styles.questionCard}>
        <div className={styles.stats}>
            <div className={styles.answerCount}>{answers}</div>
            <small>javob</small>
        </div>
        <div className={styles.summary}>
            <h3 className={styles.qTitle}>{title}</h3>
            <div className={styles.tags}>
                {tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                        {tag}
                    </span>
                ))}
            </div>
            <div className={styles.meta}>
                <span className={styles.author}>Savol beruvchi: {author}</span>
                <small>• {time}</small>
            </div>
        </div>
    </div>
);

// Sidebar komponenti
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
                    va aniq yozing.
                </li>
            </ul>
        </div>
    </div>
);

const Forum = () => {
    // Savollar ro'yxati (hozircha dummy data)
    const dummyQuestions = [
        {
            id: 1,
            title: "Ipoteka shartnomasi qanday bekor qilinadi?",
            tags: ["Fuqarolik", "Garov"],
            answers: 3,
            views: 150,
            author: "Alijon",
            time: "1 soat oldin",
        },
        {
            id: 2,
            title: "Ishga qabul qilishda sinov muddati necha oydan oshmasligi kerak?",
            tags: ["Mehnat", "Sinov"],
            answers: 7,
            views: 320,
            author: "Jasur",
            time: "5 soat oldin",
        },
        {
            id: 3,
            title: "Sudda advokat yollash majburiymi?",
            tags: ["Jinoyat", "Advokat"],
            answers: 1,
            views: 80,
            author: "Fayzulla",
            time: "kecha",
        },
    ];

    return (
        <div className={styles.page}>
            {/* Headerning fonini bu yerda ishlatmaslik uchun oddiy layout ishlatamiz */}
            <header className={styles.forumHeader}>
                <MessageSquare size={36} className={styles.headerIcon} />
                <h1 className={styles.headerTitle}>Yuridik Forum</h1>
                <p className={styles.headerSubtitle}>
                    Savol bering, tajribali huquqshunoslardan javob oling.
                </p>
            </header>

            <div className={styles.mainContent}>
                <div className={styles.grid}>
                    {/* Chap tomon: Savollar ro'yxati */}
                    <div className={styles.questionList}>
                        <div className={styles.listHeader}>
                            <h2>Barcha Savollar</h2>
                            <button className={styles.askButton}>
                                Savol Berish
                            </button>
                        </div>
                        {dummyQuestions.map((q) => (
                            <QuestionCard key={q.id} {...q} />
                        ))}
                    </div>

                    {/* O'ng tomon: Sidebar */}
                    <ForumSidebar />
                </div>
            </div>
        </div>
    );
};

export default Forum;
