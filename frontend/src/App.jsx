import React, { useEffect, useState } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation,
} from "react-router-dom";
import { supabase } from "./supabaseClient";
import { AnimatePresence } from "framer-motion";

// Navigation & Layouts
import Navigation from "./components/home/Navigation";
import MainLayout from "./layouts/MainLayout";

// Umumiy Komponentlar
import LoadingSpinner from "./components/common/LoadingSpinner";
import PageTransition from "./components/common/PageTransition";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Forum from "./pages/Forum";
import Account from "./pages/Account";
import QuestionDetail from "./pages/QuestionDetail";
import NotFound from "./pages/NotFound";

// Admin Komponentlar
import Messages from "./components/admin/Messages";
import TermsManager from "./components/admin/TermsManager";
import CategoriesManager from "./components/admin/CategoriesManager";
import LawsManager from "./components/admin/LawsManager";
import Statistics from "./components/admin/Statistics";

const RedirectToAdmin = () => {
    useEffect(() => {
        window.location.href = "https://admin.legallens.uz";
    }, []);
    return null;
};

// 🔥 YANGI: Asosiy mantiqni alohida komponentga olamiz
// Bu komponent <Router> ichida bo'lgani uchun useLocation() ni ishlata oladi.
const AppContent = () => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    const hostname = window.location.hostname;
    const isAdminSubdomain = hostname.startsWith("admin.");
    const location = useLocation(); // 🔥 Endi bu xato bermaydi

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

    if (loading) return <LoadingSpinner />;

    // ---------------------------------------------------------
    // 1️⃣ ADMIN PANEL
    // ---------------------------------------------------------
    if (isAdminSubdomain) {
        return (
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
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
                        <Route element={<Navigate to="messages" replace />} />
                        <Route path="messages" element={<Messages />} />
                        <Route
                            index
                            path="statistics"
                            element={<Statistics />}
                        />
                        <Route path="terms" element={<TermsManager />} />
                        <Route
                            path="categories"
                            element={<CategoriesManager />}
                        />
                        <Route path="laws" element={<LawsManager />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AnimatePresence>
        );
    }

    // ---------------------------------------------------------
    // 2️⃣ ASOSIY SAYT
    // ---------------------------------------------------------
    return (
        <>
            <Navigation />
            <AnimatePresence mode="wait">
                {/* location va key har bir sahifa o'zgarishini animatsiya qilish uchun kerak */}
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<MainLayout session={session} />}>
                        <Route
                            index
                            element={
                                <PageTransition>
                                    <Home session={session} />
                                </PageTransition>
                            }
                        />
                    </Route>

                    <Route
                        path="/forum"
                        element={
                            <PageTransition>
                                <Forum session={session} />
                            </PageTransition>
                        }
                    />
                    <Route
                        path="/forum/:id"
                        element={
                            <PageTransition>
                                <QuestionDetail session={session} />
                            </PageTransition>
                        }
                    />

                    <Route
                        path="/login"
                        element={
                            <PageTransition>
                                {session ? (
                                    <Navigate to="/account" />
                                ) : (
                                    <Login />
                                )}
                            </PageTransition>
                        }
                    />
                    <Route
                        path="/account"
                        element={
                            <PageTransition>
                                {session ? (
                                    <Account session={session} />
                                ) : (
                                    <Navigate to="/login" />
                                )}
                            </PageTransition>
                        }
                    />

                    <Route path="/admin/*" element={<RedirectToAdmin />} />

                    <Route
                        path="*"
                        element={
                            <PageTransition>
                                <NotFound />
                            </PageTransition>
                        }
                    />
                </Routes>
            </AnimatePresence>
        </>
    );
};

// 🔥 ASOSIY APP KOMPONENTI
// Router ni shu yerda e'lon qilamiz, shunda ichkaridagi AppContent useLocation ni ishlata oladi.
function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
