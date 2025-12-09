import React from "react";
import { Archive, MessageCircle, Bookmark } from "lucide-react";
import styles from "../../styles/account.module.css";

const AccountTabs = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: "questions", label: "Mening Savollarim", icon: Archive },
        { id: "answers", label: "Mening Javoblarim", icon: MessageCircle },
        { id: "saved", label: "Saqlangan Atamalar", icon: Bookmark },
    ];

    return (
        <div className={styles.tabsContainer}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`${styles.tabBtn} ${
                        activeTab === tab.id ? styles.activeTab : ""
                    }`}
                    onClick={() => setActiveTab(tab.id)}>
                    <tab.icon size={18} /> {tab.label}
                </button>
            ))}
        </div>
    );
};

export default AccountTabs;
