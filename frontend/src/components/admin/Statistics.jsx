import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";
import {
    Users,
    FileText,
    MessageSquare,
    Activity,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import styles from "../../styles/statistics.module.css";

// --- 1. YORDAMCHI FUNKSIYALAR ---

// Kunlik ma'lumotlarni (masalan, so'nggi 7 kun) guruhlash uchun
const groupDataByDay = (data, dateKey, countKey) => {
    const days = {};
    const today = new Date();

    // So'nggi 7 kunni yaratish
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toLocaleDateString("uz-UZ", {
            day: "2-digit",
            month: "short",
        });
        days[dateStr] = 0;
    }

    // Ma'lumotlarni guruhlash
    data.forEach((item) => {
        const date = new Date(item[dateKey]).toLocaleDateString("uz-UZ", {
            day: "2-digit",
            month: "short",
        });
        if (days.hasOwnProperty(date)) {
            days[date] = (days[date] || 0) + 1;
        }
    });

    return Object.keys(days).map((key) => ({
        [dateKey]: key,
        [countKey]: days[key],
    }));
};

// --- 2. DETAL KOMPONENTLARI (Dinamik data bilan) ---

const UserDetail = ({ dailyUsers }) => (
    <div className={styles.detailChartBox}>
        <h5 className={styles.chartTitle}>
            Ro'yxatdan O'tish Dinamikasi (So'nggi 7 kun)
        </h5>
        <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyUsers}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                <XAxis dataKey="created_at" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    fill="#eff6ff"
                />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

const TermsDetail = ({ dailyTerms }) => (
    <div className={styles.detailChartBox}>
        <h5 className={styles.chartTitle}>
            Yangi Atamalar Kiritish (So'nggi 7 kun)
        </h5>
        <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyTerms}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                <XAxis dataKey="created_at" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

const ForumDetail = ({ questionsCount, dailyQuestions }) => (
    <div className={styles.detailGrid}>
        <div className={styles.detailChartBox} style={{ gridColumn: "span 1" }}>
            <h5 className={styles.chartTitle}>Jami Savollar Soni</h5>
            <p className={styles.detailTextLarge} style={{ color: "#d97706" }}>
                **{questionsCount}**
            </p>
            <p className={styles.detailText}>Forum faoliyatini kuzatish.</p>
        </div>
        <div className={styles.detailChartBox} style={{ gridColumn: "span 2" }}>
            <h5 className={styles.chartTitle}>Savollar Berish Dinamikasi</h5>
            <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={dailyQuestions}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                    <XAxis dataKey="created_at" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#f59e0b"
                        fill="#fef3c7"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const VisitDetail = ({ dailyVisits }) => (
    <div className={styles.detailChartBox}>
        <h5 className={styles.chartTitle}>Sayt Tashriflari Dinamikasi</h5>
        <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyVisits}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                <XAxis dataKey="created_at" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#4b5563"
                    fill="#f3f4f6"
                />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

// --- 3. KPI KART KOMPONENTI (ANIMATSIYALI) ---
const KpiCard = ({
    icon: Icon,
    label,
    value,
    color,
    onClick,
    isExpanded,
    id,
    children,
}) => {
    const stylesMap = {
        blue: { bg: "#eff6ff", text: "#3b82f6" },
        green: { bg: "#f0fdf4", text: "#10b981" },
        orange: { bg: "#fef3c7", text: "#d97706" },
        gray: { bg: "#f3f4f6", text: "#4b5563" },
    };
    const style = stylesMap[color];

    return (
        <motion.div
            layout
            onClick={() => onClick(id)}
            className={styles.kpiCard}
            style={{ borderColor: isExpanded ? style.text : "#e2e8f0" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}>
            <div className={styles.cardHeaderFlex}>
                <div
                    className={styles.kpiIconBox}
                    style={{ background: style.bg, color: style.text }}>
                    <Icon size={24} />
                </div>
                <div className={styles.kpiContent}>
                    <p className={styles.kpiLabel}>{label}</p>
                    <h3 className={styles.kpiValue}>{value}</h3>
                </div>
                <div
                    className={styles.expandIcon}
                    style={{ color: style.text }}>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}>
                        {isExpanded ? (
                            <ChevronUp size={24} />
                        ) : (
                            <ChevronDown size={24} />
                        )}
                    </motion.div>
                </div>
            </div>

            {/* EXPANDED CONTENT */}
            {isExpanded && (
                <motion.div
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: "tween", duration: 0.3 }}
                    className={styles.expandedContent}>
                    <div className={styles.cardHeader}>
                        <h4 style={{ color: style.text }}>
                            {label} haqida Batafsil
                        </h4>
                    </div>

                    {children}
                </motion.div>
            )}
        </motion.div>
    );
};

// --- 4. ASOSIY STATISTIKA KOMPONENTI ---
const Statistics = () => {
    // KPI Data (Sanash uchun)
    const [counts, setCounts] = useState({
        users: 0,
        terms: 0,
        questions: 0,
        visits: 0,
    });
    // Charts Data (Detallar uchun)
    const [dailyStats, setDailyStats] = useState({
        users: [],
        terms: [],
        questions: [],
        visits: [],
    });

    const [loading, setLoading] = useState(true);
    const [expandedCard, setExpandedCard] = useState(null);

    useEffect(() => {
        fetchDynamicStats();
    }, []);

    const fetchDynamicStats = async () => {
        try {
            setLoading(true);

            // 1. KPI SONLARINI OLISH
            const [usersCount, termsCount, forumCount, visitsCount] =
                await Promise.all([
                    supabase
                        .from("users")
                        .select("*", { count: "exact", head: true }),
                    supabase
                        .from("terms")
                        .select("*", { count: "exact", head: true }),
                    // 🔥 Forum jadvali nomi 'questions' deb o'rnatildi
                    supabase
                        .from("questions")
                        .select("*", { count: "exact", head: true }),
                    supabase
                        .from("site_visits")
                        .select("*", { count: "exact", head: true }),
                ]);

            setCounts({
                users: usersCount.count || 0,
                terms: termsCount.count || 0,
                questions: forumCount.count || 0,
                visits: visitsCount.count || 0,
            });

            // 2. DETAL GRAFIKLAR UCHUN MA'LUMOTLARNI OLISH (So'nggi 7 kun)
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - 7);
            const sevenDaysAgoISO = daysAgo.toISOString();

            const [userLog, termLog, questionLog, visitLog] = await Promise.all(
                [
                    supabase
                        .from("users")
                        .select("created_at")
                        .gte("created_at", sevenDaysAgoISO),
                    supabase
                        .from("terms")
                        .select("created_at")
                        .gte("created_at", sevenDaysAgoISO),
                    supabase
                        .from("questions")
                        .select("created_at")
                        .gte("created_at", sevenDaysAgoISO),
                    supabase
                        .from("site_visits")
                        .select("created_at")
                        .gte("created_at", sevenDaysAgoISO),
                ]
            );

            // 3. MA'LUMOTLARNI KUN BO'YICHA GURUHLASH
            setDailyStats({
                users: groupDataByDay(
                    userLog.data || [],
                    "created_at",
                    "count"
                ),
                terms: groupDataByDay(
                    termLog.data || [],
                    "created_at",
                    "count"
                ),
                questions: groupDataByDay(
                    questionLog.data || [],
                    "created_at",
                    "count"
                ),
                visits: groupDataByDay(
                    visitLog.data || [],
                    "created_at",
                    "count"
                ),
            });
        } catch (error) {
            console.error("Dinamik ma'lumotlarni yuklashda xato:", error);
            // Agar bazaga ulanishda xato bo'lsa, statik 0 ko'rsatsin, ochib qolmasin
            setCounts({
                users: "Xato",
                terms: "Xato",
                questions: "Xato",
                visits: "Xato",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (id) => {
        setExpandedCard(expandedCard === id ? null : id);
    };

    if (loading)
        return <div className={styles.loading}>Statistika yuklanmoqda...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.pageTitle}>Boshqaruv Paneli (Dinamik)</h2>
                <span className={styles.dateBadge}>
                    {new Date().toLocaleDateString("uz-UZ", {
                        dateStyle: "full",
                    })}
                </span>
            </div>

            <motion.div layout className={styles.kpiGridExpanded}>
                <KpiCard
                    id="users"
                    icon={Users}
                    label="Foydalanuvchilar"
                    value={counts.users}
                    color="blue"
                    onClick={handleCardClick}
                    isExpanded={expandedCard === "users"}>
                    <UserDetail dailyUsers={dailyStats.users} />
                </KpiCard>

                <KpiCard
                    id="terms"
                    icon={FileText}
                    label="Atamalar Bazasi"
                    value={counts.terms}
                    color="green"
                    onClick={handleCardClick}
                    isExpanded={expandedCard === "terms"}>
                    <TermsDetail dailyTerms={dailyStats.terms} />
                </KpiCard>

                <KpiCard
                    id="questions"
                    icon={MessageSquare}
                    label="Forum Savollari"
                    value={counts.questions}
                    color="orange"
                    onClick={handleCardClick}
                    isExpanded={expandedCard === "questions"}>
                    <ForumDetail
                        questionsCount={counts.questions}
                        dailyQuestions={dailyStats.questions}
                    />
                </KpiCard>

                <KpiCard
                    id="visits"
                    icon={Activity}
                    label="Jami Tashriflar"
                    value={counts.visits}
                    color="gray"
                    onClick={handleCardClick}
                    isExpanded={expandedCard === "visits"}>
                    <VisitDetail dailyVisits={dailyStats.visits} />
                </KpiCard>
            </motion.div>
        </div>
    );
};

export default Statistics;
