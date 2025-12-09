import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import Sidebar from "./Sidebar";
import styles from "../../styles/adminDashboard.module.css";

const AdminLayout = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session) {
                navigate("/login");
            } else {
                setLoading(false);
            }
        };
        checkUser();
    }, [navigate]);

    if (loading) return <div className={styles.content}>Yuklanmoqda...</div>;

    return (
        <div className={styles.dashboard}>
            <Sidebar />
            <main className={styles.content}>
                <Outlet /> {/* Barcha ichki sahifalar shu yerda chiqadi */}
            </main>
        </div>
    );
};

export default AdminLayout;
