import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/home/Header";
import CategoryFilter from "../components/home/CategoryFilter";
import TermCard from "../components/home/TermCard";
import AIAssistant from "../components/home/AIAssistant";
import { ChevronDown } from "lucide-react";
import styles from "../styles/home.module.css";

const ITEMS_PER_PAGE = 4;

// 🔥 session propini to'g'ri qabul qiladi
const Home = ({ session }) => {
    // ... boshqa statelar
    const [activeCategory, setActiveCategory] = useState("all");
    const [categories, setCategories] = useState([]);
    const [displayTerms, setDisplayTerms] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchedTerm, setSearchedTerm] = useState(null);
    const [cache, setCache] = useState({});
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);

    // 🔥 MUHIM: Saqlangan atamalar ID lari
    const [savedTermIds, setSavedTermIds] = useState(new Set());

    const resultsRef = useRef(null);

    // --- YORDAMCHI FUNKSIYALAR ---

    // 🔥 1. Saqlangan atamalarni bazadan olib kelib, Setni yangilash
    const fetchSavedTerms = async () => {
        if (!session?.user) {
            setSavedTermIds(new Set());
            return;
        }

        try {
            // RLS Auth.uid() ga ulanganini inobatga olib, to'g'ridan-to'g'ri foydalanamiz
            const { data: savedData, error } = await supabase
                .from("saved_terms")
                .select("term_id")
                .eq("user_id", session.user.id);

            if (error) throw error;

            if (savedData) {
                const ids = new Set(savedData.map((item) => item.term_id));
                setSavedTermIds(ids);
            }
        } catch (e) {
            console.error("Saqlanganlarni yuklashda xato:", e);
            setSavedTermIds(new Set());
        }
    };

    // --- USE EFFECTS ---

    // 1. Kategoriya va Saqlanganlarni yuklash
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

    // 2. Session o'zgarganda saqlanganlarni yangilash
    useEffect(() => {
        fetchSavedTerms();
    }, [session]); // Sessionga bog'langan

    // 3. Kategoriya o'zgarganda (Avvalgi kabi qoladi)
    useEffect(() => {
        setSearchedTerm(null);
        setSearchQuery("");
        if (cache[activeCategory]) {
            setDisplayTerms(cache[activeCategory].data);
            setHasMore(cache[activeCategory].hasMore);
            setLoading(false);
        } else {
            setDisplayTerms([]);
            fetchTerms(0, activeCategory, "");
        }
    }, [activeCategory]);

    // ... fetchTerms, handleSearch, handleTermSelect, fetchSingleTerm, loadMore funksiyalari o'zgarishsiz qoladi

    const fetchTerms = async (pageNumber, categorySlug, searchString = "") => {
        // ... (Bu funksiya avvalgi kabi uzun bo'lib qolaveradi) ...
        // Qolgan logika avvalgi kabi
        try {
            setLoading(true);
            let query = supabase.from("terms");

            let selectString = `
                *,
                laws ( title, short_name ),
                term_categories ( categories ( name, slug, icon ) )
            `;

            if (categorySlug !== "all" && !searchString) {
                selectString = `
                    *,
                    laws ( title, short_name ),
                    term_categories!inner ( category_id, categories ( name, slug, icon ) )
                `;
            }

            query = query.select(selectString);

            if (searchString) {
                query = query
                    .ilike("title", `%${searchString}%`)
                    .order("title", { ascending: true });
            } else if (categorySlug !== "all") {
                const { data: catData } = await supabase
                    .from("categories")
                    .select("id")
                    .eq("slug", categorySlug)
                    .single();
                if (catData) {
                    query = query
                        .eq("term_categories.category_id", catData.id)
                        .order("title", { ascending: true });
                }
            }
            // --- C) BARCHASI REJIMI ---
            else {
                // Hech qanday filtrsiz, shunchaki yangilarini yoki random
                // Bu yerda order ID bo'yicha ketadi default holatda
            }

            const from = pageNumber * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;
            const { data, error } = await query.range(from, to);

            if (error) throw error;

            let finalData = data;
            if (categorySlug === "all" && !searchString && pageNumber === 0) {
                // Faqat boshida random qilamiz
                finalData = data.sort(() => Math.random() - 0.5);
            }

            const formattedNewTerms = finalData.map((term) => ({
                ...term,
                categoriesList: term.term_categories
                    .map((tc) => tc.categories)
                    .filter(Boolean),
                law: term.laws,
            }));

            const isMore = formattedNewTerms.length >= ITEMS_PER_PAGE;

            if (pageNumber === 0) {
                setDisplayTerms(formattedNewTerms);
            } else {
                setDisplayTerms((prev) => [...prev, ...formattedNewTerms]);
            }
            setHasMore(isMore);

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

    // ... handleSearch, handleTermSelect, fetchSingleTerm, loadMore funksiyalari ham avvalgi kabi qoladi.
    const handleSearch = (term) => {
        setSearchedTerm(null);
        setSearchQuery(term);
        setActiveCategory("all");
        setDisplayTerms([]);
        fetchTerms(0, "all", term);
        setTimeout(
            () =>
                resultsRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                }),
            100
        );
    };

    const handleTermSelect = (term) => {
        if (!term) {
            setSearchedTerm(null);
            return;
        }
        fetchSingleTerm(term.id);
    };

    const fetchSingleTerm = async (termId) => {
        setLoading(true);
        setSearchQuery("");
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
        resultsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    const loadMore = () => {
        const nextPage = Math.floor(displayTerms.length / ITEMS_PER_PAGE);
        fetchTerms(nextPage, activeCategory, searchQuery);
    };

    // 🔥 4. SAQLASH TUGMASI LOGIKASI (Optimistik UI dan voz kechib, mustahkamlandi)
    const handleToggleSave = async (termId) => {
        if (!session?.user) {
            alert("Atamani saqlash uchun tizimga kiring!");
            return;
        }

        const currentAuthUid = session.user.id;
        const isCurrentlySaved = savedTermIds.has(termId);

        // Optimistik UI dan voz kechib, loading ni ishlatamiz
        setLoading(true);

        try {
            if (isCurrentlySaved) {
                // --- DELETE Operatsiyasi ---
                const { error } = await supabase
                    .from("saved_terms")
                    .delete()
                    .eq("user_id", currentAuthUid)
                    .eq("term_id", termId);

                if (error)
                    throw new Error(
                        "O'chirishda xato yuz berdi: " + error.message
                    );
            } else {
                // --- INSERT Operatsiyasi ---
                const { error } = await supabase
                    .from("saved_terms")
                    .insert({ user_id: currentAuthUid, term_id: termId });

                // Xatolik 23505 (duplicate key) yuz bersa ham uni tutib, xabar beramiz
                if (error && error.code !== "23505")
                    throw new Error(
                        "Saqlashda xato yuz berdi: " + error.message
                    );
            }

            // 🔥 Muvaffaqiyatli yakunlansa, Set ni bazadan qayta yuklaymiz (aniqlik uchun)
            await fetchSavedTerms();
        } catch (error) {
            console.error("Amaliyot XATOSI:", error);
            alert(`Amaliyot bajarilmadi: ${error.message}.`);
        } finally {
            setLoading(false);
        }
    };

    const itemsToShow = searchedTerm ? [searchedTerm] : displayTerms;
    const showInitialLoader = loading && itemsToShow.length === 0;

    // --- RENDER ---
    return (
        <div className={styles.page}>
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
                                        bo'yicha natijalar
                                    </>
                                ) : activeCategory === "all" ? (
                                    "Barcha atamalar"
                                ) : (
                                    categories.find(
                                        (c) => c.slug === activeCategory
                                    )?.name || "Saralangan"
                                )}
                            </h2>
                            {/* ... */}
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
                                        id={item.id}
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
                                        // 🔥 YENGILANGAN PROPLAR
                                        isSaved={savedTermIds.has(item.id)}
                                        onToggleSave={handleToggleSave}
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
                                    {searchQuery
                                        ? "Hech narsa topilmadi."
                                        : "Atamalar mavjud emas."}
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
