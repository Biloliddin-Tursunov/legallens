import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import {
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
    Edit,
    Trash2,
} from "lucide-react";
import styles from "../../styles/adminDashboard.module.css";

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

const CategoriesManager = () => {
    const [categories, setCategories] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: "", slug: "", icon: "" });

    useEffect(() => {
        fetchCats();
    }, []);

    const fetchCats = async () => {
        const { data } = await supabase
            .from("categories")
            .select("*")
            .order("name");
        if (data) setCategories(data);
    };

    const handleEdit = (cat) => {
        setEditingId(cat.id);
        setFormData({ name: cat.name, slug: cat.slug, icon: cat.icon });
    };

    const handleDelete = async (id) => {
        if (
            !window.confirm(
                "O'chirilsinmi? Unga bog'liq atamalar ham o'chib ketishi mumkin."
            )
        )
            return;
        await supabase.from("categories").delete().eq("id", id);
        fetchCats();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.icon) return alert("Ikonka tanlang!");

        try {
            if (editingId) {
                await supabase
                    .from("categories")
                    .update(formData)
                    .eq("id", editingId);
            } else {
                await supabase.from("categories").insert([formData]);
            }
            setFormData({ name: "", slug: "", icon: "" });
            setEditingId(null);
            fetchCats();
            alert(editingId ? "Yangilandi" : "Qo'shildi");
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className={styles.pageTitle}>
                {editingId ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
            </h2>

            <form onSubmit={handleSubmit} className={styles.formCard}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Nomi</label>
                    <input
                        className={styles.input}
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
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
                            setFormData({ ...formData, slug: e.target.value })
                        }
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Ikonka</label>
                    <div className={styles.iconGrid}>
                        {AVAILABLE_ICONS.map((icon) => {
                            const IconComp = icon.component;
                            return (
                                <div
                                    key={icon.name}
                                    onClick={() =>
                                        setFormData({
                                            ...formData,
                                            icon: icon.name,
                                        })
                                    }
                                    className={`${styles.iconOption} ${
                                        formData.icon === icon.name
                                            ? styles.iconSelected
                                            : ""
                                    }`}>
                                    <IconComp size={24} />
                                    <span className={styles.iconLabel}>
                                        {icon.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <button className={styles.primaryBtn}>
                    {editingId ? "Saqlash" : "Qo'shish"}
                </button>
                {editingId && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditingId(null);
                            setFormData({ name: "", slug: "", icon: "" });
                        }}
                        className={styles.navLink}>
                        Bekor qilish
                    </button>
                )}
            </form>

            <div className={styles.tableCard} style={{ marginTop: "20px" }}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Nomi</th>
                            <th>Slug</th>
                            <th>Icon</th>
                            <th>Amallar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat.id}>
                                <td>{cat.name}</td>
                                <td>{cat.slug}</td>
                                <td>{cat.icon}</td>
                                <td>
                                    <button
                                        onClick={() => handleEdit(cat)}
                                        style={{
                                            marginRight: "10px",
                                            color: "blue",
                                        }}>
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        style={{ color: "red" }}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoriesManager;
