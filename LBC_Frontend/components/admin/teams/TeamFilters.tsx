import { TeamFiltersProps } from './types';

export function TeamFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  hasPoules,
  poules,
  selectedPoule,
  onPouleChange,
}: TeamFiltersProps) {
  return (
    <>
      {/* Mobile Category Selector */}
      <div className="lg:hidden flex justify-center mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full max-w-md"
        >
          <option value="Toutes les catégories">Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Category Selector */}
      <div className="hidden lg:flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => onCategoryChange('Toutes les catégories')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm ${
            selectedCategory === 'Toutes les catégories'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          Toutes
        </button>
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => onCategoryChange(cat.name)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm ${
              selectedCategory === cat.name
                ? 'bg-orange-500 text-white'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Poule Selector */}
      {hasPoules && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Filtrer par poule :</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onPouleChange('Toutes les poules')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                selectedPoule === 'Toutes les poules' || !selectedPoule
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              Toutes les poules
            </button>
            {poules.map((poule) => (
              <button
                key={poule}
                onClick={() => onPouleChange(poule)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                  selectedPoule === poule
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                Poule {poule}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
