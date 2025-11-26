import React, { useState } from "react";
import Header from "../components/Header";
import CategoryFilter from "../components/CategoryFilter";
import TermCard from "../components/TermCard";
import AIAssistant from "../components/AIAssistant";
import styles from "../styles/home.module.css";

// 1-QADAM: Ma'lumotlarga 'type' maydonini qo'shdik (filter ID lari bilan bir xil bo'lishi kerak)
const dummyData = [
    {
        id: 1,
        title: "Aybdorlik",
        category: "Jinoyat huquqi",
        type: "criminal", // <-- Filter ID si bilan mos
        definition:
            "Shaxsning jinoyat sodir etganligi va jinoiy javobgarlikka tortilishi kerakligini isbotlash.",
        examples: [
            "Sud aybdorlikni isbotlashi kerak",
            "Aybdorlik gumon qilinmaguncha shaxs aybsiz hisoblanadi",
        ],
    },
    {
        id: 2,
        title: "Jarima",
        category: "Ma'muriy huquq",
        type: "admin", // <-- Filter ID si bilan mos
        definition:
            "Qonunbuzarlik uchun pul to'lash shaklida qo'llaniladigan ma'muriy jazo turi.",
        examples: [],
    },
    {
        id: 3,
        title: "Shartnoma",
        category: "Fuqarolik huquqi",
        type: "civil", // <-- Filter ID si bilan mos
        definition:
            "Ikki yoki undan ortiq shaxsning fuqarolik huquqlari va burchlarini o'rnatish, o'zgartirish yoki bekor qilishga qaratilgan kelishuvi.",
        examples: ["Oldi-sotdi shartnomasi", "Ijara shartnomasi"],
    },
    {
        id: 4,
        title: "Konstitutsiya",
        category: "Konstitutsiyaviy huquq",
        type: "constitution", // <-- Filter ID si bilan mos
        definition: "Davlatning asosiy qonuni bo'lib, oliy yuridik kuchga ega.",
        examples: ["O'zbekiston Respublikasi Konstitutsiyasi"],
    },
];

const Home = () => {
    const [activeCategory, setActiveCategory] = useState("all");

    // 2-QADAM: Filtr qilish logikasi
    const filteredTerms = dummyData.filter((term) => {
        // Agar "Barchasi" (all) tanlangan bo'lsa, hammasini qaytar
        if (activeCategory === "all") return true;
        // Aks holda, termning 'type'i tanlangan kategoriyaga teng bo'lsa qaytar
        return term.type === activeCategory;
    });

    return (
        <div className={styles.page}>
            <Header />

            <CategoryFilter
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
            />

            <div className={styles.mainContent}>
                <div className={styles.grid}>
                    {/* Chap tomon */}
                    <div className={styles.termsColumn}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className={styles.sectionTitle}>
                                {activeCategory === "all"
                                    ? "Barcha atamalar"
                                    : "Saralangan atamalar"}
                            </h2>
                            <span className="text-gray-500 text-sm">
                                {filteredTerms.length} ta natija
                            </span>
                        </div>

                        {/* 3-QADAM: 'dummyData' o'rniga 'filteredTerms' ni aylantiramiz */}
                        {filteredTerms.length > 0 ? (
                            filteredTerms.map((item) => (
                                <TermCard
                                    key={item.id}
                                    title={item.title}
                                    category={item.category}
                                    definition={item.definition}
                                    examples={item.examples}
                                />
                            ))
                        ) : (
                            // Agar hech narsa topilmasa
                            <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
                                <p className="text-gray-500 text-lg">
                                    Bu kategoriyada hozircha atamalar yo'q.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* O'ng tomon */}
                    <div className={styles.sidebar}>
                        <AIAssistant />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
