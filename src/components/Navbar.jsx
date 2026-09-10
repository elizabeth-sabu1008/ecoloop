import React from 'react';
import { 
  Recycle, 
  Flame, 
  Leaf, 
  TrendingUp, 
  PlusCircle, 
  UtensilsCrossed, 
  Factory, 
  MessageSquare, 
  Layers, 
  Compass, 
  BarChart3, 
  CheckCircle2, 
  ChevronDown,
  RotateCcw,
  Sparkles,
  MapPin
} from 'lucide-react';

export default function Navbar({ 
  currentUser, 
  allUsers, 
  onSelectUser, 
  activeTab, 
  setActiveTab, 
  onOpenQuickRestaurantModal, 
  onOpenIndustrialModal,
  matches,
  onResetData
}) {
  const pendingMatchesCount = matches.filter(m => 
    (m.buyerId === currentUser.id || m.sellerId === currentUser.id) && m.status !== 'Completed'
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-sm transition-all">
      {/* Top Impact Banner / Live Ticker */}
      <div className="bg-gradient-to-r from-emerald-900 via-forest-900 to-emerald-950 text-white text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-0.5">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            EcoLoop Circular Network:
          </span>
          <span className="flex items-center gap-1 text-slate-200">
            <Recycle className="w-3.5 h-3.5 text-emerald-400" />
            <strong className="text-white">924.5 Tons</strong> Waste Diverted
          </span>
          <span className="hidden sm:inline-block text-emerald-700">•</span>
          <span className="flex items-center gap-1 text-slate-200">
            <Leaf className="w-3.5 h-3.5 text-emerald-300" />
            <strong className="text-white">1,840 MT</strong> CO₂e Offset
          </span>
          <span className="hidden sm:inline-block text-emerald-700">•</span>
          <span className="flex items-center gap-1 text-amber-200 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-600/30">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <strong className="text-amber-300">312.8 kg CH₄</strong> Methane Avoided
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs ml-auto">
          <button 
            onClick={onResetData}
            title="Reset demo data to initial realistic seed state"
            className="flex items-center gap-1 text-emerald-300/80 hover:text-white transition-colors text-[11px]"
          >
            <RotateCcw className="w-3 h-3" /> Reset Demo
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('swipe')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400/30">
              <Recycle className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-display">
                  Eco<span className="text-emerald-600">Loop</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Marketplace
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Matchmaking Circular Economy</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('swipe')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'swipe'
                  ? 'bg-white text-emerald-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Flame className={`w-4 h-4 ${activeTab === 'swipe' ? 'text-amber-500' : 'text-slate-400'}`} />
              Waste Match Deck
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">Dating App</span>
            </button>

            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'explore'
                  ? 'bg-white text-emerald-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore Listings
            </button>

            <button
              onClick={() => setActiveTab('matches')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'matches'
                  ? 'bg-white text-emerald-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Matches & Chats
              {pendingMatchesCount > 0 && (
                <span className="w-5 h-5 bg-emerald-600 text-white rounded-full text-[11px] font-bold flex items-center justify-center animate-pulse">
                  {pendingMatchesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-emerald-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Sustainability Impact
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'map'
                  ? 'bg-white text-emerald-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Circular Routes
            </button>
          </nav>

          {/* Right Section: Quick Add & Persona Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Listing Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={onOpenQuickRestaurantModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-all shadow-sm"
                title="30-second mobile-friendly restaurant food waste listing"
              >
                <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600" />
                <span>+ Food Waste</span>
              </button>

              <button
                onClick={onOpenIndustrialModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-all shadow-sm"
                title="Detailed industrial spec listing with purity grade"
              >
                <Factory className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Industrial Spec</span>
              </button>
            </div>

            {/* Persona Switcher Dropdown */}
            <div className="relative group">
              <div className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 shadow-sm cursor-pointer transition-all">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-emerald-400/40"
                />
                <div className="text-left hidden sm:block max-w-[140px]">
                  <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-emerald-600 truncate font-medium">{currentUser.companyName}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:rotate-180" />
              </div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-2 hidden group-hover:block z-50 animate-in fade-in-50 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Switch Demo Persona</p>
                  <p className="text-xs text-slate-600">Experience matching as a seller or buyer:</p>
                </div>
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => onSelectUser(u.id)}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors ${
                        u.id === currentUser.id 
                          ? 'bg-emerald-50 text-emerald-950 font-semibold border border-emerald-200' 
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-md object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold truncate">{u.name}</p>
                          <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                            u.role === 'seller' ? 'bg-amber-100 text-amber-800' :
                            u.role === 'buyer' ? 'bg-sky-100 text-sky-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {u.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{u.companyName}</p>
                      </div>
                      {u.id === currentUser.id && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('swipe')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
              activeTab === 'swipe' ? 'text-emerald-700 font-bold' : 'text-slate-500'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            Match Deck
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
              activeTab === 'explore' ? 'text-emerald-700 font-bold' : 'text-slate-500'
            }`}
          >
            <Compass className="w-4 h-4" />
            Explore
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium relative ${
              activeTab === 'matches' ? 'text-emerald-700 font-bold' : 'text-slate-500'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Matches
            {pendingMatchesCount > 0 && (
              <span className="absolute -top-1 right-2 w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {pendingMatchesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
              activeTab === 'dashboard' ? 'text-emerald-700 font-bold' : 'text-slate-500'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Impact
          </button>
          <button
            onClick={onOpenQuickRestaurantModal}
            className="flex flex-col items-center gap-1 text-[11px] font-bold text-emerald-700"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            Post Waste
          </button>
        </div>

      </div>
    </header>
  );
}
