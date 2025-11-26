import React from "react";
import { Scale, Briefcase, Gavel, Building2, Users, Home } from "lucide-react";
import styles from "../styles/categoryFilter.module.css";

const categories = [
    { id: "all", label: "Barchasi", icon: null },
    { id: "civil", label: "Fuqarolik huquqi", icon: Scale },
    { id: "criminal", label: "Jinoyat huquqi", icon: Briefcase },
    { id: "constitution", label: "Konstitutsiyaviy huquq", icon: Gavel },
    { id: "admin", label: "Ma'muriy huquq", icon: Building2 },
    { id: "labor", label: "Mehnat huquqi", icon: Users },
    { id: "family", label: "Oilaviy huquq", icon: Home },
];

const CategoryFilter = ({ activeCategory, setActiveCategory }) => {
    return (
        <div className={styles.container}>
            {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;

                return (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`${styles.button} ${
                            isActive ? styles.active : ""
                        }`}>
                        {Icon && <Icon size={18} />}
                        <span>{cat.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default CategoryFilter;
