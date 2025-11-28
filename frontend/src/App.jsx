import React, { useEffect, useState } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { supabase } from "./supabaseClient";

// Layout & Pages
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Login from "./pages/Login"; // Admin Login
import AdminDashboard from "./pages/AdminDashboard";
import Forum from "./pages/Forum";
import Account from "./pages/Account"; // <-- YANGI
import QuestionDetail from "./pages/QuestionDetail"; // <-- YANGI

function App() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return null; // Yuklanish holati

    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainLayout session={session} />}>
                    <Route index element={<Home />} />
                </Route>

                {/* Forum va uning ichki sahifasi */}
                <Route path="/forum" element={<Forum session={session} />} />
                <Route
                    path="/forum/:id"
                    element={<QuestionDetail session={session} />}
                />

                {/* Login sahifasi (Agar kirgan bo'lsa Accountga otadi) */}
                <Route
                    path="/login"
                    element={session ? <Navigate to="/account" /> : <Auth />}
                />

                {/* Account sahifasi (Himoyalangan) */}
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

                {/* Admin */}
                <Route path="/admin/login" element={<Login />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
