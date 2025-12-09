import React from "react";
import { Link } from "react-router-dom";
import { Edit2, Trash2 } from "lucide-react";
import styles from "../../styles/account.module.css";

const MyAnswersList = ({ answers, onEdit, onDelete }) => {
    if (answers.length === 0) {
        return (
            <div className={styles.emptyState}>
                Siz hali hech kimga javob yozmagansiz.
            </div>
        );
    }

    return (
        <div className={styles.gridList}>
            {answers.map((a) => (
                <div key={a.id} className={styles.itemCard}>
                    <div className={styles.contextLabel}>
                        Savolga javob: {a.questions?.title || "Noma'lum savol"}
                    </div>

                    <p className={styles.itemBody}>{a.body}</p>

                    <div
                        className={styles.itemHeader}
                        style={{ marginTop: "10px" }}>
                        <span
                            className={styles.itemDate}
                            style={{ marginLeft: 0 }}>
                            {new Date(a.created_at).toLocaleString()}
                        </span>
                    </div>

                    <div className={styles.actions}>
                        <Link
                            to={`/forum/${a.question_id}`}
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                            style={{ textDecoration: "none" }}>
                            Ko'rish
                        </Link>
                        <button
                            onClick={() => onEdit(a)}
                            className={`${styles.actionBtn} ${styles.editBtn}`}>
                            <Edit2 size={16} /> Tahrirlash
                        </button>
                        <button
                            onClick={() => onDelete(a.id)}
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}>
                            <Trash2 size={16} /> O'chirish
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyAnswersList;
