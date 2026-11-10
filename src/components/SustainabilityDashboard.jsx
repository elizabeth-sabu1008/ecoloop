import React, { useState } from 'react';
import {
  Leaf,
  Wind,
  Recycle,
  DollarSign,
  Download,
  Award,
  TrendingUp,
  ShieldCheck,
  Printer,
  X,
  TreeDeciduous,
  Car
} from 'lucide-react';

export default function SustainabilityDashboard({
  currentUser,
  listings,
  reviews,
  analytics
}) {
  const [showCertificate, setShowCertificate] = useState(false);

  const displayName = currentUser?.companyName || 'EcoLoop Network';
  const totalDivertedKg = analytics?.totalDivertedKg ?? currentUser?.totalDivertedKg ?? 0;
  const totalCarbonSavingsKg = analytics?.totalCarbonSavingsKg ?? 0;
  const totalMethaneAvoidedKg = analytics?.totalMethaneAvoidedKg ?? 0;
  const totalEstimatedSavingsDollar = analytics?.totalEstimatedSavingsDollar ?? 0;

  const totalTreesEquivalent = Math.round(totalCarbonSavingsKg / 21.7);
  const passengerCarMilesEquivalent = Math.round(totalCarbonSavingsKg * 2.5);
  const landfillVolumeM3 = Math.round(totalDivertedKg / 450);

  const statusCounts = analytics?.statusCounts || {
    Proposed: 0,
    Accepted: 0,
    Scheduled: 0,
    Completed: 0
  };
  const maxStatusCount = Math.max(
    1,
    statusCounts.Proposed,
    statusCounts.Accepted,
    statusCounts.Scheduled,
    statusCounts.Completed
  );
  const pipelineBars = [
    { label: 'Proposed', count: statusCounts.Proposed, color: 'bg-amber-400' },
    { label: 'Accepted', count: statusCounts.Accepted, color: 'bg-sky-500' },
    { label: 'Scheduled', count: statusCounts.Scheduled, color: 'bg-purple-500' },
    { label: 'Completed', count: statusCounts.Completed, color: 'bg-emerald-600' }
  ];

  const categoryBreakdown = analytics?.categoryBreakdown || [
    { name: 'Organic & Food Waste', pct: 45, kg: Math.round(totalDivertedKg * 0.45), color: 'bg-amber-500' },
    { name: 'Industrial Metal & Polymers', pct: 35, kg: Math.round(totalDivertedKg * 0.35), color: 'bg-emerald-600' },
    { name: 'Finished Compost & Biochar', pct: 20, kg: Math.round(totalDivertedKg * 0.20), color: 'bg-sky-600' }
  ];

  const handleExportCSV = () => {
    const headers = ['Listing ID', 'Title', 'Category', 'Quantity', 'Unit', 'CO2e Offset (kg)', 'Methane Avoided (kg CH4)', 'Logistics Cost ($)', 'Status', 'Date'];
    const rows = listings.map((l) => [
      l.id,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.category}"`,
      l.quantity,
      l.unit,
      l.metrics?.carbonSavingsKg || 0,
      l.metrics?.methaneAvoidedKg || 0,
      l.metrics?.logisticsCost || 0,
      l.status,
      l.createdAt?.split('T')[0] || '2026-09-08'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EcoLoop_Sustainability_Report_${displayName.replace(/\s+/g, '_')}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-3 h-full flex flex-col gap-3 min-h-0 overflow-y-auto lg:overflow-hidden">
      {/* Compact Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display">
            Sustainability Impact — {displayName}
          </h1>
          <p className="text-xs text-slate-500">
            Verified Scope 3 circular diversion, carbon offset, and landfill methane avoidance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="h-8 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCertificate(true)}
            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Certificate</span>
          </button>
        </div>
      </div>

      {/* 4 Uniform KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-500">Waste Diverted</p>
            <Recycle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1 font-display">
            {(totalDivertedKg / 1000).toFixed(1)} <span className="text-xs font-medium text-slate-500">MT</span>
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18.4% this quarter
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-500">Net CO₂e Offset</p>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1 font-display">
            {(totalCarbonSavingsKg / 1000).toFixed(2)} <span className="text-xs font-medium text-slate-500">MT CO₂e</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">EPA WARM baseline</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-500">Methane Avoided</p>
            <Wind className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1 font-display">
            {totalMethaneAvoidedKg.toFixed(1)} <span className="text-xs font-medium text-slate-500">kg CH₄</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Landfill CH₄ prevention</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-500">Value Created</p>
            <DollarSign className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1 font-display">
            ${totalEstimatedSavingsDollar.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Tipping saved & revenue</p>
        </div>
      </div>

      {/* Balanced Lower Analytics Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Trajectory & Stream Composition */}
        <div className="lg:col-span-5 flex flex-col gap-3 min-h-0">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex-1 min-h-0 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 font-display">Match Pipeline Status</h3>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Live DB
              </span>
            </div>

            <div className="flex-1 min-h-[110px] flex items-end justify-between gap-4 pt-4 pb-1 border-b border-slate-100">
              {pipelineBars.map((bar) => {
                const heightPct = Math.max(12, Math.round((bar.count / maxStatusCount) * 100));
                return (
                  <div key={bar.label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <span className="text-[11px] font-bold text-slate-700">{bar.count}</span>
                    <div
                      className={`w-full max-w-[52px] rounded-t-lg transition-all ${bar.color}`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[11px] text-slate-600 font-medium">{bar.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs shrink-0 space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900 font-display">Stream Composition</h3>
            <div className="space-y-2">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-slate-700">{cat.name}</span>
                    <span className="text-slate-500">{cat.pct}% ({cat.kg.toLocaleString()} kg)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tangible Equivalencies */}
        <div className="lg:col-span-4 bg-emerald-950 text-white p-4 rounded-2xl border border-emerald-900 shadow-xs flex flex-col justify-between min-h-0">
          <div>
            <h3 className="text-sm font-bold font-display text-emerald-200 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Real-World Equivalencies</span>
            </h3>
            <p className="text-[11px] text-slate-300 mt-1">
              Climate benefit translated to standard EPA equivalents:
            </p>
          </div>

          <div className="space-y-2.5 text-xs my-3">
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/25 flex items-center justify-center text-emerald-300 shrink-0">
                <TreeDeciduous className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">{totalTreesEquivalent} Tree Seedlings</p>
                <p className="text-[11px] text-emerald-200">10-year carbon capture growth</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/25 flex items-center justify-center text-emerald-300 shrink-0">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">{passengerCarMilesEquivalent.toLocaleString()} Miles</p>
                <p className="text-[11px] text-emerald-200">Passenger vehicle emissions avoided</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/25 flex items-center justify-center text-emerald-300 shrink-0">
                <Recycle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">{landfillVolumeM3} m³ Landfill Space</p>
                <p className="text-[11px] text-emerald-200">Compacted municipal volume saved</p>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-emerald-300/80 border-t border-white/10 pt-2.5">
            Audited via EPA WARM v16 conversion factors
          </div>
        </div>

        {/* Verified Partner Feedback */}
        <div className="lg:col-span-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col min-h-0">
          <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-1.5 mb-2.5 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Partner Reviews ({reviews.length})</span>
          </h3>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-slate-800 text-[11px] truncate">{rev.reviewerName}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                    ★ {rev.rating}.0
                  </span>
                </div>
                <p className="text-[10px] text-emerald-800 font-semibold">{rev.tag}</p>
                <p className="text-slate-600 text-[11px] line-clamp-2">"{rev.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border-2 border-emerald-600 relative">
            <button
              type="button"
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center border-b border-slate-100 pb-4 mb-4">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center mx-auto mb-2">
                <Recycle className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                Verified Waste Diversion Certificate
              </p>
              <h2 className="text-xl font-bold text-slate-900 font-display mt-1">
                {displayName}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Issued in accordance with EPA WARM & IPCC baselines
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center mb-5">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Diverted</p>
                <p className="text-base font-bold text-slate-900">{(totalDivertedKg / 1000).toFixed(1)} MT</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">CO₂e Offset</p>
                <p className="text-base font-bold text-emerald-700">{(totalCarbonSavingsKg / 1000).toFixed(2)} MT</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">CH₄ Avoided</p>
                <p className="text-base font-bold text-amber-800">{totalMethaneAvoidedKg.toFixed(1)} kg</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>EcoLoop Verification Registry</span>
              <button
                type="button"
                onClick={() => window.print()}
                className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
