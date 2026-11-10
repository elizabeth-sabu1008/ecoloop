import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Calendar,
  Leaf,
  Wind,
  Star,
  Check
} from 'lucide-react';

const STATUS_STEPS = ['Proposed', 'Accepted', 'Scheduled', 'Completed'];

export default function MatchChatDrawer({
  currentUser,
  matches,
  activeMatchId,
  onSelectMatch,
  onSendMessage,
  onUpdateStatus,
  onOpenReviewModal,
  onOpenAuth
}) {
  const [inputText, setInputText] = useState('');
  const [pickupDateInput, setPickupDateInput] = useState('Friday, Sep 12 at 10:00 AM');
  const [showScheduleInput, setShowScheduleInput] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-3 h-full flex items-center justify-center">
        <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xs max-w-md w-full text-center">
          <MessageSquare className="w-9 h-9 text-emerald-600 mx-auto mb-2.5" />
          <h3 className="text-base font-bold text-slate-900 font-display">Sign In for Matches & Chats</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Sign in or create a free business account to negotiate pickup schedules and message partners.
          </p>
          <button
            type="button"
            onClick={onOpenAuth}
            className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
          >
            Sign In / Create Account
          </button>
        </div>
      </div>
    );
  }

  const userMatches = matches.filter(
    (m) => m.buyerId === currentUser.id || m.sellerId === currentUser.id
  );

  const currentMatch = userMatches.find((m) => m.id === activeMatchId) || userMatches[0];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !currentMatch) return;
    await onSendMessage(currentMatch.id, inputText.trim());
    setInputText('');
  };

  const handleAdvanceStatus = (newStatus, schedule = null) => {
    if (!currentMatch) return;

    if (newStatus === 'Completed') {
      confetti({
        particleCount: 80,
        spread: 70,
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
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-3 h-full flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs max-w-md w-full text-center">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 font-display">No Active Matches</h3>
          <p className="text-xs text-slate-500 mt-1">
            Select Match & Connect on the Waste Match Deck or Listings tab to initiate negotiations.
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
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-3 h-full flex flex-col min-h-0">
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Sidebar: Match List */}
        <div className="md:col-span-4 border-r border-slate-200 bg-slate-50/60 flex flex-col min-h-0">
          <div className="p-3.5 border-b border-slate-200 bg-white shrink-0">
            <h2 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Matches ({userMatches.length})</span>
            </h2>
            <p className="text-[11px] text-slate-500">Logistics & schedule coordination</p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100">
            {userMatches.map((m) => {
              const isActive = m.id === currentMatch?.id;
              const isMatchSeller = m.sellerId === currentUser.id;
              const otherParty = isMatchSeller ? m.buyerCompany : m.sellerCompany;

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectMatch(m.id)}
                  className={`w-full p-3 text-left transition-colors flex items-start gap-2.5 ${
                    isActive
                      ? 'bg-emerald-50 border-l-4 border-emerald-600'
                      : 'hover:bg-slate-100/70'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-[11px] ${
                      isActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {m.matchScore}%
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-xs font-bold text-slate-900 truncate">{otherParty}</p>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 shrink-0">
                        {m.status}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-emerald-800 truncate">
                      {m.listingTitle}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {m.messages?.[m.messages.length - 1]?.text || 'Negotiation started'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Chat & Lifecycle Pane */}
        <div className="md:col-span-8 flex flex-col min-h-0 bg-white">
          {/* Header & Progress Bar */}
          <div className="p-3.5 border-b border-slate-200 bg-white shrink-0 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{partnerCompany}</h3>
                  <span className="text-[11px] text-slate-500">({partnerName})</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {currentMatch.matchScore}% Match
                  </span>
                </div>
                <p className="text-xs text-slate-600 truncate">
                  {currentMatch.listingTitle} • <strong>{currentMatch.listingQuantity}</strong>
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="flex items-center gap-1 bg-slate-50 text-emerald-800 font-semibold px-2 py-1 rounded-lg border border-slate-200">
                  <Leaf className="w-3 h-3 text-emerald-600" />
                  {currentMatch.estimatedCarbonSavingsKg} kg CO₂e
                </span>
                {currentMatch.estimatedMethaneSavingsKg > 0 && (
                  <span className="flex items-center gap-1 bg-slate-50 text-amber-900 font-semibold px-2 py-1 rounded-lg border border-slate-200">
                    <Wind className="w-3 h-3 text-amber-600" />
                    {currentMatch.estimatedMethaneSavingsKg} kg CH₄
                  </span>
                )}
              </div>
            </div>

            {/* Compact Status Stepper */}
            <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px]">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  return (
                    <div key={step} className="flex items-center gap-1.5">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-slate-400 border border-slate-300'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className={isDone ? 'font-semibold text-slate-900' : 'text-slate-400'}>
                        {step}
                      </span>
                      {idx < STATUS_STEPS.length - 1 && <span className="text-slate-300">/</span>}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  Pickup: <strong className="text-slate-800">{currentMatch.pickupSchedule}</strong>
                </span>

                {currentMatch.status === 'Proposed' && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus('Accepted')}
                    className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accept</span>
                  </button>
                )}

                {currentMatch.status === 'Accepted' && !showScheduleInput && (
                  <button
                    type="button"
                    onClick={() => setShowScheduleInput(true)}
                    className="h-7 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule Pickup</span>
                  </button>
                )}

                {showScheduleInput && (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={pickupDateInput}
                      onChange={(e) => setPickupDateInput(e.target.value)}
                      className="h-7 px-2 bg-white border border-slate-300 rounded-md text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAdvanceStatus('Scheduled', pickupDateInput)}
                      className="h-7 px-2.5 bg-emerald-600 text-white font-semibold rounded-md text-[11px] hover:bg-emerald-700"
                    >
                      Save
                    </button>
                  </div>
                )}

                {currentMatch.status === 'Scheduled' && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus('Completed')}
                    className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Complete</span>
                  </button>
                )}

                {currentMatch.status === 'Completed' && (
                  <button
                    type="button"
                    onClick={() => onOpenReviewModal(currentMatch)}
                    className="h-7 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold text-[11px] flex items-center gap-1"
                  >
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>Review</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-2.5 bg-slate-50/40">
            {currentMatch.messages?.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5 px-1">
                    <span className="font-semibold text-slate-600">{msg.senderName}</span>
                    <span>•</span>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div
                    className={`px-3 py-2 rounded-xl max-w-md text-xs leading-relaxed ${
                      isMe
                        ? 'bg-emerald-700 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${partnerCompany}...`}
              className="flex-1 h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
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
