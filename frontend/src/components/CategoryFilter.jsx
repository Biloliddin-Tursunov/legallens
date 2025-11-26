import React from "react";
// Hamma kerakli ikonkalarni import qilamiz
import {
    Scale,
    Briefcase,
    Gavel,
    Building2,
    Users,
    Home,
    Globe,
} from "lucide-react";
import styles from "../styles/categoryFilter.module.css";

// String nomlarni komponentga bog'lash
const iconMap = {
    Scale: Scale,
    Briefcase: Briefcase,
    Gavel: Gavel,
    Building2: Building2,
    Users: Users,
    Home: Home,
    Globe: Globe,
};

// categories propini Home.jsx dan olamiz
const CategoryFilter = ({ categories, activeCategory, setActiveCategory }) => {
    // "Barchasi" tugmasini qo'lda qo'shamiz
    const allButton = { id: "all", slug: "all", name: "Barchasi", icon: null };
    const displayList = [allButton, ...categories];

    return (
        <div className={styles.container}>
            {displayList.map((cat) => {
                // Bazadan icon nomi "Scale" bo'lib keladi, biz uni iconMap dan topamiz
                const IconComponent = cat.icon ? iconMap[cat.icon] : null;
                const isActive = activeCategory === cat.slug;

                return (
                    <button
                        key={cat.id || cat.slug}
                        onClick={() => setActiveCategory(cat.slug)}
                        className={`${styles.button} ${
                            isActive ? styles.active : ""
                        }`}>
                        {IconComponent && <IconComponent size={18} />}
                        <span>{cat.name}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default CategoryFilter;
