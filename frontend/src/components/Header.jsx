import React, { useState, useEffect, useRef } from "react";
import { Scale, Search, X } from "lucide-react";
import { supabase } from "../supabaseClient";
import styles from "../styles/header.module.css";

const Header = ({ onTermSelect }) => {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
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

    // 1. INPUT O'ZGARGANDA ISHLAYDIGAN FUNKSIYA (Yangi qo'shildi)
    // Tozalash logikasini shu yerga oldik -> Bu "Cascading render" xatosini yo'qotadi
    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        // Agar so'z juda qisqa bo'lsa, shu zahoti tozalaymiz (Effect kutilmaydi)
        if (value.trim().length <= 1) {
            setSuggestions([]);
            setShowDropdown(false);
            setActiveSuggestion(-1);
        }
    };

    // 2. QIDIRUV (EFFECT) - Faqat serverga so'rov yuborish uchun javobgar
    useEffect(() => {
        // Agar so'z qisqa bo'lsa, hech narsa qilma (chunki handleInputChange allaqachon tozalab bo'ldi)
        if (query.trim().length <= 1) return;

        const timer = setTimeout(async () => {
            const { data, error } = await supabase.rpc("search_terms", {
                keyword: query,
            });

            if (!error && data) {
                setSuggestions(data);
                setShowDropdown(true);
                setActiveSuggestion(-1);
            }
        }, 150); // 150ms debounce

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (term) => {
        setQuery(term.title);
        setShowDropdown(false);
        setActiveSuggestion(-1);
        if (onTermSelect) {
            onTermSelect({ id: term.id, title: term.title });
        }
    };

    const clearSearch = () => {
        setQuery("");
        setSuggestions([]);
        setShowDropdown(false);
        if (onTermSelect) onTermSelect(null);
    };

    const handleKeyDown = (e) => {
        if (!showDropdown || suggestions.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveSuggestion((prev) =>
                prev < suggestions.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveSuggestion((prev) =>
                prev > 0 ? prev - 1 : suggestions.length - 1
            );
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
                handleSelect(suggestions[activeSuggestion]);
            } else if (suggestions.length > 0) {
                handleSelect(suggestions[0]);
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
                        // O'ZGARISH: To'g'ridan-to'g'ri setQuery emas, handleInputChange chaqiriladi
                        onChange={handleInputChange}
                        onFocus={() =>
                            query.length > 1 &&
                            suggestions.length > 0 &&
                            setShowDropdown(true)
                        }
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
                                    className={`${styles.dropdownItem} ${
                                        index === activeSuggestion
                                            ? styles.active
                                            : ""
                                    }`}
                                    onClick={() => handleSelect(term)}
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
                                    {term.category_slug && (
                                        <span className={styles.categoryBadge}>
                                            {term.category_slug}
                                        </span>
                                    )}
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
