import React, { useState } from 'react';
import {
  Search,
  Filter,
  Leaf,
  Wind,
  Truck,
  Clock,
  MapPin,
  FileText,
  Trash2,
  CheckCircle2,
  X,
  MessageSquare
} from 'lucide-react';
import { calculateMatchScore } from '../services/matchingEngine';
import { getFullListingMetrics } from '../services/impactCalculator';

export default function MarketplaceList({
  currentUser,
  listings,
  onMatchCreated,
  onOpenChatWithMatch,
  onDeleteListing
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxDistanceKm, setMaxDistanceKm] = useState(200);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [recurringOnly, setRecurringOnly] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);
  const [selectedSpecListing, setSelectedSpecListing] = useState(null);

  const categories = [
    { value: 'All', label: 'All' },
    { value: 'Organic/Food waste', label: 'Organic' },
    { value: 'Industrial/Manufacturing waste', label: 'Industrial' },
    { value: 'Finished compost/fertilizer/biochar output', label: 'Compost & Biochar' }
  ];

  const refUser = currentUser || {
    id: null,
    name: 'Guest',
    location: { lat: 37.7749, lng: -122.4194 }
  };

  const filteredListings = listings.filter((item) => {
    if (item.status !== 'active') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${item.title} ${item.description} ${item.ownerName} ${item.subTag} ${item.qualityGrade} ${item.location.city}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (urgentOnly && item.urgencyLevel !== 'Urgent (24h)' && item.urgencyLevel !== 'Immediate') return false;
    if (recurringOnly && !item.isRecurring) return false;
    if (freeOnly && item.priceType !== 'Free') return false;

    const matchAnalysis = calculateMatchScore(item, refUser);
    if (maxDistanceKm < 200 && matchAnalysis.distanceKm > maxDistanceKm) return false;

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-3 h-full flex flex-col gap-3 min-h-0">
      {/* Compact Header & Filter Box */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs shrink-0 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 shrink-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display">
              Feedstock Listings
            </h1>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              {filteredListings.length} active
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:max-w-xl justify-end">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search material, city, or supplier..."
                className="w-full h-8 pl-8 pr-7 rounded-lg border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-emerald-500 text-slate-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2 h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs shrink-0">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-600 whitespace-nowrap">
                {maxDistanceKm >= 200 ? 'Any distance' : `${maxDistanceKm} km`}
              </span>
              <input
                type="range"
                min="5"
                max="200"
                step="5"
                value={maxDistanceKm}
                onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                className="w-16 accent-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Category Pills & Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 gap-0.5 overflow-x-auto max-w-full">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`h-7 px-2.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-medium">
              <input
                type="checkbox"
                checked={urgentOnly}
                onChange={(e) => setUrgentOnly(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Urgent (24h)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-medium">
              <input
                type="checkbox"
                checked={recurringOnly}
                onChange={(e) => setRecurringOnly(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Recurring</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-medium">
              <input
                type="checkbox"
                checked={freeOnly}
                onChange={(e) => setFreeOnly(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Free Pickup</span>
            </label>
          </div>
        </div>
      </div>

      {/* Listings Grid — Internal Scroll Only If Needed */}
      {filteredListings.length === 0 ? (
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 max-w-md w-full shadow-xs">
            <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800 font-display">No Matching Feedstocks</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Widen your distance radius or reset the category filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setMaxDistanceKm(200);
                setUrgentOnly(false);
                setRecurringOnly(false);
                setFreeOnly(false);
              }}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-2">
            {filteredListings.map((listing) => {
              const isOwner = Boolean(currentUser && listing.ownerId === currentUser.id);
              const matchAnalysis = calculateMatchScore(listing, refUser);
              const metrics = getFullListingMetrics(listing, refUser.location);
              const isOrganic = listing.category === 'Organic/Food waste';

              return (
                <div
                  key={listing.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors flex flex-col overflow-hidden"
                >
                  {/* Compact Card Image */}
                  <div className="relative h-24 w-full bg-slate-900 overflow-hidden shrink-0">
                    <img
                      src={
                        listing.photos?.[0] ||
                        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80'
                      }
                      alt={listing.title}
                      className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/20" />

                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-900/80 text-white border border-white/15">
                        {listing.category.split('/')[0]}
                      </span>
                      {listing.urgencyLevel === 'Urgent (24h)' && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500 text-slate-950">
                          <Clock className="w-2.5 h-2.5" /> Urgent
                        </span>
                      )}
                    </div>

                    {!isOwner && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold">
                          {matchAnalysis.score}% Match
                        </span>
                      </div>
                    )}

                    <div className="absolute bottom-1.5 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px]">
                      <span className="truncate font-medium text-slate-100">{listing.ownerName}</span>
                      <span className="text-slate-300 shrink-0">{matchAnalysis.distanceKm} km</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-2.5 flex-1 flex flex-col justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-1">
                        {listing.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {listing.location.city} • {listing.qualityGrade}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl px-2.5 py-2 border border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                          <Leaf className="w-3 h-3" /> CO₂e Offset
                        </span>
                        <p className="font-bold text-slate-900 text-xs">
                          {metrics.carbonSavingsKg.toLocaleString()} kg
                        </p>
                      </div>

                      {isOrganic ? (
                        <div>
                          <span className="text-[10px] text-amber-800 font-semibold flex items-center gap-1">
                            <Wind className="w-3 h-3 text-amber-600" /> CH₄ Avoided
                          </span>
                          <p className="font-bold text-slate-900 text-xs">{metrics.methaneAvoidedKg} kg</p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] text-sky-700 font-semibold flex items-center gap-1">
                            <Truck className="w-3 h-3" /> Transport
                          </span>
                          <p className="font-bold text-slate-900 text-xs">${metrics.logisticsCost}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <span className="text-slate-600">
                        <strong className="text-slate-900">{listing.quantity}</strong> {listing.unit}
                      </span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                          listing.priceType === 'Free'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {listing.priceType === 'Free'
                          ? 'Free Pickup'
                          : `$${listing.priceValue}/${listing.unit}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSpecListing(listing)}
                        className="flex-1 h-8 flex items-center justify-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Spec</span>
                      </button>

                      {isOwner ? (
                        <button
                          type="button"
                          onClick={() => onDeleteListing(listing.id)}
                          className="h-8 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors flex items-center justify-center"
                          title="Delete listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            const match = await onMatchCreated(listing);
                            if (match) onOpenChatWithMatch(match);
                          }}
                          className="flex-1 h-8 flex items-center justify-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Match & Chat</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Minimal Professional Spec Sheet Modal */}
      {selectedSpecListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                  {selectedSpecListing.category.split('/')[0]} • {selectedSpecListing.subTag}
                </p>
                <h2 className="text-lg font-bold text-slate-900 font-display mt-0.5">
                  {selectedSpecListing.title}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedSpecListing.ownerName} • {selectedSpecListing.location.city}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSpecListing(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Volume</p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {selectedSpecListing.quantity} {selectedSpecListing.unit}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Grade</p>
                  <p className="font-bold text-slate-900 mt-0.5 truncate">
                    {selectedSpecListing.qualityGrade}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Pricing</p>
                  <p className="font-bold text-emerald-700 mt-0.5">
                    {selectedSpecListing.priceType === 'Free'
                      ? 'Free Pickup'
                      : `$${selectedSpecListing.priceValue}/${selectedSpecListing.unit}`}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Description</p>
                <p className="text-slate-700 leading-relaxed">{selectedSpecListing.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Pickup Window</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {selectedSpecListing.availabilityWindow}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Schedule</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {selectedSpecListing.isRecurring
                      ? selectedSpecListing.recurrenceSchedule
                      : 'One-time lot'}
                  </p>
                </div>
              </div>

              {selectedSpecListing.contaminationFlags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedSpecListing.contaminationFlags.map((flag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-medium"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {flag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedSpecListing(null)}
                className="h-9 px-3.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Close
              </button>

              {(!currentUser || selectedSpecListing.ownerId !== currentUser.id) && (
                <button
                  type="button"
                  onClick={async () => {
                    const match = await onMatchCreated(selectedSpecListing);
                    setSelectedSpecListing(null);
                    if (match) onOpenChatWithMatch(match);
                  }}
                  className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                >
                  Match & Negotiate
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
