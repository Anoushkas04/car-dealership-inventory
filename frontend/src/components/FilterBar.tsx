import React from 'react';
import { Search, Filter, RotateCcw, Plus } from 'lucide-react';
import { SearchFilterState } from '../types';
import { useAuth } from '../context/AuthContext';

interface FilterBarProps {
  filters: SearchFilterState;
  onFilterChange: (newFilters: Partial<SearchFilterState>) => void;
  onResetFilters: () => void;
  availableMakes: string[];
  totalResults: number;
  onOpenAddModal: () => void;
}

const CATEGORIES = ['All', 'Sedan', 'SUV', 'Coupe', 'Truck', 'Wagon', 'Electric', 'Hatchback'];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableMakes,
  totalResults,
  onOpenAddModal,
}) => {
  const { isAdmin } = useAuth();

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.category) ||
    Boolean(filters.make) ||
    Boolean(filters.minPrice) ||
    Boolean(filters.maxPrice);

  return (
    <div className="bg-slate-900/40 border-b border-slate-800/80 p-4 sm:p-6 backdrop-blur-md">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Top row: Search input, Make filter, Price inputs, Add button */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by make, model, or category..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {/* Make dropdown */}
            <select
              value={filters.make}
              onChange={(e) => onFilterChange({ make: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="">All Makes</option>
              {availableMakes.map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </select>

            {/* Min Price */}
            <div className="relative w-32">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">$</span>
              <input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => onFilterChange({ minPrice: e.target.value })}
                className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Max Price */}
            <div className="relative w-32">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">$</span>
              <input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
                className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}

            {/* Admin Add Vehicle CTA */}
            {isAdmin && (
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Add Vehicle
              </button>
            )}
          </div>
        </div>

        {/* Bottom row: Category pills and live result count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Category pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Category:
            </span>
            {CATEGORIES.map((cat) => {
              const isSelected =
                (cat === 'All' && !filters.category) || filters.category.toLowerCase() === cat.toLowerCase();

              return (
                <button
                  key={cat}
                  onClick={() => onFilterChange({ category: cat === 'All' ? '' : cat })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Results count */}
          <div className="text-xs text-slate-400 font-medium">
            Showing <span className="font-bold text-slate-200">{totalResults}</span> vehicle{totalResults === 1 ? '' : 's'}
          </div>
        </div>
      </div>
    </div>
  );
};
