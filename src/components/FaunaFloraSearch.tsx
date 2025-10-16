import { useState, useEffect } from 'react';

interface FaunaFlora {
  commonName: string;
  scientificName: string;
  plName: string;
  esName: string;
  seasonality: string;
  notes: string;
  imageSrc?: string;
}

interface FaunaFloraSearchProps {
  species: FaunaFlora[];
  seasonalityMap: Record<string, string>;
}

export default function FaunaFloraSearch({ species, seasonalityMap }: FaunaFloraSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedSpecies, setCheckedSpecies] = useState<Set<string>>(new Set());

  // Load checked species from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('checkedSpecies');
    if (saved) {
      try {
        const parsedChecked = JSON.parse(saved);
        setCheckedSpecies(new Set(parsedChecked));
      } catch (error) {
        console.error('Error loading checked species from localStorage:', error);
      }
    }
  }, []);

  // Save checked species to localStorage whenever the set changes
  useEffect(() => {
    localStorage.setItem('checkedSpecies', JSON.stringify(Array.from(checkedSpecies)));
  }, [checkedSpecies]);

  const filteredSpecies = searchQuery.length >= 3 
    ? species.filter(item => {
        const query = searchQuery.toLowerCase();
        const commonNameWords = item.commonName.toLowerCase().split(' ');
        const plNameWords = item.plName.toLowerCase().split(' ');
        const esNameWords = item.esName.toLowerCase().split(' ');
        const notesWords = item.notes.toLowerCase().split(' ');
        
        return commonNameWords.some(word => word.includes(query)) || 
               plNameWords.some(word => word.includes(query)) ||
               esNameWords.some(word => word.includes(query)) ||
               notesWords.some(word => word.includes(query));
      })
    : species;

  const clearSearch = () => {
    setSearchQuery('');
  };

  const toggleSpeciesCheck = (speciesName: string) => {
    setCheckedSpecies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(speciesName)) {
        newSet.delete(speciesName);
      } else {
        newSet.add(speciesName);
      }
      return newSet;
    });
  };

  const isSpeciesChecked = (speciesName: string) => checkedSpecies.has(speciesName);

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Fauna i Flora</h2>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Szukaj gatunków... (minimum 3 znaki)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent bg-white shadow-sm"
            />
            {searchQuery.length > 0 && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Wyczyść wyszukiwanie"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {searchQuery.length >= 3 && (
          <div className="mt-2 text-sm text-gray-600">
            Znaleziono: {filteredSpecies.length} {filteredSpecies.length === 1 ? 'gatunek' : 'gatunków'}
          </div>
        )}

        {/* Progress Counter */}
        <div className="my-6 text-center">
          <p className="text-lg text-gray-600">
            🐠 Zaobserwowano {checkedSpecies.size} z {species.length} gatunków
          </p>
        </div>
      </div>

      {/* Species List */}
      <div className="space-y-6">
        {filteredSpecies.map((item, index) => {
          const isChecked = isSpeciesChecked(item.commonName);
          
          return (
            <div key={index} className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 ${
              isChecked 
                ? 'border-2 border-green-600' 
                : 'border border-gray-100'
            }`}>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {item.commonName}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                <span className="italic">{item.scientificName}</span> • 🇵🇱 {item.plName} • 🇪🇸 {item.esName} • {seasonalityMap[item.seasonality] || item.seasonality}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {item.imageSrc ? (
                  <div className="md:col-span-1">
                    <div 
                      className="relative cursor-pointer group"
                      onClick={() => toggleSpeciesCheck(item.commonName)}
                    >
                      <img 
                        src={item.imageSrc} 
                        alt={item.commonName}
                        className="w-full h-48 object-contain rounded-lg transition-all duration-200"
                        loading="lazy"
                      />
                      
                      {/* Overlay for hover and checked states */}
                      <div className={`absolute inset-0 rounded-lg transition-all duration-200 hidden md:block ${
                        isChecked 
                          ? 'bg-red-500 bg-opacity-0 group-hover:bg-opacity-30' 
                          : 'bg-green-500 bg-opacity-0 group-hover:bg-opacity-30'
                      }`}>
                        {/* Hover icon (check for unchecked, X for checked) */}
                        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                          isChecked ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          {isChecked ? (
                            <svg className="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                            </svg>
                          ) : (
                            <svg className="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                            </svg>
                          )}
                        </div>
                        
                        {/* Checked indicator (small check in corner) */}
                        {isChecked && (
                          <div className="absolute top-2 left-2 bg-green-500 rounded-full p-1 shadow-lg">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="md:col-span-1">
                    <div 
                      className="w-full h-48 bg-gradient-to-br from-ocean-100 to-ocean-200 rounded-lg flex items-center justify-center text-ocean-600 cursor-pointer group"
                      onClick={() => toggleSpeciesCheck(item.commonName)}
                    >
                      <div className="text-center">
                        <span className="text-4xl mb-2 block">🐠</span>
                        <span className="text-sm font-medium">Zdjęcie gatunku</span>
                      </div>
                      
                      {/* Overlay for placeholder images */}
                      <div className={`absolute inset-0 rounded-lg transition-all duration-200 hidden md:block ${
                        isChecked 
                          ? 'bg-red-500 bg-opacity-0 group-hover:bg-opacity-30' 
                          : 'bg-green-500 bg-opacity-0 group-hover:bg-opacity-30'
                      }`}>
                        {/* Hover icon */}
                        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 opacity-0 group-hover:opacity-100`}>
                          {isChecked ? (
                            <svg className="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                            </svg>
                          ) : (
                            <svg className="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                            </svg>
                          )}
                        </div>
                        
                        {/* Checked indicator for placeholder */}
                        {isChecked && (
                          <div className="absolute top-2 left-2 bg-green-500 rounded-full p-1 shadow-lg">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className={item.imageSrc ? "md:col-span-2" : "md:col-span-3"}>
                  <p className="text-gray-700 leading-relaxed">
                    {item.notes}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {searchQuery.length >= 3 && filteredSpecies.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-100">
          <div className="text-gray-500 mb-2">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Nie znaleziono gatunków</h3>
          <p className="text-gray-600">
            Spróbuj użyć innych słów kluczowych lub wyczyść wyszukiwanie.
          </p>
        </div>
      )}
    </div>
  );
}