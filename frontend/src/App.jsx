import React, { useEffect, useState } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { supabase } from "./supabaseClient";

// Navigation & Layouts
import Navigation from "./components/home/Navigation";
import MainLayout from "./layouts/MainLayout";

// Umumiy Komponentlar 🔥 YANGI IMPORT
import LoadingSpinner from "./components/common/LoadingSpinner";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Forum from "./pages/Forum";
import Account from "./pages/Account";
import QuestionDetail from "./pages/QuestionDetail";
// 🔥 YANGI IMPORT
import NotFound from "./pages/NotFound";

// Admin Komponentlar
import Messages from "./components/admin/Messages";
import TermsManager from "./components/admin/TermsManager";
import CategoriesManager from "./components/admin/CategoriesManager";
import LawsManager from "./components/admin/LawsManager";

const RedirectToAdmin = () => {
    useEffect(() => {
        window.location.href = "https://admin.legallens.uz";
    }, []);
    return null;
};

function App() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true); // Dastlabki yuklanish

    const hostname = window.location.hostname;
    const isAdminSubdomain = hostname.startsWith("admin.");

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false); // 🔥 Yuklanish tugadi
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // 🔥 GLOBAL LOADING
    if (loading) return <LoadingSpinner />;

    // ---------------------------------------------------------
    // 1️⃣ ADMIN PANEL
    // ---------------------------------------------------------
    if (isAdminSubdomain) {
        return (
            <Router>
                <Routes>
                    <Route path="/login" element={<AdminLogin />} />
                    <Route
                        path="/"
                        element={
                            session ? (
                                <AdminDashboard />
                            ) : (
                                <Navigate to="/login" />
                            )
                        }>
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
                    {/* Mavjud bo'lmagan admin route 404 ga o'tadi */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        );
    }

    // ---------------------------------------------------------
    // 2️⃣ ASOSIY SAYT
    // ---------------------------------------------------------
    return (
        <Router>
            <Navigation />
            <Routes>
                <Route path="/" element={<MainLayout session={session} />}>
                    <Route index element={<Home session={session} />} />
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

                {/* 🔥 404 Page (Barcha boshqa routelar uchun) */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

export default App;
