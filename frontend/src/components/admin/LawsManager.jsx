import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { Edit, Trash2 } from "lucide-react";
import styles from "../../styles/adminDashboard.module.css";

const LawsManager = () => {
    const [laws, setLaws] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        short_name: "",
        lex_link: "",
    });

    useEffect(() => {
        fetchLaws();
    }, []);

    const fetchLaws = async () => {
        const { data } = await supabase.from("laws").select("*").order("title");
        if (data) setLaws(data);
    };

    const handleEdit = (law) => {
        setEditingId(law.id);
        setFormData({
            title: law.title,
            short_name: law.short_name,
            lex_link: law.lex_link,
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("O'chirilsinmi?")) return;
        await supabase.from("laws").delete().eq("id", id);
        fetchLaws();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await supabase
                    .from("laws")
                    .update(formData)
                    .eq("id", editingId);
            } else {
                await supabase.from("laws").insert([formData]);
            }
            setFormData({ title: "", short_name: "", lex_link: "" });
            setEditingId(null);
            fetchLaws();
            alert("Bajarildi");
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className={styles.pageTitle}>
                {editingId ? "Qonunni tahrirlash" : "Yangi Qonun"}
            </h2>
            <form onSubmit={handleSubmit} className={styles.formCard}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Nomi</label>
                    <input
                        className={styles.input}
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
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
                        <label className={styles.label}>Qisqa nomi</label>
                        <input
                            className={styles.input}
                            value={formData.short_name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    short_name: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Link</label>
                        <input
                            className={styles.input}
                            value={formData.lex_link}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    lex_link: e.target.value,
                                })
                            }
                        />
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
                            setFormData({
                                title: "",
                                short_name: "",
                                lex_link: "",
                            });
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
                            <th>Qisqa</th>
                            <th>Link</th>
                            <th>Amallar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {laws.map((law) => (
                            <tr key={law.id}>
                                <td>{law.title}</td>
                                <td>{law.short_name}</td>
                                <td>
                                    <a
                                        href={law.lex_link}
                                        target="_blank"
                                        rel="noreferrer">
                                        Havola
                                    </a>
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleEdit(law)}
                                        style={{
                                            marginRight: "10px",
                                            color: "blue",
                                        }}>
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(law.id)}
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

export default LawsManager;
