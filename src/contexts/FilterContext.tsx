import React, { createContext, useContext, useState, useEffect } from "react";

type FilterType = "all" | "Sale" | "Rent";

interface FilterContextProps {
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
}

const FilterContext = createContext<FilterContextProps>({
  filterType: "all",
  setFilterType: () => {},
});

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filterType, setFilterTypeState] = useState<FilterType>("all");

  // Load from localStorage on first render
  useEffect(() => {
    const savedType = localStorage.getItem("filterType") as FilterType;
    if (savedType === "Sale" || savedType === "Rent" || savedType === "all") {
      setFilterTypeState(savedType);
    }
  }, []);

  // Save to localStorage whenever it changes
  const setFilterType = (type: FilterType) => {
    setFilterTypeState(type);
    localStorage.setItem("filterType", type);
  };

  return (
    <FilterContext.Provider value={{ filterType, setFilterType }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => useContext(FilterContext);
