import React, { useState } from 'react';
import { X, Factory, Check } from 'lucide-react';
import { calculateCarbonSavings, normalizeToKg } from '../services/impactCalculator';

const MATERIAL_OPTIONS = [
  { label: 'Aluminum Scraps', subTag: 'Metal Scraps - Aluminum', category: 'Industrial/Manufacturing waste' },
  { label: 'Steel / Iron Scraps', subTag: 'Metal Scraps - Steel/Iron', category: 'Industrial/Manufacturing waste' },
  { label: 'HDPE Regrind', subTag: 'Plastics - HDPE Regrind', category: 'Industrial/Manufacturing waste' },
  { label: 'PET Flakes', subTag: 'Plastics - PET Flakes', category: 'Industrial/Manufacturing waste' },
  { label: 'Textile Offcuts', subTag: 'Textile Offcuts - Cotton/Polyester', category: 'Industrial/Manufacturing waste' },
  { label: 'Clean Timber / Pallets', subTag: 'Wood / Clean Timber Pallets', category: 'Industrial/Manufacturing waste' },
  { label: 'Chemical / Mineral Byproducts', subTag: 'Chemical / Mineral Byproducts', category: 'Industrial/Manufacturing waste' },
  { label: 'Certified Organic Compost', subTag: 'Certified Organic Compost', category: 'Finished compost/fertilizer/biochar output' },
  { label: 'Biochar Soil Amendment', subTag: 'Biochar Enhanced Soil Amendment', category: 'Finished compost/fertilizer/biochar output' }
];

const QUALITY_GRADES = [
  { label: 'Grade A (99%+ Pure)', purity: 99.2 },
  { label: 'Industrial Standard (95%+)', purity: 96.0 },
  { label: 'Clean Segregated Scrap (90%+)', purity: 92.0 },
  { label: 'Certified Compost / Biochar', purity: 98.0 }
];

const HANDLING_OPTIONS = ['Palletized', 'Gaylord boxed', 'Forklift on site'];

export default function DetailedIndustrialListingModal({
  currentUser,
  isOpen,
  onClose,
  onListingCreated
}) {
  const [selectedMaterial, setSelectedMaterial] = useState(MATERIAL_OPTIONS[0]);
  const [title, setTitle] = useState('Aluminum Scraps - Segregated Lot');
  const [quantity, setQuantity] = useState(2.5);
  const [unit, setUnit] = useState('tons');
  const [priceType, setPriceType] = useState('For Sale');
  const [priceValue, setPriceValue] = useState(650);
  const [frequency, setFrequency] = useState('Bi-weekly');
  const [selectedGrade, setSelectedGrade] = useState(QUALITY_GRADES[0]);
  const [handling, setHandling] = useState(['Palletized', 'Forklift on site']);
  const [notes, setNotes] = useState('Segregated post-industrial material ready for pickup during standard weekday dock hours.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const weightKg = normalizeToKg(quantity, unit);
  const carbonSavings = calculateCarbonSavings(selectedMaterial.category, selectedMaterial.subTag, weightKg);

  const toggleHandling = (item) => {
    setHandling((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const isRecurring = frequency !== 'One-time';

    try {
      await onListingCreated({
        title,
        category: selectedMaterial.category,
        subTag: selectedMaterial.subTag,
        quantity: Number(quantity),
        unit,
        qualityGrade: selectedGrade.label,
        purityPercentage: selectedGrade.purity,
        contaminationFlags: handling,
        urgencyLevel: 'Moderate (3-5 days)',
        urgencyText: 'Ready for carrier dispatch',
        isRecurring,
        recurrenceSchedule: isRecurring ? `${frequency} schedule` : 'One-time lot',
        priceType,
        priceValue: priceType === 'Free' ? 0 : Number(priceValue),
        location: currentUser.location || {
          address: '4800 Industrial Way',
          city: 'Oakland, CA',
          lat: 37.7725,
          lng: -122.2144
        },
        availabilityWindow: 'Mon–Fri 8:00 AM – 4:00 PM',
        photos: [
          selectedMaterial.category === 'Finished compost/fertilizer/biochar output'
            ? 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=600&auto=format&fit=crop&q=80'
        ],
        description: notes
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to publish listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl p-5 max-w-lg w-full shadow-xl border border-slate-200">
        {/* Minimal Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Factory className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Industrial Spec
              </h2>
              <p className="text-[11px] text-slate-500">
                Publish surplus industrial feedstock
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Row 1: Material & Volume */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Material Type
              </label>
              <select
                value={selectedMaterial.subTag}
                onChange={(e) => {
                  const found = MATERIAL_OPTIONS.find((m) => m.subTag === e.target.value);
                  if (found) {
                    setSelectedMaterial(found);
                    setTitle(`${found.label} - Segregated Lot`);
                  }
                }}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
              >
                {MATERIAL_OPTIONS.map((m) => (
                  <option key={m.subTag} value={m.subTag}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Quantity
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                  required
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="h-9 px-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="tons">tons</option>
                  <option value="kg">kg</option>
                  <option value="pallets">pallets</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: Listing Title */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Listing Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Row 3: Pricing & Frequency */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Pricing
              </label>
              <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value)}
                className="w-full h-9 px-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
              >
                <option value="For Sale">For Sale</option>
                <option value="Free">Free Pickup</option>
                <option value="Pay to remove">Tipping Fee</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Rate (${`/${unit}`})
              </label>
              <input
                type="number"
                disabled={priceType === 'Free'}
                value={priceType === 'Free' ? 0 : priceValue}
                onChange={(e) => setPriceValue(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-slate-50 disabled:opacity-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full h-9 px-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
              >
                <option value="One-time">One-time</option>
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </div>

          {/* Row 4: Quality & Handling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Quality Grade
              </label>
              <select
                value={selectedGrade.label}
                onChange={(e) => {
                  const found = QUALITY_GRADES.find((g) => g.label === e.target.value);
                  if (found) setSelectedGrade(found);
                }}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
              >
                {QUALITY_GRADES.map((g) => (
                  <option key={g.label} value={g.label}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Handling
              </label>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {HANDLING_OPTIONS.map((opt) => {
                  const active = handling.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleHandling(opt)}
                      className={`h-8 px-2.5 rounded-lg text-[11px] font-medium border flex items-center gap-1 transition-colors ${
                        active
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {active && <Check className="w-3 h-3" />}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 5: Minimal Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Specification & Pickup Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {error && (
            <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Minimal Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500">
              Est. offset:{' '}
              <strong className="text-emerald-700">{carbonSavings.toLocaleString()} kg CO₂e</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-3.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs transition-colors"
              >
                {submitting ? 'Publishing...' : 'Publish Listing'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
