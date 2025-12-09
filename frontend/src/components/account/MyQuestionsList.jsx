import React from "react";
import { Link } from "react-router-dom";
import { Edit2, Trash2 } from "lucide-react";
import styles from "../../styles/account.module.css";

const MyQuestionsList = ({ questions, onEdit, onDelete }) => {
    if (questions.length === 0) {
        return (
            <div className={styles.emptyState}>Siz hali savol bermagansiz.</div>
        );
    }

    return (
        <div className={styles.gridList}>
            {questions.map((q) => (
                <div key={q.id} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                        <Link
                            to={`/forum/${q.id}`}
                            className={styles.itemTitle}>
                            {q.title}
                        </Link>
                        <span className={styles.itemDate}>
                            {new Date(q.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <p className={styles.itemBody}>
                        {q.body.length > 100
                            ? q.body.substring(0, 100) + "..."
                            : q.body}
                    </p>
                    <div className={styles.actions}>
                        <button
                            onClick={() => onEdit(q)}
                            className={`${styles.actionBtn} ${styles.editBtn}`}>
                            <Edit2 size={16} /> Tahrirlash
                        </button>
                        <button
                            onClick={() => onDelete(q.id)}
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}>
                            <Trash2 size={16} /> O'chirish
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyQuestionsList;
