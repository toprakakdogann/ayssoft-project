import { useState, useMemo } from "react";
import { useAuth } from "../auth/AuthContext";
import { addProduct, updateProduct, deleteProduct } from "../services/Products";
import { useCart } from "../cart/CartContext";
import ViewToggle from "../components/ViewToggle";
import ProductCard from "../components/ProductCard";
import FiltersPanel from "../components/FiltersPanel";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiSave,
  FiX,
  FiShoppingCart,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import { useProductBrowser } from "../hooks/useProductBrowser";

const VIEW = { TABLE: "table", CARD: "card" };

export default function Home() {
  const { auth } = useAuth();
  const role = auth?.user?.role;
  const { addItem } = useCart();
  const navigate = useNavigate();
  const fallbackThumb = "https://placehold.co/400x400?text=IMG";

  const [viewMode, setViewMode] = useState(VIEW.TABLE);

  const {
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
  } = useProductBrowser({
    viewMode: viewMode,
    PAGE_SIZE_TABLE: 10,
    PAGE_SIZE_CARD: 12,
  });

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    price: "",
    stock: "",
    category: "",
  });

  const hasFiltersOrSort = useMemo(() => {
    return !!(
      debouncedSearch ||
      filters.category ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.inStockOnly ||
      sort.key !== "relevance"
    );
  }, [debouncedSearch, filters, sort]);

  const isClientMode = hasFiltersOrSort;

  function goDetail(id) {
    navigate(`/products/${id}`);
  }
  function goToPage(p) {
    setPage(Math.min(Math.max(1, p), totalPages));
  }

  function closeForm() {
    setOpenForm(false);
    setEditing(null);
    setForm({ title: "", price: "", stock: "", category: "" });
  }
  function openCreate() {
    setEditing(null);
    setForm({ title: "", price: "", stock: "", category: "" });
    setOpenForm(true);
  }
  function openEdit(p) {
    setEditing(p);
    setForm({
      title: p.title || "",
      price: String(p.price ?? ""),
      stock: String(p.stock ?? ""),
      category: p.category || "",
    });
    setOpenForm(true);
  }

  function matchesCurrentView(item) {
    const q = (debouncedSearch || "").toLowerCase();
    const idStr = String(item.id ?? "");
    const title = String(item.title ?? "");
    const desc = String(item.description ?? "");
    const category = String(item.category ?? "");
    const price = Number(item.price ?? 0);

    const min = filters.minPrice !== "" ? Number(filters.minPrice) : -Infinity;
    const max = filters.maxPrice !== "" ? Number(filters.maxPrice) : Infinity;
    const cat = (filters.category || "").toLowerCase();

    const matchesQ =
      !q ||
      idStr.toLowerCase().includes(q) ||
      title.toLowerCase().includes(q) ||
      desc.toLowerCase().includes(q) ||
      category.toLowerCase().includes(q);

    const matchesCat = !cat || category.toLowerCase() === cat;
    const matchesPrice = price >= min && price <= max;
    const matchesStock = !filters.inStockOnly || Number(item.stock ?? 0) > 0;

    return matchesQ && matchesCat && matchesPrice && matchesStock;
  }

  function sortSlice(arr) {
    if (sort.key === "relevance") return arr;
    const dirMul = sort.dir === "desc" ? -1 : 1;
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
    const copy = [...arr].sort((a, b) => {
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
    return copy;
  }

  async function confirmSave() {
    const payload = {
      title: form.title.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category.trim(),
    };
    if (!payload.title) {
      alert("Title gerekli");
      return;
    }

    const prevProducts = products;
    const prevTotal = total;

    try {
      if (editing) {
        const updatedItem = {
          ...editing,
          ...payload,
          rating: typeof editing.rating === "number" ? editing.rating : 4.5,
          description: editing.description || "Yeni ürün (açıklama eklenmedi).",
          thumbnail:
            editing.thumbnail || "https://placehold.co/400x400?text=IMG",
        };

        setProducts((prev) => {
          const exists = prev.some((x) => x.id === editing.id);
          if (!exists) return prev;
          let next = prev.map((x) => (x.id === editing.id ? updatedItem : x));
          next = next.filter((x) => matchesCurrentView(x));
          return sortSlice(next).slice(0, prev.length);
        });

        await updateProduct(editing.id, payload);
      } else {
        const nextId = Number(prevTotal) + 1;
        const tempItem = {
          id: nextId,
          ...payload,
          thumbnail: "https://placehold.co/400x400?text=IMG",
          rating: 4.5,
          description: "Yeni ürün (açıklama eklenmedi).",
        };

        setProducts((prev) => {
          if (matchesCurrentView(tempItem)) {
            const next = sortSlice([tempItem, ...prev]);
            return next.slice(0, prev.length);
          }
          return prev;
        });

        setTotal((t) => t + 1);

        await addProduct(payload);
      }

      closeForm();
    } catch (err) {
      setProducts(prevProducts);
      setTotal(prevTotal);
      alert(err?.message || "İşlem başarısız");
    } finally {
      setSaveConfirmOpen(false);
    }
  }

  function askDelete(p) {
    setDeleteTarget({ id: p.id, title: p.title });
    setDeleteConfirmOpen(true);
  }
  async function confirmDelete() {
    if (!deleteTarget?.id) return;
    const prevProducts = products;
    const prevTotal = total;
    try {
      const next = products.filter((x) => x.id !== deleteTarget.id);
      setProducts(next);
      setTotal((t) => Math.max(0, t - 1));
      if (next.length === 0 && page > 1) setPage(page - 1);
      await deleteProduct(deleteTarget.id);
    } catch (err) {
      setProducts(prevProducts);
      setTotal(prevTotal);
      alert(err?.message || "Silme başarısız");
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  }

  const loadingSkeletonCount = viewMode === VIEW.CARD ? 12 : 10;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Ürün Listesi</h1>
          <div className="text-sm text-gray-500">
            Toplam Ürün:{" "}
            <span className="font-medium text-gray-700">{total}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle value={viewMode} onChange={setViewMode} />
          {role === "admin" && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              <FiPlus className="text-base" /> Yeni Ürün
            </button>
          )}
        </div>
      </div>

      <FiltersPanel
        open={filterOpen}
        setOpen={setFilterOpen}
        search={search}
        setSearch={setSearch}
        activeCount={activeCount}
        hasFiltersOrSort={hasFiltersOrSort}
        clearAll={clearFilters}
        filters={filters}
        setFilters={setFilters}
        sort={sort}
        setSort={setSort}
        categoryOptions={categoryOptions}
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {viewMode === VIEW.TABLE ? (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <div className="max-h-[520px] overflow-y-auto">
              <table className="min-w-[1200px] w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 border-b z-10">
                  <tr className="text-left text-gray-600">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Ürün</th>
                    <th className="px-4 py-3 font-medium">Kategori</th>
                    <th className="px-4 py-3 font-medium">Fiyat</th>
                    <th className="px-4 py-3 font-medium">Stok</th>
                    <th className="px-4 py-3 font-medium">Rating</th>
                    <th className="px-4 py-3 font-medium">Aksiyon</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading
                    ? [...Array(loadingSkeletonCount)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-4 py-3">
                            <div className="h-4 w-10 rounded bg-gray-200" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-4 w-64 rounded bg-gray-200" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-4 w-24 rounded bg-gray-200" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-4 w-16 rounded bg-gray-200" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-4 w-14 rounded bg-gray-200" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-4 w-16 rounded bg-gray-200" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-4 w-28 rounded bg-gray-200" />
                          </td>
                        </tr>
                      ))
                    : products.map((p) => (
                        <tr
                          key={p.id}
                          onClick={() => goDetail(p.id)}
                          className="hover:bg-gray-50 transition cursor-pointer"
                        >
                          <td className="px-4 py-3">{p.id}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.thumbnail || fallbackThumb}
                                alt={p.title}
                                className="h-10 w-10 rounded-lg object-cover bg-gray-100"
                                onError={(e) => {
                                  e.currentTarget.src = fallbackThumb;
                                }}
                              />
                              <div className="min-w-0">
                                <div className="font-medium">{p.title}</div>
                                <div className="mt-0.5 max-w-[520px] truncate text-xs text-gray-500">
                                  {p.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 capitalize">{p.category}</td>
                          <td className="px-4 py-3 font-medium">${p.price}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                p.stock > 0
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {p.stock}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            ⭐{" "}
                            {typeof p.rating === "number"
                              ? p.rating.toFixed(1)
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            {role === "admin" ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEdit(p);
                                  }}
                                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50"
                                >
                                  <FiEdit2 className="text-sm" /> Düzenle
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    askDelete(p);
                                  }}
                                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
                                >
                                  <FiTrash2 className="text-sm" /> Sil
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addItem(p);
                                }}
                                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
                              >
                                <FiShoppingCart className="text-sm" /> Sepete
                                Ekle
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse h-full"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-24 w-24 rounded-xl bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="h-3 w-full rounded bg-gray-200" />
                      <div className="h-3 w-2/3 rounded bg-gray-200" />
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="h-5 rounded bg-gray-200" />
                    <div className="h-5 rounded bg-gray-200" />
                    <div className="h-5 rounded bg-gray-200" />
                    <div className="h-5 rounded bg-gray-200" />
                  </div>
                  <div className="mt-4 h-9 w-32 rounded bg-gray-200 ml-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  p={p}
                  role={role}
                  fallbackThumb={fallbackThumb}
                  onDetail={goDetail}
                  onEdit={openEdit}
                  onDelete={askDelete}
                  onAddToCart={(item) => addItem(item)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600">
          Sayfa <span className="font-medium">{page}</span> /{" "}
          <span className="font-medium">{totalPages}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={loading || page === 1}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Prev
          </button>

          {pageNumbers[0] > 1 && (
            <>
              <button
                onClick={() => goToPage(1)}
                disabled={loading}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                1
              </button>
              <span className="px-1 text-gray-400">…</span>
            </>
          )}

          {pageNumbers.map((n) => (
            <button
              key={n}
              onClick={() => goToPage(n)}
              disabled={loading}
              className={`rounded-lg px-3 py-2 text-sm border disabled:opacity-50 ${
                n === page
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              {n}
            </button>
          ))}

          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              <span className="px-1 text-gray-400">…</span>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={loading}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={loading || page === totalPages}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {role === "admin" && openForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">
              {editing
                ? `Ürünü Düzenle (Name: ${editing.title})`
                : "Yeni Ürün Ekle"}
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSaveConfirmOpen(true);
              }}
              className="mt-4 grid gap-3"
            >
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  placeholder="Category"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    placeholder="Price"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Stock
                  </label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    placeholder="Stock"
                    value={form.stock}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, stock: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  <FiX className="text-base" /> Vazgeç
                </button>
                <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
                  <FiSave className="text-base" /> Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">Onay</h2>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-medium">
                {deleteTarget?.title || "Bu ürünü"}
              </span>{" "}
              silmek istediğinize emin misiniz?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setDeleteTarget(null);
                }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Hayır
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
              >
                Evet
              </button>
            </div>
          </div>
        </div>
      )}

      {saveConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">Onay</h2>
            <p className="mt-2 text-sm text-gray-600">
              Kaydetmek istediğinize emin misiniz?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setSaveConfirmOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Hayır
              </button>
              <button
                onClick={confirmSave}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Evet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
