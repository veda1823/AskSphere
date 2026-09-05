import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HelpCircle, Award, AlertCircle, Send, CheckCircle2 } from 'lucide-react';

const SUBJECT_OPTIONS = [
  { value: 'math', label: '📐 Mathematics' },
  { value: 'science', label: '🔬 Science' },
  { value: 'history', label: '📜 History' },
  { value: 'english', label: '📚 English' },
  { value: 'coding', label: '💻 Coding' },
  { value: 'other', label: '🌐 General / Other' },
];

export default function AskQuestion() {
  const { user, updatePoints } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('math');
  const [pointsAward, setPointsAward] = useState(10);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userPoints = user?.points ?? 0;
  const hasEnoughPoints = userPoints >= pointsAward;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('Please provide both a title and description for your question.');
      return;
    }

    if (title.trim().length < 5) {
      setError('Question title must be at least 5 characters.');
      return;
    }

    if (content.trim().length < 10) {
      setError('Please describe your problem in more detail (at least 10 characters).');
      return;
    }

    if (!hasEnoughPoints) {
      setError(`You need at least ${pointsAward} points to ask this question. Current balance: ${userPoints} pts.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await API.post('/questions', {
        title: title.trim(),
        content: content.trim(),
        subject,
        pointsAward,
      });

      // Update local points state in AuthContext
      if (res.data.remainingPoints !== undefined) {
        updatePoints(res.data.remainingPoints);
      }

      navigate(`/questions/${res.data.question.id}`);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to post question. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:px-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ask the Community</h1>
            <p className="text-sm text-slate-500">
              Get step-by-step answers from peers and students across the globe
            </p>
          </div>
        </div>

        {/* Points Balance Banner */}
        <div className={`p-4 rounded-xl border mb-6 flex items-center justify-between text-sm ${
          hasEnoughPoints
            ? 'bg-amber-50/60 border-amber-200 text-amber-900'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              Your current balance: <strong>{userPoints} points</strong>. Asking this question costs{' '}
              <strong>{pointsAward} points</strong>.
            </span>
          </div>
          <span className="font-bold text-xs px-2.5 py-1 bg-white rounded-md border shadow-2xs">
            Remaining: {userPoints - pointsAward} pts
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Select Subject
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SUBJECT_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setSubject(opt.value)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium text-left border transition-all ${
                    subject === opt.value
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/20 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Question Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How do you find the derivative of sin(2x) using the chain rule?"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">Keep it clear and specific so helpers can quickly identify your topic.</p>
          </div>

          {/* Question Description / Content */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Detailed Description & Context
            </label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Explain what step you are stuck on, formulas you tried, or what the homework prompt says..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
            />
          </div>

          {/* Points Bounty Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Offer Points Bounty to Helper
            </label>
            <div className="flex items-center gap-3">
              {[10, 20, 30].map((bounty) => (
                <button
                  type="button"
                  key={bounty}
                  onClick={() => setPointsAward(bounty)}
                  className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    pointsAward === bounty
                      ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>{bounty} Points</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1.5">Higher point rewards encourage peers to provide faster and more detailed answers!</p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !hasEnoughPoints}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Posting Question...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Post Question (-{pointsAward} pts)</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
