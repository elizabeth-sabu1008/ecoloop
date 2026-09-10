import React, { useState } from 'react';
import { 
  MapPin, 
  Truck, 
  Sparkles, 
  Leaf, 
  Flame, 
  ArrowRight, 
  CheckCircle2, 
  Navigation,
  Layers,
  Zap
} from 'lucide-react';

export default function CircularFlowMap({ users, listings }) {
  const [selectedRoute, setSelectedRoute] = useState('route_organic_loop');

  const routes = [
    {
      id: 'route_organic_loop',
      title: 'Optimal Organic Loop (Compost & Biogas Bundle)',
      driver: 'BioLoop Fleet Truck #4',
      stops: [
        { name: 'GreenFork Bistro (SF)', action: 'Pickup 340kg Prep Scraps + 160kg Grounds', type: 'generator', co2Saved: '448 kg' },
        { name: 'FreshCoast Brewery (Berkeley)', action: 'Pickup 2.8 Tons Spent Malt Mash', type: 'generator', co2Saved: '3,100 kg' },
        { name: 'BioLoop Organics Facility (Brisbane)', action: 'Discharge into Anaerobic Beds', type: 'facility', co2Saved: '3,548 kg' },
        { name: 'Valley Bloom Nursery (Sonoma)', action: 'Deliver 14 Tons Cured Compost', type: 'farm', co2Saved: '6,720 kg' }
      ],
      efficiencyGainPct: 38,
      logisticsCostSavedDollar: 145,
      totalEmissionsSavedKg: 13816
    },
    {
      id: 'route_industrial_metal',
      title: 'Secondary Polymer & Industrial Loop',
      driver: 'Pacific Logistics Carrier #12',
      stops: [
        { name: 'Apex Precision CNC (Oakland)', action: 'Pickup 920kg Clean HDPE Regrind', type: 'generator', co2Saved: '1,978 kg' },
        { name: 'Pacific Polymer Recyclers (San Leandro)', action: 'Extrude Circular Resin Pellets', type: 'facility', co2Saved: '1,978 kg' }
      ],
      efficiencyGainPct: 24,
      logisticsCostSavedDollar: 85,
      totalEmissionsSavedKg: 3956
    }
  ];

  const activeRoute = routes.find(r => r.id === selectedRoute) || routes[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            Regional Circular Routes & Collection Bundling
          </h1>
          <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
            Route Optimizer AI
          </span>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          Bundles nearby generator pickups into unified collection runs to minimize diesel freight miles and transit costs.
        </p>
      </div>

      {/* Main Grid: Visual Map View + Route Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Interactive Node Network Schematic */}
        <div className="lg:col-span-7 bg-slate-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[460px]">
          
          {/* Top Bar on Map */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Bay Area Regional Feedstock Flow
              </span>
            </div>
            <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-xl text-xs text-slate-300 border border-slate-700">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>5 Active Nodes</span>
            </div>
          </div>

          {/* Interactive Visual Network Diagram */}
          <div className="relative my-8 z-10">
            <div className="grid grid-cols-3 gap-4">
              
              {/* Node 1: GreenFork */}
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-emerald-500/40 shadow-lg text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950/60 px-2 py-0.2 rounded border border-amber-500/30">
                  Restaurant Generator
                </span>
                <p className="font-bold text-white text-sm">GreenFork Bistro</p>
                <p className="text-slate-400 text-[11px]">San Francisco • 500kg/day</p>
              </div>

              {/* Node 2: BioLoop Composting Central Hub */}
              <div className="bg-emerald-950/90 p-4 rounded-2xl border-2 border-emerald-400 shadow-xl shadow-emerald-500/10 text-xs space-y-1 col-span-1 ring-4 ring-emerald-500/20">
                <span className="text-[10px] uppercase font-bold text-emerald-300 bg-emerald-900/80 px-2 py-0.2 rounded">
                  Central Composting Hub
                </span>
                <p className="font-extrabold text-white text-base">BioLoop Organics</p>
                <p className="text-emerald-200 text-[11px]">Brisbane Facility (Aerobic + Biogas)</p>
              </div>

              {/* Node 3: Valley Bloom Farm */}
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-sky-500/40 shadow-lg text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-950/60 px-2 py-0.2 rounded border border-sky-500/30">
                  Soil Nutrients Buyer
                </span>
                <p className="font-bold text-white text-sm">Valley Bloom Nursery</p>
                <p className="text-slate-400 text-[11px]">Sonoma • 14 Tons Demand</p>
              </div>

            </div>

            {/* Connecting Flow Lines Animation */}
            <div className="my-4 bg-emerald-950/40 p-3 rounded-2xl border border-emerald-800/40 flex items-center justify-between text-xs text-emerald-300">
              <span className="flex items-center gap-1.5 font-bold">
                <Truck className="w-4 h-4 text-emerald-400 animate-bounce" />
                Collection Run: SF &rarr; Berkeley &rarr; Brisbane &rarr; Sonoma
              </span>
              <span className="font-extrabold text-white bg-emerald-800 px-2 py-0.5 rounded-md text-[11px]">
                38% Less Carbon vs Separate Runs
              </span>
            </div>
          </div>

          {/* Bottom Live Telemetry */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-slate-800 pt-4 z-10">
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold">Total Route Distance</p>
              <p className="font-extrabold text-white text-sm">64.2 km</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold">Freight Carbon Saved</p>
              <p className="font-extrabold text-emerald-400 text-sm">13.8 MT CO₂e</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold">Driver Efficiency</p>
              <p className="font-extrabold text-amber-300 text-sm">+38% Optimized</p>
            </div>
          </div>

        </div>

        {/* Right 5 Cols: Multi-Stop Collection Run Selector & Stop Schedule */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Route Selector Cards */}
          <div className="space-y-2">
            {routes.map((route) => (
              <button
                key={route.id}
                onClick={() => setSelectedRoute(route.id)}
                className={`w-full p-4 rounded-2xl text-left border transition-all ${
                  selectedRoute === route.id 
                    ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm' 
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900">{route.title}</span>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    +{route.efficiencyGainPct}% Efficiency
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{route.driver} • ${route.logisticsCostSavedDollar} Logistics Saved</p>
              </button>
            ))}
          </div>

          {/* Stop-by-Stop Itinerary */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-600" />
              Optimized Stop-by-Stop Run
            </h3>

            <div className="space-y-3">
              {activeRoute.stops.map((stop, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs relative">
                  
                  {/* Step Pin */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[10px] shrink-0 text-white ${
                    stop.type === 'facility' ? 'bg-emerald-600 ring-4 ring-emerald-100' :
                    stop.type === 'farm' ? 'bg-sky-600' : 'bg-slate-800'
                  }`}>
                    {idx + 1}
                  </div>

                  <div className="min-w-0 flex-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-bold text-slate-900">{stop.name}</p>
                      <span className="text-[10px] font-semibold text-emerald-700">{stop.co2Saved} saved</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{stop.action}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-semibold flex items-center justify-between">
              <span>Total Run Diversion Impact:</span>
              <strong className="text-emerald-800">{activeRoute.totalEmissionsSavedKg.toLocaleString()} kg CO₂e Offset</strong>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
