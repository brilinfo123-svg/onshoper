import React, { useState, useEffect } from 'react';

const AddressSearch = ({ onSelect }: { onSelect: (address: string) => void }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      fetch(`/api/nominatim?q=${query}`)
        .then((res) => res.json())
        .then((data) => setSuggestions(data))
        .catch((err) => console.error('Address fetch error:', err));
    }, 500); // debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search your address..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {suggestions.length > 0 && (
        <ul>
          {suggestions.map((item: any) => (
            <li key={item.place_id} onClick={() => onSelect(item.display_name)}>
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressSearch;
