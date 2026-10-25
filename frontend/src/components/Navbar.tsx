import React from 'react';
import { Car, Shield, User, LogOut, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenAuth: (defaultTab?: 'login' | 'register') => void;
  onOpenAddVehicle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenAddVehicle }) => {
  const { user, isAdmin, logout, quickDemoLogin } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                APEX MOTORS
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Inventory
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Automotive Inventory Management</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <button
                  onClick={onOpenAddVehicle}
                  className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4" />
                  Add Vehicle
                </button>
              )}

              {/* User Badge */}
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  isAdmin ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>
                <div className="text-left text-xs">
                  <p className="font-semibold text-slate-200 leading-tight">{user.username}</p>
                  <p className={`text-[10px] font-medium uppercase tracking-wider ${isAdmin ? 'text-amber-400' : 'text-blue-400'}`}>
                    {isAdmin ? 'Admin' : 'Customer'}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Log out"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Demo Credentials */}
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
                <span className="px-2 text-[11px] font-medium text-slate-400">Quick Demo:</span>
                <button
                  onClick={() => quickDemoLogin('admin')}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30 transition-colors"
                >
                  ⚡ Admin
                </button>
                <button
                  onClick={() => quickDemoLogin('customer')}
                  className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30 transition-colors"
                >
                  ⚡ Customer
                </button>
              </div>

              <button
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-white px-3.5 py-2 rounded-xl hover:bg-slate-900 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
