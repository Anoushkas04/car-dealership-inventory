import React from 'react';
import { ShoppingBag, Edit3, Trash2, PlusCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Vehicle } from '../types';
import { useAuth } from '../context/AuthContext';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPurchase: (id: string) => void;
  onEdit: (vehicle: Vehicle) => void;
  onRestock: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  isPurchasing: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onPurchase,
  onEdit,
  onRestock,
  onDelete,
  isPurchasing,
}) => {
  const { user, isAdmin } = useAuth();
  const isOutOfStock = vehicle.quantity <= 0;
  const isLowStock = vehicle.quantity > 0 && vehicle.quantity <= 2;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(vehicle.price);

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 p-5 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5">
      <div>
        {/* Top Header: Category badge & Stock status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-slate-800 text-slate-300 border border-slate-700/60">
            {vehicle.category}
          </span>

          {/* Stock status indicator */}
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <AlertCircle className="w-3 h-3" />
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Low Stock: {vehicle.quantity} left
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              {vehicle.quantity} in stock
            </span>
          )}
        </div>

        {/* Vehicle Identity */}
        <div className="mt-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">{vehicle.make}</p>
          <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-blue-200 transition-colors">
            {vehicle.model}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
            ID: {vehicle.id.slice(0, 8)}...
          </p>
        </div>

        {/* Price & Quantity Summary */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-baseline justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">MSRP</span>
            <p className="text-2xl font-extrabold text-white tracking-tight">{formattedPrice}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Available</span>
            <p className={`text-base font-bold ${isOutOfStock ? 'text-rose-400' : 'text-slate-200'}`}>
              {vehicle.quantity} {vehicle.quantity === 1 ? 'unit' : 'units'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-2">
        {/* Purchase button (Disabled if quantity is 0) */}
        <button
          onClick={() => onPurchase(vehicle.id)}
          disabled={isOutOfStock || isPurchasing}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all shadow-md ${
            isOutOfStock
              ? 'bg-slate-800/80 text-slate-500 border border-slate-700/50 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 active:scale-[0.98]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          {isOutOfStock ? 'Out of Stock' : isPurchasing ? 'Processing...' : 'Purchase Vehicle'}
        </button>

        {/* Admin controls */}
        {isAdmin && (
          <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/80">
            <button
              onClick={() => onEdit(vehicle)}
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              title="Edit vehicle details"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-400" />
              Edit
            </button>
            <button
              onClick={() => onRestock(vehicle)}
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              title="Restock vehicle inventory"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              Restock
            </button>
            <button
              onClick={() => onDelete(vehicle)}
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-rose-950/40 text-xs font-medium text-slate-300 hover:text-rose-400 transition-colors"
              title="Delete vehicle"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
