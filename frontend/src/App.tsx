import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FilterBar } from './components/FilterBar';
import { VehicleCard } from './components/VehicleCard';
import { VehicleModal } from './components/VehicleModal';
import { RestockModal } from './components/RestockModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { AuthModal } from './components/AuthModal';
import { Toast, ToastMessage } from './components/Toast';
import { Vehicle, VehicleFormData, SearchFilterState } from './types';
import { api } from './services/api';
import { useAuth } from './context/AuthContext';
import { Car, RefreshCw, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const { user, token } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<SearchFilterState>({
    search: '',
    category: '',
    make: '',
    minPrice: '',
    maxPrice: '',
  });

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockTargetVehicle, setRestockTargetVehicle] = useState<Vehicle | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetVehicle, setDeleteTargetVehicle] = useState<Vehicle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Action states
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load vehicles from backend
  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // If we don't have a token, we can still load through search or handle prompt
      const res = await api.getAllVehicles();
      setVehicles(res.data);
    } catch (err: any) {
      // If unauthorized, user may not be signed in yet
      if (err.message?.includes('token') || err.message?.includes('401')) {
        // If not logged in yet, try logging in with demo guest or show banner
        setError('Please sign in or use 1-Click Demo in the header to view and interact with inventory.');
      } else {
        setError(err.message || 'Failed to load vehicles');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Extract unique makes for filter dropdown
  const availableMakes = useMemo(() => {
    const set = new Set(vehicles.map((v) => v.make));
    return Array.from(set).sort();
  }, [vehicles]);

  // Client-side instant filtering + server-side search capability
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // Category filter
      if (filters.category && v.category.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }
      // Make filter
      if (filters.make && v.make.toLowerCase() !== filters.make.toLowerCase()) {
        return false;
      }
      // Price filters
      if (filters.minPrice && v.price < Number(filters.minPrice)) {
        return false;
      }
      if (filters.maxPrice && v.price > Number(filters.maxPrice)) {
        return false;
      }
      // Search term (across make, model, category)
      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        const match =
          v.make.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query) ||
          v.category.toLowerCase().includes(query);
        if (!match) return false;
      }
      return true;
    });
  }, [vehicles, filters]);

  const handleFilterChange = (newFilters: Partial<SearchFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      make: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  // Purchase vehicle action
  const handlePurchase = async (vehicleId: string) => {
    if (!user) {
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      addToast('info', 'Please sign in or use quick demo to purchase a vehicle');
      return;
    }

    try {
      setPurchasingId(vehicleId);
      const res = await api.purchaseVehicle(vehicleId);
      // Update local state with the returned updated vehicle
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicleId ? res.data : v))
      );
      addToast('success', `Success! Purchased ${res.data.make} ${res.data.model}. Remaining stock: ${res.data.quantity}`);
    } catch (err: any) {
      addToast('error', err.message || 'Purchase failed');
    } finally {
      setPurchasingId(null);
    }
  };

  // Admin: Save or Update vehicle
  const handleSaveVehicle = async (data: VehicleFormData, id?: string) => {
    if (id) {
      // Update
      const res = await api.updateVehicle(id, data);
      setVehicles((prev) => prev.map((v) => (v.id === id ? res.data : v)));
      addToast('success', `Updated ${res.data.make} ${res.data.model} successfully`);
    } else {
      // Create
      const res = await api.createVehicle(data);
      setVehicles((prev) => [res.data, ...prev]);
      addToast('success', `Added ${res.data.make} ${res.data.model} to inventory`);
    }
  };

  // Admin: Restock vehicle
  const handleRestock = async (id: string, quantity: number) => {
    const res = await api.restockVehicle(id, quantity);
    setVehicles((prev) => prev.map((v) => (v.id === id ? res.data : v)));
    addToast('success', `Restocked ${res.data.make} ${res.data.model} (+${quantity} units)`);
  };

  // Admin: Delete vehicle
  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await api.deleteVehicle(id);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      addToast('success', 'Vehicle removed from dealership catalog');
      setIsDeleteModalOpen(false);
      setDeleteTargetVehicle(null);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to delete vehicle');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Navigation */}
      <Navbar
        onOpenAuth={(tab) => {
          setAuthModalTab(tab || 'login');
          setIsAuthModalOpen(true);
        }}
        onOpenAddVehicle={() => {
          setEditingVehicle(null);
          setIsVehicleModalOpen(true);
        }}
      />

      {/* Hero with Fleet Analytics */}
      <HeroSection vehicles={vehicles} />

      {/* Search & Filter Controls */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        availableMakes={availableMakes}
        totalResults={filteredVehicles.length}
        onOpenAddModal={() => {
          setEditingVehicle(null);
          setIsVehicleModalOpen(true);
        }}
      />

      {/* Main Content: Vehicle Catalog */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-3" />
            <p className="text-sm font-medium">Loading dealership inventory...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Access Required</h3>
            <p className="text-sm text-slate-400 mb-6">{error}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setAuthModalTab('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all"
              >
                Sign In
              </button>
            </div>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-20 px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Car className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No vehicles matched your search</h3>
            <p className="text-xs text-slate-400 mb-6">
              Try adjusting your search terms, changing the category, or clearing the price filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onPurchase={handlePurchase}
                onEdit={(v) => {
                  setEditingVehicle(v);
                  setIsVehicleModalOpen(true);
                }}
                onRestock={(v) => {
                  setRestockTargetVehicle(v);
                  setIsRestockModalOpen(true);
                }}
                onDelete={(v) => {
                  setDeleteTargetVehicle(v);
                  setIsDeleteModalOpen(true);
                }}
                isPurchasing={purchasingId === vehicle.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Car className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-slate-300">Apex Motors Dealership</span> — TDD Inventory Kata
          </div>
          <p>© 2026 Apex Motors Inventory System. Developed with Node.js, Express, React, and Tailwind.</p>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />

      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => {
          setIsVehicleModalOpen(false);
          setEditingVehicle(null);
        }}
        onSubmit={handleSaveVehicle}
        editingVehicle={editingVehicle}
      />

      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => {
          setIsRestockModalOpen(false);
          setRestockTargetVehicle(null);
        }}
        onRestock={handleRestock}
        vehicle={restockTargetVehicle}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetVehicle(null);
        }}
        onConfirm={handleDelete}
        vehicle={deleteTargetVehicle}
        isDeleting={isDeleting}
      />
    </div>
  );
};
