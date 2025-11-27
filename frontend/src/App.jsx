import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Forum from "./pages/Forum"; // <-- YANGI PAGE
import Auth from "./pages/Auth";

function App() {
    return (
        <Router>
            <Routes>
                {/* Asosiy sahifa layouti */}
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Home />} />
                </Route>
                {/* Forum sahifasi */}
                <Route path="/forum" element={<Forum />} />{" "}
                <Route path="/login" element={<Auth />} />{" "}
                {/* <-- YANGI ROUTE */}
                {/* Admin uchun */}
                <Route path="/admin/login" element={<Login />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
