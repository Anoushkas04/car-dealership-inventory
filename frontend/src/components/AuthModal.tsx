import React, { useState } from 'react';
import { X, LogIn, UserPlus, Shield, User, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, quickDemoLogin } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Please provide username and password');
      return;
    }

    try {
      setIsSubmitting(true);
      if (tab === 'login') {
        await login(username, password);
      } else {
        await register(username, password, role);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemo = async (roleType: 'admin' | 'customer') => {
    setError(null);
    try {
      setIsSubmitting(true);
      await quickDemoLogin(roleType);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
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

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-xl transition-all ${
              tab === 'login'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-xl transition-all ${
              tab === 'register'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Register
          </button>
        </div>

        {/* Quick 1-Click Demo Login Banner */}
        <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900 border border-blue-500/30">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-300 mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Instant 1-Click Evaluation:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('admin')}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-300 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              Demo Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemo('customer')}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/40 text-xs font-bold text-blue-300 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              Demo Customer
            </button>
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
              Username
            </label>
            <input
              type="text"
              placeholder="e.g. janesmith"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {tab === 'register' && (
              <p className="text-[11px] text-slate-400 mt-1">Must be at least 6 characters</p>
            )}
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    role === 'user'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    role === 'admin'
                      ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting
              ? 'Authenticating...'
              : tab === 'login'
              ? 'Sign In to Account'
              : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
