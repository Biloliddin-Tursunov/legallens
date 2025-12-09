import React from "react";
import { Trash2, BookOpen } from "lucide-react";
import styles from "../../styles/account.module.css";

const SavedTermsList = ({ savedTerms, onRemove }) => {
    if (savedTerms.length === 0) {
        return (
            <div className={styles.emptyState}>
                Sizda saqlangan atamalar yo'q.
            </div>
        );
    }

    return (
        <div className={styles.gridList}>
            {savedTerms.map((item) => {
                const term = item.terms; // Relation orqali kelgan ma'lumot
                if (!term) return null;

                return (
                    <div key={item.id} className={styles.itemCard}>
                        <div className={styles.itemHeader}>
                            <h3 className={styles.itemTitle}>{term.title}</h3>
                            <button
                                onClick={() => onRemove(item.id)}
                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                title="Saqlanganlardan olib tashlash">
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <p className={styles.itemBody}>
                            {term.definition
                                ? term.definition.substring(0, 120) + "..."
                                : "Izoh yo'q"}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

export default SavedTermsList;
