/**
 * Scientific Baseline Emission Factors for Circular Economy & Waste Diversion
 * 
 * Citations & Methodological Baselines:
 * - EPA WARM (Waste Reduction Model) v15: https://www.epa.gov/warm
 * - IPCC Guidelines for National Greenhouse Gas Inventories (Volume 5: Waste)
 * - Ecoinvent 3.8 Life Cycle Inventory Database for Virgin vs Recycled Materials
 * - GWP-100 (Global Warming Potential over 100 years): Methane (CH4) = 28x CO2
 */

export const EMISSION_FACTORS = {
  // Industrial & Manufacturing Categories (kg CO2e avoided per kg diverted from virgin extraction/landfill)
  "Industrial/Manufacturing waste": {
    "Metal Scraps - Aluminum": {
      co2eAvoidedPerKg: 3.82, // Smelting virgin bauxite vs remelting clean scrap (WARM v15)
      transportFactorPerTonKm: 0.12,
      description: "Avoids high-energy bauxite electrolysis and mining"
    },
    "Metal Scraps - Steel/Iron": {
      co2eAvoidedPerKg: 1.64, // Blast furnace virgin iron ore vs electric arc furnace scrap
      transportFactorPerTonKm: 0.12,
      description: "Avoids blast furnace iron ore reduction"
    },
    "Plastics - HDPE Regrind": {
      co2eAvoidedPerKg: 2.15, // Virgin naphtha polymer cracking vs clean flaking/extrusion
      transportFactorPerTonKm: 0.12,
      description: "Displaces virgin petroleum polymer synthesis"
    },
    "Plastics - PET Flakes": {
      co2eAvoidedPerKg: 2.45,
      transportFactorPerTonKm: 0.12,
      description: "Recovers terephthalic acid polymer loop"
    },
    "Textile Offcuts - Cotton/Polyester": {
      co2eAvoidedPerKg: 2.80,
      transportFactorPerTonKm: 0.12,
      description: "Avoids agricultural water/fertilizer footprint and virgin polyester"
    },
    "Wood / Clean Timber Pallets": {
      co2eAvoidedPerKg: 0.88,
      transportFactorPerTonKm: 0.12,
      description: "Prevents open burning / landfill rotting; sequesters biogenic carbon"
    },
    "Chemical / Mineral Byproducts": {
      co2eAvoidedPerKg: 1.25,
      transportFactorPerTonKm: 0.12,
      description: "Direct input substitution in secondary manufacturing"
    },
    "Default Industrial": {
      co2eAvoidedPerKg: 1.90,
      transportFactorPerTonKm: 0.12,
      description: "Standard mixed secondary manufacturing diversion"
    }
  },

  // Organic / Food Waste (Crucial Methane Avoided Calculations)
  "Organic/Food waste": {
    "Pre-consumer prep waste": {
      ch4AvoidedPerKg: 0.62,  // Anaerobic landfill gas generation (EPA WARM food waste baseline)
      co2eAvoidedPerKg: 2.50, // Landfill total equivalent avoided + compost nutrient recovery
      methaneGwpMultiplier: 28,
      description: "Diverted from anaerobic landfill degradation into aerobic composting"
    },
    "Post-consumer plate waste": {
      ch4AvoidedPerKg: 0.58,
      co2eAvoidedPerKg: 2.30,
      methaneGwpMultiplier: 28,
      description: "High moisture organic diversion avoiding methane pockets"
    },
    "Coffee grounds & spent tea": {
      ch4AvoidedPerKg: 0.68,
      co2eAvoidedPerKg: 2.80,
      methaneGwpMultiplier: 28,
      description: "High nitrogen organic substrate ideal for mushroom cultivation & compost"
    },
    "Brewery spent grain & yeast": {
      ch4AvoidedPerKg: 0.72,
      co2eAvoidedPerKg: 3.10,
      methaneGwpMultiplier: 28,
      description: "Reused as high-protein livestock feed or biogas feedstock"
    },
    "Food-processing byproducts (peels, pulp)": {
      ch4AvoidedPerKg: 0.64,
      co2eAvoidedPerKg: 2.60,
      methaneGwpMultiplier: 28,
      description: "Standard industrial food processing organic diversion"
    },
    "Expired/unsold retail inventory": {
      ch4AvoidedPerKg: 0.60,
      co2eAvoidedPerKg: 2.45,
      methaneGwpMultiplier: 28,
      description: "Packaged/bulk organic diversion from landfill"
    },
    "Default Organic": {
      ch4AvoidedPerKg: 0.62,
      co2eAvoidedPerKg: 2.50,
      methaneGwpMultiplier: 28,
      description: "General organic matter diverted to composting / anaerobic digestion"
    }
  },

  // Finished Output (Closing the loop on soil health & carbon sequestration)
  "Finished compost/fertilizer/biochar output": {
    "Certified Organic Compost": {
      co2eSequesteredPerKg: 0.48, // Soil carbon sequestration & chemical fertilizer displacement
      description: "Enriches soil organic matter and replaces synthetic nitrogen/phosphorus fertilizers"
    },
    "Biochar Enhanced Soil Amendment": {
      co2eSequesteredPerKg: 2.10, // Long-term recalcitrant pyrogenic carbon capture (>100 years)
      description: "Permanent soil carbon fixation and water retention booster"
    },
    "Liquid Organic Fertilizer (Biogas Digestate)": {
      co2eSequesteredPerKg: 0.35,
      description: "Nutrient-dense liquid byproduct replacing synthetic petrochemical fertilizers"
    },
    "Default Output": {
      co2eSequesteredPerKg: 0.50,
      description: "Circular soil regeneration product"
    }
  }
};

export const LOGISTICS_RATES = {
  baseFee: 25.00,        // Flat baseline booking & dispatch fee in USD
  perKmRate: 1.45,       // USD per km for standard logistics vehicle
  heavyLoadPerTonKm: 0.45 // USD surcharge per ton-km for heavy bulk shipments
};
