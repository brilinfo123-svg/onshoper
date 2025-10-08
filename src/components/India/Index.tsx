import React, { useState, useRef, useMemo, useCallback } from 'react';
import { State, City } from 'country-state-city';
import areaData from '../../indiaArea/indian-areas.json';
import styles from './Index.module.scss';

const IndiaAddressForm = ({ onLocationSelect, isProductForm = false, formData, setFormData }) => {
  const [selectedState, setSelectedState] = useState(formData?.location?.stateCode || '');
  const [selectedCity, setSelectedCity] = useState(formData?.location?.city || '');
  const [selectedArea, setSelectedArea] = useState(formData?.location?.area || '');
  const [selectedAreaCoords, setSelectedAreaCoords] = useState(formData?.location?.coordinates || null);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [slideDirection, setSlideDirection] = useState('forward');
  const [hasAreas, setHasAreas] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  const formContainerRef = useRef(null);

  // Memoize Indian states to prevent recalculation on every render
  const indianStates = useMemo(() => State.getStatesOfCountry('IN'), []);

  // Initialize cities based on selected state
  React.useEffect(() => {
    if (selectedState) {
      const stateCities = City.getCitiesOfState('IN', selectedState);
      setCities(stateCities);
      setFilteredCities(stateCities);
      setCurrentStep(2);
      
      // If city is already selected, load its areas
      if (selectedCity) {
        const stateData = areaData[selectedState] || {};
        const cityData = stateData[selectedCity] || {};
        const areaNames = Object.keys(cityData);
        
        if (areaNames.length > 0) {
          setAreas(areaNames);
          setFilteredAreas(areaNames);
          setHasAreas(true);
          setCurrentStep(3);
        } else {
          setHasAreas(false);
        }
      }
    }
  }, [selectedState, selectedCity]);

  // Memoize state name lookup
  const getStateName = useCallback((stateCode) => {
    return indianStates.find(state => state.isoCode === stateCode)?.name || '';
  }, [indianStates]);

  // Memoize city coordinates lookup
  const getCityCoordinates = useCallback((cityName, stateCode) => {
    const stateData = areaData[stateCode] || {};
    const cityData = stateData[cityName] || {};
    const firstArea = Object.keys(cityData)[0];
    
    if (firstArea && cityData[firstArea]) {
      return cityData[firstArea];
    }
    
    // Default coordinates for major states
    const stateCoords = {
      'UP': { lat: 26.8467, lng: 80.9462 },
      'MH': { lat: 19.0760, lng: 72.8777 },
      'DL': { lat: 28.7041, lng: 77.1025 },
      'KA': { lat: 12.9716, lng: 77.5946 },
      'TN': { lat: 13.0827, lng: 80.2707 },
      'GJ': { lat: 23.0225, lng: 72.5714 },
      'RJ': { lat: 26.9124, lng: 75.7873 },
      'TG': { lat: 17.3850, lng: 78.4867 },
      'KL': { lat: 8.5241, lng: 76.9366 },
      'WB': { lat: 22.5726, lng: 88.3639 },
      'CH': { lat: 30.7333, lng: 76.7794 }
    };
    
    return stateCoords[stateCode] || { lat: 20.5937, lng: 78.9629 };
  }, []);

  // Memoize form data update function
  const updateFormData = useCallback((locationData) => {
    if (setFormData) {
      setFormData(prev => ({
        ...prev,
        location: locationData
      }));
    }
  }, [setFormData]);

  const handleStateChange = useCallback((stateCode) => {
    if (isAnimating) return;
    
    setSelectedState(stateCode);
    setSelectedCity('');
    setSelectedArea('');
    setSelectedAreaCoords(null);
    setSearchQuery('');
    setShowAreaDropdown(false);
    
    if (stateCode) {
      const stateCities = City.getCitiesOfState('IN', stateCode);
      setCities(stateCities);
      setFilteredCities(stateCities);
      setSlideDirection('forward');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(2);
        setIsAnimating(false);
        setShowCityDropdown(true);
      }, 300);
      
      updateFormData({
        state: getStateName(stateCode),
        stateCode: stateCode,
        city: '',
        area: '',
        coordinates: null
      });
    } else {
      setCities([]);
      setFilteredCities([]);
      setCurrentStep(1);
      setShowCityDropdown(false);
      
      updateFormData({
        state: '',
        stateCode: '',
        city: '',
        area: '',
        coordinates: null
      });
    }
    setAreas([]);
    setFilteredAreas([]);
  }, [isAnimating, updateFormData, getStateName]);

  const handleCityChange = useCallback((cityName) => {
    if (isAnimating) return;
    
    setSelectedCity(cityName);
    setSelectedArea('');
    setSelectedAreaCoords(null);
    setSearchQuery('');
    
    if (cityName && selectedState) {
      const stateData = areaData[selectedState] || {};
      const cityData = stateData[cityName] || {};
      const areaNames = Object.keys(cityData);
      
      if (areaNames.length > 0) {
        setAreas(areaNames);
        setFilteredAreas(areaNames);
        setHasAreas(true);
        setSlideDirection('forward');
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentStep(3);
          setIsAnimating(false);
          setShowAreaDropdown(true);
          setShowCityDropdown(false);
        }, 300);
        
        // Update parent form data with city but no area yet
        updateFormData({
          state: getStateName(selectedState),
          stateCode: selectedState,
          city: cityName,
          area: '',
          coordinates: null
        });
      } else {
        setAreas([]);
        setFilteredAreas([]);
        setHasAreas(false);
        setShowCityDropdown(false);
        
        const cityCoords = getCityCoordinates(cityName, selectedState);
        setSelectedAreaCoords(cityCoords);
        
        // Update parent form data with city coordinates
        updateFormData({
          state: getStateName(selectedState),
          stateCode: selectedState,
          city: cityName,
          area: '',
          coordinates: cityCoords
        });
        
        if (isProductForm && onLocationSelect) {
          onLocationSelect({
            state: getStateName(selectedState),
            stateCode: selectedState,
            city: cityName,
            area: '',
            coordinates: cityCoords
          });
        }
      }
    } else {
      setAreas([]);
      setFilteredAreas([]);
      
      // Update parent form data
      updateFormData({
        state: getStateName(selectedState),
        stateCode: selectedState,
        city: cityName,
        area: '',
        coordinates: null
      });
    }
  }, [isAnimating, selectedState, updateFormData, getStateName, getCityCoordinates, isProductForm, onLocationSelect]);

  const handleAreaChange = useCallback((areaName) => {
    setSelectedArea(areaName);
    setShowAreaDropdown(false);
    setShowCityDropdown(false);
    
    if (areaName && selectedState && selectedCity) {
      const stateData = areaData[selectedState] || {};
      const cityData = stateData[selectedCity] || {};
      const areaCoords = cityData[areaName];
      
      setSelectedAreaCoords(areaCoords);
      
      // Update parent form data
      updateFormData({
        state: getStateName(selectedState),
        stateCode: selectedState,
        city: selectedCity,
        area: areaName,
        coordinates: areaCoords
      });
      
      if (isProductForm && onLocationSelect) {
        onLocationSelect({
          state: getStateName(selectedState),
          stateCode: selectedState,
          city: selectedCity,
          area: areaName,
          coordinates: areaCoords
        });
      }
    } else {
      setSelectedAreaCoords(null);
    }
  }, [selectedState, selectedCity, updateFormData, getStateName, isProductForm, onLocationSelect]);

  const handleSearch = useCallback((e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (currentStep === 2) {
      const filtered = cities.filter(city => 
        city.name.toLowerCase().includes(query)
      );
      setFilteredCities(filtered);
      setShowCityDropdown(true);
      setShowAreaDropdown(false);
    } else if (currentStep === 3) {
      const filtered = areas.filter(area => 
        area.toLowerCase().includes(query)
      );
      setFilteredAreas(filtered);
      setShowAreaDropdown(true);
      setShowCityDropdown(false);
    }
  }, [currentStep, cities, areas]);

  const toggleCityDropdown = useCallback(() => {
    if (selectedState && cities.length > 0 && currentStep === 2) {
      setShowCityDropdown(!showCityDropdown);
      setShowAreaDropdown(false);
    }
  }, [selectedState, cities.length, currentStep, showCityDropdown]);

  const toggleAreaDropdown = useCallback(() => {
    if (selectedCity && areas.length > 0 && currentStep === 3) {
      setShowAreaDropdown(!showAreaDropdown);
      setShowCityDropdown(false);
    }
  }, [selectedCity, areas.length, currentStep, showAreaDropdown]);

  const goBack = useCallback(() => {
    if (isAnimating || currentStep <= 1) return;
    
    setSlideDirection('backward');
    setShowCityDropdown(false);
    setShowAreaDropdown(false);
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentStep(currentStep - 1);
      setSearchQuery('');
      
      if (currentStep === 3) {
        setFilteredAreas(areas);
        setShowCityDropdown(true);
      } else if (currentStep === 2) {
        setFilteredCities(cities);
      }
      
      setIsAnimating(false);
    }, 300);
  }, [isAnimating, currentStep, areas, cities]);

  return (
    <div className={styles.container} ref={formContainerRef}>
      {!isProductForm && <h2 className={styles.title}>Indian Address Form</h2>}
      
      {currentStep > 1 && (
        <button 
          onClick={goBack}
          className={styles.backButton}
          disabled={isAnimating}
        >
          ← Back
        </button>
      )}

      <div className={styles.formContainer}>
        {/* State Selection */}
        <div className={`${styles.step} ${currentStep === 1 ? styles.active : ''} ${
          currentStep > 1 ? styles.slideLeft : currentStep < 1 ? styles.slideRight : ''
        }`}>
          <label className={styles.label}>
            <span className="icon-map-pin"></span>Select State:
          </label>
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className={styles.select}
            disabled={isAnimating}
          >
            <option value="">-- Select Your State --</option>
            {indianStates.map((state) => (
              <option key={state.isoCode} value={state.isoCode}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        {/* City Selection */}
        <div className={`${styles.step} ${currentStep === 2 ? styles.active : ''} ${
          currentStep > 2 ? styles.slideLeft : currentStep < 2 ? styles.slideRight : ''
        }`}>
          <label className={styles.label}>
            <span className="icon-map-pin"></span>Select Your City:
          </label>
          
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search cities..."
              value={selectedCity || searchQuery}
              onChange={handleSearch}
              onFocus={() => {
                if (selectedState && cities.length > 0) {
                  setShowCityDropdown(true);
                  setShowAreaDropdown(false);
                }
              }}
              onClick={toggleCityDropdown}
              className={styles.searchInput}
              disabled={isAnimating}
            />
            {selectedCity && (
              <button 
                className={styles.clearButton}
                onClick={() => {
                  setSelectedCity('');
                  setSearchQuery('');
                  setShowCityDropdown(true);
                  updateFormData({
                    state: getStateName(selectedState),
                    stateCode: selectedState,
                    city: '',
                    area: '',
                    coordinates: null
                  });
                }}
              >
                Clear
              </button>
            )}
          </div>
          
          {showCityDropdown && (
            <div className={styles.optionsContainer}>
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <div
                    key={city.name}
                    onClick={() => handleCityChange(city.name)}
                    className={`${styles.option} ${selectedCity === city.name ? styles.selected : ''}`}
                  >
                    {city.name}
                  </div>
                ))
              ) : (
                <div className={styles.noOptions}>
                  No cities found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Area Selection - Only show if areas are available */}
        {hasAreas && (
          <div className={`${styles.step} ${currentStep === 3 ? styles.active : ''} ${
            currentStep > 3 ? styles.slideLeft : ''
          }`}>
            <label className={styles.label}>
              Select {selectedState === 'CH' ? 'Sector' : 'Area'}:
            </label>
            
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder={`Search ${selectedState === 'CH' ? 'sectors' : 'areas'}...`}
                value={selectedArea || searchQuery}
                onChange={handleSearch}
                onFocus={() => {
                  if (selectedCity && areas.length > 0) {
                    setShowAreaDropdown(true);
                    setShowCityDropdown(false);
                  }
                }}
                onClick={toggleAreaDropdown}
                className={styles.searchInput}
                disabled={isAnimating}
              />
              {selectedArea && (
                <button 
                  className={styles.clearButton}
                  onClick={() => {
                    setSelectedArea('');
                    setSearchQuery('');
                    setShowAreaDropdown(true);
                    updateFormData({
                      state: getStateName(selectedState),
                      stateCode: selectedState,
                      city: selectedCity,
                      area: '',
                      coordinates: null
                    });
                  }}
                >
                  ×
                </button>
              )}
            </div>
            
            {showAreaDropdown && (
              <div className={styles.optionsContainer}>
                {filteredAreas.length > 0 ? (
                  filteredAreas.map((area) => (
                    <div
                      key={area}
                      onClick={() => handleAreaChange(area)}
                      className={`${styles.option} ${selectedArea === area ? styles.selected : ''}`}
                    >
                      {area}
                    </div>
                  ))
                ) : (
                  <div className={styles.noOptions}>
                    No {selectedState === 'CH' ? 'sectors' : 'areas'} found
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedState && selectedCity && !isProductForm && (
        <div className={styles.summary}>
          <h3>Selected Location:</h3>
          <p><strong>State:</strong> {getStateName(selectedState)}</p>
          <p><strong>City:</strong> {selectedCity}</p>
          {selectedArea && (
            <p><strong>{selectedState === 'CH' ? 'Sector' : 'Area'}:</strong> {selectedArea}</p>
          )}
          {selectedAreaCoords && (
            <p>
              <strong>Coordinates:</strong> {selectedAreaCoords.lat.toFixed(4)}° N, {selectedAreaCoords.lng.toFixed(4)}° E
            </p>
          )}
          {!hasAreas && (
            <p className={styles.noAreasMessage}>
              No specific areas available for this city. Using city coordinates.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default IndiaAddressForm;