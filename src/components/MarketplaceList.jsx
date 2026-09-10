import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Flame, 
  Leaf, 
  Truck, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  DollarSign, 
  Check, 
  Sparkles, 
  X, 
  Info, 
  ArrowUpRight,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { calculateMatchScore } from '../services/matchingEngine';
import { getFullListingMetrics } from '../services/impactCalculator';

export default function MarketplaceList({ 
  currentUser, 
  listings, 
  onMatchCreated, 
  onOpenChatWithMatch,
  onDeleteListing,
  onOpenQuickRestaurantModal,
  onOpenIndustrialModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxDistanceKm, setMaxDistanceKm] = useState(60);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [recurringOnly, setRecurringOnly] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);
  const [selectedSpecListing, setSelectedSpecListing] = useState(null);

  const categories = [
    'All',
    'Organic/Food waste',
    'Industrial/Manufacturing waste',
    'Finished compost/fertilizer/biochar output'
  ];

  // Filter listings
  const filteredListings = listings.filter(item => {
    if (item.status !== 'active') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${item.title} ${item.description} ${item.ownerName} ${item.subTag} ${item.qualityGrade} ${item.location.city}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    // Category
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;

    // Urgent filter
    if (urgentOnly && item.urgencyLevel !== 'Urgent (24h)' && item.urgencyLevel !== 'Immediate') return false;

    // Recurring filter
    if (recurringOnly && !item.isRecurring) return false;

    // Free filter
    if (freeOnly && item.priceType !== 'Free') return false;

    // Distance filter
    const matchAnalysis = calculateMatchScore(item, currentUser);
    if (matchAnalysis.distanceKm > maxDistanceKm) return false;

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header & Controls */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
              Circular Feedstock Marketplace
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Browse industrial byproducts, restaurant food streams, and finished compost outputs scored for <span className="font-semibold text-emerald-800">{currentUser.companyName}</span>.
            </p>
          </div>

          {/* Quick Post Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenQuickRestaurantModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>+ Quick Food Waste (30s)</span>
            </button>
            <button
              onClick={onOpenIndustrialModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <span>+ Industrial Feedstock</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Category Filter Pills */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by material (e.g. coffee grounds, 6061 aluminum, biochar, HDPE, prep scraps)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Distance Slider */}
            <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-xs">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-600 whitespace-nowrap">Radius: <strong>{maxDistanceKm} km</strong></span>
              <input 
                type="range" 
                min="5" 
                max="120" 
                value={maxDistanceKm} 
                onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                className="w-24 accent-emerald-600" 
              />
            </div>
          </div>

          {/* Category Tabs & Quick Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            
            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat === 'All' ? 'All Materials' : cat.split('/')[0]}
                </button>
              ))}
            </div>

            {/* Quick Checkbox Filters */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                <input 
                  type="checkbox" 
                  checked={urgentOnly} 
                  onChange={(e) => setUrgentOnly(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="flex items-center gap-1 text-amber-700">
                  <Clock className="w-3 h-3 text-amber-500" /> Urgent (24h)
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                <input 
                  type="checkbox" 
                  checked={recurringOnly} 
                  onChange={(e) => setRecurringOnly(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="flex items-center gap-1 text-purple-700">
                  <Calendar className="w-3 h-3 text-purple-500" /> Recurring
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                <input 
                  type="checkbox" 
                  checked={freeOnly} 
                  onChange={(e) => setFreeOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-emerald-800">Free / Zero Cost</span>
              </label>
            </div>

          </div>

        </div>
      </div>

      {/* Grid of Listings */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto shadow-sm">
          <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 font-display">No Feedstocks Match These Filters</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Try widening your distance radius or clearing specific category/urgency toggles.</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
              setMaxDistanceKm(100);
              setUrgentOnly(false);
              setRecurringOnly(false);
              setFreeOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 font-semibold text-xs hover:bg-emerald-100 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => {
            const isOwner = listing.ownerId === currentUser.id;
            const matchAnalysis = calculateMatchScore(listing, currentUser);
            const metrics = getFullListingMetrics(listing, currentUser.location);
            const isOrganic = listing.category === 'Organic/Food waste';

            return (
              <div 
                key={listing.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col overflow-hidden group"
              >
                {/* Photo & Overlay Badges */}
                <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                  <img 
                    src={listing.photos?.[0] || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80'} 
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                  {/* Top Left Category / Urgency */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-white border border-white/20">
                      {listing.category.split('/')[0]}
                    </span>
                    {listing.urgencyLevel === 'Urgent (24h)' && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow-sm animate-pulse">
                        <Clock className="w-3 h-3" /> Urgent 24h
                      </span>
                    )}
                  </div>

                  {/* Top Right Match Score Badge */}
                  {!isOwner && (
                    <div className="absolute top-3 right-3">
                      <div className="flex items-center gap-1 bg-emerald-600/95 backdrop-blur-md text-white px-2.5 py-1 rounded-xl shadow-md border border-emerald-400/40 text-xs font-extrabold">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                        <span>{matchAnalysis.score}% Match</span>
                      </div>
                    </div>
                  )}

                  {/* Bottom Image Overlay Owner */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <img src={listing.ownerAvatar} alt="" className="w-5 h-5 rounded-full object-cover ring-1 ring-white/60" />
                      <span className="truncate font-medium text-slate-200">{listing.ownerName}</span>
                    </div>
                    <span className="text-[11px] text-slate-300 shrink-0 font-medium">
                      {listing.location.city} • {matchAnalysis.distanceKm} km
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-emerald-700 transition-colors">
                      {listing.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {listing.description}
                    </p>
                  </div>

                  {/* Climate Impact Ticker Box */}
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Leaf className="w-3 h-3" /> CO₂e Offset:
                      </span>
                      <p className="font-extrabold text-slate-900">{metrics.carbonSavingsKg.toLocaleString()} kg</p>
                    </div>

                    {isOrganic ? (
                      <div>
                        <span className="text-[10px] text-amber-800 font-bold flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-600" /> Methane Avoided:
                        </span>
                        <p className="font-extrabold text-amber-950">{metrics.methaneAvoidedKg} kg CH₄</p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[10px] text-sky-700 font-semibold flex items-center gap-1">
                          <Truck className="w-3 h-3" /> Est. Transport:
                        </span>
                        <p className="font-extrabold text-slate-900">${metrics.logisticsCost}</p>
                      </div>
                    )}
                  </div>

                  {/* Quantity & Pricing */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 font-medium">Volume: </span>
                      <strong className="text-slate-800">{listing.quantity} {listing.unit}</strong>
                    </div>
                    <div>
                      <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                        listing.priceType === 'Free' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {listing.priceType === 'Free' ? 'Free Pickup' : `$${listing.priceValue}/${listing.unit}`}
                      </span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedSpecListing(listing)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Full Spec</span>
                    </button>

                    {isOwner ? (
                      <button
                        onClick={() => onDeleteListing(listing.id)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                        title="Delete this listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const match = onMatchCreated(listing, currentUser);
                          onOpenChatWithMatch(match);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Match & Chat</span>
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Technical Spec Sheet Modal */}
      {selectedSpecListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  {selectedSpecListing.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display mt-2">
                  {selectedSpecListing.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Listed by {selectedSpecListing.ownerName} • {selectedSpecListing.location.city}
                </p>
              </div>
              <button
                onClick={() => setSelectedSpecListing(null)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Spec Details */}
            <div className="space-y-4 text-xs text-slate-700">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Volume / Batch Size</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">{selectedSpecListing.quantity} {selectedSpecListing.unit}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Purity Standard</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">{selectedSpecListing.qualityGrade}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Pricing Terms</p>
                  <p className="text-sm font-extrabold text-emerald-800 mt-0.5">
                    {selectedSpecListing.priceType === 'Free' ? 'Free / Divert' : `$${selectedSpecListing.priceValue}/${selectedSpecListing.unit}`}
                  </p>
                </div>
              </div>

              {/* Full Description */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Material Origin & Description</h4>
                <p className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed text-slate-600">
                  {selectedSpecListing.description}
                </p>
              </div>

              {/* Compliance & Contamination Flags */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-2">Purity & Contamination Checklist</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSpecListing.contaminationFlags?.map((flag, idx) => (
                    <span key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {flag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recurrence & Logistics */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                <h4 className="font-bold text-emerald-400 uppercase text-[11px] flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-400" /> Logistics & Collection Window
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Pickup Timing:</span> {selectedSpecListing.availabilityWindow}
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Recurrence:</span> {selectedSpecListing.isRecurring ? selectedSpecListing.recurrenceSchedule : 'One-time lot'}
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedSpecListing(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Close
              </button>

              {selectedSpecListing.ownerId !== currentUser.id && (
                <button
                  onClick={() => {
                    const match = onMatchCreated(selectedSpecListing, currentUser);
                    setSelectedSpecListing(null);
                    onOpenChatWithMatch(match);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
                >
                  Create Match & Start Negotiation
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
