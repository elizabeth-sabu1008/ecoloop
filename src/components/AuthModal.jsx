import React, { useState } from 'react';
import { X, LogIn, UserPlus, Building2 } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  demoUsers = [],
  promptMessage = ''
}) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessType, setBusinessType] = useState('Restaurant & Hospitality');
  const [role, setRole] = useState('both');
  const [city, setCity] = useState('San Francisco, CA');

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await api.login(loginEmail, loginPassword);
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await api.register({
        name,
        companyName,
        email,
        password,
        businessType,
        role,
        city
      });
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoUser = async (userId) => {
    setError('');
    setLoading(true);
    try {
      const { user } = await api.demoLogin(userId);
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to switch account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                {mode === 'login' ? 'Sign In to EcoLoop' : 'Create Business Account'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {promptMessage || 'Access live feedstock matching, messaging, and listings'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 mb-4">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`h-8 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`h-8 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {error && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {demoUsers.filter((u) => u.isDemo).length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Quick Demo Accounts
                </p>
                <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto">
                  {demoUsers.filter((u) => u.isDemo).slice(0, 6).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      disabled={loading}
                      onClick={() => handleDemoUser(u.id)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-colors truncate"
                    >
                      <p className="text-[11px] font-semibold text-slate-900 truncate">{u.companyName}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{u.role}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Bay Organics Co."
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Work Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Password (6+)</label>
                <input
                  type="password"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Business Type</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Restaurant & Hospitality">Restaurant & Hospitality</option>
                  <option value="Industrial Manufacturer">Industrial Manufacturer</option>
                  <option value="Composting & Biogas Facility">Composting / Biogas</option>
                  <option value="Industrial Materials Recycler">Materials Recycler</option>
                  <option value="Organic Farm & Nursery">Farm & Nursery</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="both">Both (Supply & Receive)</option>
                  <option value="seller">Supplier (List Waste)</option>
                  <option value="buyer">Buyer / Recycler</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="San Francisco, CA"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold transition-colors"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

