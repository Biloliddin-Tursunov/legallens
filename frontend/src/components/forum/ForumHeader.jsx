import React from "react";
import { MessageSquare, Search, Plus } from "lucide-react";
import styles from "../../styles/forum.module.css";

const ForumHeader = ({
    searchQuery,
    setSearchQuery,
    onSearch,
    onOpenModal,
    session,
}) => {
    return (
        <div className={styles.header}>
            <h1 className={styles.headerTitle}>
                <MessageSquare size={40} className="text-blue-600" />
                Yuridik Forum
            </h1>

            <div className={styles.searchBarWrapper}>
                <div className={styles.searchInputWrapper}>
                    <Search size={20} className={styles.searchIcon} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Savol yoki mavzuni qidiring..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onSearch()}
                    />
                </div>
                <button
                    className={styles.askBtn}
                    onClick={() =>
                        session
                            ? onOpenModal()
                            : alert("Savol berish uchun tizimga kiring")
                    }>
                    <Plus size={18} /> Savol berish
                </button>
            </div>
        </div>
    );
};

export default ForumHeader;
