import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import CategoryFilter from "../components/CategoryFilter";
import TermCard from "../components/TermCard";
import AIAssistant from "../components/AIAssistant";
import { ChevronDown } from "lucide-react";
import styles from "../styles/home.module.css";

const ITEMS_PER_PAGE = 4;

const Home = () => {
    // STATE LAR
    const [activeCategory, setActiveCategory] = useState("all");
    const [categories, setCategories] = useState([]);

    // Ekranda ko'rsatiladigan ro'yxat
    const [displayTerms, setDisplayTerms] = useState([]);

    // KESH (Xotira)
    const [cache, setCache] = useState({});

    // Texnik state
    const [loading, setLoading] = useState(false);
    const [searchedTerm, setSearchedTerm] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const resultsRef = useRef(null);

    // 1. KATEGORIYALARNI YUKLASH
    useEffect(() => {
        const fetchCats = async () => {
            const { data } = await supabase
                .from("categories")
                .select("*")
                .order("id");
            setCategories(data || []);
        };
        fetchCats();
    }, []);

    // 2. KATEGORIYA ALMASHGANDA
    useEffect(() => {
        setSearchedTerm(null);

        // Keshda bormi?
        if (cache[activeCategory]) {
            setDisplayTerms(cache[activeCategory].data);
            setHasMore(cache[activeCategory].hasMore);
            setLoading(false);
        } else {
            // Yo'q bo'lsa, ekranni tozalab, yangidan yuklaymiz
            setDisplayTerms([]);
            fetchTerms(0, activeCategory);
        }
    }, [activeCategory]);

    // 3. ATAMALARNI YUKLASH (ENG MUHIM TUZATILGAN QISM)
    const fetchTerms = async (pageNumber, categorySlug) => {
        try {
            setLoading(true);

            let query = supabase.from("terms");

            // --- 1-SENARIY: "BARCHASI" ---
            if (categorySlug === "all") {
                query = query.select(`
          *,
          laws ( title, short_name ),
          term_categories (
            categories ( name, slug, icon )
          )
        `);
            }
            // --- 2-SENARIY: ANIQ KATEGORIYA ---
            else {
                // A) Avval o'sha kategoriyaning ID sini aniq topib olamiz (XATOSIZ USUL)
                const { data: catData, error: catError } = await supabase
                    .from("categories")
                    .select("id")
                    .eq("slug", categorySlug)
                    .single();

                if (catError || !catData) {
                    console.error("Kategoriya topilmadi");
                    setLoading(false);
                    return;
                }

                // B) Endi shu ID bo'yicha filtrlaymiz
                // !inner - bu "faqat shu shartga tushadiganlar qolsin" degan buyruq
                query = query.select(`
          *,
          laws ( title, short_name ),
          term_categories!inner (
            category_id,
            categories ( name, slug, icon )
          )
        `);

                // MANA SHU YERDA FILTR KETADI: category_id aniq 1, 2 yoki 5 bo'lishi shart
                query = query.eq("term_categories.category_id", catData.id);

                // Tartib
                query = query.order("title", { ascending: true });
            }

            // PAGINATION
            const from = pageNumber * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            const { data, error } = await query.range(from, to);

            if (error) throw error;

            // RANDOM (Faqat "Barchasi" uchun)
            let finalData = data;
            if (categorySlug === "all") {
                finalData = data.sort(() => Math.random() - 0.5);
            }

            // FORMATLASH
            const formattedNewTerms = finalData.map((term) => ({
                ...term,
                categoriesList: term.term_categories
                    .map((tc) => tc.categories) // Ichkaridagi categories obyektini olamiz
                    .filter(Boolean), // Bo'shlarini olib tashlaymiz
                law: term.laws,
            }));

            // KESHNI YANGILASH
            setCache((prevCache) => {
                const existingData = prevCache[categorySlug]?.data || [];
                // Agar 0-sahifa bo'lsa, yangi ro'yxat. Bo'lmasa, davomiga qo'shamiz.
                const updatedList =
                    pageNumber === 0
                        ? formattedNewTerms
                        : [...existingData, ...formattedNewTerms];

                const isMore = formattedNewTerms.length >= ITEMS_PER_PAGE;

                // Ekranni yangilash
                setDisplayTerms(updatedList);
                setHasMore(isMore);

                return {
                    ...prevCache,
                    [categorySlug]: {
                        data: updatedList,
                        page: pageNumber,
                        hasMore: isMore,
                    },
                };
            });
        } catch (error) {
            console.error("Yuklashda xato:", error);
        } finally {
            setLoading(false);
        }
    };

    // 4. LOAD MORE
    const loadMore = () => {
        const currentCache = cache[activeCategory];
        if (currentCache) {
            fetchTerms(currentCache.page + 1, activeCategory);
        }
    };

    // 5. QIDIRUV
    const handleTermSelect = (term) => {
        if (!term) {
            setSearchedTerm(null);
            return;
        }
        fetchSingleTerm(term.id);
    };

    const fetchSingleTerm = async (termId) => {
        setLoading(true);
        const { data } = await supabase
            .from("terms")
            .select(
                `*, laws(title, short_name), term_categories(categories(name, slug, icon))`
            )
            .eq("id", termId)
            .single();

        if (data) {
            const formatted = {
                ...data,
                categoriesList: data.term_categories
                    .map((tc) => tc.categories)
                    .filter(Boolean),
                law: data.laws,
            };
            setSearchedTerm(formatted);
        }
        setLoading(false);
    };

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

    // RENDER
    const itemsToShow = searchedTerm ? [searchedTerm] : displayTerms;
    const showInitialLoader = loading && itemsToShow.length === 0;

    return (
        <div className={styles.page}>
            <Header onTermSelect={handleTermSelect} />

            <CategoryFilter
                categories={categories}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
            />

            <div className={styles.mainContent}>
                <div className={styles.grid}>
                    <div className={styles.termsColumn} ref={resultsRef}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className={styles.sectionTitle}>
                                {searchedTerm ? (
                                    <>
                                        <span className="text-blue-600">
                                            "{searchedTerm.title}"
                                        </span>{" "}
                                        qidiruv natijasi
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
                                    {itemsToShow.length} ta natija
                                </span>
                            )}
                        </div>

                        {showInitialLoader ? (
                            <div className="text-center py-10">
                                Yuklanmoqda...
                            </div>
                        ) : itemsToShow.length > 0 ? (
                            <>
                                {itemsToShow.map((item) => (
                                    <TermCard
                                        key={item.id}
                                        title={item.title}
                                        categories={item.categoriesList}
                                        definition={item.definition}
                                        examples={item.examples}
                                        law={item.law}
                                        article={item.article_number}
                                        isHighlighted={
                                            searchedTerm &&
                                            searchedTerm.id === item.id
                                        }
                                    />
                                ))}

                                {!searchedTerm && hasMore && (
                                    <button
                                        onClick={loadMore}
                                        disabled={loading}
                                        className={styles.loadMoreBtn}>
                                        {loading ? (
                                            "Yuklanmoqda..."
                                        ) : (
                                            <>
                                                <ChevronDown size={20} /> Yana
                                                ko'rsatish
                                            </>
                                        )}
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
                                <p className="text-gray-500 text-lg">
                                    Bu kategoriyada atamalar topilmadi.
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
