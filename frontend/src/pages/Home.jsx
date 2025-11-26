import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import CategoryFilter from "../components/CategoryFilter";
import TermCard from "../components/TermCard";
import AIAssistant from "../components/AIAssistant";
import styles from "../styles/home.module.css";

const Home = () => {
    const [activeCategory, setActiveCategory] = useState("all");
    const [terms, setTerms] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchedTerm, setSearchedTerm] = useState(null);

    // Skroll qilish uchun Ref
    const resultsRef = useRef(null);

    // 1-QADAM: Ma'lumotlarni yuklash (Funksiya useEffect ichida bo'lishi shart)
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);

                // Kategoriyalarni olish
                const { data: categoriesData } = await supabase
                    .from("categories")
                    .select("*")
                    .order("id");
                setCategories(categoriesData || []);

                // Atamalarni olish
                const { data: termsData } = await supabase
                    .from("terms")
                    .select(
                        `
            *,
            laws ( title, short_name ),
            term_categories (
              categories ( name, slug, icon )
            )
          `
                    )
                    .order("title", { ascending: true });

                // Ma'lumotlarni formatlash
                const formattedTerms =
                    termsData?.map((term) => ({
                        ...term,
                        categoriesList: term.term_categories.map(
                            (tc) => tc.categories
                        ),
                        law: term.laws,
                    })) || [];

                setTerms(formattedTerms);
            } catch (error) {
                console.error("Data yuklashda xatolik:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []); // [] - Faqat sahifa ochilganda bir marta ishlaydi

    // 2-QADAM: Avto-skroll (Qidiruv natijasi chiqqanda)
    useEffect(() => {
        if (searchedTerm && resultsRef.current) {
            setTimeout(() => {
                resultsRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 100);
        }
    }, [searchedTerm]);

    // Handlerlar
    const handleTermSelect = (term) => {
        if (!term) {
            setSearchedTerm(null);
            return;
        }
        // To'liq ma'lumotni topamiz
        const fullTerm = terms.find((t) => t.id === term.id);

        if (fullTerm) {
            setSearchedTerm(fullTerm);
            // Agar atamaning kategoriyasi bo'lsa, filtrni ham o'shanga o'tkazamiz
            if (fullTerm.categoriesList && fullTerm.categoriesList.length > 0) {
                setActiveCategory(fullTerm.categoriesList[0].slug);
            }
        }
    };

    // Ekranga chiqarish logikasi
    let displayTerms = [];

    if (searchedTerm) {
        // A) Qidiruv natijasi
        displayTerms.push(searchedTerm);

        // Unga bog'liq atamalar
        const related = terms.filter(
            (t) =>
                t.id !== searchedTerm.id &&
                t.categoriesList.some((cat) =>
                    searchedTerm.categoriesList.some(
                        (sc) => sc.slug === cat.slug
                    )
                )
        );
        displayTerms = [...displayTerms, ...related];
    } else {
        // B) Oddiy filtr
        displayTerms = terms.filter((term) => {
            if (activeCategory === "all") return true;
            return term.categoriesList.some(
                (cat) => cat.slug === activeCategory
            );
        });
    }

    return (
        <div className={styles.page}>
            <Header onTermSelect={handleTermSelect} />

            <CategoryFilter
                categories={categories}
                activeCategory={activeCategory}
                setActiveCategory={(cat) => {
                    setActiveCategory(cat);
                    setSearchedTerm(null);
                }}
            />

            <div className={styles.mainContent}>
                <div className={styles.grid}>
                    {/* Natijalar chiqadigan joy (Ref ulandi) */}
                    <div className={styles.termsColumn} ref={resultsRef}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className={styles.sectionTitle}>
                                {searchedTerm ? (
                                    <>
                                        <span className="text-blue-600">
                                            "{searchedTerm.title}"
                                        </span>{" "}
                                        va unga bog'liq atamalar
                                    </>
                                ) : activeCategory === "all" ? (
                                    "Barcha atamalar"
                                ) : (
                                    categories.find(
                                        (c) => c.slug === activeCategory
                                    )?.name || "Saralangan"
                                )}
                            </h2>
                            {!loading && (
                                <span className="text-gray-500 text-sm">
                                    {displayTerms.length} ta natija
                                </span>
                            )}
                        </div>

                        {loading ? (
                            <div className="text-center py-10">
                                Yuklanmoqda...
                            </div>
                        ) : displayTerms.length > 0 ? (
                            displayTerms.map((item) => (
                                <TermCard
                                    key={item.id}
                                    title={item.title}
                                    categories={item.categoriesList}
                                    definition={item.definition}
                                    examples={item.examples}
                                    law={item.law}
                                    article={item.article_number}
                                    // Qidirilgan elementni ajratib ko'rsatish (ixtiyoriy props)
                                    style={
                                        searchedTerm &&
                                        searchedTerm.id === item.id
                                            ? { border: "2px solid #1a56db" }
                                            : {}
                                    }
                                />
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
                                <p className="text-gray-500 text-lg">
                                    Ma'lumot topilmadi.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className={styles.sidebar}>
                        <AIAssistant />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
