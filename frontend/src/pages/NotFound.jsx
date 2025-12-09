import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/common.module.css";
// import Navigation from "../components/home/Navigation"; // ❌ BUNI OLIB TASHLASH KERAK!

const NotFound = () => {
    return (
        // <Navigation /> ni o'chirib tashladik
        <div className={styles.errorContainer}>
            <h1 className={styles.errorCode}>404</h1>
            <h2 className={styles.errorTitle}>Sahifa topilmadi! 🤯</h2>
            <p className={styles.errorDescription}>
                Kechirasiz, siz qidirayotgan manzil o'chirilgan bo'lishi yoki
                noto'g'ri kiritilgan bo'lishi mumkin.
            </p>
            <Link to="/" className={styles.homeLink}>
                Bosh sahifaga qaytish
            </Link>
        </div>
    );
};

export default NotFound;
