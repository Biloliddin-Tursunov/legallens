import React from "react";
import styles from "../../styles/common.module.css";

const LoadingSpinner = ({ text = "Yuklanmoqda..." }) => {
    return (
        <div className={styles.spinnerOverlay}>
            <div className={styles.spinnerContainer}></div>
            <p className={styles.loadingText}>{text}</p>
        </div>
    );
};

export default LoadingSpinner;
