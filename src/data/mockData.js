import { getFullListingMetrics } from '../services/impactCalculator.js';

export const INITIAL_USERS = [
  {
    id: 'user_greenfork',
    name: 'Chef Marco Silva',
    companyName: 'GreenFork Bistro & Farm Table',
    businessType: 'Restaurant & Hospitality',
    role: 'seller', // seller, buyer, both
    location: {
      address: '742 Valencia St, San Francisco, CA 94110',
      city: 'San Francisco, CA',
      lat: 37.7608,
      lng: -122.4215
    },
    verificationStatus: 'verified',
    rating: 4.92,
    reviewCount: 38,
    totalDivertedKg: 14250,
    acceptedCategories: ['Finished compost/fertilizer/biochar output'],
    acceptedTags: ['Herb garden soil', 'Organic compost'],
    bio: 'Zero-waste Michelin-recommended farm-to-table restaurant generating clean prep vegetable trimmings and espresso grounds daily.',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_bioloop',
    name: 'Elena Vance',
    companyName: 'BioLoop Organics & Clean Energy',
    businessType: 'Composting & Biogas Facility',
    role: 'both',
    location: {
      address: '1200 Tunnel Ave, Brisbane, CA 94005',
      city: 'Brisbane, CA',
      lat: 37.7021,
      lng: -122.4042
    },
    verificationStatus: 'verified',
    rating: 4.98,
    reviewCount: 114,
    totalDivertedKg: 285000,
    minCapacityKg: 100,
    maxCapacityKg: 50000,
    acceptedCategories: ['Organic/Food waste', 'Industrial/Manufacturing waste'],
    acceptedTags: ['Pre-consumer prep waste', 'Coffee grounds & spent tea', 'Brewery spent grain & yeast', 'Food-processing byproducts (peels, pulp)', 'Wood / Clean Timber Pallets'],
    bio: 'Regional aerobic industrial composting & dry anaerobic digestion facility converting commercial food streams into OMRI-certified compost and biochar.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_apex',
    name: 'Dave Miller',
    companyName: 'Apex Precision CNC & Fabrication',
    businessType: 'Industrial Manufacturer',
    role: 'seller',
    location: {
      address: '4800 Industrial Way, Oakland, CA 94601',
      city: 'Oakland, CA',
      lat: 37.7725,
      lng: -122.2144
    },
    verificationStatus: 'verified',
    rating: 4.88,
    reviewCount: 42,
    totalDivertedKg: 94200,
    acceptedCategories: [],
    acceptedTags: [],
    bio: 'Aerospace and robotic component machine shop with consistent segregated streams of clean 6061-T6 aluminum shavings, stainless steel offcuts, and packaging.',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_pacific_polymer',
    name: 'Dr. Aris Thorne',
    companyName: 'Pacific Polymer & Circular Materials',
    businessType: 'Industrial Materials Recycler',
    role: 'buyer',
    location: {
      address: '890 Marina Blvd, San Leandro, CA 94577',
      city: 'San Leandro, CA',
      lat: 37.7095,
      lng: -122.1852
    },
    verificationStatus: 'verified',
    rating: 4.95,
    reviewCount: 86,
    totalDivertedKg: 420000,
    minCapacityKg: 200,
    maxCapacityKg: 40000,
    acceptedCategories: ['Industrial/Manufacturing waste'],
    acceptedTags: ['Plastics - HDPE Regrind', 'Plastics - PET Flakes', 'Chemical / Mineral Byproducts'],
    bio: 'Advanced plastic flaking and compounding facility supplying circular post-industrial resins for consumer goods packaging.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_valley_farm',
    name: 'Sarah Jenkins',
    companyName: 'Valley Bloom Organic Nursery & Vineyard',
    businessType: 'Organic Farm & Nursery',
    role: 'buyer',
    location: {
      address: '4100 Highway 12, Sonoma, CA 95476',
      city: 'Sonoma, CA',
      lat: 38.2919,
      lng: -122.4580
    },
    verificationStatus: 'verified',
    rating: 5.0,
    reviewCount: 29,
    totalDivertedKg: 65000,
    minCapacityKg: 500,
    maxCapacityKg: 30000,
    acceptedCategories: ['Finished compost/fertilizer/biochar output'],
    acceptedTags: ['Certified Organic Compost', 'Biochar Enhanced Soil Amendment', 'Liquid Organic Fertilizer (Biogas Digestate)'],
    bio: 'Regenerative 140-acre organic vineyard and native nursery seeking certified organic compost and biochar soil amendments to eliminate synthetic fertilizers.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_brewery',
    name: 'Marcus Chen',
    companyName: 'FreshCoast Craft Brewing Co.',
    businessType: 'Brewery & Beverage Processor',
    role: 'seller',
    location: {
      address: '2200 4th St, Berkeley, CA 94710',
      city: 'Berkeley, CA',
      lat: 37.8647,
      lng: -122.2982
    },
    verificationStatus: 'verified',
    rating: 4.90,
    reviewCount: 19,
    totalDivertedKg: 48000,
    acceptedCategories: [],
    acceptedTags: [],
    bio: 'Craft brewery producing 60bbl weekly with warm spent barley mash ready for agricultural feeding or anaerobic digestors.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_LISTINGS = [
  {
    id: 'list_101',
    ownerId: 'user_greenfork',
    ownerName: 'GreenFork Bistro & Farm Table',
    ownerAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80',
    ownerVerificationStatus: 'verified',
    title: 'Daily Spent Espresso Grounds & Cold Brew Pulp',
    category: 'Organic/Food waste',
    subTag: 'Coffee grounds & spent tea',
    quantity: 160,
    unit: 'kg',
    qualityGrade: 'Grade A - Pure Organics',
    purityPercentage: 99.5,
    contaminationFlags: ['Meat/Dairy Free', 'Packaging Free', '100% Compostable'],
    urgencyLevel: 'Urgent (24h)',
    urgencyText: 'Pickup within 24 hours required for freshness',
    isRecurring: true,
    recurrenceSchedule: 'Every Tue, Thu & Sat at 4:00 PM',
    priceType: 'Free',
    priceValue: 0,
    location: {
      address: '742 Valencia St, San Francisco, CA 94110',
      city: 'San Francisco, CA',
      lat: 37.7608,
      lng: -122.4215
    },
    availabilityWindow: 'Ready for pickup daily 3:00 PM - 6:00 PM',
    photos: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=600&auto=format&fit=crop&q=80'
    ],
    description: 'Clean, unadulterated spent espresso pucks and coarse cold-brew grinds packed in food-safe 5-gallon buckets. Extremely high nitrogen content, ideal for mushroom substrate or compost activator.',
    createdAt: '2026-09-08T14:30:00Z',
    status: 'active'
  },
  {
    id: 'list_102',
    ownerId: 'user_greenfork',
    ownerName: 'GreenFork Bistro & Farm Table',
    ownerAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80',
    ownerVerificationStatus: 'verified',
    title: 'Pre-Consumer Kitchen Prep Vegetable Trimmings',
    category: 'Organic/Food waste',
    subTag: 'Pre-consumer prep waste',
    quantity: 340,
    unit: 'kg',
    qualityGrade: 'Grade A - Raw Botanical',
    purityPercentage: 98.0,
    contaminationFlags: ['Meat/Dairy Free', 'Packaging Free', 'Certified Plant-Based'],
    urgencyLevel: 'Urgent (24h)',
    urgencyText: 'Time-sensitive: pickup by today 7:00 PM',
    isRecurring: true,
    recurrenceSchedule: 'Daily after dinner service',
    priceType: 'Free',
    priceValue: 0,
    location: {
      address: '742 Valencia St, San Francisco, CA 94110',
      city: 'San Francisco, CA',
      lat: 37.7608,
      lng: -122.4215
    },
    availabilityWindow: 'Nightly 6:00 PM - 10:00 PM',
    photos: [
      'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80'
    ],
    description: 'Carrot peels, celery ends, cabbage cores, herb stems, and onion skins strictly sorted prior to cooking. Zero meats, dairy, oils, or plastic wrappers.',
    createdAt: '2026-09-08T18:00:00Z',
    status: 'active'
  },
  {
    id: 'list_103',
    ownerId: 'user_bioloop',
    ownerName: 'BioLoop Organics & Clean Energy',
    ownerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    ownerVerificationStatus: 'verified',
    title: 'OMRI-Listed Screened Thermal Compost (Bulk)',
    category: 'Finished compost/fertilizer/biochar output',
    subTag: 'Certified Organic Compost',
    quantity: 14,
    unit: 'tons',
    qualityGrade: 'USCC STA Certified & OMRI Listed',
    purityPercentage: 99.8,
    contaminationFlags: ['Weed Seed Free', 'Heavy Metal Tested', 'Pathogen Free'],
    urgencyLevel: 'Flexible / Non-perishable',
    urgencyText: 'Cured & matured 90 days',
    isRecurring: false,
    recurrenceSchedule: 'Available on-demand',
    priceType: 'For Sale',
    priceValue: 68, // $68 / ton
    location: {
      address: '1200 Tunnel Ave, Brisbane, CA 94005',
      city: 'Brisbane, CA',
      lat: 37.7021,
      lng: -122.4042
    },
    availabilityWindow: 'Mon-Fri 7:00 AM - 4:00 PM (Loading dock open)',
    photos: [
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80'
    ],
    description: 'Rich dark humus compost produced from aerobically composted Bay Area organic streams. Screened to 1/4 inch with carbon-to-nitrogen ratio of 16:1. Perfect for vineyards, orchards, and organic farms.',
    createdAt: '2026-09-07T10:00:00Z',
    status: 'active'
  },
  {
    id: 'list_104',
    ownerId: 'user_bioloop',
    ownerName: 'BioLoop Organics & Clean Energy',
    ownerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    ownerVerificationStatus: 'verified',
    title: 'Pyrolyzed Biochar Soil Inoculant & Carbon Sink',
    category: 'Finished compost/fertilizer/biochar output',
    subTag: 'Biochar Enhanced Soil Amendment',
    quantity: 4.5,
    unit: 'tons',
    qualityGrade: 'High Carbon (>82% Fixed C)',
    purityPercentage: 99.9,
    contaminationFlags: ['100% Recalcitrant Carbon', 'Heavy Metal Tested'],
    urgencyLevel: 'Flexible / Non-perishable',
    urgencyText: 'Super stable carbon sequestration',
    isRecurring: false,
    recurrenceSchedule: 'Monthly batch availability',
    priceType: 'For Sale',
    priceValue: 195, // $195 / ton
    location: {
      address: '1200 Tunnel Ave, Brisbane, CA 94005',
      city: 'Brisbane, CA',
      lat: 37.7021,
      lng: -122.4042
    },
    availabilityWindow: 'Mon-Sat 8:00 AM - 5:00 PM',
    photos: [
      'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=600&auto=format&fit=crop&q=80'
    ],
    description: 'High surface-area biochar created via clean pyrolysis of clean lumber offcuts. Inoculated with beneficial mycorrhizal fungi and humic acid to supercharge agricultural water retention.',
    createdAt: '2026-09-06T11:20:00Z',
    status: 'active'
  },
  {
    id: 'list_105',
    ownerId: 'user_apex',
    ownerName: 'Apex Precision CNC & Fabrication',
    ownerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    ownerVerificationStatus: 'verified',
    title: 'Aerospace 6061-T6 Aluminum CNC Shavings & Billet Offcuts',
    category: 'Industrial/Manufacturing waste',
    subTag: 'Metal Scraps - Aluminum',
    quantity: 2.4,
    unit: 'tons',
    qualityGrade: 'Mil-Spec Certified 6061-T6 Alloy',
    purityPercentage: 99.4,
    contaminationFlags: ['Coolant Centrifuged', 'Zero Iron Contamination'],
    urgencyLevel: 'Moderate (3-5 days)',
    urgencyText: 'Forklift loading available on site',
    isRecurring: true,
    recurrenceSchedule: 'Bi-weekly every 2nd Friday',
    priceType: 'For Sale',
    priceValue: 880, // $880 / ton
    location: {
      address: '4800 Industrial Way, Oakland, CA 94601',
      city: 'Oakland, CA',
      lat: 37.7725,
      lng: -122.2144
    },
    availabilityWindow: 'Mon-Fri 6:00 AM - 3:30 PM (Bay 4)',
    photos: [
      'https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=600&auto=format&fit=crop&q=80'
    ],
    description: 'Dry, de-oiled aerospace aluminum shavings and solid end-billets packed into gaylord boxes on reinforced pallets. Complete mill test reports (MTR) provided.',
    createdAt: '2026-09-07T08:15:00Z',
    status: 'active'
  },
  {
    id: 'list_106',
    ownerId: 'user_apex',
    ownerName: 'Apex Precision CNC & Fabrication',
    ownerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    ownerVerificationStatus: 'verified',
    title: 'Clean Post-Industrial HDPE Extrusion Purge & Offcuts',
    category: 'Industrial/Manufacturing waste',
    subTag: 'Plastics - HDPE Regrind',
    quantity: 920,
    unit: 'kg',
    qualityGrade: 'Virgin-Grade Offcuts (MFI 0.3)',
    purityPercentage: 99.1,
    contaminationFlags: ['Unprinted', 'Non-Hazardous', 'Dry Stored'],
    urgencyLevel: 'Moderate (3-5 days)',
    urgencyText: 'Dock pickup ready',
    isRecurring: false,
    recurrenceSchedule: 'One-time lot',
    priceType: 'For Sale',
    priceValue: 320,
    location: {
      address: '4800 Industrial Way, Oakland, CA 94601',
      city: 'Oakland, CA',
      lat: 37.7725,
      lng: -122.2144
    },
    availabilityWindow: 'Mon-Fri 7:00 AM - 4:00 PM',
    photos: [
      'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80'
    ],
    description: 'High-density polyethylene purge lumps and edge trimmings from industrial tooling prototyping. Uncolored natural white resin ready for shredding & regrinding.',
    createdAt: '2026-09-08T11:45:00Z',
    status: 'active'
  },
  {
    id: 'list_107',
    ownerId: 'user_brewery',
    ownerName: 'FreshCoast Craft Brewing Co.',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    ownerVerificationStatus: 'verified',
    title: 'Fresh Warm Spent Brewer\'s Malt Mash (Barley & Wheat)',
    category: 'Organic/Food waste',
    subTag: 'Brewery spent grain & yeast',
    quantity: 2.8,
    unit: 'tons',
    qualityGrade: 'Brew-House Fresh (High Protein 26%)',
    purityPercentage: 99.9,
    contaminationFlags: ['Chemical Free', '100% Food-Grade Barley', 'Packaging Free'],
    urgencyLevel: 'Urgent (24h)',
    urgencyText: 'Must be collected within 18h to prevent acidification',
    isRecurring: true,
    recurrenceSchedule: 'Every Tuesday & Thursday at 11:00 AM',
    priceType: 'Free',
    priceValue: 0,
    location: {
      address: '2200 4th St, Berkeley, CA 94710',
      city: 'Berkeley, CA',
      lat: 37.8647,
      lng: -122.2982
    },
    availabilityWindow: 'Brew brew days 10:00 AM - 2:00 PM',
    photos: [
      'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=600&auto=format&fit=crop&q=80'
    ],
    description: 'High-nutrient spent grain immediately discharged from our lauter tun. Exceptional nutritional profile for livestock feed, compost activator, or anaerobic methane biogas digesters.',
    createdAt: '2026-09-08T16:00:00Z',
    status: 'active'
  }
].map(listing => {
  // Precompute default metrics
  const metrics = getFullListingMetrics(listing);
  return { ...listing, metrics };
});

