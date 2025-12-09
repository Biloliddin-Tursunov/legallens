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
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard"; // Bu endi Layout vazifasini bajaradi
import Forum from "./pages/Forum";
import Account from "./pages/Account";
import QuestionDetail from "./pages/QuestionDetail";

// 🔥 YANGI ADMIN KOMPONENTLAR (Import yo'llarini o'zingizga moslang)
import Messages from "./components/admin/Messages";
import TermsManager from "./components/admin/TermsManager";
import CategoriesManager from "./components/admin/CategoriesManager";
import LawsManager from "./components/admin/LawsManager";

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
                    {/* Admin Login */}
                    <Route path="/login" element={<AdminLogin />} />

                    {/* Admin Dashboard (Protected & Nested Routes) */}
                    <Route
                        path="/"
                        element={
                            session ? (
                                <AdminDashboard /> // Bu yerda Sidebar va Outlet bor
                            ) : (
                                <Navigate to="/login" />
                            )
                        }>
                        {/* 🔥 Ichki Routelar: admin.site.uz/terms, admin.site.uz/laws va h.k. */}
                        <Route
                            index
                            element={<Navigate to="messages" replace />}
                        />
                        <Route path="messages" element={<Messages />} />
                        <Route path="terms" element={<TermsManager />} />
                        <Route
                            path="categories"
                            element={<CategoriesManager />}
                        />
                        <Route path="laws" element={<LawsManager />} />
                    </Route>

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
