import React from "react";
import { BookOpen, Bookmark } from "lucide-react"; // Bookmark qo'shildi
import styles from "../../styles/termCard.module.css";

const TermCard = ({
    id, // ID kerak bo'ladi
    title,
    categories,
    definition,
    examples,
    law,
    article,
    style,
    isHighlighted,
    isSaved, // 🔥 YANGI PROP: Saqlanganmi?
    onToggleSave, // 🔥 YANGI PROP: Bosilganda ishlovchi funksiya
}) => {
    const cardStyle = {
        ...style,
        ...(isHighlighted
            ? { border: "2px solid #fbbf24", backgroundColor: "#fffbeb" }
            : {}),
    };

    return (
        <div className={styles.card} style={cardStyle}>
            {/* SAQLASH TUGMASI */}
            <button
                className={`${styles.saveBtn} ${isSaved ? styles.saved : ""}`}
                onClick={(e) => {
                    e.stopPropagation(); // Karta bosilganda modal ochilib ketmasligi uchun (agar bo'lsa)
                    onToggleSave(id);
                }}
                title={isSaved ? "Saqlanganlardan olish" : "Saqlash"}>
                {/* fill={isSaved ? "currentColor" : "none"} -> Ichini to'ldirish uchun */}
                <Bookmark size={22} fill={isSaved ? "currentColor" : "none"} />
            </button>

            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>

                <div className={styles.badgesWrapper}>
                    {categories &&
                        categories.map((cat, index) => {
                            if (!cat) return null;
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
