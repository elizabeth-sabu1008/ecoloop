import React, { useState } from 'react';
import { Truck, Navigation, Layers } from 'lucide-react';

export default function CircularFlowMap({ routes: apiRoutes = [] }) {
  const [selectedRoute, setSelectedRoute] = useState('route_organic_loop');

  const fallbackRoutes = [
    {
      id: 'route_organic_loop',
      title: 'Organic Loop (Compost & Biogas)',
      driver: 'BioLoop Fleet Truck #4',
      stops: [],
      efficiencyGainPct: 38,
      logisticsCostSavedDollar: 145,
      totalEmissionsSavedKg: 0
    }
  ];

  const routes = apiRoutes.length > 0 ? apiRoutes : fallbackRoutes;
  const activeRoute = routes.find((r) => r.id === selectedRoute) || routes[0];
  const previewStops = activeRoute.stops.slice(0, 3);
  const routeChain = activeRoute.stops.map((s) => s.name.split('(')[0].trim()).join(' → ') || 'No active stops';

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-3 h-full flex flex-col gap-3 min-h-0 overflow-y-auto lg:overflow-hidden">
      {/* Compact Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display">
            Circular Routes & Collection Bundling
          </h1>
          <p className="text-xs text-slate-500">
            Bundled regional pickups generated from active feedstock listings
          </p>
        </div>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
          {activeRoute.stops.length} Active Stops
        </span>
      </div>

      {/* Main Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7 Cols: Dynamic Live Schematic View */}
        <div className="lg:col-span-7 bg-slate-950 text-white rounded-2xl p-5 border border-slate-800 flex flex-col justify-between min-h-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                {activeRoute.title}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg text-xs text-slate-300 border border-slate-800">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>{activeRoute.stops.length} Nodes</span>
            </div>
          </div>

          <div className="my-4 space-y-4">
            {previewStops.length === 0 ? (
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
                No active listings found for this loop yet. Post a listing to add a collection stop.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {previewStops.map((stop, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      stop.type === 'facility'
                        ? 'bg-emerald-950 border-emerald-500/60'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <span
                      className={`text-[10px] uppercase font-bold ${
                        stop.type === 'facility' ? 'text-emerald-300' : 'text-amber-400'
                      }`}
                    >
                      {stop.type === 'facility' ? 'Processing Hub' : `Stop ${idx + 1}`}
                    </span>
                    <p className="font-bold text-white truncate">{stop.name}</p>
                    <p className="text-slate-300 text-[11px] truncate">{stop.action}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-300">
              <span className="flex items-center gap-2 font-semibold truncate max-w-md">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">{routeChain}</span>
              </span>
              <span className="font-semibold text-white bg-emerald-800 px-2 py-0.5 rounded text-[11px] shrink-0">
                +{activeRoute.efficiencyGainPct}% Route Efficiency
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-slate-800 pt-3">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Carrier</p>
              <p className="font-bold text-white text-xs sm:text-sm mt-0.5 truncate">{activeRoute.driver}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Carbon Offset</p>
              <p className="font-bold text-emerald-400 text-sm mt-0.5">
                {(activeRoute.totalEmissionsSavedKg / 1000).toFixed(1)} MT CO₂e
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Freight Saved</p>
              <p className="font-bold text-amber-300 text-sm mt-0.5">${activeRoute.logisticsCostSavedDollar}</p>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Route Selector & Stops */}
        <div className="lg:col-span-5 flex flex-col gap-3 min-h-0">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 shrink-0">
            {routes.map((route) => (
              <button
                key={route.id}
                type="button"
                onClick={() => setSelectedRoute(route.id)}
                className={`w-full p-3 rounded-xl text-left border transition-colors ${
                  selectedRoute === route.id
                    ? 'bg-emerald-50 border-emerald-500'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="font-bold text-xs text-slate-900 truncate">{route.title}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                    +{route.efficiencyGainPct}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {route.driver} • {route.stops.length} stops
                </p>
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-900 font-display flex items-center gap-1.5 shrink-0">
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>Stop-by-Stop Itinerary</span>
            </h3>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
              {activeRoute.stops.map((stop, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 text-white mt-0.5 ${
                      stop.type === 'facility'
                        ? 'bg-emerald-600'
                        : stop.type === 'farm'
                        ? 'bg-sky-600'
                        : 'bg-slate-800'
                    }`}
                  >
                    {idx + 1}
                  </div>

                  <div className="min-w-0 flex-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900 truncate">{stop.name}</p>
                      <span className="text-[10px] font-semibold text-emerald-700 shrink-0">
                        {stop.co2Saved}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{stop.action}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-semibold flex items-center justify-between shrink-0">
              <span>Total CO₂e Offset</span>
              <strong className="text-emerald-800">
                {activeRoute.totalEmissionsSavedKg.toLocaleString()} kg
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
