// contexts/FavoriteContext.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface FavoriteContextType {
  favorites: string[];
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export const FavoriteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const { data: session, status } = useSession();

  // Load favorites from localStorage for the current user
  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load
    if (!session?.user?.contact) {
      setFavorites([]); // Clear favorites if no user
      return;
    }

    const userEmail = session.user.email;
    const storedFavorites = localStorage.getItem(`favorites_${userEmail}`);
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    } else {
      setFavorites([]);
    }
  }, [session, status]);

  // Save favorites to localStorage for the current user
  useEffect(() => {
    if (!session?.user?.contact) return;
    
    const userEmail = session.user.email;
    localStorage.setItem(`favorites_${userEmail}`, JSON.stringify(favorites));
  }, [favorites, session]);

  const addFavorite = (productId: string) => {
    setFavorites(prev => [...prev, productId]);
  };

  const removeFavorite = (productId: string) => {
    setFavorites(prev => prev.filter(id => id !== productId));
  };

  const isFavorite = (productId: string) => {
    return favorites.includes(productId);
  };

  return (
    <FavoriteContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
};