import React, { useState, useMemo } from 'react';
import { 
  X, 
  UtensilsCrossed, 
  Flame, 
  Leaf, 
  Clock, 
  Sparkles, 
  Check, 
  Camera, 
  Info,
  Calendar,
  DollarSign
} from 'lucide-react';
import { calculateCarbonSavings, calculateMethaneAvoided, normalizeToKg } from '../services/impactCalculator';

const PRESET_ORGANIC_TYPES = [
  {
    tag: 'Pre-consumer prep waste',
    label: 'Kitchen Veggie Prep Scraps',
    desc: 'Clean peels, trims & stalks prior to cooking',
    defaultPhoto: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80'
  },
  {
    tag: 'Coffee grounds & spent tea',
    label: 'Spent Espresso & Cold Brew Pulp',
    desc: 'High nitrogen grounds from daily barista service',
    defaultPhoto: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'
  },
  {
    tag: 'Brewery spent grain & yeast',
    label: 'Brewery Spent Malt Grain',
    desc: 'Warm malted barley mash from brew day',
    defaultPhoto: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=600&auto=format&fit=crop&q=80'
  },
  {
    tag: 'Food-processing byproducts (peels, pulp)',
    label: 'Bakery / Juice Processing Byproducts',
    desc: 'Day-old dough, citrus peels, fruit pomace',
    defaultPhoto: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80'
  }
];

const CONTAMINATION_OPTIONS = [
  'Meat/Dairy Free',
  'Packaging Free',
  '100% Compostable',
  'Non-Oily / Uncooked',
  'Certified Plant-Based'
];

