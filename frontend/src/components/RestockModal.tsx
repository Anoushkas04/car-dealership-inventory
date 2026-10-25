import React, { useState } from 'react';
import { X, PlusCircle, AlertCircle } from 'lucide-react';
import { Vehicle } from '../types';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestock: (id: string, quantity: number) => Promise<void>;
  vehicle: Vehicle | null;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  onClose,
  onRestock,
  vehicle,
}) => {
  const [quantity, setQuantity] = useState<number>(5);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !vehicle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      setError('Please enter a valid positive integer');
      return;
    }

    try {
      setIsSubmitting(true);
      await onRestock(vehicle.id, quantity);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Restock failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Restock Inventory</h2>
            <p className="text-xs text-slate-400">
              {vehicle.make} {vehicle.model} (Current: {vehicle.quantity})
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Quantity to Add
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-2">
            {[1, 3, 5, 10].map((num) => (
              <button
                type="button"
                key={num}
                onClick={() => setQuantity(num)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  quantity === num
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                +{num}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? 'Restocking...' : `Restock (+${quantity})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
