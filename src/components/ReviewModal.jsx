import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Star, X, Sparkles, ShieldCheck, Check } from 'lucide-react';

const REVIEW_TAGS = [
  'Pristine Organic Feedstock',
  'Punctual 24h Pickup',
  'Accurate Alloy Specs',
  'Clean Packaging-Free',
  'Zero Contamination',
  'Clear Logistics Access'
];

export default function ReviewModal({ 
  currentUser, 
  match, 
  isOpen, 
  onClose, 
  onSubmitReview 
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTag, setSelectedTag] = useState(REVIEW_TAGS[0]);
  const [comment, setComment] = useState('Excellent partnership. Stream was segregated exactly to specification with zero contamination.');

  if (!isOpen || !match) return null;

  const isSeller = match.sellerId === currentUser.id;
  const targetUserId = isSeller ? match.buyerId : match.sellerId;
  const targetUserName = isSeller ? match.buyerName : match.sellerName;
  const targetCompanyName = isSeller ? match.buyerCompany : match.sellerCompany;

  const handleSubmit = (e) => {
    e.preventDefault();

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 }
    });

    onSubmitReview({
      targetUserId,
      matchId: match.id,
      reviewerName: `${currentUser.name} (${currentUser.companyName})`,
      rating,
      tag: selectedTag,
      comment
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Verified Feedstock Review</h3>
              <p className="text-xs text-slate-500">Rate your completed diversion with {targetCompanyName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Star Rating Picker */}
          <div className="text-center py-2 bg-slate-50 rounded-2xl border border-slate-200/80">
            <p className="text-[11px] font-bold text-slate-600 uppercase mb-1.5">Material & Logistics Reliability</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star 
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-slate-300'
                    }`} 
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-extrabold text-amber-800 mt-1">
              {rating === 5 ? '5.0 - Exceptional Quality & Purity' :
               rating === 4 ? '4.0 - Very Good' :
               rating === 3 ? '3.0 - Standard' : 'Needs Improvement'}
            </p>
          </div>

          {/* Tag Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">Key Performance Stamp</label>
            <div className="flex flex-wrap gap-1.5">
              {REVIEW_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    selectedTag === tag 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Feedback Comments</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900"
              required
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Publish Verified Review
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
