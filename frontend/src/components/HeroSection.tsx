import React from 'react';
import { Package, DollarSign, AlertTriangle, Layers } from 'lucide-react';
import { Vehicle } from '../types';

interface HeroSectionProps {
  vehicles: Vehicle[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ vehicles }) => {
  const totalVehicles = vehicles.length;
  const totalUnits = vehicles.reduce((sum, v) => sum + v.quantity, 0);
  const totalValue = vehicles.reduce((sum, v) => sum + v.price * v.quantity, 0);
  const outOfStockCount = vehicles.filter((v) => v.quantity === 0).length;
  const categoriesCount = new Set(vehicles.map((v) => v.category)).size;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold uppercase tracking-wider mb-3">
              Precision Automotive Fleet
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Dealership Inventory System
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
              Explore our premium fleet of vehicles. Real-time live inventory tracking, instant purchase transactions, and admin restocking capabilities.
            </p>
          </div>
        </div>

        {/* Inventory Analytics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Units</span>
              <Package className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{totalUnits}</p>
            <p className="text-xs text-slate-400 mt-1">Across {totalVehicles} vehicle models</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Inventory Value</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {formatCurrency(totalValue)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Active fleet valuation</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Categories</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{categoriesCount}</p>
            <p className="text-xs text-slate-400 mt-1">Distinct vehicle segments</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Out of Stock</span>
              <AlertTriangle className={`w-4 h-4 ${outOfStockCount > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
            </div>
            <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${outOfStockCount > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
              {outOfStockCount}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {outOfStockCount > 0 ? 'Restock required' : 'Full availability'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
