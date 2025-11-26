import React from "react";
import { Outlet } from "react-router-dom";
import styles from "../styles/mainLayout.module.css";

const MainLayout = () => {
    return (
        <div className={styles.wrapper}>
            {/* Asosiy kontent shu yerga tushadi (Home, Detail va h.k.) */}
            <main className={styles.content}>
                <Outlet />
            </main>

            {/* Footer qismi - hamma sahifada ko'rinadi */}
            <footer className={styles.footer}>
                <div className={styles.footerContainer}>
                    <p>
                        &copy; {new Date().getFullYear()} LegalLens. Barcha
                        huquqlar himoyalangan.
                    </p>
                    <p className={styles.footerSub}>
                        Yuridik savodxonlikni oshiramiz.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
