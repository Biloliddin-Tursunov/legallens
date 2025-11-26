import React from "react";
import { BookOpen } from "lucide-react"; // Manba uchun ikonka
import styles from "../styles/termCard.module.css";

// categories - bu array, law - bu obyekt
const TermCard = ({
    title,
    categories,
    definition,
    examples,
    law,
    article,
}) => {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>
                {/* Kategoriyalarni loop qilib chiqarish */}
                <div className={styles.badgesWrapper}>
                    {categories &&
                        categories.map((cat, index) => (
                            <span key={index} className={styles.badge}>
                                {cat.name}
                            </span>
                        ))}
                </div>
            </div>

            <p className={styles.definition}>{definition}</p>

            {/* Misollar */}
            {examples && examples.length > 0 && (
                <div className={styles.examplesBox}>
                    <h4 className={styles.examplesTitle}>
                        <span>📖</span> Misollar:
                    </h4>
                    <ul className={styles.list}>
                        {examples.map((ex, index) => (
                            <li key={index} className={styles.listItem}>
                                {ex}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Manba qismi (agar mavjud bo'lsa) */}
            {law && (
                <div className={styles.footer}>
                    <div className={styles.source}>
                        <BookOpen size={16} />
                        <span>
                            Manba:{" "}
                            <strong>{law.short_name || law.title}</strong>,{" "}
                            {article}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TermCard;