export const INITIAL_MATCHES = [
  {
    id: 'match_901',
    listingId: 'list_101',
    listingTitle: 'Daily Spent Espresso Grounds & Cold Brew Pulp',
    listingCategory: 'Organic/Food waste',
    listingQuantity: '160 kg',
    sellerId: 'user_greenfork',
    sellerName: 'Chef Marco Silva',
    sellerCompany: 'GreenFork Bistro',
    buyerId: 'user_bioloop',
    buyerName: 'Elena Vance',
    buyerCompany: 'BioLoop Organics & Clean Energy',
    matchScore: 97,
    status: 'Accepted', // Proposed, Accepted, Scheduled, Completed
    estimatedLogisticsCost: 48,
    estimatedCarbonSavingsKg: 448,
    estimatedMethaneSavingsKg: 108.8,
    pickupSchedule: 'Thursday at 4:30 PM',
    createdAt: '2026-09-08T15:10:00Z',
    notes: 'BioLoop truck route will collect during Thursday afternoon pickup run.',
    messages: [
      {
        id: 'msg_1',
        senderId: 'user_bioloop',
        senderName: 'Elena Vance',
        text: 'Hi Marco! We saw your recurring coffee grounds listing. Our anaerobic composting beds thrive on spent grounds for pH balancing.',
        timestamp: '2026-09-08T15:15:00Z'
      },
      {
        id: 'msg_2',
        senderId: 'user_greenfork',
        senderName: 'Chef Marco Silva',
        text: 'Awesome Elena! We produce about 160kg every 2 days. We have them neatly sealed in 5-gal buckets at our loading bay.',
        timestamp: '2026-09-08T15:22:00Z'
      },
      {
        id: 'msg_3',
        senderId: 'user_bioloop',
        senderName: 'Elena Vance',
        text: 'Perfect. We have our collection van nearby on Valencia St on Thursdays. Can we schedule pickup at 4:30 PM?',
        timestamp: '2026-09-08T15:30:00Z'
      },
      {
        id: 'msg_4',
        senderId: 'user_greenfork',
        senderName: 'Chef Marco Silva',
        text: 'Accepted! 4:30 PM on Thursday is locked in. Ring buzzer #2 at the rear alley.',
        timestamp: '2026-09-08T15:34:00Z'
      }
    ]
  },
  {
    id: 'match_902',
    listingId: 'list_103',
    listingTitle: 'OMRI-Listed Screened Thermal Compost (Bulk)',
    listingCategory: 'Finished compost/fertilizer/biochar output',
    listingQuantity: '14 tons',
    sellerId: 'user_bioloop',
    sellerName: 'Elena Vance',
    sellerCompany: 'BioLoop Organics',
    buyerId: 'user_valley_farm',
    buyerName: 'Sarah Jenkins',
    buyerCompany: 'Valley Bloom Organic Nursery & Vineyard',
    matchScore: 99,
    status: 'Scheduled',
    estimatedLogisticsCost: 185,
    estimatedCarbonSavingsKg: 6720,
    estimatedMethaneSavingsKg: 0,
    pickupSchedule: 'Friday, Sep 12 at 9:00 AM',
    createdAt: '2026-09-07T14:00:00Z',
    notes: 'Bulk tipper delivery to North Vineyard block.',
    messages: [
      {
        id: 'msg_201',
        senderId: 'user_valley_farm',
        senderName: 'Sarah Jenkins',
        text: 'Hello Elena! We are prepping our fall cover crop and vineyard rows. We need 14 tons of your USCC STA certified compost.',
        timestamp: '2026-09-07T14:10:00Z'
      },
      {
        id: 'msg_202',
        senderId: 'user_bioloop',
        senderName: 'Elena Vance',
        text: 'Hi Sarah! We have a fresh batch cured 90 days with excellent fungal-to-bacterial biomass. Ready to dispatch on Friday.',
        timestamp: '2026-09-07T14:35:00Z'
      }
    ]
  },
  {
    id: 'match_903',
    listingId: 'list_105',
    listingTitle: 'Aerospace 6061-T6 Aluminum CNC Shavings & Billet Offcuts',
    listingCategory: 'Industrial/Manufacturing waste',
    listingQuantity: '2.4 tons',
    sellerId: 'user_apex',
    sellerName: 'Dave Miller',
    sellerCompany: 'Apex Precision CNC',
    buyerId: 'user_pacific_polymer',
    buyerName: 'Dr. Aris Thorne',
    buyerCompany: 'Pacific Polymer & Circular Materials',
    matchScore: 89,
    status: 'Completed',
    estimatedLogisticsCost: 110,
    estimatedCarbonSavingsKg: 9168,
    estimatedMethaneSavingsKg: 0,
    pickupSchedule: 'Completed on Sep 4',
    createdAt: '2026-09-03T10:00:00Z',
    notes: 'Direct secondary remelting ingot feed. Full chain-of-custody certified.',
    messages: [
      {
        id: 'msg_301',
        senderId: 'user_pacific_polymer',
        senderName: 'Dr. Aris Thorne',
        text: 'Dave, confirmed receipt of the 2.4 tons aluminum lot. Zero coolant residue found. Excellent purity.',
        timestamp: '2026-09-04T16:00:00Z'
      }
    ],
    review: {
      rating: 5,
      comment: 'Exceptional sorting and clean pallets. MTR certificates were included on every gaylord box. Displaced over 9 tons of virgin smelting CO2!',
      authorName: 'Dr. Aris Thorne',
      authorCompany: 'Pacific Polymer',
      date: '2026-09-05'
    }
  }
];

export const INITIAL_REVIEWS = [
  {
    id: 'rev_1',
    targetUserId: 'user_greenfork',
    reviewerName: 'Elena Vance (BioLoop Organics)',
    rating: 5,
    tag: 'Pristine Organic Feedstock',
    comment: 'Chef Marco’s team strictly separates coffee grounds and kitchen scraps. Zero plastic film or cutlery contamination. Super easy weekly collection!',
    date: '3 days ago'
  },
  {
    id: 'rev_2',
    targetUserId: 'user_bioloop',
    reviewerName: 'Sarah Jenkins (Valley Bloom Vineyard)',
    rating: 5,
    tag: 'Premium OMRI Compost',
    comment: 'The compost quality is the highest we’ve tested. Soil organic matter increased by 2.4% after application. Closing the loop with local restaurant nutrients feels incredible.',
    date: '1 week ago'
  },
  {
    id: 'rev_3',
    targetUserId: 'user_apex',
    reviewerName: 'Dr. Aris Thorne (Pacific Polymer)',
    rating: 5,
    tag: 'Accurate Alloy Specs',
    comment: 'Consistent 6061-T6 shavings with certified de-oiling. Reliable recurring schedule every second Friday without fail.',
    date: '2 weeks ago'
  }
];
