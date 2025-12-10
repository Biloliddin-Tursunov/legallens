import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import {
    Scale,
    MessageSquare,
    LogOut,
    Book,
    Layers,
    FileText,
    BarChart2,
} from "lucide-react";

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    // 🔥 MUHIM: Subdomenda ishlaganimiz uchun yo'llar "/" dan boshlanishi shart.
    // "/admin/messages" EMAS, balki shunchaki "/messages"
    const navItems = [
        // 🔥 Yangi qo'shilgan qator:
        { path: "/statistics", icon: BarChart2, label: "Statistika" },

        // Eski qatorlar o'z o'rnida qolsin:
        { path: "/messages", icon: MessageSquare, label: "Xabarlar" },
        { path: "/terms", icon: FileText, label: "Atamalar" },
        { path: "/categories", icon: Layers, label: "Kategoriyalar" },
        { path: "/laws", icon: Book, label: "Qonunlar" },
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoArea}>
                <Scale className="text-blue-400" size={28} />
                <span className={styles.logoText}>LegalLens Admin</span>
            </div>

            <nav className={styles.nav}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path} // 👈 O'ZGARISH: Bu yerda endi "/admin" qo'shilmaydi
                        className={({ isActive }) =>
                            isActive ? styles.activeNavLink : styles.navLink
                        }>
                        <item.icon size={18} /> {item.label}
                    </NavLink>
                ))}
            </nav>

            <button onClick={handleLogout} className={styles.logoutBtn}>
                <LogOut size={16} /> Chiqish
            </button>
        </aside>
    );
};

export default Sidebar;

import styles from "../../styles/adminDashboard.module.css";
