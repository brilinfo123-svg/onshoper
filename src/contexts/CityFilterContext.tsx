// /contexts/CityFilterContext.tsx
import { createContext, useContext, useState } from "react";

interface CityFilterContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
}

const CityFilterContext = createContext<CityFilterContextType | undefined>(undefined);

export const CityFilterProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedCity, setSelectedCity] = useState("All Cities");

  return (
    <CityFilterContext.Provider value={{ selectedCity, setSelectedCity }}>
      {children}
    </CityFilterContext.Provider>
  );
};

export const useCityFilter = () => {
  const context = useContext(CityFilterContext);
  if (!context) throw new Error("useCityFilter must be used within CityFilterProvider");
  return context;
};
