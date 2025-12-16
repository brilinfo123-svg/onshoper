"use client";
import { createContext, useContext, useState } from "react";

interface Category {
  id: string;
  name: string;
  subcategories: string[];
}

interface CategoryContextType {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  loaded: boolean;
  setLoaded: (loaded: boolean) => void;
}

const CategoryContext = createContext<CategoryContextType | null>(null);

export const CategoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loaded, setLoaded] = useState(false);

  return (
    <CategoryContext.Provider value={{ categories, setCategories, loaded, setLoaded }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error("useCategories must be used inside CategoryProvider");
  return ctx;
};
