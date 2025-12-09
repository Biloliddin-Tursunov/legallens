import React, { useState } from "react";
import { X, HelpCircle, FileText } from "lucide-react";
import styles from "../../styles/forum.module.css";

const AskQuestionModal = ({ isOpen, onClose, onSubmit, submitting }) => {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(title, body);
        setTitle("");
        setBody("");
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Yangi savol</h2>
                    <p className={styles.modalSubtitle}>
                        Huquqiy muammolaringizga yechim toping
                    </p>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Title Input */}
                    <div className={styles.formGroup}>
                        <label className={styles.inputLabel}>
                            Savol mavzusi
                        </label>
                        <input
                            className={styles.modalInput}
                            placeholder="Masalan: Aliment undirish tartibi qanday?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            autoFocus
                        />
                        <span className={styles.helperText}>
                            Qisqa va mazmunli sarlavha tanlang.
                        </span>
                    </div>

                    {/* Body Input */}
                    <div className={styles.formGroup}>
                        <label className={styles.inputLabel}>
                            Batafsil ma'lumot
                        </label>
                        <textarea
                            className={styles.modalTextarea}
                            placeholder="Vaziyatni to'liq tushuntirib bering..."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            required
                        />
                        <span className={styles.helperText}>
                            Qancha ko'p ma'lumot bersangiz, shuncha aniq javob
                            olasiz.
                        </span>
                    </div>

                    {/* Actions */}
                    <div className={styles.modalActions}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={onClose}
                            disabled={submitting}>
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            className={styles.askBtn}
                            disabled={submitting}>
                            {submitting
                                ? "Yuklanmoqda..."
                                : "Savolni chop etish"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AskQuestionModal;
