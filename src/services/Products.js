const API = "https://dummyjson.com";

export async function getProducts(limit = 10, skip = 0) {
  const res = await fetch(`${API}/products?limit=${limit}&skip=${skip}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Ürünler alınamadı");
  return data;
}

export async function getProductById(id) {
  const res = await fetch(`https://dummyjson.com/products/${id}`);
  if (!res.ok) throw new Error("Ürün detayı alınamadı");
  return await res.json();
}

export async function addProduct(payload) {
  const res = await fetch(`${API}/products/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Ürün eklenemedi");
  return data;
}

export async function updateProduct(id, patch) {
  const res = await fetch(`${API}/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Ürün güncellenemedi");
  return data;
}

export async function deleteProduct(id) {
  const res = await fetch(`${API}/products/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Ürün silinemedi");
  return data;
}
