"use client";
import { createContext, useContext, useState } from "react";

interface ProductContextType {
  products: any[];
  setProducts: (products: any[]) => void;

  loaded: boolean;
  setLoaded: (loaded: boolean) => void;

  lastFetch: number;
  setLastFetch: React.Dispatch<React.SetStateAction<number>>;

  productDetails: Record<string, any>;
  setProductDetails: React.Dispatch<
    React.SetStateAction<Record<string, any>>
  >;
}

const ProductContext = createContext<ProductContextType | null>(null);

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [lastFetch, setLastFetch] = useState(0);
  const [productDetails, setProductDetails] = useState<Record<string, any>>({});

  return (
    <ProductContext.Provider value={{ products, setProducts, loaded, setLoaded, productDetails, setProductDetails, lastFetch, setLastFetch}}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used inside ProductProvider");
  return ctx;
};
