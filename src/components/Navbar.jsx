import React, { useState, useRef, useEffect } from 'react';
import {
  Recycle,
  PlusCircle,
  UtensilsCrossed,
  Factory,
  MessageSquare,
  Layers,
  LayoutGrid,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  LogIn,
  LogOut,
  MapPin
} from 'lucide-react';

export default function Navbar({
  currentUser,
  allUsers,
  onSelectUser,
  onOpenAuth,
  onLogout,
  activeTab,
  setActiveTab,
  onOpenQuickRestaurantModal,
  onOpenIndustrialModal,
  matches
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const pendingMatchesCount = currentUser
    ? matches.filter(
        (m) => (m.buyerId === currentUser.id || m.sellerId === currentUser.id) && m.status !== 'Completed'
      ).length
    : 0;

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const navItems = [
    { id: 'swipe', label: 'Waste Match Deck', mobileLabel: 'Match Deck', icon: Layers },
    { id: 'explore', label: 'Listings', mobileLabel: 'Listings', icon: LayoutGrid },
    { id: 'matches', label: 'Matches', mobileLabel: 'Matches', icon: MessageSquare, badge: pendingMatchesCount },
    { id: 'dashboard', label: 'Impact', mobileLabel: 'Impact', icon: BarChart3 },
    { id: 'map', label: 'Routes', mobileLabel: 'Routes', icon: MapPin }
  ];

  return (
    <header className="shrink-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-13 gap-3">
          {/* Logo */}
          <button
            type="button"
            onClick={() => setActiveTab('swipe')}
            className="flex items-center gap-2 shrink-0 text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Recycle className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 font-display whitespace-nowrap">
              Eco<span className="text-emerald-600">Loop</span>
            </span>
          </button>

          {/* Unified Navigation Box — Single Aligned Row */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-0.5 lg:gap-1 shrink-0"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`h-8 px-2.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                    isActive
                      ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-semibold leading-none">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions & Account */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="hidden lg:flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenQuickRestaurantModal}
                className="h-8 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors"
              >
                <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>+ Food Waste</span>
              </button>

              <button
                type="button"
                onClick={onOpenIndustrialModal}
                className="h-8 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors"
              >
                <Factory className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span>+ Industrial Spec</span>
              </button>
            </div>

            {currentUser ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  title={`${currentUser.name} (${currentUser.companyName})`}
                  className="h-8 px-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 flex items-center gap-2 transition-colors"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-5 h-5 rounded-md object-cover shrink-0"
                  />
                  <span className="hidden xl:block text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                    {currentUser.companyName}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                    <div className="px-2.5 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-emerald-700 font-medium truncate">{currentUser.companyName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                    </div>

                    <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Quick Demo Accounts
                    </p>
                    <div className="space-y-1 max-h-52 overflow-y-auto">
                      {allUsers.filter((u) => u.isDemo).map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            onSelectUser(u.id);
                            setMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                            u.id === currentUser.id
                              ? 'bg-emerald-50 text-emerald-950 font-semibold border border-emerald-200'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-md object-cover shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold truncate">{u.companyName}</p>
                            <p className="text-[10px] text-slate-500 truncate">{u.name} • {u.role}</p>
                          </div>
                          {u.id === currentUser.id && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="mt-1.5 pt-1.5 border-t border-slate-100 space-y-1">
                      <div className="grid grid-cols-2 gap-1.5 lg:hidden">
                        <button
                          type="button"
                          onClick={() => {
                            onOpenQuickRestaurantModal();
                            setMenuOpen(false);
                          }}
                          className="py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                        >
                          + Food Waste
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onOpenIndustrialModal();
                            setMenuOpen(false);
                          }}
                          className="py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-slate-900 text-white"
                        >
                          + Industrial
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onOpenAuth();
                          setMenuOpen(false);
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 text-left transition-colors"
                      >
                        Sign in / Create new account...
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onLogout();
                          setMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Box */}
        <div className="flex md:hidden items-center justify-between gap-1 pb-2">
          <div className="flex flex-1 items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex-1 h-8 px-2 rounded-lg text-[11px] font-medium whitespace-nowrap flex items-center justify-center gap-1 transition-colors ${
                    isActive ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.mobileLabel}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={onOpenQuickRestaurantModal}
            className="h-10 px-2.5 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0"
            title="New Listing"
          >
            <PlusCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
