"use client";

import { createContext, useContext, useState } from "react";

interface SearchContextType {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;

  selectedCity: string;
  setSelectedCity: React.Dispatch<React.SetStateAction<string>>;
}

const SearchContext = createContext<SearchContextType | null>(null);

export const SearchProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");

  return (
    <SearchContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
        selectedCity,
        setSelectedCity,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const ctx = useContext(SearchContext);

  if (!ctx) {
    throw new Error("useSearch must be used inside SearchProvider");
  }

  return ctx;
};