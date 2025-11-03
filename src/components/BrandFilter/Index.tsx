interface BrandFilterProps {
  category: string;
  selectedBrands: string[];
  onBrandChange: (brand: string) => void;
}

const brandOptions: Record<string, string[]> = {
  Mobiles: ["OnePlus", "Samsung", "Apple", "Xiaomi"],
  Car: ["Tata", "Toyota", "Honda", "Ford"],
  Motorcycle: ["Bajaj", "Hero", "Honda", "Yamaha"],
  Vehicles: ["Bajaj", "Honda", "TVS", "Yamaha"],
};

const BrandFilter: React.FC<BrandFilterProps> = ({
  category,
  selectedBrands,
  onBrandChange,
}) => {
  const brands = brandOptions[category];

  if (!brands || brands.length === 0) return null;

  return (
    <div>
      <h4>Filter by Brand</h4>
      {brands.map((brand) => (
        <label key={brand} style={{ marginRight: "10px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={selectedBrands.includes(brand)}
            onChange={() => onBrandChange(brand)}
          />
          {brand}
        </label>
      ))}
    </div>
  );
};

export default BrandFilter;