// "use client";

// import {
//   createContext,
//   useContext,
//   useState,
//   useCallback,
//   useEffect,
// } from "react";

// const ProductContext = createContext<any>(null);

// export const ProductProvider = ({ children }: any) => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Load once from sessionStorage
//   useEffect(() => {
//     const cached = sessionStorage.getItem("allProducts");

//     if (cached) {
//       setProducts(JSON.parse(cached));
//     }
//   }, []);

//   const fetchProducts = useCallback(async () => {
//     // Already in memory
//     if (products.length > 0) return;

//     // Already cached
//     const cached = sessionStorage.getItem("allProducts");

//     if (cached) {
//       setProducts(JSON.parse(cached));
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await fetch("/api/products");
//       const data = await res.json();

//       setProducts(data.products || []);

//       sessionStorage.setItem(
//         "allProducts",
//         JSON.stringify(data.products || [])
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [products]);

//   const refreshProducts = useCallback(async () => {
//     setLoading(true);

//     try {
//       const res = await fetch("/api/products");
//       const data = await res.json();

//       setProducts(data.products || []);

//       sessionStorage.setItem(
//         "allProducts",
//         JSON.stringify(data.products || [])
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   return (
//     <ProductContext.Provider
//       value={{
//         products,
//         loading,
//         fetchProducts,
//         refreshProducts,
//       }}
//     >
//       {children}
//     </ProductContext.Provider>
//   );
// };

// export const useProducts = () => useContext(ProductContext);