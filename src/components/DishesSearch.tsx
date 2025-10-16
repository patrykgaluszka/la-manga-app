import { useState, useEffect } from 'react';

interface Dish {
  title: string;
  desc: string;
  imageSrc?: string;
}

interface DishesSearchProps {
  dishes: Dish[];
}

export default function DishesSearch({ dishes }: DishesSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedDishes, setCheckedDishes] = useState<Set<string>>(new Set());

  // Load checked dishes from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('checkedDishes');
    if (saved) {
      try {
        const parsedChecked = JSON.parse(saved);
        setCheckedDishes(new Set(parsedChecked));
      } catch (error) {
        console.error('Error loading checked dishes from localStorage:', error);
      }
    }
  }, []);

  // Save checked dishes to localStorage whenever the set changes
  useEffect(() => {
    localStorage.setItem('checkedDishes', JSON.stringify(Array.from(checkedDishes)));
  }, [checkedDishes]);

  const filteredDishes = searchQuery.length >= 3 
    ? dishes.filter(dish => {
        const query = searchQuery.toLowerCase();
        const titleWords = dish.title.toLowerCase().split(' ');
        const descWords = dish.desc.toLowerCase().split(' ');
        
        return titleWords.some(word => word.includes(query)) || 
               descWords.some(word => word.includes(query));
      })
    : dishes;

  const clearSearch = () => {
    setSearchQuery('');
  };

  const toggleDishCheck = (dishTitle: string) => {
    setCheckedDishes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dishTitle)) {
        newSet.delete(dishTitle);
      } else {
        newSet.add(dishTitle);
      }
      return newSet;
    });
  };

  const isDishChecked = (dishTitle: string) => checkedDishes.has(dishTitle);

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dania</h2>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Szukaj dań... (minimum 3 znaki)"
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
            Znaleziono: {filteredDishes.length} {filteredDishes.length === 1 ? 'danie' : 'dań'}
          </div>
        )}

        {/* Progress Counter */}
        <div className="my-6 text-center">
          <p className="text-lg text-gray-600">
            🍽️ Spróbowano {checkedDishes.size} z {dishes.length} dań
          </p>
        </div>
      </div>

      {/* Dishes List */}
      <div className="space-y-6">
        {filteredDishes.map((dish, index) => {
          const isChecked = isDishChecked(dish.title);
          
          return (
            <div key={index} className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 ${
              isChecked 
                ? 'border-2 border-green-600' 
                : 'border border-gray-100'
            }`}>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {dish.title}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {dish.imageSrc ? (
                  <div className="md:col-span-1">
                    <div 
                      className="relative cursor-pointer group"
                      onClick={() => toggleDishCheck(dish.title)}
                    >
                      <img 
                        src={dish.imageSrc} 
                        alt={dish.title}
                        className="w-full h-48 object-cover rounded-lg transition-all duration-200"
                        loading="lazy"
                      />
                      
                      {/* Overlay for hover and checked states */}
                      <div className={`absolute inset-0 rounded-lg transition-all duration-200 hidden md:block ${
                        isChecked 
                          ? 'bg-red-500 bg-opacity-0 group-hover:bg-opacity-30' 
                          : 'bg-green-500 bg-opacity-0 group-hover:bg-opacity-30'
                      }`}>
                        {/* Hover icon (check for unchecked, X for checked) */}
                        <div className={`absolute inset-0 flex items-center justify-center md:transition-opacity md:duration-200 ${
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
                ) : null}
                
                <div className={dish.imageSrc ? "md:col-span-2" : "md:col-span-3"}>
                  <p className="text-gray-700 leading-relaxed">
                    {dish.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {searchQuery.length >= 3 && filteredDishes.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-100">
          <div className="text-gray-500 mb-2">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Nie znaleziono dań</h3>
          <p className="text-gray-600">
            Spróbuj użyć innych słów kluczowych lub wyczyść wyszukiwanie.
          </p>
        </div>
      )}
    </div>
  );
}