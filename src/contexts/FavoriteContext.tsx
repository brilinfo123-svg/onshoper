"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface FavoriteContextType {
  favorites: Set<string>;
  favoritesCount: number;          // ✅ helper for UI
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  loading: boolean;                // ✅ VERY IMPORTANT
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export const FavoriteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // 🔥 Load favorites on refresh (DB → localStorage fallback)
  useEffect(() => {
    if (status === "loading") return;
  
    if (!session?.user?.contact) {
      setFavorites(new Set());
      setLoading(false);
      return;
    }
  
    const userKey = `favorites_${session.user.contact}`;
  
    // 🟢 STEP 1: Try localStorage FIRST (NO API CALL)
    const stored = localStorage.getItem(userKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(new Set(parsed));
          setLoading(false);
          return; // ❌ STOP → no API call
        }
      } catch (e) {
        console.warn("⚠️ localStorage parse error, refetching...");
      }
    }
  
    // 🔴 STEP 2: Call API ONLY if localStorage missing
    const loadFavorites = async () => {
      try {
        const res = await fetch("/api/favorites/getAll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: session.user.contact }),
        });
  
        if (!res.ok) throw new Error("API failed");
  
        const data = await res.json();
  
        if (Array.isArray(data.favorites)) {
          setFavorites(new Set<string>(data.favorites));
  
          // ✅ cache
          localStorage.setItem(userKey, JSON.stringify(data.favorites));
        }
      } catch (err) {
        console.warn("⚠️ DB fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
  
    loadFavorites();
  }, [session?.user?.contact, status]);
  

  // 💾 Persist to localStorage
  useEffect(() => {
    if (!session?.user?.contact || loading) return;

    const userKey = `favorites_${session.user.contact}`;
    localStorage.setItem(userKey, JSON.stringify(Array.from(favorites)));
  }, [favorites, session?.user?.contact, loading]);

  // ➕ Add
  const addFavorite = (productId: string) => {
    setFavorites(prev => {
      const updated = new Set(prev);
      updated.add(productId);
      return updated;
    });
  };

  // ➖ Remove
  const removeFavorite = (productId: string) => {
    setFavorites(prev => {
      const updated = new Set(prev);
      updated.delete(productId);
      return updated;
    });
  };

  // ❤️ Check
  const isFavorite = (productId: string) => favorites.has(productId);

  return (
    <FavoriteContext.Provider
      value={{
        favorites,
        favoritesCount: favorites.size, // ✅ SAFE FOR UI
        addFavorite,
        removeFavorite,
        isFavorite,
        loading,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoriteProvider");
  }
  return context;
};
