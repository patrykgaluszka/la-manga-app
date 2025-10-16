import { useEffect, useMemo, useState } from 'react';

type ChecklistItem = {
  name: string;
  checked?: boolean;
  isCustom?: boolean;
};

type ChecklistCategory = {
  name: string;
  items: ChecklistItem[];
};

interface ChecklistProps {
  categories: ChecklistCategory[];
  storageKey?: string;
}

type PersistedState = Record<string, ChecklistItem[]>; // categoryName -> full items with checked flags

export default function Checklist({ categories, storageKey = 'checklistState' }: ChecklistProps) {
  const [itemsByCategory, setItemsByCategory] = useState<Map<string, ChecklistItem[]>>(new Map());
  const [newItemByCategory, setNewItemByCategory] = useState<Record<string, string>>({});

  // Defaults from incoming props
  const defaultItems = useMemo(() => {
    const map = new Map<string, ChecklistItem[]>();
    for (const category of categories) {
      map.set(
        category.name,
        category.items.map((i) => ({ name: i.name, checked: !!i.checked, isCustom: false }))
      );
    }
    return map;
  }, [categories]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setItemsByCategory(defaultItems);
        return;
      }
      const parsed: PersistedState = JSON.parse(raw);
      const restored = new Map<string, ChecklistItem[]>();
      for (const category of categories) {
        const saved = parsed[category.name];
        if (Array.isArray(saved)) {
          restored.set(
            category.name,
            saved.map((i) => ({ name: i.name, checked: !!i.checked, isCustom: !!i.isCustom }))
          );
        } else {
          restored.set(category.name, defaultItems.get(category.name) ?? []);
        }
      }
      setItemsByCategory(restored);
    } catch (err) {
      setItemsByCategory(defaultItems);
      // eslint-disable-next-line no-console
      console.error('Error loading checklist from localStorage', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, categories]);

  // Persist to localStorage whenever items change
  useEffect(() => {
    const toPersist: PersistedState = {};
    for (const [categoryName, items] of itemsByCategory.entries()) {
      toPersist[categoryName] = items.map((i) => ({ name: i.name, checked: !!i.checked, isCustom: !!i.isCustom }));
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(toPersist));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error saving checklist to localStorage', err);
    }
  }, [itemsByCategory, storageKey]);

  const toggleItem = (categoryName: string, itemName: string) => {
    setItemsByCategory((prev) => {
      const next = new Map(prev);
      const list = next.get(categoryName) ?? [];
      const updated = list.map((it) =>
        it.name === itemName ? { ...it, checked: !it.checked } : it
      );
      next.set(categoryName, updated);
      return next;
    });
  };

  const addItem = (categoryName: string) => {
    const raw = newItemByCategory[categoryName] ?? '';
    const trimmed = raw.trim();
    if (!trimmed) return;
    setItemsByCategory((prev) => {
      const next = new Map(prev);
      const list = next.get(categoryName) ?? [];
      const exists = list.some((it) => it.name.toLowerCase() === trimmed.toLowerCase());
      if (exists) return prev;
      next.set(categoryName, [...list, { name: trimmed, checked: false, isCustom: true }]);
      return next;
    });
    setNewItemByCategory((prev) => ({ ...prev, [categoryName]: '' }));
  };

  const removeItem = (categoryName: string, itemName: string) => {
    setItemsByCategory((prev) => {
      const next = new Map(prev);
      const list = next.get(categoryName) ?? [];
      const filtered = list.filter((it) => !(it.name === itemName && it.isCustom));
      next.set(categoryName, filtered);
      return next;
    });
  };

  const clearAll = () => {
    setItemsByCategory((prev) => {
      const next = new Map<string, ChecklistItem[]>();
      for (const [cat, list] of prev.entries()) {
        next.set(cat, list.map((i) => ({ ...i, checked: false })));
      }
      return next;
    });
  };

  const resetToPredefined = () => {
    if (window.confirm('Na pewno przywrócić listy do ustawień domyślnych? Spowoduje to usunięcie dodanych pozycji.')) {
      setItemsByCategory(defaultItems);
    }
  };

  const totalItems = useMemo(() => {
    let count = 0;
    for (const list of itemsByCategory.values()) count += list.length;
    return count;
  }, [itemsByCategory]);

  const totalChecked = useMemo(() => {
    let count = 0;
    for (const list of itemsByCategory.values()) {
      count += list.filter((i) => i.checked).length;
    }
    return count;
  }, [itemsByCategory]);

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-800">
          Lista rzeczy do spakowania
        </h2>
        <div className="flex gap-2">
          <button
            onClick={resetToPredefined}
            className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
          >
            Reset
          </button>
          <button
            onClick={clearAll}
            className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm"
          >
            Odznacz wszystko
          </button>
        </div>
      </div>

      <div className="mb-8 text-center">
        <p className="text-lg text-gray-700">
          ✅ Spakowano {totalChecked} z {totalItems} pozycji
        </p>
      </div>

      <div className="space-y-8">
        {categories.map((category) => {
          const items = itemsByCategory.get(category.name) ?? [];
          const checkedInCategory = items.filter((i) => i.checked).length;
          const newValue = newItemByCategory[category.name] ?? '';
          return (
            <section key={category.name} className="bg-white rounded-xl shadow border border-gray-100">
              <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  {category.name}
                </h3>
                <span className="text-sm text-gray-600">
                  {checkedInCategory} / {items.length}
                </span>
              </header>
              <ul className="divide-y divide-gray-100">
                {items.map((item) => {
                  const isChecked = !!item.checked;
                  return (
                    <li key={item.name} className="flex items-start gap-3 px-6 py-4">
                      <button
                        onClick={() => toggleItem(category.name, item.name)}
                        className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'
                        }`}
                        aria-pressed={isChecked}
                        aria-label={item.name}
                      >
                        {isChecked && (
                          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <div 
                        className="flex-1 cursor-pointer select-none"
                        onClick={() => toggleItem(category.name, item.name)}
                        role="button"
                        aria-label={`Przełącz ${item.name}`}
                      >
                        <p className={`text-gray-800 ${isChecked ? 'line-through text-gray-400' : ''}`}>
                          {item.name}
                        </p>
                      </div>
                      {item.isCustom && (
                        <button
                          onClick={() => removeItem(category.name, item.name)}
                          className="ml-2 text-sm text-red-600 hover:text-red-700"
                          aria-label={`Usuń ${item.name}`}
                          title="Usuń pozycję"
                        >
                          Usuń
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewItemByCategory((prev) => ({ ...prev, [category.name]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem(category.name);
                      }
                    }}
                    placeholder="Dodaj nową pozycję..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                  <button
                    onClick={() => addItem(category.name)}
                    className="px-3 py-2 rounded-lg bg-ocean-600 hover:bg-ocean-700 text-white text-sm"
                  >
                    Dodaj
                  </button>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}


