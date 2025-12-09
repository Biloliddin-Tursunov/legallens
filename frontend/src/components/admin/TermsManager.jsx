import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { Edit, Trash2, Search, X, ChevronDown } from "lucide-react";
import styles from "../../styles/adminDashboard.module.css";

const ITEMS_PER_PAGE = 20; // Har safar 20 tadan yuklaydi

const TermsManager = () => {
    const [terms, setTerms] = useState([]);
    const [categories, setCategories] = useState([]);
    const [laws, setLaws] = useState([]);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false); // Faqat "Yana yuklash" uchun

    // Pagination & Search states
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // Edit form states
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        definition: "",
        law_id: "",
        article_number: "",
        examples: "",
    });
    const [selectedCats, setSelectedCats] = useState([]);

    // 1. Dastlabki yuklash (Categories & Laws)
    useEffect(() => {
        fetchHelpers();
        fetchTerms("", 0); // Birinchi 20 tani yuklash
    }, []);

    // 2. Qidiruv o'zgarganda (Debounce)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            // Qidiruv o'zgarganda page ni 0 ga tushiramiz va yangitdan qidiramiz
            setPage(0);
            fetchTerms(searchTerm, 0);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const fetchHelpers = async () => {
        const [catsRes, lawsRes] = await Promise.all([
            supabase.from("categories").select("*"),
            supabase.from("laws").select("*"),
        ]);
        if (catsRes.data) setCategories(catsRes.data);
        if (lawsRes.data) setLaws(lawsRes.data);
    };

    // --- ASOSIY FETCH FUNKSIYASI ---
    const fetchTerms = async (query = "", pageNum = 0) => {
        // Agar bu birinchi sahifa bo'lsa umumiy loading, bo'lmasa "loadingMore"
        if (pageNum === 0) setLoading(true);
        else setLoadingMore(true);

        // Range hisoblash (0-19, 20-39, ...)
        const from = pageNum * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        let supabaseQuery = supabase
            .from("terms")
            .select("*, laws(short_name)")
            .order("created_at", { ascending: false })
            .range(from, to); // 🔥 Faqat shu oraliqni oladi

        if (query) {
            supabaseQuery = supabaseQuery.ilike("title", `%${query}%`);
        }

        const { data, error } = await supabaseQuery;

        if (error) {
            console.error("Xatolik:", error);
        } else {
            // Agar kelgan ma'lumot 20 tadan kam bo'lsa, demak oxiriga yetdik
            if (data.length < ITEMS_PER_PAGE) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            // Agar 0-sahifa bo'lsa yangilaymiz, bo'lmasa eskiga qo'shamiz
            if (pageNum === 0) {
                setTerms(data);
            } else {
                setTerms((prev) => [...prev, ...data]);
            }
        }

        setLoading(false);
        setLoadingMore(false);
    };

    // --- YANA YUKLASH TUGMASI ---
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchTerms(searchTerm, nextPage);
    };

    // --- O'CHIRISH ---
    const handleDelete = async (id) => {
        if (!window.confirm("Rostdan ham o'chirmoqchimisiz?")) return;

        await supabase.from("term_categories").delete().eq("term_id", id);
        const { error } = await supabase.from("terms").delete().eq("id", id);

        if (error) alert("Xatolik: " + error.message);
        else {
            // O'chirilgandan so'ng ro'yxatni buzmaslik uchun shunchaki state dan olib tashlaymiz
            setTerms(terms.filter((t) => t.id !== id));
        }
    };

    // --- SAQLASH (Add/Edit) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formattedExamples = formData.examples
            .split(";")
            .map((e) => e.trim())
            .filter((e) => e);
        const payload = { ...formData, examples: formattedExamples };

        try {
            let termId = editingId;

            if (editingId) {
                // UPDATE
                const { error } = await supabase
                    .from("terms")
                    .update(payload)
                    .eq("id", editingId);
                if (error) throw error;
                await supabase
                    .from("term_categories")
                    .delete()
                    .eq("term_id", editingId);

                alert("Yangilandi!");
            } else {
                // CREATE
                const { data, error } = await supabase
                    .from("terms")
                    .insert([payload])
                    .select()
                    .single();
                if (error) throw error;
                termId = data.id;
                alert("Qo'shildi!");
            }

            // Kategoriyalarni ulash
            if (selectedCats.length > 0 && termId) {
                const relations = selectedCats.map((catId) => ({
                    term_id: termId,
                    category_id: catId,
                }));
                await supabase.from("term_categories").insert(relations);
            }

            resetForm();
            // Ro'yxatni boshidan yangilaymiz
            setPage(0);
            fetchTerms(searchTerm, 0);
        } catch (err) {
            alert("Xatolik: " + err.message);
        }
    };

    // Formni tozalash va Edit mode ga o'tish
    const resetForm = () => {
        setFormData({
            title: "",
            slug: "",
            definition: "",
            law_id: "",
            article_number: "",
            examples: "",
        });
        setSelectedCats([]);
        setEditingId(null);
    };

    const handleEdit = async (term) => {
        setEditingId(term.id);
        const { data: rels } = await supabase
            .from("term_categories")
            .select("category_id")
            .eq("term_id", term.id);
        const currentCatIds = rels ? rels.map((r) => r.category_id) : [];

        setFormData({
            title: term.title,
            slug: term.slug,
            definition: term.definition,
            law_id: term.law_id || "",
            article_number: term.article_number || "",
            examples: term.examples ? term.examples.join("; ") : "",
        });
        setSelectedCats(currentCatIds);
        window.scrollTo(0, 0);
    };

    return (
        <div className="animate-fade-in">
            <h2 className={styles.pageTitle}>
                {editingId ? "Atamani tahrirlash" : "Yangi atama qo'shish"}
            </h2>

            {/* FORM */}
            <form onSubmit={handleSubmit} className={styles.formCard}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "1.5rem",
                    }}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Nomi</label>
                        <input
                            className={styles.input}
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    title: e.target.value,
                                })
                            }
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Slug</label>
                        <input
                            className={styles.input}
                            value={formData.slug}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
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
                        value={formData.definition}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                definition: e.target.value,
                            })
                        }
                        rows={3}
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
                        <label className={styles.label}>Qonun</label>
                        <select
                            className={styles.select}
                            value={formData.law_id}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    law_id: e.target.value,
                                })
                            }>
                            <option value="">Tanlang...</option>
                            {laws.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.short_name || l.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Modda</label>
                        <input
                            className={styles.input}
                            value={formData.article_number}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    article_number: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Kategoriyalar</label>
                    <div className={styles.tagsWrapper}>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() =>
                                    setSelectedCats((prev) =>
                                        prev.includes(cat.id)
                                            ? prev.filter((id) => id !== cat.id)
                                            : [...prev, cat.id]
                                    )
                                }
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
                        Misollar ( ; bilan ajrating)
                    </label>
                    <textarea
                        className={styles.textarea}
                        value={formData.examples}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                examples: e.target.value,
                            })
                        }
                        rows={2}
                    />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="submit" className={styles.primaryBtn}>
                        {editingId ? "Yangilash" : "Saqlash"}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className={styles.navLink}
                            style={{ border: "1px solid #ccc" }}>
                            Bekor qilish
                        </button>
                    )}
                </div>
            </form>

            {/* SEARCH */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "3rem",
                    marginBottom: "1rem",
                }}>
                <h3 className={styles.pageTitle} style={{ margin: 0 }}>
                    Mavjud Atamalar ({terms.length} ta yuklandi)
                </h3>

                <div style={{ position: "relative", width: "300px" }}>
                    <input
                        type="text"
                        placeholder="Atamani qidirish..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.input}
                        style={{ paddingLeft: "35px", paddingRight: "35px" }}
                    />
                    <Search
                        size={18}
                        style={{
                            position: "absolute",
                            left: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#94a3b8",
                        }}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            style={{
                                position: "absolute",
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#94a3b8",
                            }}>
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* TABLE */}
            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Nomi</th>
                            <th>Qonun</th>
                            <th>Amallar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && page === 0 ? (
                            <tr>
                                <td
                                    colSpan="3"
                                    style={{
                                        textAlign: "center",
                                        padding: "20px",
                                    }}>
                                    Yuklanmoqda...
                                </td>
                            </tr>
                        ) : terms.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="3"
                                    style={{
                                        textAlign: "center",
                                        padding: "20px",
                                    }}>
                                    Ma'lumot topilmadi
                                </td>
                            </tr>
                        ) : (
                            terms.map((term) => (
                                <tr key={term.id}>
                                    <td>{term.title}</td>
                                    <td>
                                        {term.laws?.short_name || "-"}{" "}
                                        {term.article_number}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleEdit(term)}
                                            style={{
                                                marginRight: "10px",
                                                color: "blue",
                                            }}>
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(term.id)
                                            }
                                            style={{ color: "red" }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* LOAD MORE BUTTON */}
                {hasMore && !loading && terms.length > 0 && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            padding: "1rem",
                        }}>
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className={styles.navLink} // Yoki o'zingiz xohlagan boshqa stil
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                border: "1px solid #e2e8f0",
                                background: "#567dff",
                                color: "#232323",
                            }}>
                            {loadingMore ? (
                                "Yuklanmoqda..."
                            ) : (
                                <>
                                    <ChevronDown size={16} /> Yana 20 tasini
                                    yuklash
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TermsManager;
