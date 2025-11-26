import React, { useState, useEffect, useRef } from "react";
import { Scale, Search, X } from "lucide-react";
import { supabase } from "../supabaseClient";
import styles from "../styles/header.module.css";

const Header = ({ onTermSelect }) => {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    // YANGI: Klaviatura orqali tanlangan qator indeksi (-1 = hech narsa tanlanmagan)
    const [activeSuggestion, setActiveSuggestion] = useState(-1);

    const dropdownRef = useRef(null);

    // Tashqariga bosilganda yopish
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Qidiruv funksiyasi
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length > 1) {
                const { data, error } = await supabase.rpc("search_terms", {
                    keyword: query,
                });

                if (!error) {
                    setSuggestions(data);
                    setShowDropdown(true);
                    setActiveSuggestion(-1); // Qidiruv o'zgarganda tanlovni reset qilamiz
                }
            } else {
                setSuggestions([]);
                setShowDropdown(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelect = (term) => {
        setQuery(term.title);
        setShowDropdown(false);
        setActiveSuggestion(-1);
        if (onTermSelect) {
            onTermSelect(term);
        }
    };

    const clearSearch = () => {
        setQuery("");
        setSuggestions([]);
        setShowDropdown(false);
        if (onTermSelect) onTermSelect(null);
    };

    // YANGI: KLAVIATURA BOSILGANDA ISHLAYDIGAN FUNKSIYA
    const handleKeyDown = (e) => {
        // Agar dropdown yopiq bo'lsa yoki tavsiyalar yo'q bo'lsa, hech narsa qilma
        if (!showDropdown || suggestions.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault(); // Sahifa pastga tushib ketmasligi uchun
            // Agar oxiriga yetgan bo'lsa boshiga qaytadi, bo'lmasa pastga tushadi
            setActiveSuggestion((prev) =>
                prev < suggestions.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            // Agar boshida bo'lsa oxiriga o'tadi, bo'lmasa tepaga chiqadi
            setActiveSuggestion((prev) =>
                prev > 0 ? prev - 1 : suggestions.length - 1
            );
        } else if (e.key === "Enter") {
            // Agar biron qator tanlangan bo'lsa, o'shani tanlaymiz
            if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
                e.preventDefault();
                handleSelect(suggestions[activeSuggestion]);
            }
        } else if (e.key === "Escape") {
            setShowDropdown(false);
        }
    };

    return (
        <div className={styles.header}>
            <div className={styles.container}>
                <div className={styles.iconWrapper}>
                    <Scale size={64} className={styles.icon} />
                </div>

                <h1 className={styles.title}>Yuridik Lug'at va Atamalar</h1>
                <p className={styles.subtitle}>
                    AI yordamida yuridik tushunchalar va atamalarni oson toping
                </p>

                <div className={styles.searchBox} ref={dropdownRef}>
                    <Search className={styles.searchIcon} size={20} />

                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Atamani qidiring (masalan: Aybdorlik)..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() =>
                            query.length > 1 && setShowDropdown(true)
                        }
                        // YANGI: Klaviatura hodisasini ulaymiz
                        onKeyDown={handleKeyDown}
                    />

                    {query && (
                        <button
                            onClick={clearSearch}
                            className={styles.clearBtn}>
                            <X size={18} />
                        </button>
                    )}

                    {showDropdown && suggestions.length > 0 && (
                        <ul className={styles.dropdown}>
                            {suggestions.map((term, index) => (
                                <li
                                    key={term.id}
                                    // YANGI: Agar index activeSuggestion ga teng bo'lsa, 'active' klassini qo'shamiz
                                    className={`${styles.dropdownItem} ${
                                        index === activeSuggestion
                                            ? styles.active
                                            : ""
                                    }`}
                                    onClick={() => handleSelect(term)}
                                    // Sichqoncha bilan ustiga borganda ham activeni o'zgartiramiz
                                    onMouseEnter={() =>
                                        setActiveSuggestion(index)
                                    }>
                                    <div className="flex items-center">
                                        <Search
                                            size={14}
                                            className={styles.itemIcon}
                                        />
                                        <span>{term.title}</span>
                                    </div>
                                    <span className={styles.categoryBadge}>
                                        Atama
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
