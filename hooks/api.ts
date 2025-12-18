// hooks/api.ts
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// 1. Product Details
export function useProductDetails(id?: string) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/products/${id}` : null,
    fetcher
  );
  return {
    product: data?.product || null,
    isLoading,
    isError: error,
  };
}

// 2. Seller Profile
export function useSellerProfile(email?: string) {
  const { data, error, isLoading } = useSWR(
    email ? `/api/profile?userEmail=${email}` : null,
    fetcher
  );
  return {
    seller: data || null,
    isLoading,
    isError: error,
  };
}

// 3. Favorites Check
export function useIsFavorite(userId?: string, productId?: string) {
  const { data, error, isLoading } = useSWR(
    userId && productId
      ? ["/api/favorites/isFavourite", userId, productId]
      : null,
    () =>
      fetch("/api/favorites/isFavourite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId }),
      }).then((res) => res.json())
  );
  return {
    isFavourite: data?.isFavourite || false,
    isLoading,
    isError: error,
  };
}
