import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { Award, Clock, User, ArrowLeft, CheckCircle2, MessageSquare, Sparkles } from 'lucide-react';

const SUBJECT_COLORS = {
  math: 'bg-blue-50 text-blue-700 border-blue-200',
  science: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  history: 'bg-amber-50 text-amber-800 border-amber-200',
  english: 'bg-purple-50 text-purple-700 border-purple-200',
  coding: 'bg-rose-50 text-rose-700 border-rose-200',
  other: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/questions/${id}`);
        if (res.data.success) {
          setQuestion(res.data.question);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load question.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading question details...</p>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Question Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'This question may have been deleted.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </Link>
      </div>
    );
  }

  const subjectKey = (question.subject || 'other').toLowerCase();
  const badgeStyle = SUBJECT_COLORS[subjectKey] || SUBJECT_COLORS.other;

  const formattedDate = new Date(question.createdAt).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Back Link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Questions</span>
      </Link>

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8">
        
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border capitalize ${badgeStyle}`}>
            {question.subject}
          </span>
          <div className="flex items-center gap-1.5 px-3.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold shadow-2xs">
            <Award className="w-4 h-4 text-amber-600" />
            <span>+{question.pointsAward} Points Bounty</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
          {question.title}
        </h1>

        {/* Body Content */}
        <div className="text-slate-700 text-base leading-relaxed whitespace-pre-line mb-6 pb-6 border-b border-slate-100">
          {question.content}
        </div>

        {/* Author Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
              {question.author?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <span className="font-semibold text-slate-800 block text-sm">
                {question.author?.username}
              </span>
              <span className="text-slate-400">Asked on {formattedDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Active</span>
          </div>
        </div>

      </div>

      {/* Answers Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <span>Answers ({question.answers?.length || 0})</span>
          </h2>
        </div>

        {question.answers && question.answers.length > 0 ? (
          <div className="space-y-4">
            {question.answers.map((answer) => (
              <div
                key={answer.id}
                className={`bg-white rounded-2xl border p-6 transition-all ${
                  answer.isAccepted
                    ? 'border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
                    : 'border-slate-200'
                }`}
              >
                {/* Accepted Answer Banner */}
                {answer.isAccepted && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold uppercase tracking-wider mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Brainliest Answer
                  </div>
                )}

                {/* Content */}
                <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line mb-4">
                  {answer.content}
                </p>

                {/* Answer Author */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold text-slate-700">{answer.author?.username}</span>
                  </div>
                  <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No answers yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Be the first peer to provide a helpful answer and earn the <strong>+{question.pointsAward} points bounty</strong>!
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
