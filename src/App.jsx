import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import SwipeMatchDeck from './components/SwipeMatchDeck';
import MarketplaceList from './components/MarketplaceList';
import MatchChatDrawer from './components/MatchChatDrawer';
import SustainabilityDashboard from './components/SustainabilityDashboard';
import CircularFlowMap from './components/CircularFlowMap';
import QuickRestaurantListingModal from './components/QuickRestaurantListingModal';
import DetailedIndustrialListingModal from './components/DetailedIndustrialListingModal';
import ReviewModal from './components/ReviewModal';
import AuthModal from './components/AuthModal';
import { api } from './services/api';

export default function App() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [skippedIds, setSkippedIds] = useState([]);
  const [matches, setMatches] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorBanner, setErrorBanner] = useState('');

  const [activeTab, setActiveTab] = useState('swipe'); // 'swipe' | 'explore' | 'matches' | 'dashboard' | 'map'
  const [activeMatchId, setActiveMatchId] = useState(null);

  // Modals state
  const [isQuickRestaurantOpen, setIsQuickRestaurantOpen] = useState(false);
  const [isIndustrialOpen, setIsIndustrialOpen] = useState(false);
  const [reviewMatchTarget, setReviewMatchTarget] = useState(null);
  const [authModalState, setAuthModalState] = useState({ open: false, message: '', onComplete: null });

  const refreshAll = useCallback(async () => {
    try {
      const [meRes, usersRes, listingsRes, matchesRes, reviewsRes, analyticsRes, routesRes] =
        await Promise.all([
          api.getMe(),
          api.getUsers(),
          api.getListings(),
          api.getMatches(),
          api.getReviews(),
          api.getAnalytics(),
          api.getRoutes()
        ]);

      setCurrentUser(meRes.user);
      setUsers(usersRes.users || []);
      setListings(listingsRes.listings || []);
      setSkippedIds(listingsRes.skippedIds || []);
      setMatches(matchesRes.matches || []);
      setReviews(reviewsRes.reviews || []);
      setAnalytics(analyticsRes.analytics || null);
      setRoutes(routesRes.routes || []);
      setErrorBanner('');

      if ((matchesRes.matches || []).length > 0) {
        setActiveMatchId((prev) => prev || matchesRes.matches[0].id);
      }
    } catch (err) {
      setErrorBanner(err.message || 'Unable to reach backend database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) {
        await refreshAll();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshAll]);

  // Poll active matches every 4s when viewing Matches tab for real multi-user chat updates
  useEffect(() => {
    if (activeTab !== 'matches' || !currentUser) return undefined;
    const timer = setInterval(async () => {
      try {
        const res = await api.getMatches();
        setMatches(res.matches || []);
      } catch {
        // Silent background poll
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [activeTab, currentUser]);

  const requireAuth = (message, onProceed = null) => {
    if (currentUser) {
      if (onProceed) onProceed();
      return true;
    }
    setAuthModalState({ open: true, message, onComplete: onProceed });
    return false;
  };

  const handleAuthSuccess = async (user) => {
    const callback = authModalState.onComplete;
    setCurrentUser(user);
    await refreshAll();
    if (callback) callback();
  };

  const handleSelectUser = async (userId) => {
    try {
      const { user } = await api.demoLogin(userId);
      setCurrentUser(user);
      setActiveMatchId(null);
      await refreshAll();
    } catch (err) {
      setErrorBanner(err.message);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setMatches([]);
    setSkippedIds([]);
    setActiveMatchId(null);
    await refreshAll();
  };

  const handleCreateListing = async (listingData) => {
    if (!currentUser) return;
    await api.createListing(listingData);
    await refreshAll();
  };

  const handleDeleteListing = async (listingId) => {
    await api.deleteListing(listingId);
    await refreshAll();
  };

  const handleSkipListing = async (listingId) => {
    setSkippedIds((prev) => (prev.includes(listingId) ? prev : [...prev, listingId]));
    if (currentUser) {
      await api.skipListing(listingId);
    }
  };

  const handleResetSkips = async () => {
    setSkippedIds([]);
    if (currentUser) {
      await api.resetSkips();
    }
  };

  const handleMatchCreated = async (listing) => {
    if (!requireAuth('Sign in or create a business account to match with suppliers.')) {
      return null;
    }
    const { match } = await api.createMatch(listing.id);
    await refreshAll();
    return match;
  };

  const handleOpenChatWithMatch = (match) => {
    if (!match) return;
    setActiveMatchId(match.id);
    setActiveTab('matches');
  };

  const handleSendMessage = async (matchId, text) => {
    await api.sendMessage(matchId, text);
    const res = await api.getMatches();
    setMatches(res.matches || []);
  };

  const handleUpdateStatus = async (matchId, newStatus, pickupSchedule = null) => {
    await api.updateMatch(matchId, { status: newStatus, pickupSchedule });
    await refreshAll();
  };

  const handleSubmitReview = async (reviewData) => {
    await api.createReview(reviewData);
    await refreshAll();
  };

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-[#f8faf7]">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-[#f8faf7] text-slate-900 font-sans">
      <Navbar
        currentUser={currentUser}
        allUsers={users}
        onSelectUser={handleSelectUser}
        onOpenAuth={() => setAuthModalState({ open: true, message: '' })}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickRestaurantModal={() =>
          requireAuth('Sign in or create an account to post food waste.', () =>
            setIsQuickRestaurantOpen(true)
          )
        }
        onOpenIndustrialModal={() =>
          requireAuth('Sign in or create an account to post an industrial spec.', () =>
            setIsIndustrialOpen(true)
          )
        }
        matches={matches}
      />

      {errorBanner && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-1.5 text-xs text-rose-700 text-center shrink-0">
          {errorBanner}
        </div>
      )}

      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {activeTab === 'swipe' && (
          <SwipeMatchDeck
            key={currentUser?.id || 'guest'}
            currentUser={currentUser}
            listings={listings}
            skippedIds={skippedIds}
            onSkipListing={handleSkipListing}
            onResetSkips={handleResetSkips}
            onMatchCreated={handleMatchCreated}
            onOpenChatWithMatch={handleOpenChatWithMatch}
            onOpenQuickRestaurantModal={() =>
              requireAuth('Sign in or create an account to post feedstock.', () =>
                setIsQuickRestaurantOpen(true)
              )
            }
          />
        )}

        {activeTab === 'explore' && (
          <MarketplaceList
            currentUser={currentUser}
            listings={listings}
            onMatchCreated={handleMatchCreated}
            onOpenChatWithMatch={handleOpenChatWithMatch}
            onDeleteListing={handleDeleteListing}
          />
        )}

        {activeTab === 'matches' && (
          <MatchChatDrawer
            currentUser={currentUser}
            matches={matches}
            activeMatchId={activeMatchId}
            onSelectMatch={(id) => setActiveMatchId(id)}
            onSendMessage={handleSendMessage}
            onUpdateStatus={handleUpdateStatus}
            onOpenReviewModal={(m) => setReviewMatchTarget(m)}
            onOpenAuth={() => setAuthModalState({ open: true, message: 'Sign in to view and message your matches.' })}
          />
        )}

        {activeTab === 'dashboard' && (
          <SustainabilityDashboard
            currentUser={currentUser}
            listings={listings}
            reviews={reviews}
            analytics={analytics}
          />
        )}

        {activeTab === 'map' && <CircularFlowMap routes={routes} />}
      </main>

      <QuickRestaurantListingModal
        currentUser={currentUser || { companyName: 'Your Business', location: { city: 'San Francisco, CA', lat: 37.7749, lng: -122.4194 } }}
        isOpen={isQuickRestaurantOpen}
        onClose={() => setIsQuickRestaurantOpen(false)}
        onListingCreated={handleCreateListing}
      />

      <DetailedIndustrialListingModal
        currentUser={currentUser || { companyName: 'Your Business', location: { city: 'Oakland, CA', lat: 37.7725, lng: -122.2144 } }}
        isOpen={isIndustrialOpen}
        onClose={() => setIsIndustrialOpen(false)}
        onListingCreated={handleCreateListing}
      />

      <ReviewModal
        currentUser={currentUser}
        match={reviewMatchTarget}
        isOpen={!!reviewMatchTarget}
        onClose={() => setReviewMatchTarget(null)}
        onSubmitReview={handleSubmitReview}
      />

      <AuthModal
        isOpen={authModalState.open}
        onClose={() => setAuthModalState({ open: false, message: '', onComplete: null })}
        onAuthSuccess={handleAuthSuccess}
        demoUsers={users}
        promptMessage={authModalState.message}
      />
    </div>
  );
}
