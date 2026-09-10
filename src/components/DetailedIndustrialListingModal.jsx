import React, { useState } from 'react';
import { 
  X, 
  Factory, 
  Leaf, 
  ShieldCheck, 
  Truck, 
  Calendar, 
  DollarSign, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Check
} from 'lucide-react';
import { calculateCarbonSavings, normalizeToKg } from '../services/impactCalculator';

const INDUSTRIAL_SUBTAGS = [
  'Metal Scraps - Aluminum',
  'Metal Scraps - Steel/Iron',
  'Plastics - HDPE Regrind',
  'Plastics - PET Flakes',
  'Textile Offcuts - Cotton/Polyester',
  'Wood / Clean Timber Pallets',
  'Chemical / Mineral Byproducts',
  'Certified Organic Compost',
  'Biochar Enhanced Soil Amendment'
];

const QUALITY_PRESETS = [
  'Mil-Spec Aerospace Certified (99.4% Pure)',
  'Virgin Industrial Regrind (MFI 0.3)',
  'OMRI Listed & USCC STA Tested Compost',
  'Clean Kiln-Dried Biomass (<8% Moisture)',
  'Commercial Recycled Flakes'
];

export default function DetailedIndustrialListingModal({ 
  currentUser, 
  isOpen, 
  onClose, 
  onListingCreated 
}) {
  const [category, setCategory] = useState('Industrial/Manufacturing waste');
  const [subTag, setSubTag] = useState(INDUSTRIAL_SUBTAGS[0]);
  const [title, setTitle] = useState('Clean Post-Industrial Feedstock Lot');
  const [quantity, setQuantity] = useState(2.5);
  const [unit, setUnit] = useState('tons');
  const [qualityGrade, setQualityGrade] = useState(QUALITY_PRESETS[0]);
  const [purityPercentage, setPurityPercentage] = useState(99.2);
  const [priceType, setPriceType] = useState('For Sale');
  const [priceValue, setPriceValue] = useState(650);
  const [isRecurring, setIsRecurring] = useState(true);
  const [recurrenceSchedule, setRecurrenceSchedule] = useState('Bi-weekly every 2nd Friday');
  const [availabilityWindow, setAvailabilityWindow] = useState('Mon-Fri 7:00 AM - 4:00 PM (Loading Bay 2)');
  const [description, setDescription] = useState('Continuous segregated stream of clean feedstock. Packaged in gaylord boxes on reinforced pallets with mill test certs.');
  const [dockRequirements, setDockRequirements] = useState(['Forklift on site', 'Gaylord boxed', 'Palletized']);

  if (!isOpen) return null;

  // Live Carbon calculation
  const weightKg = normalizeToKg(quantity, unit);
  const carbonSavings = calculateCarbonSavings(category, subTag, weightKg);

  const toggleDockReq = (req) => {
    if (dockRequirements.includes(req)) {
      setDockRequirements(dockRequirements.filter(r => r !== req));
    } else {
      setDockRequirements([...dockRequirements, req]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newListing = {
      title,
      category,
      subTag,
      quantity: Number(quantity),
      unit,
      qualityGrade,
      purityPercentage: Number(purityPercentage),
      contaminationFlags: [...dockRequirements, 'Lab Spec Certified'],
      urgencyLevel: 'Moderate (3-5 days)',
      urgencyText: 'Loading dock ready for freight carrier dispatch',
      isRecurring,
      recurrenceSchedule: isRecurring ? recurrenceSchedule : 'One-time lot',
      priceType,
      priceValue: priceType === 'Free' ? 0 : Number(priceValue),
      location: currentUser.location || {
        address: '4800 Industrial Way',
        city: 'Oakland, CA',
        lat: 37.7725,
        lng: -122.2144
      },
      availabilityWindow,
      photos: [
        category === 'Finished compost/fertilizer/biochar output'
          ? 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=600&auto=format&fit=crop&q=80'
      ],
      description
    };

    onListingCreated(newListing);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                Industrial Feedstock & Spec Sheet Creator
              </h2>
              <p className="text-xs text-slate-500">
                Detailed quality grades and recurring logistics for secondary manufacturing
              </p>
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
          
          {/* Category Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Material Sector</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900"
              >
                <option value="Industrial/Manufacturing waste">Industrial / Manufacturing waste</option>
                <option value="Finished compost/fertilizer/biochar output">Finished compost / fertilizer / biochar output</option>
                <option value="Organic/Food waste">Organic / Food waste (Bulk)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Feedstock Sub-Type</label>
              <select
                value={subTag}
                onChange={(e) => {
                  setSubTag(e.target.value);
                  setTitle(`${e.target.value} - Clean Secondary Feedstock`);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900"
              >
                {INDUSTRIAL_SUBTAGS.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Listing Title / Specification Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900"
              required
            />
          </div>

          {/* Quantity, Unit & Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Batch Volume</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 text-center"
                  required
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="px-2 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900"
                >
                  <option value="tons">tons</option>
                  <option value="kg">kg</option>
                  <option value="pallets">pallets</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Pricing Model</label>
              <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900"
              >
                <option value="For Sale">Sale ($ / unit)</option>
                <option value="Free">Free (Free to take)</option>
                <option value="Pay to remove">Pay Tipping Fee</option>
              </select>
            </div>

            {priceType !== 'Free' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Rate (${`/${unit}`})</label>
                <input
                  type="number"
                  value={priceValue}
                  onChange={(e) => setPriceValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-emerald-800"
                />
              </div>
            )}
          </div>

          {/* Quality Grade & Purity */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Purity & Lab Grade Standard
              </label>
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {purityPercentage}% Purity
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value)}
                placeholder="e.g. Mil-Spec 6061-T6, OMRI Organic"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900"
              />
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="80"
                  max="99.9"
                  step="0.1"
                  value={purityPercentage}
                  onChange={(e) => setPurityPercentage(e.target.value)}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            {/* EPA WARM Climate Offset Preview */}
            <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between">
              <span className="text-emerald-900 font-semibold flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Estimated CO₂e Offset:
              </span>
              <strong className="text-emerald-950 text-sm">
                {carbonSavings.toLocaleString()} kg CO₂e
              </strong>
            </div>
          </div>

          {/* Recurrence & Logistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Recurrence Model</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecurring(true)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isRecurring ? 'bg-purple-50 text-purple-900 border-purple-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  Recurring Supply
                </button>
                <button
                  type="button"
                  onClick={() => setIsRecurring(false)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    !isRecurring ? 'bg-purple-50 text-purple-900 border-purple-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  One-time Batch
                </button>
              </div>
            </div>

            {isRecurring && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Schedule Details</label>
                <input
                  type="text"
                  value={recurrenceSchedule}
                  onChange={(e) => setRecurrenceSchedule(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900"
                />
              </div>
            )}
          </div>

          {/* Loading Dock Requirements */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Loading Dock & Packaging Criteria
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['Forklift on site', 'Gaylord boxed', 'Palletized', 'Tipper accessible', 'Flatbed accessible'].map(req => {
                const isChecked = dockRequirements.includes(req);
                return (
                  <button
                    key={req}
                    type="button"
                    onClick={() => toggleDockReq(req)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
                      isChecked ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 text-amber-400" />}
                    {req}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Technical Spec & Chemistry Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900"
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-lg shadow-slate-900/20 flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Publish Industrial Feedstock Spec
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
