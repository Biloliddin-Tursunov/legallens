import React, { useState, useEffect } from "react";
import styles from "../../styles/account.module.css";

const EditModal = ({ isOpen, onClose, initialData, onSave, title }) => {
    const [formData, setFormData] = useState({ title: "", body: "" });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || "",
                body: initialData.body || "",
            });
        }
    }, [initialData]);

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalBox}>
                <h3 style={{ marginBottom: "20px" }}>{title}</h3>

                {/* Agar Title bo'lsa (Savollar uchun) */}
                {initialData.title !== undefined && (
                    <input
                        className={styles.modalInput}
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Mavzu"
                    />
                )}

                <textarea
                    className={styles.modalInput}
                    style={{ minHeight: "150px" }}
                    value={formData.body}
                    onChange={(e) =>
                        setFormData({ ...formData, body: e.target.value })
                    }
                    placeholder="Matn..."
                />

                <div className={styles.actions} style={{ border: "none" }}>
                    <button
                        onClick={onClose}
                        className={styles.deleteBtn}
                        style={{ background: "#f1f5f9", color: "#64748b" }}>
                        Bekor qilish
                    </button>
                    <button
                        onClick={() => onSave(formData)}
                        className={styles.editBtn}
                        style={{ background: "#0284c7", color: "white" }}>
                        Saqlash
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditModal;
