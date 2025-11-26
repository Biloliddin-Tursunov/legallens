import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";

function App() {
    return (
        <Router>
            <Routes>
                {/* Asosiy Layout ichida sahifalar almashadi */}
                <Route path="/" element={<MainLayout />}>
                    {/* Bosh sahifa */}
                    <Route index element={<Home />} />

                    {/* Kelajakda qo'shiladigan sahifalar uchun misol: */}
                    {/* <Route path="/term/:id" element={<TermDetail />} /> */}
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
