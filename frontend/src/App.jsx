import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
    return (
        <Router>
            <Routes>
                {/* Oddiy foydalanuvchilar uchun */}
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Home />} />
                </Route>

                {/* Admin uchun */}
                <Route path="/login" element={<Login />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
