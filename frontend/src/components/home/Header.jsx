import React, { useState, useEffect, useRef } from "react";
import { Scale, Search, X } from "lucide-react";
import { supabase } from "../../../supabaseClient";
import styles from "../../styles/header.module.css";
import Logo from "../../assets/logo.png";

// onSearch propini ham qabul qilamiz
const Header = ({ onTermSelect, onSearch }) => {
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

        // Agar input bo'shatilsa, qidiruvni ham tozalash uchun parentga signal beramiz
        if (value.trim() === "") {
            if (onSearch) onSearch(""); // Bo'sh qidiruv = hammasini ko'rsatish
        }

        if (value.trim().length <= 1) {
            setSuggestions([]);
            setShowDropdown(false);
            setActiveSuggestion(-1);
        }
    };

    // Qidiruv effekti (Dropdown uchun)
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

    // 🔥 YANGI: Klaviaturadan foydalanish (Enter bosganda)
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            setShowDropdown(false); // Dropdownni yopamiz

            // Agar onSearch funksiyasi berilgan bo'lsa, unga qidiruv so'zini jo'natamiz
            if (onSearch) {
                onSearch(query);
            }
        }
    };

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
        if (onSearch) onSearch(""); // Tozalaganda hammasini qaytarish
    };

    return (
        <div className={styles.header}>
            <div className={styles.container}>
                <div className={styles.iconWrapper}>
                    <img src={Logo} className={styles.icon} alt="Logo" />
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
                        onKeyDown={handleKeyDown} // 🔥 Enter bosishni eshitish
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
