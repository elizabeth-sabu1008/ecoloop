import { EMISSION_FACTORS, LOGISTICS_RATES } from '../data/emissionFactors.js';

/**
 * Calculates Great-Circle Distance between two coordinates in kilometers (Haversine formula)
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 12.5; // realistic fallback default

  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 1 decimal place
}

/**
 * Calculates Estimated Logistics Cost ($ USD)
 */
export function calculateLogisticsCost(distanceKm, weightKg, isUrgent = false) {
  const tons = weightKg / 1000;
  const dist = Math.max(1, distanceKm);
  
  let cost = LOGISTICS_RATES.baseFee + (dist * LOGISTICS_RATES.perKmRate);
  
  if (tons > 0.5) {
    cost += dist * tons * LOGISTICS_RATES.heavyLoadPerTonKm;
  }
  
  // Expedited 24h pickup surcharge
  if (isUrgent) {
    cost *= 1.15;
  }

  return Math.round(cost);
}

/**
 * Standardizes weight into Kilograms (kg)
 */
export function normalizeToKg(quantity, unit) {
  const qty = parseFloat(quantity) || 0;
  switch ((unit || '').toLowerCase()) {
    case 'tons':
    case 'ton':
    case 't':
      return qty * 1000;
    case 'lbs':
    case 'pounds':
      return qty * 0.453592;
    case 'pallets':
      return qty * 450; // standard average loaded pallet
    case 'liters':
    case 'l':
      return qty * 1.0; // density ~ 1kg/L approx
    case 'kg':
    default:
      return qty;
  }
}

/**
 * Calculates Estimated Carbon Savings (kg CO2e)
 */
export function calculateCarbonSavings(category, subTag, weightKg) {
  const categoryFactors = EMISSION_FACTORS[category];
  if (!categoryFactors) return Math.round(weightKg * 1.5);

  const matchedFactor = categoryFactors[subTag] || 
    Object.values(categoryFactors).find(f => f.co2eAvoidedPerKg || f.co2eSequesteredPerKg) || 
    { co2eAvoidedPerKg: 1.8 };

  const factor = matchedFactor.co2eAvoidedPerKg || matchedFactor.co2eSequesteredPerKg || 1.8;
  return Math.round(weightKg * factor);
}

/**
 * Calculates Estimated Methane (CH4) Avoided specifically for Organic / Food Waste
 */
export function calculateMethaneAvoided(category, subTag, weightKg) {
  if (category !== 'Organic/Food waste') return 0;

  const categoryFactors = EMISSION_FACTORS['Organic/Food waste'];
  const matchedFactor = categoryFactors[subTag] || categoryFactors['Default Organic'];
  
  const ch4Factor = matchedFactor?.ch4AvoidedPerKg || 0.62;
  return Math.round(weightKg * ch4Factor * 10) / 10;
}

/**
 * Computes full ecological and financial metrics for a listing & prospective partner
 */
export function getFullListingMetrics(listing, partnerCoords = null) {
  const weightKg = normalizeToKg(listing.quantity, listing.unit);
  
  // Coordinates
  const lat1 = listing.location?.lat || 37.7749;
  const lon1 = listing.location?.lng || -122.4194;
  const lat2 = partnerCoords?.lat || (lat1 + 0.08);
  const lon2 = partnerCoords?.lng || (lon1 + 0.06);

  const distanceKm = calculateHaversineDistance(lat1, lon1, lat2, lon2);
  const isUrgent = listing.urgencyLevel === 'Urgent (24h)' || listing.urgencyLevel === 'Immediate';
  const logisticsCost = calculateLogisticsCost(distanceKm, weightKg, isUrgent);
  const carbonSavingsKg = calculateCarbonSavings(listing.category, listing.subTag, weightKg);
  const methaneAvoidedKg = calculateMethaneAvoided(listing.category, listing.subTag, weightKg);

  // Carbon equivalent in trees planted / cars off road
  const treeSeedlingsEquivalent = Math.round(carbonSavingsKg / 21.7); // 1 tree seedling grown for 10 years ~21.7 kg CO2
  const milesDrivenEquivalent = Math.round(carbonSavingsKg * 2.5); // 1 kg CO2 ~ 2.5 miles driven in standard passenger car

  return {
    weightKg,
    distanceKm,
    logisticsCost,
    carbonSavingsKg,
    methaneAvoidedKg,
    treeSeedlingsEquivalent,
    milesDrivenEquivalent
  };
}