export default function QuickRestaurantListingModal({ 
  currentUser, 
  isOpen, 
  onClose, 
  onListingCreated 
}) {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_ORGANIC_TYPES[0]);
  const [title, setTitle] = useState(PRESET_ORGANIC_TYPES[0].label);
  const [quantity, setQuantity] = useState(150);
  const [unit, setUnit] = useState('kg');
  const [isUrgent, setIsUrgent] = useState(true);
  const [isRecurring, setIsRecurring] = useState(true);
  const [recurrenceSchedule, setRecurrenceSchedule] = useState('Daily after service (9:00 PM)');
  const [selectedFlags, setSelectedFlags] = useState(['Meat/Dairy Free', 'Packaging Free', '100% Compostable']);
  const [notes, setNotes] = useState('Cleanly separated in food-grade 5-gallon buckets at rear alley loading dock.');
  const [customPhoto, setCustomPhoto] = useState('');

  if (!isOpen) return null;

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setTitle(preset.label);
  };

  const toggleFlag = (flag) => {
    if (selectedFlags.includes(flag)) {
      setSelectedFlags(selectedFlags.filter(f => f !== flag));
    } else {
      setSelectedFlags([...selectedFlags, flag]);
    }
  };

  // Live impact calculation
  const weightKg = normalizeToKg(quantity, unit);
  const carbonSavings = calculateCarbonSavings('Organic/Food waste', selectedPreset.tag, weightKg);
  const methaneAvoided = calculateMethaneAvoided('Organic/Food waste', selectedPreset.tag, weightKg);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newListing = {
      title,
      category: 'Organic/Food waste',
      subTag: selectedPreset.tag,
      quantity: Number(quantity),
      unit,
      qualityGrade: 'Grade A - Clean Food Scrap',
      purityPercentage: 99.0,
      contaminationFlags: selectedFlags,
      urgencyLevel: isUrgent ? 'Urgent (24h)' : 'Flexible',
      urgencyText: isUrgent ? 'Time-sensitive organic pickup within 24 hours' : 'Regular scheduled collection',
      isRecurring,
      recurrenceSchedule: isRecurring ? recurrenceSchedule : 'One-time lot',
      priceType: 'Free',
      priceValue: 0,
      location: currentUser.location || {
        address: 'Downtown Commercial District',
        city: 'San Francisco, CA',
        lat: 37.7749,
        lng: -122.4194
      },
      availabilityWindow: 'Daily 4:00 PM - 9:00 PM (Loading dock buzzer #2)',
      photos: [
        customPhoto || selectedPreset.defaultPhoto
      ],
      description: notes
    };

    onListingCreated(newListing);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-xl w-full shadow-2xl border border-emerald-100 max-h-[95vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-emerald-50 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                  30-Second Food Waste Fast-List
                </h2>
                <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                  Quick Mobile
                </span>
              </div>
              <p className="text-xs text-slate-500">Posting from: <strong className="text-slate-700">{currentUser.companyName}</strong></p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Step 1: Feedstock Presets */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. Select Organic Stream Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_ORGANIC_TYPES.map((preset) => {
                const isSelected = selectedPreset.tag === preset.tag;
                return (
                  <button
                    key={preset.tag}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-sm' 
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 text-slate-700'
                    }`}
                  >
                    <p className={`font-bold text-xs truncate ${isSelected ? 'text-emerald-950' : 'text-slate-800'}`}>
                      {preset.label}
                    </p>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{preset.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Listing Title */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Listing Headline</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
              required
            />
          </div>

          {/* Step 2: Weight & Live Impact Preview */}
          <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-emerald-950 uppercase">
                2. Estimated Weight per Batch
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="5"
                  max="10000"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-20 px-2 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-emerald-950 text-center"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="px-2 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-emerald-950"
                >
                  <option value="kg">kg</option>
                  <option value="tons">tons</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>

            <input
              type="range"
              min="10"
              max="2000"
              step="10"
              value={unit === 'kg' ? quantity : quantity * 1000}
              onChange={(e) => {
                if (unit === 'kg') setQuantity(Number(e.target.value));
                else if (unit === 'tons') setQuantity(Number(e.target.value) / 1000);
                else setQuantity(Math.round(Number(e.target.value) * 2.20462));
              }}
              className="w-full accent-emerald-600"
            />

            {/* Live Climate Calculator Pill */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-white/90 p-2 rounded-xl border border-emerald-200 text-center">
                <span className="text-[10px] text-emerald-700 font-bold flex items-center justify-center gap-1">
                  <Leaf className="w-3 h-3 text-emerald-600" /> CO₂e Avoided
                </span>
                <p className="text-sm font-extrabold text-emerald-900 mt-0.5">
                  {carbonSavings.toLocaleString()} kg
                </p>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-2 rounded-xl border border-amber-300 text-center">
                <span className="text-[10px] text-amber-900 font-bold flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3 text-amber-600 animate-pulse" /> Methane Avoided
                </span>
                <p className="text-sm font-extrabold text-amber-950 mt-0.5">
                  {methaneAvoided} kg CH₄
                </p>
              </div>
            </div>
          </div>

          {/* Step 3: Urgency & Recurrence */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* 24h Urgency Toggle */}
            <div 
              onClick={() => setIsUrgent(!isUrgent)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                isUrgent 
                  ? 'border-amber-400 bg-amber-50/80 text-amber-950 ring-1 ring-amber-400/30' 
                  : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Urgent (24h)
                </span>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isUrgent ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'
                }`}>
                  {isUrgent ? '✓' : ''}
                </span>
              </div>
              <p className="text-[10px] text-amber-800">Boosts visibility for nearby compost facilities</p>
            </div>

            {/* Recurring Schedule Toggle */}
            <div 
              onClick={() => setIsRecurring(!isRecurring)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                isRecurring 
                  ? 'border-purple-300 bg-purple-50/80 text-purple-950 ring-1 ring-purple-300/30' 
                  : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" /> Recurring Feed
                </span>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isRecurring ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-400'
                }`}>
                  {isRecurring ? '✓' : ''}
                </span>
              </div>
              <p className="text-[10px] text-purple-800">Continuous scheduled pickup</p>
            </div>

          </div>

          {/* Recurrence Schedule Detail Input if recurring */}
          {isRecurring && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Recurrence Schedule Details</label>
              <input
                type="text"
                value={recurrenceSchedule}
                onChange={(e) => setRecurrenceSchedule(e.target.value)}
                placeholder="e.g. Every Tue, Thu & Sat at 4:00 PM"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900"
              />
            </div>
          )}

          {/* Step 4: Contamination & Compliance Checklist */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              3. Purity & Contamination Checklist (Click to toggle)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CONTAMINATION_OPTIONS.map((flag) => {
                const isChecked = selectedFlags.includes(flag);
                return (
                  <button
                    key={flag}
                    type="button"
                    onClick={() => toggleFlag(flag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
                      isChecked 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 text-white" />}
                    {flag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading Dock / Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pickup Location & Logistics Instructions</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900"
              placeholder="e.g. Buckets placed at rear service door, buzzer 2."
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Publish Organic Feedstock (Free Divert)
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
