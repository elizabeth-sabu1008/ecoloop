import assert from 'node:assert';
import { 
  calculateHaversineDistance, 
  calculateLogisticsCost, 
  calculateCarbonSavings, 
  calculateMethaneAvoided, 
  normalizeToKg,
  getFullListingMetrics
} from '../services/impactCalculator.js';
import { calculateMatchScore } from '../services/matchingEngine.js';
import { INITIAL_USERS, INITIAL_LISTINGS } from '../data/mockData.js';

console.log('🧪 Starting EcoLoop Comprehensive Verification Tests...\n');

// 1. Haversine Distance Test
console.log('Test 1: Haversine Distance Calculation');
const sfLat = 37.7749, sfLng = -122.4194;
const oaklandLat = 37.8044, oaklandLng = -122.2711;
const dist = calculateHaversineDistance(sfLat, sfLng, oaklandLat, oaklandLng);
console.log(`- SF to Oakland Distance: ${dist} km`);
assert(dist > 10 && dist < 20, 'Distance should be roughly 13-16 km');
console.log('✅ Distance calculation verified\n');

// 2. Logistics Cost Test
console.log('Test 2: Logistics Cost Calculation');
const costStandard = calculateLogisticsCost(15, 500, false);
const costUrgent = calculateLogisticsCost(15, 500, true);
console.log(`- Standard logistics cost (15km, 500kg): $${costStandard}`);
console.log(`- Urgent 24h logistics cost: $${costUrgent}`);
assert(costStandard >= 40 && costStandard <= 60, 'Cost should align with flat base + per km');
assert(costUrgent > costStandard, 'Urgent pickup must reflect expedition multiplier');
console.log('✅ Logistics cost formulas verified\n');

// 3. Weight Normalization
console.log('Test 3: Weight Normalization');
assert.strictEqual(normalizeToKg(2.5, 'tons'), 2500);
assert.strictEqual(normalizeToKg(100, 'kg'), 100);
assert(Math.abs(normalizeToKg(100, 'lbs') - 45.3592) < 0.1);
console.log('✅ Weight normalization verified across metric/imperial units\n');

// 4. Carbon & Methane Avoided Calculations (EPA WARM & IPCC Baselines)
console.log('Test 4: Climate Emission Offsets (EPA WARM)');
const aluminumOffset = calculateCarbonSavings('Industrial/Manufacturing waste', 'Metal Scraps - Aluminum', 1000);
console.log(`- 1000kg Aluminum Smelting Offset: ${aluminumOffset} kg CO2e`);
assert(aluminumOffset > 3500, 'Aluminum recycling should displace >3.5 kg CO2e per kg');

const foodOffset = calculateCarbonSavings('Organic/Food waste', 'Pre-consumer prep waste', 500);
console.log(`- 500kg Food Waste Landfill Offset: ${foodOffset} kg CO2e`);
assert(foodOffset > 1000, 'Food waste composting should displace >2 kg CO2e per kg');

const methaneAvoided = calculateMethaneAvoided('Organic/Food waste', 'Pre-consumer prep waste', 500);
console.log(`- 500kg Food Waste Methane Avoided: ${methaneAvoided} kg CH4`);
assert(methaneAvoided > 250, 'Methane avoidance must reflect ~0.62 factor');
console.log('✅ EPA WARM carbon and methane formulas verified\n');

// 5. Algorithmic Match Score Testing
console.log('Test 5: Algorithmic Match Compatibility Scoring');
const restaurantUser = INITIAL_USERS.find(u => u.id === 'user_greenfork');
const composterUser = INITIAL_USERS.find(u => u.id === 'user_bioloop');
const coffeeListing = INITIAL_LISTINGS.find(l => l.subTag.includes('Coffee'));

const matchResult = calculateMatchScore(coffeeListing, composterUser);
console.log(`- Coffee Grounds -> BioLoop Composter Match Score: ${matchResult.score}% (${matchResult.grade})`);
console.log(`- Match Reasons:`, matchResult.reasons);
console.log(`- Badges Awarded:`, matchResult.badges);
assert(matchResult.score >= 85, 'High affinity organic feedstock should score >= 85%');
assert(matchResult.badges.includes('Urgent Priority') || matchResult.badges.includes('Organic Loop'), 'Should contain organic/urgency badges');
console.log('✅ Matching engine algorithm verified\n');

// 6. Full Listing Metrics Integration
console.log('Test 6: Full Listing Metrics Integration');
const fullMetrics = getFullListingMetrics(coffeeListing, composterUser.location);
console.log('- Full Metrics Computed:', fullMetrics);
assert(fullMetrics.carbonSavingsKg > 0);
assert(fullMetrics.methaneAvoidedKg > 0);
assert(fullMetrics.logisticsCost > 0);
assert(fullMetrics.treeSeedlingsEquivalent > 0);
console.log('✅ End-to-end impact integration verified\n');

console.log('🎉 ALL ECOLOOP VERIFICATION TESTS PASSED SUCCESSFULLY!');
