import { INITIAL_USERS, INITIAL_LISTINGS, INITIAL_MATCHES, INITIAL_REVIEWS } from '../data/mockData';
import { getFullListingMetrics } from './impactCalculator';
import { calculateMatchScore } from './matchingEngine';

const STORAGE_KEYS = {
  USERS: 'ecoloop_users_v1',
  LISTINGS: 'ecoloop_listings_v1',
  MATCHES: 'ecoloop_matches_v1',
  REVIEWS: 'ecoloop_reviews_v1',
  CURRENT_USER_ID: 'ecoloop_current_user_id_v1'
};

export const StorageService = {
  getUsers: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  },

  setUsers: (users) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getCurrentUser: () => {
    const users = StorageService.getUsers();
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'user_greenfork';
    return users.find(u => u.id === currentId) || users[0];
  },

  setCurrentUserId: (id) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  },

  getListings: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LISTINGS);
      return data ? JSON.parse(data) : INITIAL_LISTINGS;
    } catch {
      return INITIAL_LISTINGS;
    }
  },

  setListings: (listings) => {
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
  },

  addListing: (listingData, currentUser) => {
    const listings = StorageService.getListings();
    
    // Compute metrics
    const metrics = getFullListingMetrics(listingData, currentUser?.location);
    
    const newListing = {
      id: `list_${Date.now()}`,
      ownerId: currentUser.id,
      ownerName: currentUser.companyName || currentUser.name,
      ownerAvatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      ownerVerificationStatus: currentUser.verificationStatus || 'verified',
      createdAt: new Date().toISOString(),
      status: 'active',
      ...listingData,
      metrics
    };

    const updated = [newListing, ...listings];
    StorageService.setListings(updated);
    return newListing;
  },

  deleteListing: (id) => {
    const listings = StorageService.getListings().filter(l => l.id !== id);
    StorageService.setListings(listings);
    return listings;
  },

  getMatches: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
      return data ? JSON.parse(data) : INITIAL_MATCHES;
    } catch {
      return INITIAL_MATCHES;
    }
  },

  setMatches: (matches) => {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  },

  createMatch: (listing, prospectiveBuyer) => {
    const matches = StorageService.getMatches();
    const metrics = getFullListingMetrics(listing, prospectiveBuyer.location);
    const matchAnalysis = calculateMatchScore(listing, prospectiveBuyer);

    // Check if match already exists
    const existing = matches.find(m => m.listingId === listing.id && (m.buyerId === prospectiveBuyer.id || m.sellerId === prospectiveBuyer.id));
    if (existing) return existing;

    const newMatch = {
      id: `match_${Date.now()}`,
      listingId: listing.id,
      listingTitle: listing.title,
      listingCategory: listing.category,
      listingQuantity: `${listing.quantity} ${listing.unit}`,
      sellerId: listing.ownerId,
      sellerName: listing.ownerName,
      sellerCompany: listing.ownerName,
      buyerId: prospectiveBuyer.id,
      buyerName: prospectiveBuyer.name,
      buyerCompany: prospectiveBuyer.companyName,
      matchScore: matchAnalysis.score,
      status: 'Proposed',
      estimatedLogisticsCost: metrics.logisticsCost,
      estimatedCarbonSavingsKg: metrics.carbonSavingsKg,
      estimatedMethaneSavingsKg: metrics.methaneAvoidedKg,
      pickupSchedule: 'Pending negotiation',
      createdAt: new Date().toISOString(),
      notes: `Matched via EcoLoop Algorithmic Matchmaker (${matchAnalysis.grade})`,
      messages: [
        {
          id: `msg_${Date.now()}`,
          senderId: prospectiveBuyer.id,
          senderName: prospectiveBuyer.name,
          text: `Hi ${listing.ownerName}! We saw your listing for "${listing.title}" and are interested in partnering to reuse this material feedstock. Let's arrange a pickup window.`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    const updated = [newMatch, ...matches];
    StorageService.setMatches(updated);
    return newMatch;
  },

  updateMatchStatus: (matchId, newStatus, pickupSchedule = null) => {
    const matches = StorageService.getMatches().map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          status: newStatus,
          pickupSchedule: pickupSchedule || m.pickupSchedule
        };
      }
      return m;
    });
    StorageService.setMatches(matches);
    return matches;
  },

  sendMessage: (matchId, senderUser, text) => {
    const matches = StorageService.getMatches().map(m => {
      if (m.id === matchId) {
        const newMsg = {
          id: `msg_${Date.now()}`,
          senderId: senderUser.id,
          senderName: senderUser.name || senderUser.companyName,
          text,
          timestamp: new Date().toISOString()
        };
        return {
          ...m,
          messages: [...(m.messages || []), newMsg]
        };
      }
      return m;
    });
    StorageService.setMatches(matches);
    return matches.find(m => m.id === matchId);
  },

  getReviews: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      return data ? JSON.parse(data) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  },

  addReview: (reviewData) => {
    const reviews = StorageService.getReviews();
    const newRev = {
      id: `rev_${Date.now()}`,
      date: 'Just now',
      ...reviewData
    };
    const updated = [newRev, ...reviews];
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
    return updated;
  },

  resetToDefault: () => {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.LISTINGS);
    localStorage.removeItem(STORAGE_KEYS.MATCHES);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  }
};
