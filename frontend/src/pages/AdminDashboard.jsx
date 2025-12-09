import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import styles from "../styles/adminDashboard.module.css";

const AdminDashboard = () => {
    return (
        <div className={styles.dashboard}>
            {/* Chap tomondagi menyu */}
            <Sidebar />

            {/* O'ng tomondagi asosiy kontent qismi */}
            <main className={styles.content}>
                {/* Outlet - bu yerda App.js dagi child routelar 
            (Messages, TermsManager, LawsManager va h.k.) 
            avtomatik ravishda almashib turadi.
        */}
                <Outlet />
            </main>
        </div>
    );
};

export default AdminDashboard;
