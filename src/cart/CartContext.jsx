import React, { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const count = useMemo(
    () => items.reduce((a, x) => a + x.quantity, 0),
    [items]
  );
  const total = useMemo(
    () => items.reduce((a, x) => a + x.price * x.quantity, 0),
    [items]
  );

  function addItem(product) {
    setItems((prev) => {
      const found = prev.find((x) => x.id === product.id);
      const stock = Number(product.stock ?? 0);

      if (found) {
        const nextQty = Math.min(
          found.quantity + 1,
          stock || found.quantity + 1
        );
        return prev.map((x) =>
          x.id === product.id ? { ...x, quantity: nextQty } : x
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          price: Number(product.price ?? 0),
          thumbnail: product.thumbnail,
          stock: stock,
          quantity: 1,
        },
      ];
    });
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  function setQuantity(id, qty) {
    setItems((prev) =>
      prev
        .map((x) => {
          if (x.id !== id) return x;
          const max = Number(x.stock ?? 0) || 999999;
          const next = Math.max(0, Math.min(Number(qty || 0), max));
          return { ...x, quantity: next };
        })
        .filter((x) => x.quantity > 0)
    );
  }

  function clear() {
    setItems([]);
  }

  const value = useMemo(
    () => ({ items, count, total, addItem, removeItem, setQuantity, clear }),
    [items, count, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
