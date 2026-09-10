import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SwipeMatchDeck from './components/SwipeMatchDeck';
import MarketplaceList from './components/MarketplaceList';
import MatchChatDrawer from './components/MatchChatDrawer';
import SustainabilityDashboard from './components/SustainabilityDashboard';
import CircularFlowMap from './components/CircularFlowMap';
import QuickRestaurantListingModal from './components/QuickRestaurantListingModal';
import DetailedIndustrialListingModal from './components/DetailedIndustrialListingModal';
import ReviewModal from './components/ReviewModal';
import { StorageService } from './services/storageService';

export default function App() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('swipe'); // 'swipe' | 'explore' | 'matches' | 'dashboard' | 'map'
  const [activeMatchId, setActiveMatchId] = useState(null);

  // Modals state
  const [isQuickRestaurantOpen, setIsQuickRestaurantOpen] = useState(false);
  const [isIndustrialOpen, setIsIndustrialOpen] = useState(false);
  const [reviewMatchTarget, setReviewMatchTarget] = useState(null);

  // Initialize data from local storage service
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    const loadedUsers = StorageService.getUsers();
    const loadedCurrent = StorageService.getCurrentUser();
    const loadedListings = StorageService.getListings();
    const loadedMatches = StorageService.getMatches();
    const loadedReviews = StorageService.getReviews();

    setUsers(loadedUsers);
    setCurrentUser(loadedCurrent);
    setListings(loadedListings);
    setMatches(loadedMatches);
    setReviews(loadedReviews);
    if (loadedMatches.length > 0 && !activeMatchId) {
      setActiveMatchId(loadedMatches[0].id);
    }
  };

  const handleSelectUser = (userId) => {
    StorageService.setCurrentUserId(userId);
    const updated = users.find(u => u.id === userId);
    if (updated) {
      setCurrentUser(updated);
    }
  };

  const handleCreateListing = (listingData) => {
    if (!currentUser) return;
    const newListing = StorageService.addListing(listingData, currentUser);
    setListings(StorageService.getListings());
  };

  const handleDeleteListing = (listingId) => {
    const updated = StorageService.deleteListing(listingId);
    setListings(updated);
  };

  const handleMatchCreated = (listing, buyer) => {
    const newMatch = StorageService.createMatch(listing, buyer);
    setMatches(StorageService.getMatches());
    return newMatch;
  };

  const handleOpenChatWithMatch = (match) => {
    setActiveMatchId(match.id);
    setActiveTab('matches');
  };

  const handleSendMessage = (matchId, sender, text) => {
    StorageService.sendMessage(matchId, sender, text);
    setMatches(StorageService.getMatches());
  };

  const handleUpdateStatus = (matchId, newStatus, pickupSchedule = null) => {
    const updated = StorageService.updateMatchStatus(matchId, newStatus, pickupSchedule);
    setMatches(updated);
  };

  const handleSubmitReview = (reviewData) => {
    const updated = StorageService.addReview(reviewData);
    setReviews(updated);
  };

  const handleResetData = () => {
    StorageService.resetToDefault();
    loadAllData();
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf7] text-slate-900 font-sans">
      
      {/* Top App Navbar */}
      <Navbar
        currentUser={currentUser}
        allUsers={users}
        onSelectUser={handleSelectUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickRestaurantModal={() => setIsQuickRestaurantOpen(true)}
        onOpenIndustrialModal={() => setIsIndustrialOpen(true)}
        matches={matches}
        onResetData={handleResetData}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {activeTab === 'swipe' && (
          <SwipeMatchDeck
            currentUser={currentUser}
            listings={listings}
            onMatchCreated={handleMatchCreated}
            onOpenChatWithMatch={handleOpenChatWithMatch}
            onOpenQuickRestaurantModal={() => setIsQuickRestaurantOpen(true)}
            onOpenIndustrialModal={() => setIsIndustrialOpen(true)}
          />
        )}

        {activeTab === 'explore' && (
          <MarketplaceList
            currentUser={currentUser}
            listings={listings}
            onMatchCreated={handleMatchCreated}
            onOpenChatWithMatch={handleOpenChatWithMatch}
            onDeleteListing={handleDeleteListing}
            onOpenQuickRestaurantModal={() => setIsQuickRestaurantOpen(true)}
            onOpenIndustrialModal={() => setIsIndustrialOpen(true)}
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
          />
        )}

        {activeTab === 'dashboard' && (
          <SustainabilityDashboard
            currentUser={currentUser}
            listings={listings}
            matches={matches}
            reviews={reviews}
          />
        )}

        {activeTab === 'map' && (
          <CircularFlowMap
            users={users}
            listings={listings}
          />
        )}
      </main>

      {/* Listing Modals */}
      <QuickRestaurantListingModal
        currentUser={currentUser}
        isOpen={isQuickRestaurantOpen}
        onClose={() => setIsQuickRestaurantOpen(false)}
        onListingCreated={handleCreateListing}
      />

      <DetailedIndustrialListingModal
        currentUser={currentUser}
        isOpen={isIndustrialOpen}
        onClose={() => setIsIndustrialOpen(false)}
        onListingCreated={handleCreateListing}
      />

      {/* Star Rating & Review Modal */}
      <ReviewModal
        currentUser={currentUser}
        match={reviewMatchTarget}
        isOpen={!!reviewMatchTarget}
        onClose={() => setReviewMatchTarget(null)}
        onSubmitReview={handleSubmitReview}
      />

    </div>
  );
}
