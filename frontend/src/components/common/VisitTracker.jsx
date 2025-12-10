import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../../supabaseClient";

const VisitTracker = () => {
    const location = useLocation();
    const loggingRef = useRef(false);

    useEffect(() => {
        const currentPath = location.pathname;
        const hostname = window.location.hostname; // Masalan: "admin.legallens.uz" yoki "legallens.uz"

        // 🛑 1-SHART: Admin panelda umuman ISHLAMASIN
        // Agar domen "admin." bilan boshlansa YOKI yo'l "/admin" bo'lsa -> TO'XTATISH
        if (hostname.startsWith("admin.") || currentPath.startsWith("/admin")) {
            return;
        }

        // 🛑 2-SHART: Refresh qilinganda qayta yozmaslik
        const sessionKey = `visited_log_${currentPath}`;
        if (sessionStorage.getItem(sessionKey)) return;

        const logVisit = async () => {
            if (loggingRef.current) return;
            loggingRef.current = true;

            try {
                // --- A) USER ISMINI ANIQLASH ---
                let userId = null;
                let userName = "Mehmon";

                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (session?.user) {
                    userId = session.user.id;

                    // Ismni olish (users jadvalidan)
                    const { data: profile } = await supabase
                        .from("users")
                        .select("first_name, full_name")
                        .eq("id", userId)
                        .single();

                    if (profile) {
                        userName =
                            profile.first_name ||
                            profile.full_name ||
                            session.user.email;
                    } else {
                        userName = session.user.email;
                    }
                }

                // --- B) IP MANZIL ---
                let ipData = { ip: null, city: null, country: null };
                try {
                    const controller = new AbortController();
                    setTimeout(() => controller.abort(), 2000);
                    const res = await fetch("https://ipapi.co/json/", {
                        signal: controller.signal,
                    });
                    if (res.ok) {
                        const data = await res.json();
                        ipData = {
                            ip: data.ip,
                            city: data.city,
                            country: data.country_name,
                        };
                    }
                } catch (e) {
                    // Jim turamiz
                }

                // --- C) QURILMA ---
                const ua = navigator.userAgent;
                let device = "Desktop";
                if (/Mobi|Android/i.test(ua)) device = "Mobile";
                else if (/iPad|Tablet/i.test(ua)) device = "Tablet";

                // --- D) BAZAGA YOZISH ---
                await supabase.from("site_visits").insert({
                    page_path: currentPath,
                    device_type: device,
                    browser: getBrowserName(ua),
                    user_id: userId,
                    user_name: userName,
                    ip_address: ipData.ip,
                    city: ipData.city,
                    country: ipData.country,
                });

                sessionStorage.setItem(sessionKey, "true");
            } catch (error) {
                console.error("Tracker Xatosi:", error);
            } finally {
                loggingRef.current = false;
            }
        };

        logVisit();
    }, [location.pathname]);

    return null;
};

function getBrowserName(ua) {
    if (ua.indexOf("Chrome") > -1) return "Chrome";
    if (ua.indexOf("Safari") > -1) return "Safari";
    if (ua.indexOf("Firefox") > -1) return "Firefox";
    return "Unknown";
}

export default VisitTracker;
