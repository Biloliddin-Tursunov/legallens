import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/home/Header";
import CategoryFilter from "../components/home/CategoryFilter";
import TermCard from "../components/home/TermCard";
import AIAssistant from "../components/home/AIAssistant";
import { ChevronDown } from "lucide-react";
import styles from "../styles/home.module.css";

const ITEMS_PER_PAGE = 4;

const Home = () => {
    // STATE LAR
    const [activeCategory, setActiveCategory] = useState("all");
    const [categories, setCategories] = useState([]);

    // Ekranda ko'rsatiladigan ro'yxat
    const [displayTerms, setDisplayTerms] = useState([]);

    // Qidiruv statelari
    const [searchQuery, setSearchQuery] = useState(""); // 🔥 YANGI: Enter orqali qidirilgan so'z
    const [searchedTerm, setSearchedTerm] = useState(null); // Dropdown orqali tanlangan bitta atama

    // KESH (Xotira)
    const [cache, setCache] = useState({});

    // Texnik state
    const [loading, setLoading] = useState(false);
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
        // Kategoriya almashsa, qidiruvlarni tozalaymiz
        setSearchedTerm(null);
        setSearchQuery("");

        // Keshda bormi?
        if (cache[activeCategory]) {
            setDisplayTerms(cache[activeCategory].data);
            setHasMore(cache[activeCategory].hasMore);
            setLoading(false);
        } else {
            // Yo'q bo'lsa, yangidan yuklaymiz
            setDisplayTerms([]);
            fetchTerms(0, activeCategory, ""); // Search bo'sh
        }
    }, [activeCategory]);

    // 🔥 3. ASOSIY FETCH FUNKSIYASI (Universal)
    const fetchTerms = async (pageNumber, categorySlug, searchString = "") => {
        try {
            setLoading(true);

            let query = supabase.from("terms");

            // Queryni shakllantirish (Select)
            // Agar qidiruv bo'lsa yoki kategoriya tanlangan bo'lsa
            let selectString = `
                *,
                laws ( title, short_name ),
                term_categories (
                    categories ( name, slug, icon )
                )
            `;

            // Agar aniq kategoriya bo'lsa (va qidiruv bo'lmasa)
            if (categorySlug !== "all" && !searchString) {
                // !inner ishlatamiz filtrlash uchun
                selectString = `
                    *,
                    laws ( title, short_name ),
                    term_categories!inner (
                        category_id,
                        categories ( name, slug, icon )
                    )
                `;
            }

            query = query.select(selectString);

            // --- A) QIDIRUV REJIMI ---
            if (searchString) {
                // Title ustunidan qidiramiz (ilike - katta kichik harf farq qilmaydi)
                query = query.ilike("title", `%${searchString}%`);
                query = query.order("title", { ascending: true });
            }
            // --- B) KATEGORIYA REJIMI ---
            else if (categorySlug !== "all") {
                const { data: catData } = await supabase
                    .from("categories")
                    .select("id")
                    .eq("slug", categorySlug)
                    .single();

                if (catData) {
                    query = query.eq("term_categories.category_id", catData.id);
                    query = query.order("title", { ascending: true });
                }
            }
            // --- C) BARCHASI REJIMI ---
            else {
                // Hech qanday filtrsiz, shunchaki yangilarini yoki random
                // Bu yerda order ID bo'yicha ketadi default holatda
            }

            // PAGINATION
            const from = pageNumber * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            const { data, error } = await query.range(from, to);

            if (error) throw error;

            // RANDOM (Faqat "Barchasi" va qidiruvsiz bo'lsa)
            let finalData = data;
            if (categorySlug === "all" && !searchString) {
                finalData = data.sort(() => Math.random() - 0.5);
            }

            // FORMATLASH
            const formattedNewTerms = finalData.map((term) => ({
                ...term,
                categoriesList: term.term_categories
                    .map((tc) => tc.categories)
                    .filter(Boolean),
                law: term.laws,
            }));

            // STATE YANGILASH
            const isMore = formattedNewTerms.length >= ITEMS_PER_PAGE;

            if (pageNumber === 0) {
                setDisplayTerms(formattedNewTerms);
            } else {
                setDisplayTerms((prev) => [...prev, ...formattedNewTerms]);
            }
            setHasMore(isMore);

            // Agar qidiruv BO'LMASA, keshlaymiz
            if (!searchString) {
                setCache((prev) => ({
                    ...prev,
                    [categorySlug]: {
                        data:
                            pageNumber === 0
                                ? formattedNewTerms
                                : [
                                      ...(prev[categorySlug]?.data || []),
                                      ...formattedNewTerms,
                                  ],
                        page: pageNumber,
                        hasMore: isMore,
                    },
                }));
            }
        } catch (error) {
            console.error("Yuklashda xato:", error);
        } finally {
            setLoading(false);
        }
    };

    // 🔥 4. HEADERDAN "ENTER" BOSILGANDA
    const handleSearch = (term) => {
        // Hamma narsani tozalab, qidiruvni boshlaymiz
        setSearchedTerm(null); // Dropdown tanlovi olib tashlanadi
        setSearchQuery(term); // Qidiruv so'zi saqlanadi
        setActiveCategory("all"); // Kategoriyani reset qilamiz (UX uchun)
        setDisplayTerms([]); // Ekranni tozalaymiz

        // Agar bo'sh bo'lsa, shunchaki hammasini yuklaydi
        fetchTerms(0, "all", term);

        // Natijalarga skroll qilish
        setTimeout(() => {
            if (resultsRef.current) {
                resultsRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        }, 100);
    };

    // 5. DROPDOWNDAN TANLANGANDA
    const handleTermSelect = (term) => {
        if (!term) {
            setSearchedTerm(null);
            return;
        }
        fetchSingleTerm(term.id);
    };

    const fetchSingleTerm = async (termId) => {
        setLoading(true);
        setSearchQuery(""); // Qidiruv so'zini tozalaymiz (chunki aniq bittasi tanlandi)

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

        if (resultsRef.current) {
            resultsRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    // 6. YANA YUKLASH (LOAD MORE)
    const loadMore = () => {
        // Hozirgi sahifa raqamini hisoblash (yuklanganlar soniga qarab)
        const nextPage = Math.floor(displayTerms.length / ITEMS_PER_PAGE);
        fetchTerms(nextPage, activeCategory, searchQuery);
    };

    // RENDER
    // Agar searchedTerm (bitta) bo'lsa o'shani, bo'lmasa displayTerms (ro'yxat)ni ko'rsat
    const itemsToShow = searchedTerm ? [searchedTerm] : displayTerms;
    const showInitialLoader = loading && itemsToShow.length === 0;

    return (
        <div className={styles.page}>
            {/* Headerga ikkita prop beramiz: Select (dropdown) va Search (enter) */}
            <Header onTermSelect={handleTermSelect} onSearch={handleSearch} />

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
                                        atamasi
                                    </>
                                ) : searchQuery ? (
                                    <>
                                        <span className="text-blue-600">
                                            "{searchQuery}"
                                        </span>{" "}
                                        bo'yicha qidiruv natijalari
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
                                    {itemsToShow.length} ta ko'rsatilmoqda
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

                                {/* Load More Button: Faqat bitta atama tanlanmagan bo'lsa chiqadi */}
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
                                    {searchQuery
                                        ? "Bu so'z bo'yicha hech narsa topilmadi."
                                        : "Bu kategoriyada atamalar mavjud emas."}
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
