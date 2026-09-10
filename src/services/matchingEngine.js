import { calculateHaversineDistance, getFullListingMetrics } from './impactCalculator.js';

/**
 * Calculates a 0-100 Compatibility Match Score between a Listing and a Prospective User/Business
 */
export function calculateMatchScore(listing, user) {
  if (!listing || !user) return { score: 75, reasons: ['Standard regional match'], badges: [] };

  let score = 0;
  const reasons = [];
  const badges = [];

  // 1. Material Compatibility (0 to 40 points)
  const userAcceptedCategories = user.acceptedCategories || [];
  const userAcceptedTags = user.acceptedTags || [];
  
  if (userAcceptedCategories.includes(listing.category)) {
    score += 25;
    if (userAcceptedTags.some(t => listing.subTag?.toLowerCase().includes(t.toLowerCase()) || (listing.title || '').toLowerCase().includes(t.toLowerCase()))) {
      score += 15;
      reasons.push(`Exact feedstock match for ${user.name}'s facility`);
      badges.push('Direct Feedstock');
    } else {
      score += 8;
      reasons.push(`Accepts category: ${listing.category}`);
    }
  } else if (user.businessType === 'Composting & Biogas Facility' && listing.category === 'Organic/Food waste') {
    score += 38;
    reasons.push('High-affinity organic feedstock for microbial digestion');
    badges.push('Organic Loop');
  } else if (user.businessType === 'Organic Farm & Nursery' && listing.category === 'Finished compost/fertilizer/biochar output') {
    score += 40;
    reasons.push('Direct agricultural soil nutrient demand');
    badges.push('Farm Soil Input');
  } else if (user.businessType === 'Industrial Materials Recycler' && listing.category === 'Industrial/Manufacturing waste') {
    score += 35;
    reasons.push('Secondary raw material manufacturing fit');
    badges.push('Circular Industrial');
  } else {
    score += 15; // baseline interest
  }

  // 2. Distance Proximity & Logistics Efficiency (0 to 30 points)
  const listingLat = listing.location?.lat || 37.7749;
  const listingLon = listing.location?.lng || -122.4194;
  const userLat = user.location?.lat || 37.7833;
  const userLon = user.location?.lng || -122.4167;

  const distanceKm = calculateHaversineDistance(listingLat, listingLon, userLat, userLon);

  if (distanceKm <= 8) {
    score += 30;
    reasons.push(`Ultra-local: only ${distanceKm} km away`);
    badges.push('Hyperlocal (<8km)');
  } else if (distanceKm <= 25) {
    score += 24;
    reasons.push(`Close transit: ${distanceKm} km away`);
    badges.push('Low Transport Footprint');
  } else if (distanceKm <= 60) {
    score += 16;
    reasons.push(`Regional range: ${distanceKm} km away`);
  } else {
    score += 8;
    reasons.push(`Long haul: ${distanceKm} km away`);
  }

  // 3. Batch Size / Volume Capacity Fit (0 to 20 points)
  const weightKg = listing.metrics?.weightKg || 100;
  if (user.minCapacityKg && weightKg < user.minCapacityKg) {
    score += 6;
    reasons.push('Below preferred bulk threshold');
  } else if (user.maxCapacityKg && weightKg > user.maxCapacityKg) {
    score += 10;
    reasons.push('High volume — may require multiple collection runs');
  } else {
    score += 20;
    reasons.push('Optimal batch volume match');
    badges.push('Batch Size Fit');
  }

  // 4. Urgency & Perishability Boost + Trust Rating (0 to 10 points)
  if (listing.urgencyLevel === 'Urgent (24h)' || listing.urgencyLevel === 'Immediate') {
    score += 6;
    reasons.push('Time-critical organic recovery prioritized');
    badges.push('Urgent Priority');
  }

  if (listing.ownerVerificationStatus === 'verified' || user.verificationStatus === 'verified') {
    score += 4;
    badges.push('Verified Partner');
  }

  // Cap between 45 and 99
  const finalScore = Math.min(99, Math.max(45, Math.round(score)));

  let grade = 'Moderate Match';
  let gradeColor = 'text-amber-600 bg-amber-50 border-amber-200';
  if (finalScore >= 90) {
    grade = 'Exceptional Match';
    gradeColor = 'text-emerald-700 bg-emerald-50 border-emerald-300';
  } else if (finalScore >= 78) {
    grade = 'Strong Match';
    gradeColor = 'text-eco-600 bg-eco-50 border-eco-200';
  }

  return {
    score: finalScore,
    grade,
    gradeColor,
    distanceKm,
    reasons,
    badges: [...new Set(badges)]
  };
}
