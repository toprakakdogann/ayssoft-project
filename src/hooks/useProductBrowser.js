import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../services/Products";

const SEARCH_BATCH = 100;
const SEARCH_MAX_CAP = 500;

export function useProductBrowser({
  viewMode,
  PAGE_SIZE_TABLE = 10,
  PAGE_SIZE_CARD = 12,
}) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    inStockOnly: false,
  });

  const [sort, setSort] = useState({ key: "relevance", dir: "asc" });

  const hasFiltersOrSort = useMemo(() => {
    const { category, minPrice, maxPrice, inStockOnly } = filters;
    return (
      !!category ||
      !!minPrice ||
      !!maxPrice ||
      !!inStockOnly ||
      sort.key !== "relevance"
    );
  }, [filters, sort]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, hasFiltersOrSort, viewMode]);

  const pageSize = useMemo(
    () => (viewMode === "card" ? PAGE_SIZE_CARD : PAGE_SIZE_TABLE),
    [viewMode, PAGE_SIZE_CARD, PAGE_SIZE_TABLE]
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  const pageNumbers = useMemo(() => {
    const windowSize = 5;
    const half = Math.floor(windowSize / 2);
    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    const nums = [];
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  }, [page, totalPages]);

  const isClientMode = !!debouncedSearch || hasFiltersOrSort;

  useEffect(() => {
    let cancelled = false;
    async function fetchPage() {
      setLoading(true);
      setError("");
      try {
        if (isClientMode) {
          let all = [];
          let skip = 0;
          while (!cancelled && all.length < SEARCH_MAX_CAP) {
            const batch = await getProducts(
              SEARCH_BATCH,
              skip,
              debouncedSearch
            );
            const items = batch?.products || [];
            all = all.concat(items);
            if (items.length < SEARCH_BATCH) break;
            skip += SEARCH_BATCH;
          }

          const q = (debouncedSearch || "").toLowerCase();
          const min =
            filters.minPrice !== "" ? Number(filters.minPrice) : -Infinity;
          const max =
            filters.maxPrice !== "" ? Number(filters.maxPrice) : Infinity;
          const cat = (filters.category || "").toLowerCase();

          let filtered = all.filter((p) => {
            const idStr = String(p.id ?? "");
            const title = p.title ?? "";
            const desc = p.description ?? "";
            const category = p.category ?? "";
            const price = Number(p.price ?? 0);
            const matchesQ =
              !q ||
              idStr.toLowerCase().includes(q) ||
              title.toLowerCase().includes(q) ||
              desc.toLowerCase().includes(q) ||
              category.toLowerCase().includes(q);
            const matchesCat = !cat || category.toLowerCase() === cat;
            const matchesPrice = price >= min && price <= max;
            const matchesStock =
              !filters.inStockOnly || Number(p.stock ?? 0) > 0;
            return matchesQ && matchesCat && matchesPrice && matchesStock;
          });

          if (sort.key !== "relevance") {
            const dirMul = sort.dir === "desc" ? -1 : 1;
            filtered = filtered.sort((a, b) => {
              const getVal = (obj) => {
                switch (sort.key) {
                  case "title":
                    return String(obj.title ?? "").toLowerCase();
                  case "price":
                    return Number(obj.price ?? 0);
                  case "rating":
                    return Number(obj.rating ?? 0);
                  case "stock":
                    return Number(obj.stock ?? 0);
                  default:
                    return 0;
                }
              };
              const va = getVal(a),
                vb = getVal(b);
              if (va < vb) return -1 * dirMul;
              if (va > vb) return 1 * dirMul;
              const ta = String(a.title ?? "").toLowerCase();
              const tb = String(b.title ?? "").toLowerCase();
              if (ta < tb) return -1;
              if (ta > tb) return 1;
              return 0;
            });
          }

          const nextTotal = filtered.length;
          const start = (page - 1) * pageSize;
          const end = start + pageSize;
          const pageSlice = filtered.slice(start, end);

          if (!cancelled) {
            setProducts(pageSlice);
            setTotal(nextTotal);
          }
        } else {
          const skip = (page - 1) * pageSize;
          const data = await getProducts(pageSize, skip, "");
          if (!cancelled) {
            setProducts(data.products || []);
            setTotal(Number(data.total || 0));
          }
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || "Hata oluştu");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPage();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, debouncedSearch, isClientMode, filters, sort, version]);

  const clearFilters = () => {
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      inStockOnly: false,
    });
    setSort({ key: "relevance", dir: "asc" });
    setSearch("");
  };

  const categoryOptions = useMemo(() => {
    const set = new Set(
      products
        .map((p) => (p?.category ? String(p.category) : ""))
        .filter(Boolean)
        .map((s) => s.toLowerCase())
    );
    return Array.from(set).sort();
  }, [products]);

  const activeCount = useMemo(() => {
    let c = 0;
    if (filters.category) c++;
    if (filters.minPrice) c++;
    if (filters.maxPrice) c++;
    if (filters.inStockOnly) c++;
    if (sort.key !== "relevance") c++;
    if (debouncedSearch) c++;
    return c;
  }, [filters, sort, debouncedSearch]);

  const refresh = () => setVersion((v) => v + 1);

  return {
    products,
    setProducts,
    total,
    setTotal,
    loading,
    error,
    page,
    setPage,
    totalPages,
    pageNumbers,
    pageSize,
    search,
    setSearch,
    debouncedSearch,
    filters,
    setFilters,
    sort,
    setSort,
    categoryOptions,
    activeCount,
    clearFilters,
    refresh,
  };
}
