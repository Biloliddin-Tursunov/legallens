import React from "react";
import { BookOpen } from "lucide-react";
import styles from "../../styles/termCard.module.css";

const TermCard = ({
    title,
    categories,
    definition,
    examples,
    law,
    article,
    style,
    isHighlighted,
}) => {
    // Agar qidiruvdan tanlangan bo'lsa, qo'shimcha stil berish (sariq border)
    const cardStyle = {
        ...style,
        ...(isHighlighted
            ? { border: "2px solid #fbbf24", backgroundColor: "#fffbeb" }
            : {}),
    };

    return (
        <div className={styles.card} style={cardStyle}>
            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>

                <div className={styles.badgesWrapper}>
                    {/* XATOLIK TUZATILDI: cat mavjudligini tekshiramiz */}
                    {categories &&
                        categories.map((cat, index) => {
                            if (!cat) return null; // Agar kategoriya bo'sh bo'lsa, o'tkazib yuboramiz

                            return (
                                <span key={index} className={styles.badge}>
                                    {cat.name}
                                </span>
                            );
                        })}
                </div>
            </div>

            <p className={styles.definition}>{definition}</p>

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
