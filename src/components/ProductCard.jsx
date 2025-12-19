import { FiEdit2, FiTrash2, FiShoppingCart } from "react-icons/fi";

export default function ProductCard({
  p,
  role,
  fallbackThumb,
  onDetail,
  onEdit,
  onDelete,
  onAddToCart,
}) {
  return (
    <div
      onClick={() => onDetail(p.id)}
      className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow transition flex h-full flex-col"
    >
      <div className="flex items-start gap-4">
        <img
          src={p.thumbnail || fallbackThumb}
          alt={p.title}
          className="h-24 w-24 rounded-xl object-cover bg-gray-100 shrink-0"
          onError={(e) => {
            e.currentTarget.src = fallbackThumb;
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-6 line-clamp-2">{p.title}</h3>
            <span className="shrink-0 text-xs rounded-full px-2 py-1 bg-gray-100 text-gray-700">
              #{p.id}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 line-clamp-2">
            {p.description}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <span className="rounded-full bg-gray-100 px-2 py-0.5 capitalize">
          {p.category || "—"}
        </span>
        <span className="text-right font-medium">${p.price}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            p.stock > 0
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          Stok: {p.stock}
        </span>
        <span className="text-right">
          ⭐ {typeof p.rating === "number" ? p.rating.toFixed(1) : "—"}
        </span>
      </div>

      <div className="mt-4 pt-3 border-t flex justify-between items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDetail(p.id);
          }}
          className="text-xs underline underline-offset-2 hover:opacity-80"
        >
          Detaya Git
        </button>

        {role === "admin" ? (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(p);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50"
            >
              <FiEdit2 className="text-sm" />
              Düzenle
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(p);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
            >
              <FiTrash2 className="text-sm" />
              Sil
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(p);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
          >
            <FiShoppingCart className="text-sm" />
            Sepete Ekle
          </button>
        )}
      </div>
    </div>
  );
}
