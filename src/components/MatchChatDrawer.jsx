import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Calendar, 
  Leaf, 
  Flame, 
  Star, 
  Sparkles, 
  ShieldCheck, 
  X, 
  ArrowRight,
  ChevronRight,
  DollarSign
} from 'lucide-react';

const STATUS_STEPS = ['Proposed', 'Accepted', 'Scheduled', 'Completed'];

export default function MatchChatDrawer({ 
  currentUser, 
  matches, 
  activeMatchId, 
  onSelectMatch, 
  onSendMessage, 
  onUpdateStatus, 
  onOpenReviewModal 
}) {
  const [inputText, setInputText] = useState('');
  const [pickupDateInput, setPickupDateInput] = useState('Friday, Sep 12 at 10:00 AM');
  const [showScheduleInput, setShowScheduleInput] = useState(false);

  // Filter matches related to current user
  const userMatches = matches.filter(m => 
    m.buyerId === currentUser.id || m.sellerId === currentUser.id
  );

  const currentMatch = userMatches.find(m => m.id === activeMatchId) || userMatches[0];

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !currentMatch) return;

    onSendMessage(currentMatch.id, currentUser, inputText.trim());
    setInputText('');
  };

  const handleAdvanceStatus = (newStatus, schedule = null) => {
    if (!currentMatch) return;

    if (newStatus === 'Completed') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
      onUpdateStatus(currentMatch.id, 'Completed');
      onOpenReviewModal(currentMatch);
    } else {
      onUpdateStatus(currentMatch.id, newStatus, schedule);
    }
    setShowScheduleInput(false);
  };

  if (userMatches.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm max-w-md mx-auto">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 font-display">No Matches Yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Swipe right on the Circular Match Deck or click "Match & Chat" on any listing to initiate negotiations.
          </p>
        </div>
      </div>
    );
  }

  const isSeller = currentMatch?.sellerId === currentUser.id;
  const partnerName = isSeller ? currentMatch?.buyerName : currentMatch?.sellerName;
  const partnerCompany = isSeller ? currentMatch?.buyerCompany : currentMatch?.sellerCompany;
  const currentStepIdx = STATUS_STEPS.indexOf(currentMatch?.status || 'Proposed');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Container with Sidebar + Chat */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px]">
        
        {/* Left Sidebar: List of Matches */}
        <div className="md:col-span-4 border-r border-slate-200 bg-slate-50/50 flex flex-col">
          
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Active Feedstock Matches ({userMatches.length})
            </h2>
            <p className="text-xs text-slate-500">Negotiate terms, timing & logistics</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {userMatches.map((m) => {
              const isActive = m.id === currentMatch?.id;
              const isMatchSeller = m.sellerId === currentUser.id;
              const otherParty = isMatchSeller ? m.buyerCompany : m.sellerCompany;

              return (
                <button
                  key={m.id}
                  onClick={() => onSelectMatch(m.id)}
                  className={`w-full p-3.5 text-left transition-all flex items-start gap-3 ${
                    isActive 
                      ? 'bg-emerald-50/90 border-l-4 border-emerald-600 shadow-xs' 
                      : 'hover:bg-slate-100/80'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-xs ${
                    isActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {m.matchScore}%
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-xs font-bold text-slate-900 truncate">{otherParty}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                        m.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        m.status === 'Scheduled' ? 'bg-purple-100 text-purple-800' :
                        m.status === 'Accepted' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold text-emerald-800 truncate">{m.listingTitle}</p>
                    <p className="text-[10px] text-slate-500 mt-1 truncate">
                      {m.messages?.[m.messages.length - 1]?.text || 'Negotiation started'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* Right Chat & Lifecycle Area */}
        <div className="md:col-span-8 flex flex-col bg-white">
          
          {/* Match Header with Status Flow */}
          <div className="p-4 border-b border-slate-200 bg-white">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{partnerCompany}</h3>
                  <span className="text-[11px] font-medium text-slate-500">({partnerName})</span>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {currentMatch.matchScore}% Match Score
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Feedstock: <strong>{currentMatch.listingTitle}</strong> ({currentMatch.listingQuantity})
                </p>
              </div>

              {/* Climate Impact Mini Summary */}
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-200">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  {currentMatch.estimatedCarbonSavingsKg} kg CO₂e
                </span>
                {currentMatch.estimatedMethaneSavingsKg > 0 && (
                  <span className="flex items-center gap-1 bg-amber-50 text-amber-900 font-bold px-2.5 py-1 rounded-lg border border-amber-200">
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                    {currentMatch.estimatedMethaneSavingsKg} kg CH₄
                  </span>
                )}
              </div>
            </div>

            {/* Lifecycle Status Progression Bar */}
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between relative">
                
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-200 -translate-y-1/2 z-0" />
                <div 
                  className="absolute top-1/2 left-4 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-300"
                  style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 90}%` }}
                />

                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={step} className="flex flex-col items-center relative z-10">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                        isDone 
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm' 
                          : 'bg-white text-slate-400 border-2 border-slate-300'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className={`text-[10px] font-bold mt-1 ${isCurrent ? 'text-emerald-800' : 'text-slate-500'}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Status Action Buttons */}
              <div className="mt-3 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="text-slate-600">
                  <span>Schedule: </span>
                  <strong className="text-slate-900">{currentMatch.pickupSchedule}</strong>
                </div>

                <div className="flex items-center gap-2">
                  {currentMatch.status === 'Proposed' && (
                    <button
                      onClick={() => handleAdvanceStatus('Accepted')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Accept Feedstock Partnership
                    </button>
                  )}

                  {currentMatch.status === 'Accepted' && !showScheduleInput && (
                    <button
                      onClick={() => setShowScheduleInput(true)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Schedule Pickup Time
                    </button>
                  )}

                  {showScheduleInput && (
                    <div className="flex items-center gap-1.5 animate-in fade-in">
                      <input
                        type="text"
                        value={pickupDateInput}
                        onChange={(e) => setPickupDateInput(e.target.value)}
                        className="px-2.5 py-1 bg-white border border-purple-300 rounded-lg text-xs"
                      />
                      <button
                        onClick={() => handleAdvanceStatus('Scheduled', pickupDateInput)}
                        className="px-2.5 py-1 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700"
                      >
                        Confirm Schedule
                      </button>
                    </div>
                  )}

                  {currentMatch.status === 'Scheduled' && (
                    <button
                      onClick={() => handleAdvanceStatus('Completed')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Mark Picked Up & Diverted (Complete)
                    </button>
                  )}

                  {currentMatch.status === 'Completed' && (
                    <button
                      onClick={() => onOpenReviewModal(currentMatch)}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      Leave Verified Review
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40 max-h-[380px]">
            {currentMatch.messages?.map((msg) => {
              const isMe = msg.senderId === currentUser.id;

              return (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5 px-1">
                    <span className="font-semibold text-slate-700">{msg.senderName}</span>
                    <span>•</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed shadow-xs ${
                    isMe 
                      ? 'bg-emerald-700 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${partnerCompany} regarding pickup, purity specs, or terms...`}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
