"use client";
import { createContext, useContext, useState } from "react";

interface ProductContextType {
  products: any[];
  setProducts: (products: any[]) => void;
  loaded: boolean;
  setLoaded: (loaded: boolean) => void;
}

const ProductContext = createContext<ProductContextType | null>(null);

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  return (
    <ProductContext.Provider value={{ products, setProducts, loaded, setLoaded }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used inside ProductProvider");
  return ctx;
};
