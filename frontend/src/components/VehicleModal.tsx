import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { Vehicle, VehicleFormData } from '../types';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VehicleFormData, id?: string) => Promise<void>;
  editingVehicle?: Vehicle | null;
}

const COMMON_CATEGORIES = ['Sedan', 'SUV', 'Coupe', 'Truck', 'Wagon', 'Electric', 'Hatchback', 'Convertible'];

export const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingVehicle,
}) => {
  const [formData, setFormData] = useState<VehicleFormData>({
    make: '',
    model: '',
    category: 'Sedan',
    price: 35000,
    quantity: 5,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingVehicle) {
      setFormData({
        make: editingVehicle.make,
        model: editingVehicle.model,
        category: editingVehicle.category,
        price: editingVehicle.price,
        quantity: editingVehicle.quantity,
      });
    } else {
      setFormData({
        make: '',
        model: '',
        category: 'Sedan',
        price: 35000,
        quantity: 5,
      });
    }
    setError(null);
  }, [editingVehicle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.make.trim()) {
      setError('Make is required');
      return;
    }
    if (!formData.model.trim()) {
      setError('Model is required');
      return;
    }
    if (formData.price < 0) {
      setError('Price cannot be negative');
      return;
    }
    if (formData.quantity < 0) {
      setError('Quantity cannot be negative');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData, editingVehicle ? editingVehicle.id : undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {editingVehicle ? 'Edit Vehicle Details' : 'Add Vehicle to Inventory'}
            </h2>
            <p className="text-xs text-slate-400">
              {editingVehicle ? `Updating ${editingVehicle.make} ${editingVehicle.model}` : 'Enter complete specifications'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Make *
              </label>
              <input
                type="text"
                placeholder="e.g. BMW, Tesla"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Model *
              </label>
              <input
                type="text"
                placeholder="e.g. M3, Model Y"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {COMMON_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Price (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="35000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Quantity in Stock *
              </label>
              <input
                type="number"
                min="0"
                placeholder="5"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
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
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
