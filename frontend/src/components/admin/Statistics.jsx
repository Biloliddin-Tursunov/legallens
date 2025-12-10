// src/components/admin/Statistics.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import {
    BarChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from "recharts";
import {
    Users,
    FileText,
    MessageSquare,
    Activity,
    Globe,
    Smartphone,
    Clock,
    UserCheck,
    UserX,
    ChevronDown,
} from "lucide-react";
import styles from "../../styles/statistics.module.css";

const Statistics = () => {
    // 1. KPI Statistikalar
    const [counts, setCounts] = useState({
        users: 0,
        terms: 0,
        questions: 0,
        visits: 0,
    });

    // 2. Grafiklarni chizish uchun ma'lumotlar
    const [deviceStats, setDeviceStats] = useState([]);
    const [dailyStats, setDailyStats] = useState([]);

    // 3. Jadval (Logs) va "Yana yuklash" logikasi
    const [visitLogs, setVisitLogs] = useState([]); // Ekranda ko'rinadigan ro'yxat
    const [page, setPage] = useState(0); // Hozirgi sahifa (0 dan boshlanadi)
    const [hasMore, setHasMore] = useState(true); // Yana ma'lumot bormi?
    const [loadingLogs, setLoadingLogs] = useState(false); // Tugma bosilganda loading
    const LOGS_PER_PAGE = 30; // Har safar nechtadan yuklash

    const [loading, setLoading] = useState(true); // Umumiy sahifa yuklanishi

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);

            // --- A) KPI SONLARINI OLISH ---
            const [usersData, termsData, forumData, visitsData] =
                await Promise.all([
                    supabase
                        .from("users")
                        .select("*", { count: "exact", head: true }),
                    supabase
                        .from("terms")
                        .select("*", { count: "exact", head: true }),
                    // ⚠️ DIQQAT: Jadval nomingiz 'forum_questions' ekanligiga ishonch hosil qiling
                    supabase
                        .from("questions")
                        .select("*", { count: "exact", head: true }),
                    supabase
                        .from("site_visits")
                        .select("*", { count: "exact", head: true }),
                ]);

            setCounts({
                users: usersData.count || 0,
                terms: termsData.count || 0,
                questions: forumData.count || 0,
                visits: visitsData.count || 0,
            });

            // --- B) GRAFIKLAR UCHUN STATISTIKA (So'nggi 100 ta asosida) ---
            const { data: chartData } = await supabase
                .from("site_visits")
                .select("device_type, created_at")
                .order("created_at", { ascending: false })
                .limit(100);

            if (chartData) {
                processChartData(chartData);
            }

            // --- C) JADVAL UCHUN ILK 30 TA ---
            await fetchMoreLogs(0); // 0-sahifani yuklaymiz
        } catch (error) {
            console.error("Ma'lumotlarni yuklashda xato:", error);
        } finally {
            setLoading(false);
        }
    };

    // Jadvalga ma'lumot qo'shish funksiyasi
    const fetchMoreLogs = async (pageNumber) => {
        setLoadingLogs(true);
        const from = pageNumber * LOGS_PER_PAGE;
        const to = from + LOGS_PER_PAGE - 1;

        const { data, error } = await supabase
            .from("site_visits")
            .select("*")
            .order("created_at", { ascending: false })
            .range(from, to);

        if (!error && data) {
            if (data.length < LOGS_PER_PAGE) {
                setHasMore(false); // Agar 30 tadan kam kelsa, demak tugadi
            }

            // Agar 0-sahifa bo'lsa yangilaymiz, aks holda eskisiga qo'shamiz
            setVisitLogs((prev) =>
                pageNumber === 0 ? data : [...prev, ...data]
            );
            setPage(pageNumber);
        }
        setLoadingLogs(false);
    };

    const processChartData = (data) => {
        // Qurilmalar
        const devices = {};
        data.forEach((item) => {
            const type = item.device_type || "Noma'lum";
            devices[type] = (devices[type] || 0) + 1;
        });
        setDeviceStats(
            Object.keys(devices).map((key) => ({
                name: key,
                value: devices[key],
            }))
        );

        // Kunlik tashriflar
        const days = {};
        [...data].reverse().forEach((item) => {
            const date = new Date(item.created_at).toLocaleDateString("uz-UZ", {
                day: "2-digit",
                month: "short",
            });
            days[date] = (days[date] || 0) + 1;
        });
        setDailyStats(
            Object.keys(days).map((key) => ({ date: key, count: days[key] }))
        );
    };

    const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

    if (loading)
        return <div className={styles.loading}>Statistika yuklanmoqda...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.pageTitle}>Boshqaruv Paneli</h2>
                <span className={styles.dateBadge}>
                    {new Date().toLocaleDateString("uz-UZ", {
                        dateStyle: "full",
                    })}
                </span>
            </div>

            {/* --- 1. HAMMA KPI KARTALAR --- */}
            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <div
                        className={styles.kpiIconBox}
                        style={{ background: "#eff6ff", color: "#3b82f6" }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <p className={styles.kpiLabel}>Foydalanuvchilar</p>
                        <h3 className={styles.kpiValue}>{counts.users}</h3>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div
                        className={styles.kpiIconBox}
                        style={{ background: "#f0fdf4", color: "#10b981" }}>
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className={styles.kpiLabel}>Atamalar Bazasi</p>
                        <h3 className={styles.kpiValue}>{counts.terms}</h3>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div
                        className={styles.kpiIconBox}
                        style={{ background: "#fef3c7", color: "#d97706" }}>
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <p className={styles.kpiLabel}>Forum Savollari</p>
                        <h3 className={styles.kpiValue}>{counts.questions}</h3>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div
                        className={styles.kpiIconBox}
                        style={{ background: "#f3f4f6", color: "#4b5563" }}>
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className={styles.kpiLabel}>Jami Tashriflar</p>
                        <h3 className={styles.kpiValue}>{counts.visits}</h3>
                    </div>
                </div>
            </div>

            {/* --- 2. GRAFIKLAR --- */}
            <div className={styles.chartsRow}>
                <div className={styles.chartCard}>
                    <div className={styles.cardHeader}>
                        <h3>Tashriflar Dinamikasi (So'nggi 7 kun)</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={dailyStats}>
                            <defs>
                                <linearGradient
                                    id="colorCount"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="#3b82f6"
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#3b82f6"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#3b82f6"
                                fillOpacity={1}
                                fill="url(#colorCount)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className={styles.chartCard}>
                    <div className={styles.cardHeader}>
                        <h3>Qurilmalar Ulushi</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={deviceStats}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value">
                                {deviceStats.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* --- 3. JADVAL (PAGINATION BILAN) --- */}
            <div className={styles.tableCard}>
                <div className={styles.cardHeader}>
                    <h3>Tashriflar Tarixi</h3>
                    <span style={{ fontSize: "0.9rem", color: "#64748b" }}>
                        Jami ko'rsatilmoqda: {visitLogs.length} ta
                    </span>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.logTable}>
                        <thead>
                            <tr>
                                <th>Foydalanuvchi</th>
                                <th>IP & Joylashuv</th>
                                <th>Qurilma</th>
                                <th>Brauzer</th>
                                <th>Sahifa</th>
                                <th>Vaqt</th>
                            </tr>
                        </thead>
                        {/* ... Jadval ichi ... */}
                        <tbody>
                            {visitLogs.map((log) => (
                                <tr key={log.id}>
                                    <td>
                                        {log.user_id ? (
                                            <div className="flex flex-col">
                                                <div
                                                    style={{
                                                        color: "#10b981",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "5px",
                                                        fontWeight: "600",
                                                    }}>
                                                    <UserCheck size={16} />
                                                    {/* 🔥 Bu yerda endi aniq ISM chiqadi (Masalan: "Azizbek") */}
                                                    {log.user_name}
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                style={{
                                                    color: "#94a3b8",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "5px",
                                                }}>
                                                <UserX size={16} />
                                                Mehmon
                                            </div>
                                        )}
                                    </td>
                                    {/* ... Qolgan ustunlar o'zgarishsiz ... */}
                                    <td>
                                        <div style={{ fontSize: "0.85rem" }}>
                                            <strong>
                                                {log.ip_address || "-"}
                                            </strong>
                                            <br />
                                            <span style={{ color: "#64748b" }}>
                                                {log.city ? `${log.city}` : ""}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        {log.device_type === "Mobile"
                                            ? "📱"
                                            : "💻"}{" "}
                                        {log.device_type}
                                    </td>
                                    <td
                                        className={styles.pathCell}
                                        title={log.page_path}>
                                        {log.page_path}
                                    </td>
                                    <td className={styles.timeCell}>
                                        {new Date(
                                            log.created_at
                                        ).toLocaleString("uz-UZ")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- YANA YUKLASH TUGMASI --- */}
                {hasMore && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            padding: "20px",
                        }}>
                        <button
                            onClick={() => fetchMoreLogs(page + 1)}
                            disabled={loadingLogs}
                            style={{
                                padding: "10px 20px",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                                background: loadingLogs ? "#f1f5f9" : "white",
                                cursor: loadingLogs ? "wait" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontWeight: "600",
                                color: "#475569",
                                transition: "all 0.2s",
                            }}>
                            {loadingLogs ? (
                                "Yuklanmoqda..."
                            ) : (
                                <>
                                    <ChevronDown size={18} />
                                    Yana yuklash
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Statistics;
