import React from "react";
import { Scale, Search } from "lucide-react";
import styles from "../styles/header.module.css";

const Header = () => {
    return (
        <div className={styles.header}>
            <div className={styles.container}>
                <div className={styles.iconWrapper}>
                    <Scale size={64} className={styles.icon} />
                </div>

                <h1 className={styles.title}>Yuridik Lug'at va Atamalar</h1>
                <p className={styles.subtitle}>
                    AI yordamida yuridik tushunchalar va atamalarni oson toping
                </p>

                <div className={styles.searchBox}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Yuridik atama yoki ta'rifni qidiring..."
                    />
                </div>
            </div>
        </div>
    );
};

export default Header;
