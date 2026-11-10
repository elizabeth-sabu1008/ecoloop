import React, { useState } from 'react';
import { X, UtensilsCrossed, Check } from 'lucide-react';
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
  'Non-Oily / Uncooked'
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
  const [notes, setNotes] = useState('Separated in sealed food-grade buckets at rear loading dock.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setTitle(preset.label);
  };

  const toggleFlag = (flag) => {
    setSelectedFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  const weightKg = normalizeToKg(quantity, unit);
  const carbonSavings = calculateCarbonSavings('Organic/Food waste', selectedPreset.tag, weightKg);
  const methaneAvoided = calculateMethaneAvoided('Organic/Food waste', selectedPreset.tag, weightKg);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await onListingCreated({
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
        availabilityWindow: 'Daily 4:00 PM - 9:00 PM',
        photos: [selectedPreset.defaultPhoto],
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
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Food Waste Listing
              </h2>
              <p className="text-[11px] text-slate-500">
                Posting from {currentUser.companyName}
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

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Stream Preset */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
              Organic Stream
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_ORGANIC_TYPES.map((preset) => {
                const isSelected = selectedPreset.tag === preset.tag;
                return (
                  <button
                    key={preset.tag}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2 rounded-lg text-left border transition-colors ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <p className="font-semibold text-xs truncate">{preset.label}</p>
                    <p className="text-[10px] text-slate-500 truncate">{preset.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Headline & Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-7">
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

            <div className="sm:col-span-5">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Weight
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="5"
                  max="10000"
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
                  <option value="kg">kg</option>
                  <option value="tons">tons</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>
          </div>

          {/* Urgency & Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsUrgent((prev) => !prev)}
                className={`flex-1 h-9 px-3 rounded-lg border text-xs font-semibold transition-colors ${
                  isUrgent
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {isUrgent ? '✓ Urgent (24h)' : 'Flexible Window'}
              </button>
              <button
                type="button"
                onClick={() => setIsRecurring((prev) => !prev)}
                className={`flex-1 h-9 px-3 rounded-lg border text-xs font-semibold transition-colors ${
                  isRecurring
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {isRecurring ? '✓ Recurring' : 'One-time'}
              </button>
            </div>

            <div>
              <input
                type="text"
                disabled={!isRecurring}
                value={isRecurring ? recurrenceSchedule : 'One-time pickup'}
                onChange={(e) => setRecurrenceSchedule(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 disabled:opacity-50 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Purity Checklist */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Compliance Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CONTAMINATION_OPTIONS.map((flag) => {
                const isChecked = selectedFlags.includes(flag);
                return (
                  <button
                    key={flag}
                    type="button"
                    onClick={() => toggleFlag(flag)}
                    className={`h-7 px-2.5 rounded-lg text-[11px] font-medium border flex items-center gap-1 transition-colors ${
                      isChecked
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3" />}
                    <span>{flag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Pickup Notes
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

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500">
              Est. <strong className="text-emerald-700">{carbonSavings.toLocaleString()} kg CO₂e</strong> •{' '}
              <strong className="text-amber-800">{methaneAvoided} kg CH₄</strong>
            </div>

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
                className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors"
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
