import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import { getProductById, deleteProduct } from "../services/Products";
import { FiArrowLeft, FiEdit2, FiTrash2, FiShoppingCart } from "react-icons/fi";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { addItem } = useCart();

  const role = auth?.user?.role;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fallbackThumb = "https://placehold.co/300x200?text=IMG";

  useEffect(() => {
    let cancelled = false;

    async function fetchDetail() {
      setLoading(true);
      setError("");
      try {
        const data = await getProductById(id);
        if (!cancelled) setProduct(data);
      } catch (e) {
        if (!cancelled) setError("Ürün detayı alınamadı");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleDelete() {
    try {
      await deleteProduct(product.id);
      navigate("/");
    } catch {
      alert("Silme işlemi başarısız");
    }
  }

  if (loading) {
    return (
      <div className="pt-6">
        <div className="h-6 w-48 rounded bg-gray-200 animate-pulse" />
        <div className="mt-4 h-32 rounded bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl pt-6 space-y-4">
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate(-1)}
          className="mt-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
          title="Geri"
        >
          <FiArrowLeft className="text-lg" />
        </button>

        <div className="min-w-0">
          <h1 className="mt-3 text-xl font-semibold text-gray-900 truncate">
            {product.title}
          </h1>
        </div>
      </div>

      <div className="rounded-2xl border bg-white">
        <div className="grid grid-cols-[120px_1fr] gap-4 p-4">
          <img
            src={product.thumbnail || fallbackThumb}
            alt={product.title}
            className="h-24 w-full rounded-lg object-cover bg-gray-100"
            onError={(e) => {
              e.currentTarget.src = fallbackThumb;
            }}
          />

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-gray-100 px-2 py-1">
                Kategori: <b>{product.category}</b>
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-1">
                Stok: <b>{product.stock}</b>
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-1">
                Rating:{" "}
                <b>
                  {typeof product.rating === "number"
                    ? product.rating.toFixed(1)
                    : "-"}
                </b>
              </span>
            </div>

            <div className="text-lg font-semibold text-gray-900">
              ${product.price}
            </div>

            <p className="text-sm text-gray-600 line-clamp-3">
              {product.description}
            </p>

            <div className="flex items-center gap-2 pt-2">
              {role === "admin" ? (
                <>
                  <button
                    onClick={() =>
                      navigate("/", { state: { editProduct: product } })
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50"
                  >
                    <FiEdit2 />
                    Düzenle
                  </button>

                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
                  >
                    <FiTrash2 />
                    Sil
                  </button>
                </>
              ) : (
                <button
                  onClick={() => addItem(product)}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
                >
                  <FiShoppingCart />
                  Sepete Ekle
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">Onay</h2>
            <p className="mt-2 text-sm text-gray-600">
              Bu ürünü silmek istediğinize emin misiniz?
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Hayır
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
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
