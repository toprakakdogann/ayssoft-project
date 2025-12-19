const API = "https://dummyjson.com";

export async function createCart(userId, items) {
  const res = await fetch(`${API}/carts/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, products: items }),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data?.message || "Satın alma (cart) oluşturulamadı");
  return data;
}
