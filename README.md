<<<<<<< HEAD
# EcoLoop Marketplace 🌿🔄

**EcoLoop Marketplace** is a circular economy matchmaking platform connecting surplus/waste generators (restaurants, breweries, factories, machine shops) with reuse businesses (compost facilities, anaerobic digesters, plastics and metal recyclers) and agricultural buyers purchasing finished compost and biochar ("A dating app for industrial and food waste").

---

## 📁 Folder & File Structure

```
ecoloop/
├── index.html                                 # HTML5 entry with Google Fonts & SEO meta tags
├── package.json                               # Dependencies & scripts
├── vite.config.js                             # Vite bundler & Tailwind CSS v4 setup
├── tailwind.config.js                         # Custom eco & earth color palette
├── src/
│   ├── main.jsx                               # React root entry point
│   ├── App.jsx                                # Main app orchestrator & view router
│   ├── index.css                              # Glassmorphism, animations & Tailwind styles
│   │
│   ├── components/
│   │   ├── Navbar.jsx                         # Top impact ticker & persona switcher
│   │   ├── SwipeMatchDeck.jsx                 # Tinder-style "Waste Dating App" card deck
│   │   ├── MarketplaceList.jsx                # Searchable marketplace with distance/category filters
│   │   ├── QuickRestaurantListingModal.jsx    # 30-second mobile-first restaurant listing flow
│   │   ├── DetailedIndustrialListingModal.jsx # Industrial technical spec & recurring schedule form
│   │   ├── MatchChatDrawer.jsx                # In-app negotiation & lifecycle tracker
│   │   ├── ReviewModal.jsx                    # Verified 5-star ratings & quality reliability tags
│   │   ├── SustainabilityDashboard.jsx        # ESG metrics, monthly charts & CSV report export
│   │   └── CircularFlowMap.jsx                # Regional route optimizer & node network map
│   │
│   ├── data/
│   │   ├── emissionFactors.js                 # EPA WARM & IPCC baseline scientific factors
│   │   └── mockData.js                        # Realistic pre-seeded demo accounts & feedstocks
│   │
│   ├── services/
│   │   ├── impactCalculator.js                # Carbon savings, methane avoided & logistics cost formulas
│   │   ├── matchingEngine.js                  # 0-100 algorithmic compatibility scorer
│   │   └── storageService.js                  # Persistent local storage relational state
│   │
│   └── tests/
│       └── ecoloop.test.js                    # Automated test suite for calculations & matching
└── dist/                                      # Production build output bundle
```

---

## 🚀 How to Run Locally

1. Open a terminal in this folder:
   ```bash
   cd ecoloop
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open **http://localhost:5173** in your web browser.

---

## 🧪 Run Automated Tests

To test all calculations (Haversine distance, EPA WARM carbon offsets, methane avoided, and match scores):
```bash
node src/tests/ecoloop.test.js
```
=======
# Ecoloop
An AI-powered marketplace that matches waste generators with businesses that can reuse their surplus material, cutting landfill, logistics costs, and carbon emissions.
>>>>>>> 815a1b70ccd34458be93e24662fcb433da979286
