import React, { useEffect, useState } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { supabase } from "./supabaseClient";

// Navigation
import Navigation from "./components/Navigation";

// Layouts
import MainLayout from "./layouts/MainLayout";

// Pages
import Home from "./pages/Home";
// 🔥 O'ZGARISH: Fayl nomlari o'zgargani uchun importlar ham o'zgardi
import Login from "./pages/Login"; // (Eski Auth.jsx -> Endi oddiy userlar uchun)
import AdminLogin from "./pages/AdminLogin"; // (Eski Login.jsx -> Endi adminlar uchun)
import AdminDashboard from "./pages/AdminDashboard";
import Forum from "./pages/Forum";
import Account from "./pages/Account";
import QuestionDetail from "./pages/QuestionDetail";

// 🔥 YORDAMCHI KOMPONENT (Redirect uchun)
const RedirectToAdmin = () => {
    useEffect(() => {
        window.location.href = "https://admin.legallens.uz";
    }, []);
    return null;
};

function App() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔥 SUBDOMAIN TEKSHIRISH
    const hostname = window.location.hostname;
    const isAdminSubdomain = hostname.startsWith("admin.");

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) return null;

    // ---------------------------------------------------------
    // 1️⃣ ADMIN PANEL (admin.localhost yoki admin.legallens.uz)
    // ---------------------------------------------------------
    if (isAdminSubdomain) {
        return (
            <Router>
                <Routes>
                    {/* 🔥 Admin Login sahifasi */}
                    <Route path="/login" element={<AdminLogin />} />

                    <Route
                        path="/"
                        element={
                            session ? (
                                <AdminDashboard />
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        );
    }

    // ---------------------------------------------------------
    // 2️⃣ ASOSIY SAYT (localhost yoki legallens.uz)
    // ---------------------------------------------------------
    return (
        <Router>
            <Navigation />
            <Routes>
                <Route path="/" element={<MainLayout session={session} />}>
                    <Route index element={<Home />} />
                </Route>

                <Route path="/forum" element={<Forum session={session} />} />
                <Route
                    path="/forum/:id"
                    element={<QuestionDetail session={session} />}
                />

                {/* 🔥 User Login sahifasi (Auth o'rniga Login ishlatildi) */}
                <Route
                    path="/login"
                    element={session ? <Navigate to="/account" /> : <Login />}
                />
                <Route
                    path="/account"
                    element={
                        session ? (
                            <Account session={session} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />

                <Route path="/admin/*" element={<RedirectToAdmin />} />
            </Routes>
        </Router>
    );
}

export default App;
