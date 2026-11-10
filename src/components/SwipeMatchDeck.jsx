import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Check,
  Layers,
  Leaf,
  Wind,
  Truck,
  Clock,
  MapPin,
  ShieldCheck,
  RotateCcw,
  FileText,
  Calendar,
  DollarSign,
  Package,
  MessageSquare,
  Sparkles,
  ListFilter
} from 'lucide-react';
import { calculateMatchScore } from '../services/matchingEngine';
import { getFullListingMetrics } from '../services/impactCalculator';

export default function SwipeMatchDeck({
  currentUser,
  listings,
  skippedIds = [],
  onSkipListing,
  onResetSkips,
  onMatchCreated,
  onOpenChatWithMatch,
  onOpenQuickRestaurantModal
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [transitionDir, setTransitionDir] = useState(null); // 'left' | 'right'
  const [showMatchModal, setShowMatchModal] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'spec'

  const eligibleListings = listings.filter(
    (l) =>
      (!currentUser || l.ownerId !== currentUser.id) &&
      l.status === 'active' &&
      !skippedIds.includes(l.id)
  );

  const currentListing =
    eligibleListings.find((l) => l.id === selectedId) || eligibleListings[0];

  const refUser = currentUser || {
    name: 'Guest',
    companyName: 'Visitor',
    location: { lat: 37.7749, lng: -122.4194 }
  };

  // Summary metrics for the top strip
  const urgentCount = eligibleListings.filter((l) => l.urgencyLevel === 'Urgent (24h)').length;
  const totalPotentialCo2 = eligibleListings.reduce(
    (sum, l) => sum + (l.metrics?.carbonSavingsKg || 0),
    0
  );
  const scoredQueue = eligibleListings.map((l) => ({
    listing: l,
    analysis: calculateMatchScore(l, refUser),
    metrics: getFullListingMetrics(l, refUser.location)
  }));
  const avgMatchScore =
    scoredQueue.length > 0
      ? Math.round(scoredQueue.reduce((s, x) => s + x.analysis.score, 0) / scoredQueue.length)
      : 0;

  const handleSkip = () => {
    if (!currentListing) return;
    setTransitionDir('left');
    const targetId = currentListing.id;
    setTimeout(() => {
      onSkipListing(targetId);
      setSelectedId(null);
      setTransitionDir(null);
      setViewMode('overview');
    }, 200);
  };

  const handleMatch = async () => {
    if (!currentListing) return;
    setTransitionDir('right');
    const targetListing = currentListing;

    setTimeout(async () => {
      try {
        const newMatch = await onMatchCreated(targetListing);
        setTransitionDir(null);
        setSelectedId(null);
        setViewMode('overview');
        if (newMatch) {
          confetti({
            particleCount: 65,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#10b981', '#059669', '#0ea5e9']
          });
          setShowMatchModal({
            listing: targetListing,
            match: newMatch
          });
        }
      } catch {
        setTransitionDir(null);
      }
    }, 200);
  };

  if (!currentListing) {
    return (
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 h-full flex items-center justify-center">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm max-w-md w-full text-center">
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 border border-emerald-200">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 font-display mb-1">
            All Active Listings Reviewed
          </h2>
          <p className="text-xs text-slate-600 mb-4">
            You have reviewed all available material streams{currentUser ? ` for ${currentUser.companyName}` : ''}.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              type="button"
              onClick={onResetSkips}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Review Queue Again</span>
            </button>

            <button
              type="button"
              onClick={onOpenQuickRestaurantModal}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
            >
              <span>+ Post Feedstock</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const matchAnalysis = calculateMatchScore(currentListing, refUser);
  const metrics = getFullListingMetrics(currentListing, refUser.location);
  const isOrganic = currentListing.category === 'Organic/Food waste';

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-3 h-full flex flex-col gap-3 min-h-0">
      {/* Top Live Queue Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Available Streams</p>
            <p className="text-base font-bold text-slate-900 font-display">{eligibleListings.length}</p>
          </div>
          <Layers className="w-4 h-4 text-emerald-600" />
        </div>

        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Urgent Pickups (24h)</p>
            <p className="text-base font-bold text-slate-900 font-display">{urgentCount}</p>
          </div>
          <Clock className="w-4 h-4 text-amber-600" />
        </div>

        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Queue CO₂e Potential</p>
            <p className="text-base font-bold text-slate-900 font-display">
              {(totalPotentialCo2 / 1000).toFixed(1)} MT
            </p>
          </div>
          <Leaf className="w-4 h-4 text-emerald-600" />
        </div>

        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Avg Compatibility</p>
            <p className="text-base font-bold text-emerald-700 font-display">{avgMatchScore}%</p>
          </div>
          <Sparkles className="w-4 h-4 text-emerald-600" />
        </div>
      </div>

      {/* Main 12-Col Workspace */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left 8 Cols: Active Feedstock Match Card */}
        <div
          className={`lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0 transition-all duration-200 ${
            transitionDir === 'left' ? 'card-swipe-left' : ''
          } ${transitionDir === 'right' ? 'card-swipe-right' : ''}`}
        >
          {/* Left Media Column */}
          <div className="md:col-span-5 relative min-h-[190px] bg-slate-900 overflow-hidden">
            <img
              src={
                currentListing.photos?.[0] ||
                'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80'
              }
              alt={currentListing.title}
              className="absolute inset-0 w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-black/20" />

            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-900/80 text-white border border-white/15">
                {currentListing.category.split('/')[0]}
              </span>
              {currentListing.urgencyLevel === 'Urgent (24h)' && (
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500 text-slate-950">
                  <Clock className="w-3 h-3" />
                  Urgent 24h
                </span>
              )}
            </div>

            <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
              <div className="flex items-center gap-2">
                <img
                  src={currentListing.ownerAvatar}
                  alt={currentListing.ownerName}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/50 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white flex items-center gap-1 truncate">
                    {currentListing.ownerName}
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </p>
                  <p className="text-[11px] text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {currentListing.location.city} • {matchAnalysis.distanceKm} km away
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Details Column */}
          <div className="md:col-span-7 p-4 flex flex-col justify-between min-h-0 overflow-y-auto">
            <div className="space-y-3">
              {/* Header + Mode Switch */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
                      {currentListing.subTag}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold shrink-0">
                      {matchAnalysis.score}% Match
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display leading-snug mt-0.5">
                    {currentListing.title}
                  </h2>
                </div>

                <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode('overview')}
                    className={`h-7 px-2.5 rounded-md text-[11px] font-medium transition-colors ${
                      viewMode === 'overview'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('spec')}
                    className={`h-7 px-2.5 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
                      viewMode === 'spec'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span>Spec</span>
                  </button>
                </div>
              </div>

              {viewMode === 'overview' ? (
                <>
                  {/* 3 Uniform Metric Tiles */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                      <div className="flex items-center gap-1 text-emerald-700 text-[11px] font-semibold">
                        <Leaf className="w-3 h-3 shrink-0" />
                        <span>CO₂e Offset</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">
                        {metrics.carbonSavingsKg.toLocaleString()} kg
                      </p>
                    </div>

                    {isOrganic ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                        <div className="flex items-center gap-1 text-amber-700 text-[11px] font-semibold">
                          <Wind className="w-3 h-3 shrink-0" />
                          <span>CH₄ Avoided</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                          {metrics.methaneAvoidedKg} kg
                        </p>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                        <div className="flex items-center gap-1 text-slate-600 text-[11px] font-semibold">
                          <ShieldCheck className="w-3 h-3 shrink-0" />
                          <span>Purity</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                          {currentListing.purityPercentage}%
                        </p>
                      </div>
                    )}

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                      <div className="flex items-center gap-1 text-sky-700 text-[11px] font-semibold">
                        <Truck className="w-3 h-3 shrink-0" />
                        <span>Logistics</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">
                        ${metrics.logisticsCost}
                      </p>
                    </div>
                  </div>

                  {/* Business & Supply Details */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Volume:</span>
                      <strong className="text-slate-900 ml-auto">
                        {currentListing.quantity} {currentListing.unit}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Price:</span>
                      <strong className="text-emerald-700 ml-auto">
                        {currentListing.priceType === 'Free'
                          ? 'Free Pickup'
                          : `$${currentListing.priceValue}/${currentListing.unit}`}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Schedule:</span>
                      <strong className="text-slate-900 ml-auto truncate">
                        {currentListing.isRecurring ? currentListing.recurrenceSchedule : 'One-time lot'}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Grade:</span>
                      <strong className="text-slate-900 ml-auto truncate">
                        {currentListing.qualityGrade}
                      </strong>
                    </div>
                  </div>

                  {/* Material Overview, Match Reasons & Climate Equivalence */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 text-xs">
                    <p className="text-slate-700 leading-relaxed">
                      {currentListing.description}
                    </p>
                    {matchAnalysis.reasons?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/70">
                        {matchAnalysis.reasons.map((reason, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[11px] font-medium bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md"
                          >
                            <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                      <span>Pickup Window: <strong className="text-slate-800">{currentListing.availabilityWindow}</strong></span>
                      <span>Offset Equiv: <strong className="text-emerald-700">{metrics.treeSeedlingsEquivalent} trees • {metrics.milesDrivenEquivalent.toLocaleString()} car mi</strong></span>
                    </div>
                  </div>

                  {/* Compliance Tags */}
                  {currentListing.contaminationFlags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {currentListing.contaminationFlags.map((flag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          {flag}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Description & Origin
                    </p>
                    <p className="text-slate-700 leading-relaxed">{currentListing.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Quality Standard</p>
                      <p className="font-semibold text-slate-900 mt-0.5">{currentListing.qualityGrade}</p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Pickup Window</p>
                      <p className="font-semibold text-slate-900 mt-0.5">{currentListing.availabilityWindow}</p>
                    </div>
                  </div>

                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                    <span className="font-semibold">EPA WARM Climate Impact</span>
                    <span className="font-bold">
                      {metrics.carbonSavingsKg.toLocaleString()} kg CO₂e ({metrics.milesDrivenEquivalent.toLocaleString()} car mi)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={handleSkip}
                className="h-9 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
                <span>Skip</span>
              </button>

              <button
                type="button"
                onClick={handleMatch}
                className="h-9 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Match & Connect</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Feedstock Queue Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col min-h-0">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Match Queue ({eligibleListings.length})
              </h3>
            </div>
            {skippedIds.length > 0 && (
              <button
                type="button"
                onClick={onResetSkips}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restore ({skippedIds.length})</span>
              </button>
            )}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100">
            {scoredQueue.map(({ listing, analysis }) => {
              const isActive = listing.id === currentListing.id;
              return (
                <button
                  key={listing.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(listing.id);
                    setViewMode('overview');
                  }}
                  className={`w-full p-3 text-left transition-colors flex items-start gap-2.5 ${
                    isActive
                      ? 'bg-emerald-50/80 border-l-4 border-emerald-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={listing.photos?.[0]}
                    alt=""
                    className="w-11 h-11 rounded-lg object-cover shrink-0 bg-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <p className="text-xs font-bold text-slate-900 truncate">{listing.title}</p>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                        {analysis.score}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate mt-0.5">{listing.ownerName}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>
                        {listing.quantity} {listing.unit} • {listing.priceType === 'Free' ? 'Free' : `$${listing.priceValue}/${listing.unit}`}
                      </span>
                      <span>{analysis.distanceKm} km</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Match Confirmation Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-display">
                    Feedstock Match Created
                  </h2>
                  <p className="text-xs text-slate-500">
                    Connected {showMatchModal.listing.ownerName} with {refUser.companyName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMatchModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Material:</span>
                <span className="font-semibold text-slate-900">{showMatchModal.listing.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated CO₂e Offset:</span>
                <span className="font-semibold text-emerald-700">{metrics.carbonSavingsKg} kg CO₂e</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Logistics:</span>
                <span className="font-semibold text-slate-900">${metrics.logisticsCost}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowMatchModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Continue Reviewing
              </button>
              <button
                type="button"
                onClick={() => {
                  const matchToOpen = showMatchModal.match;
                  setShowMatchModal(null);
                  if (matchToOpen) onOpenChatWithMatch(matchToOpen);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
