import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { User, MessageSquare, LogIn, Home } from "lucide-react";
import Logo from "../../assets/logo5.png";
import styles from "../../styles/Navigation.module.css";

const Navigation = () => {
    const [session, setSession] = useState(null);
    const location = useLocation();
    const path = location.pathname;

    useEffect(() => {
        supabase.auth
            .getSession()
            .then(({ data: { session } }) => setSession(session));
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
        return () => subscription.unsubscribe();
    }, []);

    // Login sahifalarida navigatsiya kerak emas
    if (path === "/login" || path === "/admin/login") return null;

    // Faol tabni aniqlash
    const isActive = (route) =>
        path === route || (route !== "/" && path.startsWith(route));

    return (
        <>
            {/* --- 1. DESKTOP NAVIGATION --- */}
            <nav className={styles.desktopNav}>
                <div className={styles.innerContainer}>
                    {/* LOGO */}
                    <Link to="/" className={styles.logoBox}>
                        <img
                            src={Logo}
                            alt="LegalLens Logo"
                            className={styles.logoImage}
                        />
                    </Link>

                    {/* LINKS */}
                    <div className={styles.navLinks}>
                        <Link
                            to="/forum"
                            className={`${styles.linkItem} ${
                                isActive("/forum") ? styles.linkItemActive : ""
                            }`}>
                            <MessageSquare size={18} />
                            Forum
                        </Link>

                        {session ? (
                            <Link to="/account" className={styles.primaryBtn}>
                                <User size={18} />
                                Kabinet
                            </Link>
                        ) : (
                            <Link to="/login" className={styles.primaryBtn}>
                                <LogIn size={18} />
                                Kirish
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* --- 2. MOBILE NAVIGATION (Bottom Bar) --- */}
            <div className={styles.mobileNav}>
                <Link
                    to="/"
                    className={`${styles.mobileItem} ${
                        path === "/" ? styles.mobileItemActive : ""
                    }`}>
                    <Home size={24} strokeWidth={path === "/" ? 2.5 : 2} />
                    <span>Asosiy</span>
                </Link>

                <Link
                    to="/forum"
                    className={`${styles.mobileItem} ${
                        isActive("/forum") ? styles.mobileItemActive : ""
                    }`}>
                    <MessageSquare
                        size={24}
                        strokeWidth={isActive("/forum") ? 2.5 : 2}
                    />
                    <span>Forum</span>
                </Link>

                {session ? (
                    <Link
                        to="/account"
                        className={`${styles.mobileItem} ${
                            isActive("/account") ? styles.mobileItemActive : ""
                        }`}>
                        <User
                            size={24}
                            strokeWidth={isActive("/account") ? 2.5 : 2}
                        />
                        <span>Kabinet</span>
                    </Link>
                ) : (
                    <Link
                        to="/login"
                        className={`${styles.mobileItem} ${
                            isActive("/login") ? styles.mobileItemActive : ""
                        }`}>
                        <LogIn
                            size={24}
                            strokeWidth={isActive("/login") ? 2.5 : 2}
                        />
                        <span>Kirish</span>
                    </Link>
                )}
            </div>
        </>
    );
};

export default Navigation;
