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

    // Tashqariga bosganda yopish
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

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        if (value.trim().length <= 1) {
            setSuggestions([]);
            setShowDropdown(false);
            setActiveSuggestion(-1);
        }
    };

    // Qidiruv effekti
    useEffect(() => {
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
        }, 150);
        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (term) => {
        setQuery(term.title);
        setShowDropdown(false);
        setActiveSuggestion(-1);
        if (onTermSelect) onTermSelect({ id: term.id, title: term.title });
    };

    const clearSearch = () => {
        setQuery("");
        setSuggestions([]);
        setShowDropdown(false);
        if (onTermSelect) onTermSelect(null);
    };

    return (
        <div className={styles.header}>
            <div className={styles.container}>
                {/* DIQQAT: Bu yerdan eski tugmalar olib tashlandi.
                   Ular endi Navigation.jsx da!
                */}

                <div className={styles.iconWrapper}>
                    <Scale size={64} className={styles.icon} />
                </div>

                <h1 className={styles.title}>Yuridik Lug'at va Atamalar</h1>
                <p className={styles.subtitle}>
                    Yuridik tushunchalar va atamalarni oson toping
                </p>

                <div className={styles.searchBox} ref={dropdownRef}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Atamani qidiring..."
                        value={query}
                        onChange={handleInputChange}
                        onFocus={() =>
                            query.length > 1 &&
                            suggestions.length > 0 &&
                            setShowDropdown(true)
                        }
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
                                    onClick={() => handleSelect(term)}>
                                    <div className="flex items-center">
                                        <Search
                                            size={14}
                                            className={styles.itemIcon}
                                        />
                                        <span>{term.title}</span>
                                    </div>
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
