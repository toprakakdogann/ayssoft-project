import { FiChevronDown, FiSliders } from "react-icons/fi";

export default function FiltersPanel({
  open,
  setOpen,
  search,
  setSearch,
  activeCount,
  hasFiltersOrSort,
  clearAll,
  filters,
  setFilters,
  sort,
  setSort,
  categoryOptions = [],
}) {
  return (
    <>
      <div className="relative">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ara (id, başlık, kategori, açıklama)…"
          className="w-full sm:max-w-[520px] rounded-xl border border-gray-200 px-3 py-2 text-sm pr-9"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            title="Temizle"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
          aria-expanded={open}
          title="Filtreler & Sıralama"
        >
          <FiSliders className="text-base" />
          Filtreler & Sıralama
          <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-100 px-1 text-xs">
            {activeCount}
          </span>
          <FiChevronDown className={`transition ${open ? "rotate-180" : ""}`} />
        </button>

        {(hasFiltersOrSort || search) && (
          <button
            onClick={clearAll}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
            title="Tümünü temizle"
          >
            Sıfırla
          </button>
        )}
      </div>

      {open && (
        <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Kategori</label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, category: e.target.value }))
                }
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">Tümü</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Min Fiyat</label>
              <input
                type="number"
                inputMode="decimal"
                placeholder="Min ₺"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, minPrice: e.target.value }))
                }
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Max Fiyat</label>
              <input
                type="number"
                inputMode="decimal"
                placeholder="Max ₺"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, maxPrice: e.target.value }))
                }
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, inStockOnly: e.target.checked }))
                  }
                />
                Sadece stoktakiler
              </label>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Sıralama</label>
              <div className="flex gap-2">
                <select
                  value={sort.key}
                  onChange={(e) =>
                    setSort((s) => ({ ...s, key: e.target.value }))
                  }
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="relevance">Varsayılan</option>
                  <option value="title">Başlık</option>
                  <option value="price">Fiyat</option>
                  <option value="rating">Puan</option>
                  <option value="stock">Stok</option>
                </select>
                <select
                  value={sort.dir}
                  onChange={(e) =>
                    setSort((s) => ({ ...s, dir: e.target.value }))
                  }
                  className="w-28 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="asc">Artan</option>
                  <option value="desc">Azalan</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={() => setOpen(false)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </>
  );
}
