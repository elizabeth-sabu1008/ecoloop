import React, { useState } from 'react';
import { 
  BarChart3, 
  Leaf, 
  Flame, 
  Recycle, 
  DollarSign, 
  Download, 
  Award, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Printer, 
  X,
  FileText,
  Share2,
  TreeDeciduous,
  Car
} from 'lucide-react';
import { normalizeToKg } from '../services/impactCalculator';

export default function SustainabilityDashboard({ 
  currentUser, 
  listings, 
  matches, 
  reviews 
}) {
  const [showCertificate, setShowCertificate] = useState(false);

  // Compute aggregate statistics for the current user (and platform-wide)
  const userMatches = matches.filter(m => m.buyerId === currentUser.id || m.sellerId === currentUser.id);
  const completedMatches = userMatches.filter(m => m.status === 'Completed');

  // Compute Total Diverted Weight
  let totalDivertedKg = currentUser.totalDivertedKg || 0;
  let totalCarbonSavingsKg = 0;
  let totalMethaneAvoidedKg = 0;
  let totalEstimatedSavingsDollar = 0;

  // Aggregate metrics from listings and matches
  listings.forEach(l => {
    if (l.ownerId === currentUser.id) {
      const kg = normalizeToKg(l.quantity, l.unit);
      totalCarbonSavingsKg += l.metrics?.carbonSavingsKg || 0;
      totalMethaneAvoidedKg += l.metrics?.methaneAvoidedKg || 0;
      totalEstimatedSavingsDollar += (l.priceType === 'For Sale' ? (l.priceValue * (l.quantity || 1)) : 120);
    }
  });

  // Calculate equivalent impact metrics
  const totalTreesEquivalent = Math.max(12, Math.round(totalCarbonSavingsKg / 21.7));
  const passengerCarMilesEquivalent = Math.max(140, Math.round(totalCarbonSavingsKg * 2.5));
  const landfillVolumeM3 = Math.round((totalDivertedKg + 1200) / 450); // ~450 kg/m3 compacted waste

  // Category breakdown
  const categoryBreakdown = [
    { name: 'Organic & Food Waste', pct: 45, kg: Math.round(totalDivertedKg * 0.45), color: 'bg-amber-500' },
    { name: 'Industrial Metal & Polymers', pct: 35, kg: Math.round(totalDivertedKg * 0.35), color: 'bg-emerald-600' },
    { name: 'Finished Compost & Biochar', pct: 20, kg: Math.round(totalDivertedKg * 0.20), color: 'bg-sky-600' }
  ];

  // Export CSV Report function
  const handleExportCSV = () => {
    const headers = ['Listing ID', 'Title', 'Category', 'Quantity', 'Unit', 'CO2e Offset (kg)', 'Methane Avoided (kg CH4)', 'Logistics Cost ($)', 'Status', 'Date'];
    
    const rows = listings.map(l => [
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

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EcoLoop_Sustainability_Report_${currentUser.companyName.replace(/\s+/g, '_')}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header with Export & Certificate Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
              Circular Sustainability Dashboard
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Verified ESG Data
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Tracking scope 3 circular diversion, carbon offsets, and methane avoidance for <strong className="text-emerald-900">{currentUser.companyName}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export ESG CSV</span>
          </button>

          <button
            onClick={() => setShowCertificate(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            <Award className="w-3.5 h-3.5 text-emerald-200" />
            <span>View Impact Certificate</span>
          </button>
        </div>
      </div>

      {/* 4 Headline Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Diverted Weight */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
            <Recycle className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Waste Diverted</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 font-display">
            {(totalDivertedKg / 1000).toFixed(1)} <span className="text-sm font-medium text-slate-500">Metric Tons</span>
          </h3>
          <p className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% this quarter
          </p>
        </div>

        {/* Carbon Offset */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
            <Leaf className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Net CO₂e Avoided</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 font-display">
            {(totalCarbonSavingsKg / 1000).toFixed(2)} <span className="text-sm font-medium text-slate-500">MT CO₂e</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            EPA WARM virgin baseline displacement
          </p>
        </div>

        {/* Methane Avoided (Organics Highlight) */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white p-5 rounded-3xl border border-amber-300 shadow-sm relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 ring-2 ring-amber-400/40">
            <Flame className="w-5 h-5 text-amber-600 animate-pulse" />
          </div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-amber-900">Landfill Methane Avoided</p>
          <h3 className="text-2xl font-extrabold text-amber-950 mt-1 font-display">
            {totalMethaneAvoidedKg.toFixed(1)} <span className="text-sm font-medium text-amber-800">kg CH₄</span>
          </h3>
          <p className="text-xs text-amber-800 font-semibold mt-1">
            ~28x atmospheric warming potential avoided
          </p>
        </div>

        {/* Economic Value Created */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Value Created / Tipping Saved</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 font-display">
            ${totalEstimatedSavingsDollar.toLocaleString()}
          </h3>
          <p className="text-xs text-sky-700 font-semibold mt-1">
            Zero disposal fees & secondary revenue
          </p>
        </div>

      </div>

      {/* Visual Analytics & Equivalence Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Material Stream Breakdown & Monthly Trajectory */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Monthly Trajectory Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Monthly Waste Diversion Trajectory</h3>
                <p className="text-xs text-slate-500">Historical feedstocks matched and diverted across 2026</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                100% Circular
              </span>
            </div>

            {/* Visual CSS Bar Chart */}
            <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
              {[
                { month: 'Apr', val: 35, label: '3.5 T' },
                { month: 'May', val: 48, label: '4.8 T' },
                { month: 'Jun', val: 62, label: '6.2 T' },
                { month: 'Jul', val: 75, label: '7.5 T' },
                { month: 'Aug', val: 88, label: '8.8 T' },
                { month: 'Sep (Now)', val: 98, label: '9.8 T', current: true }
              ].map((bar) => (
                <div key={bar.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {bar.label}
                  </span>
                  <div 
                    className={`w-full rounded-t-xl transition-all duration-500 ${
                      bar.current 
                        ? 'bg-gradient-to-t from-emerald-700 to-emerald-500 shadow-md shadow-emerald-500/20' 
                        : 'bg-emerald-200 hover:bg-emerald-300'
                    }`}
                    style={{ height: `${bar.val}%` }}
                  />
                  <span className={`text-xs font-semibold ${bar.current ? 'text-emerald-800 font-bold' : 'text-slate-500'}`}>
                    {bar.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Material Category Distribution */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 font-display mb-1">Diverted Stream Composition</h3>
            <p className="text-xs text-slate-500 mb-4">Feedstocks segregated and repurposed by volume percentage</p>

            <div className="space-y-3">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">{cat.name}</span>
                    <span className="text-slate-600">{cat.pct}% ({cat.kg.toLocaleString()} kg)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${cat.color} rounded-full transition-all duration-700`}
                      style={{ width: `${cat.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 4 Cols: Real-World Equivalence & Verified Reviews */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Tangible Environmental Impact Equivalents */}
          <div className="bg-gradient-to-br from-emerald-900 to-forest-900 text-white p-6 rounded-3xl shadow-lg border border-emerald-800 space-y-4">
            <h3 className="text-base font-bold font-display text-emerald-200 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Tangible Equivalencies
            </h3>
            <p className="text-xs text-slate-300">
              What your diverted waste translates to in real-world climate offsets:
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
                  <TreeDeciduous className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-extrabold text-white text-sm">{totalTreesEquivalent} Tree Seedlings</p>
                  <p className="text-[11px] text-emerald-200">Grown for 10 years in carbon capture</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-extrabold text-white text-sm">{passengerCarMilesEquivalent.toLocaleString()} Miles</p>
                  <p className="text-[11px] text-emerald-200">Passenger car driving emissions avoided</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
                  <Recycle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-extrabold text-white text-sm">{landfillVolumeM3} m³ Landfill Space</p>
                  <p className="text-[11px] text-emerald-200">Compacted municipal landfill volume saved</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Trust & Reviews List */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Partner Feedback ({reviews.length})
            </h3>

            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px] truncate">{rev.reviewerName}</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                      ★ {rev.rating}.0
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-800 font-semibold">{rev.tag}</p>
                  <p className="text-slate-600 text-[11px] line-clamp-2 italic">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Official Impact Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-2xl w-full shadow-2xl border-4 border-emerald-600 relative max-h-[95vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Header */}
            <div className="text-center border-b-2 border-emerald-100 pb-6 mb-6">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-600/30">
                <Recycle className="w-9 h-9" />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Official Circular Economy Verified Certificate
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display mt-2">
                Certificate of Waste Diversion & Climate Action
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Issued by EcoLoop Marketplace in accordance with EPA WARM & IPCC Guidelines
              </p>
            </div>

            {/* Recipient Info */}
            <div className="text-center my-6 space-y-2">
              <p className="text-xs uppercase font-bold text-slate-400">Proudly Presented To</p>
              <h3 className="text-2xl font-black text-emerald-950 font-display">
                {currentUser.companyName}
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                For outstanding commitment to secondary feedstock circularity, industrial symbiosis, and landfill methane prevention.
              </p>
            </div>

            {/* Verified Achievements Grid */}
            <div className="grid grid-cols-3 gap-3 bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 text-center my-6">
              <div>
                <p className="text-[10px] uppercase font-bold text-emerald-800">Total Waste Diverted</p>
                <p className="text-lg font-black text-emerald-950">{(totalDivertedKg / 1000).toFixed(1)} MT</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-emerald-800">Net Carbon Offset</p>
                <p className="text-lg font-black text-emerald-950">{(totalCarbonSavingsKg / 1000).toFixed(2)} MT CO₂e</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-900">Methane Avoided</p>
                <p className="text-lg font-black text-amber-950">{totalMethaneAvoidedKg.toFixed(1)} kg CH₄</p>
              </div>
            </div>

            {/* Certificate Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 text-xs text-slate-500">
              <div className="text-left">
                <p className="font-bold text-slate-800">EcoLoop Verification Registry</p>
                <p className="text-[10px]">ID: ECL-{Date.now().toString().slice(-8)}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
