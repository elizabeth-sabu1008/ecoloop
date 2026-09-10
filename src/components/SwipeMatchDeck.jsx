import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Heart, 
  X, 
  Sparkles, 
  Flame, 
  Leaf, 
  Truck, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  RotateCcw, 
  Info, 
  Calendar, 
  DollarSign, 
  Check, 
  AlertTriangle,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { calculateMatchScore } from '../services/matchingEngine';
import { getFullListingMetrics } from '../services/impactCalculator';

export default function SwipeMatchDeck({ 
  currentUser, 
  listings, 
  onMatchCreated, 
  onOpenChatWithMatch,
  onOpenQuickRestaurantModal,
  onOpenIndustrialModal
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null); // 'left' | 'right'
  const [showCelebrationModal, setShowCelebrationModal] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);

  // Filter out current user's own listings from the swipe deck
  const eligibleListings = listings.filter(l => l.ownerId !== currentUser.id && l.status === 'active');

  const currentListing = eligibleListings[currentIndex];

  useEffect(() => {
    // Reset index when user changes or listing count changes
    setCurrentIndex(0);
  }, [currentUser.id]);

  const handleSwipe = (direction) => {
    if (!currentListing) return;

    setSwipeDirection(direction);

    setTimeout(() => {
      if (direction === 'right') {
        // Trigger circular confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#059669', '#f59e0b', '#3b82f6']
        });

        // Create match
        const newMatch = onMatchCreated(currentListing, currentUser);
        setShowCelebrationModal({
          listing: currentListing,
          match: newMatch
        });
      }

      setSwipeDirection(null);
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    }, 350);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
  };

  if (!currentListing) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-xl relative overflow-hidden">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50/50">
            <Sparkles className="w-10 h-10 text-emerald-600 animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-display mb-2">You've Reviewed All Feedstocks!</h2>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            You have browsed every current active material listing matching <span className="font-semibold text-emerald-700">{currentUser.companyName}</span>'s location radius.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleRestart}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/20 transition-all text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Review Deck Again
            </button>

            <button
              onClick={onOpenQuickRestaurantModal}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-all text-sm"
            >
              + Post New Surplus Feedstock
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate dynamic match scores for current user
  const matchAnalysis = calculateMatchScore(currentListing, currentUser);
  const metrics = getFullListingMetrics(currentListing, currentUser.location);
  const isOrganic = currentListing.category === 'Organic/Food waste';

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              Circular Match Deck
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              Card {currentIndex + 1} of {eligibleListings.length}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Swipe Right (or click Heart) to match & open logistics negotiation.
          </p>
        </div>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          {isFlipped ? 'Show Overview' : 'View Full Spec'}
        </button>
      </div>

      {/* Swipeable Card Deck */}
      <div className="relative h-[620px] w-full select-none">
        
        {/* Next Card Background Illusion */}
        {eligibleListings[currentIndex + 1] && (
          <div className="absolute inset-0 top-3 scale-[0.96] opacity-60 bg-white rounded-3xl shadow-md border border-slate-200 pointer-events-none transition-all" />
        )}

        {/* Current Active Card */}
        <div 
          className={`absolute inset-0 bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden flex flex-col transition-all duration-300 ${
            swipeDirection === 'left' ? 'card-swipe-left' : ''
          } ${
            swipeDirection === 'right' ? 'card-swipe-right' : ''
          }`}
        >
          
          {!isFlipped ? (
            /* Card Front: Visual Feedstock Overview */
            <>
              {/* Photo & Top Badges */}
              <div className="relative h-64 w-full bg-slate-900 overflow-hidden">
                <img 
                  src={currentListing.photos?.[0] || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80'} 
                  alt={currentListing.title}
                  className="w-full h-full object-cover opacity-90 transition-transform hover:scale-105 duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                {/* Match Score Badge (Top Right) */}
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1.5 bg-emerald-600/95 backdrop-blur-md text-white px-3.5 py-1.5 rounded-2xl shadow-lg border border-emerald-400/40 animate-pulse-slow">
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span className="font-extrabold text-sm">{matchAnalysis.score}%</span>
                    <span className="text-[11px] font-medium text-emerald-100">Match</span>
                  </div>
                </div>

                {/* Category & Urgency Badge (Top Left) */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-white/20">
                    {currentListing.category}
                  </span>
                  
                  {currentListing.urgencyLevel === 'Urgent (24h)' && (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/95 text-slate-950 shadow-md animate-bounce">
                      <Clock className="w-3.5 h-3.5" />
                      Urgent Pickup (24h)
                    </span>
                  )}
                </div>

                {/* Bottom Overlay Info on Photo */}
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <img 
                      src={currentListing.ownerAvatar} 
                      alt={currentListing.ownerName}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-white/60" 
                    />
                    <span className="text-xs font-medium text-slate-200 flex items-center gap-1">
                      {currentListing.ownerName}
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug line-clamp-2">
                    {currentListing.title}
                  </h3>
                </div>
              </div>

              {/* Card Body: Climate & Logistics Breakdown */}
              <div className="p-4 flex-1 flex flex-col justify-between overflow-y-auto">
                
                {/* 3 Headline Metric Cards */}
                <div className="grid grid-cols-3 gap-2 my-1">
                  
                  {/* Carbon Savings Card */}
                  <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-2.5 text-center">
                    <div className="flex items-center justify-center gap-1 text-emerald-700 text-xs font-semibold mb-0.5">
                      <Leaf className="w-3.5 h-3.5" />
                      CO₂e Offset
                    </div>
                    <p className="text-base font-extrabold text-emerald-900">
                      {metrics.carbonSavingsKg.toLocaleString()} <span className="text-xs font-medium">kg</span>
                    </p>
                    <p className="text-[10px] text-emerald-700 font-medium">vs Virgin Input</p>
                  </div>

                  {/* Methane Avoided (Organics) OR Logistics Proximity */}
                  {isOrganic ? (
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100/90 border border-amber-300 rounded-2xl p-2.5 text-center relative overflow-hidden ring-1 ring-amber-400/40">
                      <div className="flex items-center justify-center gap-1 text-amber-900 text-xs font-bold mb-0.5">
                        <Flame className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                        CH₄ Avoided
                      </div>
                      <p className="text-base font-extrabold text-amber-950">
                        {metrics.methaneAvoidedKg} <span className="text-xs font-medium">kg</span>
                      </p>
                      <p className="text-[10px] text-amber-800 font-bold uppercase tracking-tight">Landfill Methane</p>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-700 text-xs font-semibold mb-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                        Purity Grade
                      </div>
                      <p className="text-base font-extrabold text-slate-900 truncate">
                        {currentListing.purityPercentage}%
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">Lab Spec Verified</p>
                    </div>
                  )}

                  {/* Logistics Cost Estimate */}
                  <div className="bg-sky-50/90 border border-sky-200/80 rounded-2xl p-2.5 text-center">
                    <div className="flex items-center justify-center gap-1 text-sky-700 text-xs font-semibold mb-0.5">
                      <Truck className="w-3.5 h-3.5" />
                      Logistics Est.
                    </div>
                    <p className="text-base font-extrabold text-sky-900">
                      ${metrics.logisticsCost}
                    </p>
                    <p className="text-[10px] text-sky-700 font-medium">{matchAnalysis.distanceKm} km transit</p>
                  </div>

                </div>

                {/* Key Spec Row */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 text-xs space-y-1.5 my-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location:
                    </span>
                    <span className="font-semibold text-slate-800">{currentListing.location.city} ({matchAnalysis.distanceKm} km)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Quantity & Price:
                    </span>
                    <span className="font-bold text-emerald-800">
                      {currentListing.quantity} {currentListing.unit} • {currentListing.priceType === 'Free' ? 'Free Pickup' : `$${currentListing.priceValue}/${currentListing.unit}`}
                    </span>
                  </div>

                  {currentListing.isRecurring && (
                    <div className="flex items-center justify-between text-purple-700">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Recurrence:
                      </span>
                      <span className="font-semibold">{currentListing.recurrenceSchedule}</span>
                    </div>
                  )}
                </div>

                {/* Contamination Flags & Compliance Tags */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Compliance & Quality Stamps</p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentListing.contaminationFlags?.map((flag, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        {flag}
                      </span>
                    ))}
                    {matchAnalysis.badges.map((b, idx) => (
                      <span 
                        key={`b-${idx}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </>
          ) : (
            /* Card Back: Technical Spec Sheet & Full Description */
            <div className="p-6 flex-1 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Feedstock Spec Sheet
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{currentListing.title}</h3>
                  </div>
                  <button 
                    onClick={() => setIsFlipped(false)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold"
                  >
                    Close Spec
                  </button>
                </div>

                <div className="space-y-3 text-xs text-slate-700">
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-1">Description & Material Origin</h4>
                    <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed text-slate-600">
                      {currentListing.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Material Sub-Tag</p>
                      <p className="font-semibold text-slate-900">{currentListing.subTag}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Quality Standard</p>
                      <p className="font-semibold text-slate-900">{currentListing.qualityGrade}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
                    <h4 className="font-bold text-emerald-950 uppercase text-[11px] mb-1 flex items-center gap-1">
                      <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                      EPA WARM Climate Audit Trail
                    </h4>
                    <p className="text-emerald-800 text-[11px] leading-tight">
                      Diverting this {currentListing.quantity} {currentListing.unit} batch replaces virgin material extraction and saves an estimated <strong>{metrics.carbonSavingsKg} kg CO₂e</strong> (equivalent to taking a standard car off the road for <strong>{metrics.milesDrivenEquivalent} miles</strong>).
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Pickup & Loading Dock Window</p>
                    <p className="font-semibold text-slate-800">{currentListing.availabilityWindow}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsFlipped(false)}
                className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors"
              >
                Back to Match Overview
              </button>
            </div>
          )}

          {/* Action Control Buttons (Dating-App Style) */}
          <div className="p-3 bg-white/95 border-t border-slate-100 flex items-center justify-around gap-4 z-10">
            
            {/* Pass / Dislike */}
            <button
              onClick={() => handleSwipe('left')}
              title="Pass / Next Feedstock"
              className="w-14 h-14 rounded-full bg-slate-50 hover:bg-rose-50 border-2 border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95"
            >
              <X className="w-7 h-7" />
            </button>

            {/* Inspect Spec Toggle */}
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              title="Inspect Spec Sheet"
              className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <Info className="w-5 h-5" />
            </button>

            {/* Match / Like */}
            <button
              onClick={() => handleSwipe('right')}
              title="Match / Partner with this Surplus Generator"
              className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 border-2 border-emerald-300/60 transition-all hover:scale-110 active:scale-95 animate-glow"
            >
              <Heart className="w-8 h-8 fill-white" />
            </button>

          </div>

        </div>

      </div>

      {/* Swipe Right Celebration Modal */}
      {showCelebrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl border border-emerald-200 relative animate-in zoom-in-95 duration-200">
            
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50 shadow-inner">
              <Sparkles className="w-10 h-10 animate-spin-slow" />
            </div>

            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Circular Economy Match!
            </span>

            <h2 className="text-2xl font-bold text-slate-900 font-display mt-3 mb-1">
              It's a Feedstock Match!
            </h2>

            <p className="text-sm text-slate-600 mb-6">
              You matched <span className="font-semibold text-emerald-800">{showCelebrationModal.listing.ownerName}</span> with <span className="font-semibold text-slate-900">{currentUser.companyName}</span>.
            </p>

            {/* Mini Match Summary */}
            <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 text-xs text-left mb-6 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-emerald-800 font-semibold">Feedstock:</span>
                <span className="font-bold text-slate-900">{showCelebrationModal.listing.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-800 font-semibold">CO₂e Offset:</span>
                <span className="font-bold text-emerald-700">{metrics.carbonSavingsKg} kg CO₂e</span>
              </div>
              {showCelebrationModal.listing.category === 'Organic/Food waste' && (
                <div className="flex justify-between items-center text-amber-900">
                  <span className="font-semibold">Methane Avoided:</span>
                  <span className="font-bold text-amber-800">{metrics.methaneAvoidedKg} kg CH₄</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-emerald-800 font-semibold">Est. Logistics:</span>
                <span className="font-bold text-slate-900">${metrics.logisticsCost}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  const matchToOpen = showCelebrationModal.match;
                  setShowCelebrationModal(null);
                  if (matchToOpen) {
                    onOpenChatWithMatch(matchToOpen);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/30 text-sm transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                Open In-App Negotiation Chat
              </button>

              <button
                onClick={() => setShowCelebrationModal(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Keep Swiping Feedstocks
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
