import { useState } from "react";
import { useCart } from "../cart/CartContext";
import { useAuth } from "../auth/AuthContext";

export default function Cart() {
  const { auth } = useAuth();
  const role = auth?.user?.role;

  const { items, total, removeItem, setQuantity, clear } = useCart();

  const [confirmBuyOpen, setConfirmBuyOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [thankYouOpen, setThankYouOpen] = useState(false);

  function handleBuyYes() {
    clear();
    setConfirmBuyOpen(false);
    setThankYouOpen(true);
  }

  function handleClearYes() {
    clear();
    setConfirmClearOpen(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Sepetim</h1>

        <button
          onClick={() => setConfirmClearOpen(true)}
          disabled={items.length === 0}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          Sepeti Temizle
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-600">
          Sepetin boş.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="divide-y">
              {items.map((it) => (
                <div key={it.id} className="flex gap-4 p-4">
                  <img
                    src={it.thumbnail}
                    alt={it.title}
                    className="h-16 w-16 rounded-xl object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{it.title}</div>
                        <div className="mt-1 text-sm text-gray-500">
                          ${it.price} • Stok:{" "}
                          <span className="font-medium">{it.stock}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(it.id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
                      >
                        Sil
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(it.id, it.quantity - 1)}
                        className="h-9 w-9 rounded-lg border border-gray-200 hover:bg-gray-50"
                      >
                        −
                      </button>

                      <input
                        type="number"
                        min={1}
                        max={it.stock || 999999}
                        value={it.quantity}
                        onChange={(e) => setQuantity(it.id, e.target.value)}
                        className="w-20 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      />

                      <button
                        onClick={() => setQuantity(it.id, it.quantity + 1)}
                        disabled={it.stock ? it.quantity >= it.stock : false}
                        className="h-9 w-9 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                      >
                        +
                      </button>

                      {it.stock ? (
                        <span className="text-xs text-gray-500">
                          (Maks: {it.stock})
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm h-fit">
            <div className="text-sm text-gray-500">Özet</div>
            <div className="mt-2 text-2xl font-semibold">
              ${total.toFixed(2)}
            </div>

            <button
              className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500"
              onClick={() => setConfirmBuyOpen(true)}
            >
              Satın Al
            </button>

            <div className="mt-3 text-xs text-gray-500">
              Rol:{" "}
              <span className="font-medium text-gray-700">{role || "?"}</span>
            </div>
          </div>
        </div>
      )}

      {confirmBuyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">Onay</h2>
            <p className="mt-2 text-sm text-gray-600">
              Satın almak istediğinize emin misiniz?
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmBuyOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Hayır
              </button>

              <button
                onClick={handleBuyYes}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
              >
                Evet
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">Onay</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sepeti temizlemek istediğinize emin misiniz?
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Hayır
              </button>

              <button
                onClick={handleClearYes}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
              >
                Evet
              </button>
            </div>
          </div>
        </div>
      )}

      {thankYouOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">Teşekkürler</h2>
            <p className="mt-2 text-sm text-gray-600">
              Satın alımınız için teşekkür ederiz.
            </p>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setThankYouOpen(false)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
