import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import {
    // UI Ikonkalari
    MessageSquare,
    LogOut,
    Book,
    Layers,
    FileText,
    // Kategoriya tanlash uchun ikonlar
    Scale,
    Gavel,
    Briefcase,
    Building2,
    Users,
    Home,
    Globe,
    Shield,
    Lock,
    FileCheck,
} from "lucide-react";
import styles from "../styles/adminDashboard.module.css";

// Admin tanlashi mumkin bo'lgan ikonlar ro'yxati
const AVAILABLE_ICONS = [
    { name: "Scale", component: Scale, label: "Tarozi" },
    { name: "Gavel", component: Gavel, label: "Bolg'a" },
    { name: "Briefcase", component: Briefcase, label: "Portfel" },
    { name: "Building2", component: Building2, label: "Bino" },
    { name: "Users", component: Users, label: "Odamlar" },
    { name: "Home", component: Home, label: "Uy" },
    { name: "Globe", component: Globe, label: "Dunyo" },
    { name: "Shield", component: Shield, label: "Qalqon" },
    { name: "Lock", component: Lock, label: "Qulf" },
    { name: "FileCheck", component: FileCheck, label: "Hujjat" },
];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("messages"); // messages, add-term, add-cat, add-law
    const [loading, setLoading] = useState(false);

    // Data States
    const [messages, setMessages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [laws, setLaws] = useState([]);

    // Form States
    const [newTerm, setNewTerm] = useState({
        title: "",
        slug: "",
        definition: "",
        law_id: "",
        article_number: "",
        examples: "",
    });
    const [selectedCats, setSelectedCats] = useState([]);
    const [newCat, setNewCat] = useState({ name: "", slug: "", icon: "" });
    const [newLaw, setNewLaw] = useState({
        title: "",
        short_name: "",
        lex_link: "",
    });

    // --- INITIAL LOAD ---
    useEffect(() => {
        const checkUser = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session) navigate("/login");
        };
        checkUser();
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        const [msgRes, catRes, lawRes] = await Promise.all([
            supabase
                .from("messages")
                .select("*")
                .order("created_at", { ascending: false }),
            supabase.from("categories").select("*").order("name"),
            supabase.from("laws").select("*").order("title"),
        ]);

        if (msgRes.data) setMessages(msgRes.data);
        if (catRes.data) setCategories(catRes.data);
        if (lawRes.data) setLaws(lawRes.data);
        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    // --- HANDLERS ---
    const handleSaveCategory = async (e) => {
        e.preventDefault();
        if (!newCat.icon) {
            alert("Iltimos, ikonka tanlang!");
            return;
        }
        try {
            const { error } = await supabase
                .from("categories")
                .insert([newCat]);
            if (error) throw error;
            alert("Kategoriya qo'shildi!");
            setNewCat({ name: "", slug: "", icon: "" });
            fetchData();
        } catch (err) {
            alert("Xatolik: " + err.message);
        }
    };

    const handleSaveLaw = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from("laws").insert([newLaw]);
            if (error) throw error;
            alert("Qonun qo'shildi!");
            setNewLaw({ title: "", short_name: "", lex_link: "" });
            fetchData();
        } catch (err) {
            alert("Xatolik: " + err.message);
        }
    };

    const handleSaveTerm = async (e) => {
        e.preventDefault();
        try {
            const { data: termData, error: termError } = await supabase
                .from("terms")
                .insert([
                    {
                        title: newTerm.title,
                        slug: newTerm.slug,
                        definition: newTerm.definition,
                        law_id: newTerm.law_id,
                        article_number: newTerm.article_number,
                        examples: newTerm.examples
                            .split(";")
                            .map((e) => e.trim())
                            .filter((e) => e),
                    },
                ])
                .select()
                .single();

            if (termError) throw termError;

            if (selectedCats.length > 0) {
                const relations = selectedCats.map((catId) => ({
                    term_id: termData.id,
                    category_id: catId,
                }));
                const { error: relError } = await supabase
                    .from("term_categories")
                    .insert(relations);
                if (relError) throw relError;
            }

            alert("Atama muvaffaqiyatli qo'shildi!");
            setNewTerm({
                title: "",
                slug: "",
                definition: "",
                law_id: "",
                article_number: "",
                examples: "",
            });
            setSelectedCats([]);
        } catch (err) {
            alert("Xatolik: " + err.message);
        }
    };

    // --- RENDER ---
    return (
        <div className={styles.dashboard}>
            {/* SIDEBAR */}
            <aside className={styles.sidebar}>
                <div className={styles.logoArea}>
                    <Scale className="text-blue-400" size={28} />
                    <span className={styles.logoText}>LegalLens Admin</span>
                </div>

                <nav className={styles.nav}>
                    <button
                        onClick={() => setActiveTab("messages")}
                        className={
                            activeTab === "messages"
                                ? styles.activeNavLink
                                : styles.navLink
                        }>
                        <MessageSquare size={18} /> Xabarlar
                    </button>

                    <div className={styles.divider}></div>
                    <p className={styles.sectionTitle}>Qo'shish</p>

                    <button
                        onClick={() => setActiveTab("add-term")}
                        className={
                            activeTab === "add-term"
                                ? styles.activeNavLink
                                : styles.navLink
                        }>
                        <FileText size={18} /> Atama
                    </button>
                    <button
                        onClick={() => setActiveTab("add-cat")}
                        className={
                            activeTab === "add-cat"
                                ? styles.activeNavLink
                                : styles.navLink
                        }>
                        <Layers size={18} /> Kategoriya
                    </button>
                    <button
                        onClick={() => setActiveTab("add-law")}
                        className={
                            activeTab === "add-law"
                                ? styles.activeNavLink
                                : styles.navLink
                        }>
                        <Book size={18} /> Qonun
                    </button>
                </nav>

                <button onClick={handleLogout} className={styles.logoutBtn}>
                    <LogOut size={16} /> Chiqish
                </button>
            </aside>

            {/* MAIN CONTENT */}
            <main className={styles.content}>
                {/* TAB 1: XABARLAR */}
                {activeTab === "messages" && (
                    <div className="animate-fade-in">
                        <h2 className={styles.pageTitle}>
                            Kelib tushgan savollar
                        </h2>
                        <div className={styles.tableCard}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Sana</th>
                                        <th>Foydalanuvchi</th>
                                        <th>Xabar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {messages.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="3"
                                                style={{
                                                    textAlign: "center",
                                                    padding: "2rem",
                                                    color: "#94a3b8",
                                                }}>
                                                Xabarlar yo'q
                                            </td>
                                        </tr>
                                    ) : (
                                        messages.map((msg) => (
                                            <tr key={msg.id}>
                                                <td
                                                    style={{
                                                        whiteSpace: "nowrap",
                                                        color: "#64748b",
                                                        fontSize: "0.875rem",
                                                    }}>
                                                    {new Date(
                                                        msg.created_at
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    <div
                                                        style={{
                                                            fontWeight: 500,
                                                        }}>
                                                        {msg.full_name}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: "0.85rem",
                                                            color: "#64748b",
                                                        }}>
                                                        {msg.contact_info}
                                                    </div>
                                                </td>
                                                <td
                                                    style={{
                                                        color: "#334155",
                                                    }}>
                                                    {msg.message_text}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 2: ATAMA QO'SHISH */}
                {activeTab === "add-term" && (
                    <div className={styles.formContainer}>
                        <h2 className={styles.pageTitle}>
                            Yangi atama yaratish
                        </h2>
                        <form
                            onSubmit={handleSaveTerm}
                            className={styles.formCard}>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "1.5rem",
                                }}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>
                                        Atama nomi
                                    </label>
                                    <input
                                        className={styles.input}
                                        placeholder="Masalan: Aybdorlik"
                                        value={newTerm.title}
                                        onChange={(e) =>
                                            setNewTerm({
                                                ...newTerm,
                                                title: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>
                                        Slug (URL)
                                    </label>
                                    <input
                                        className={styles.input}
                                        placeholder="aybdorlik"
                                        value={newTerm.slug}
                                        onChange={(e) =>
                                            setNewTerm({
                                                ...newTerm,
                                                slug: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Ta'rif</label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Atama ma'nosi..."
                                    value={newTerm.definition}
                                    onChange={(e) =>
                                        setNewTerm({
                                            ...newTerm,
                                            definition: e.target.value,
                                        })
                                    }
                                    required
                                    rows={4}></textarea>
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "1.5rem",
                                }}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>
                                        Manba (Qonun)
                                    </label>
                                    <select
                                        className={styles.select}
                                        value={newTerm.law_id}
                                        onChange={(e) =>
                                            setNewTerm({
                                                ...newTerm,
                                                law_id: e.target.value,
                                            })
                                        }
                                        required>
                                        <option value="">Tanlang...</option>
                                        {laws.map((law) => (
                                            <option key={law.id} value={law.id}>
                                                {law.short_name || law.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>
                                        Modda
                                    </label>
                                    <input
                                        className={styles.input}
                                        placeholder="Masalan: 15-modda"
                                        value={newTerm.article_number}
                                        onChange={(e) =>
                                            setNewTerm({
                                                ...newTerm,
                                                article_number: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>
                                    Kategoriyalar
                                </label>
                                <div className={styles.tagsWrapper}>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => {
                                                if (
                                                    selectedCats.includes(
                                                        cat.id
                                                    )
                                                )
                                                    setSelectedCats(
                                                        selectedCats.filter(
                                                            (id) =>
                                                                id !== cat.id
                                                        )
                                                    );
                                                else
                                                    setSelectedCats([
                                                        ...selectedCats,
                                                        cat.id,
                                                    ]);
                                            }}
                                            className={
                                                selectedCats.includes(cat.id)
                                                    ? styles.tagActive
                                                    : styles.tag
                                            }>
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>
                                    Misollar (har bir misolni ; bilan ajrating)
                                </label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Masalan: Misol 1; Misol 2"
                                    value={newTerm.examples}
                                    onChange={(e) =>
                                        setNewTerm({
                                            ...newTerm,
                                            examples: e.target.value,
                                        })
                                    }
                                    rows={2}></textarea>
                            </div>

                            <button type="submit" className={styles.primaryBtn}>
                                Saqlash
                            </button>
                        </form>
                    </div>
                )}

                {/* TAB 3: KATEGORIYA QO'SHISH (ICON PICKER BILAN) */}
                {activeTab === "add-cat" && (
                    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                        <h2 className={styles.pageTitle}>Yangi kategoriya</h2>
                        <form
                            onSubmit={handleSaveCategory}
                            className={styles.formCard}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>
                                    Kategoriya nomi
                                </label>
                                <input
                                    className={styles.input}
                                    placeholder="Masalan: Oila huquqi"
                                    value={newCat.name}
                                    onChange={(e) =>
                                        setNewCat({
                                            ...newCat,
                                            name: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>
                                    Slug (URL uchun)
                                </label>
                                <input
                                    className={styles.input}
                                    placeholder="oila-huquqi"
                                    value={newCat.slug}
                                    onChange={(e) =>
                                        setNewCat({
                                            ...newCat,
                                            slug: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>

                            {/* ICON PICKER */}
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>
                                    Ikonka tanlang
                                </label>
                                <div className={styles.iconGrid}>
                                    {AVAILABLE_ICONS.map((icon) => {
                                        const IconComp = icon.component;
                                        const isSelected =
                                            newCat.icon === icon.name;
                                        return (
                                            <div
                                                key={icon.name}
                                                onClick={() =>
                                                    setNewCat({
                                                        ...newCat,
                                                        icon: icon.name,
                                                    })
                                                }
                                                className={`${
                                                    styles.iconOption
                                                } ${
                                                    isSelected
                                                        ? styles.iconSelected
                                                        : ""
                                                }`}>
                                                <IconComp size={24} />
                                                <span
                                                    className={
                                                        styles.iconLabel
                                                    }>
                                                    {icon.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <button type="submit" className={styles.primaryBtn}>
                                Kategoriya qo'shish
                            </button>
                        </form>
                    </div>
                )}

                {/* TAB 4: QONUN QO'SHISH */}
                {activeTab === "add-law" && (
                    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                        <h2 className={styles.pageTitle}>
                            Yangi qonun manbasi
                        </h2>
                        <form
                            onSubmit={handleSaveLaw}
                            className={styles.formCard}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>
                                    To'liq nomi
                                </label>
                                <input
                                    className={styles.input}
                                    placeholder="O'zbekiston Respublikasi Jinoyat Kodeksi"
                                    value={newLaw.title}
                                    onChange={(e) =>
                                        setNewLaw({
                                            ...newLaw,
                                            title: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "1.5rem",
                                }}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>
                                        Qisqa nomi
                                    </label>
                                    <input
                                        className={styles.input}
                                        placeholder="JK"
                                        value={newLaw.short_name}
                                        onChange={(e) =>
                                            setNewLaw({
                                                ...newLaw,
                                                short_name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>
                                        Lex.uz havolasi
                                    </label>
                                    <input
                                        className={styles.input}
                                        placeholder="https://lex.uz/..."
                                        value={newLaw.lex_link}
                                        onChange={(e) =>
                                            setNewLaw({
                                                ...newLaw,
                                                lex_link: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <button type="submit" className={styles.primaryBtn}>
                                Qonun qo'shish
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
