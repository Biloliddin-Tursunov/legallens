import React from "react";
import { TrendingUp } from "lucide-react";
import styles from "../../styles/forum.module.css";

const ForumSidebar = () => (
    <div className={styles.sidebar}>
        <div className={styles.quoteCard}>
            <span className={styles.quoteIcon}>“</span>
            <p className={styles.quoteText}>
                Adolat kuchli bo'lishi kerak, kuch esa adolatli bo'lishi kerak.
            </p>
            <p className={styles.quoteAuthor}>— Blez Paskal</p>
        </div>

        <div className={styles.statsCard}>
            <h4 className={styles.statsTitle}>
                <TrendingUp size={20} className="text-blue-500" />
                Forum Statistikasi
            </h4>
            <div className={styles.statRow}>
                <span>Jami savollar:</span>
                <span className={styles.statValue}>1,245</span>
            </div>
            <div className={styles.statRow}>
                <span>Hal etilgan:</span>
                <span className={styles.statValue}>890</span>
            </div>
            <div className={styles.statRow}>
                <span>Faol yuristlar:</span>
                <span className={styles.statValue}>45</span>
            </div>
        </div>
    </div>
);

export default ForumSidebar;
