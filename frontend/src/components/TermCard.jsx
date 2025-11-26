import React from "react";
import styles from "../styles/termCard.module.css";

const TermCard = ({ title, category, definition, examples }) => {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>
                <span className={styles.badge}>{category}</span>
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
        </div>
    );
};

export default TermCard;
