import React from 'react';
import { Link } from 'react-router-dom';
import { Award, MessageSquare, Clock, User, ArrowRight } from 'lucide-react';

const SUBJECT_COLORS = {
  math: 'bg-blue-50 text-blue-700 border-blue-200',
  science: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  history: 'bg-amber-50 text-amber-800 border-amber-200',
  english: 'bg-purple-50 text-purple-700 border-purple-200',
  coding: 'bg-rose-50 text-rose-700 border-rose-200',
  other: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function QuestionCard({ question }) {
  const { id, title, content, subject, pointsAward = 10, createdAt, author, _count } = question;
  const answerCount = _count?.answers ?? question.answers?.length ?? 0;

  const subjectKey = (subject || 'other').toLowerCase();
  const badgeStyle = SUBJECT_COLORS[subjectKey] || SUBJECT_COLORS.other;

  // Format date readable
  const formattedDate = new Date(createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Badges (Subject + Points Award) */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border capitalize ${badgeStyle}`}>
            {subject}
          </span>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>+{pointsAward} pts</span>
          </div>
        </div>

        {/* Question Title */}
        <Link to={`/questions/${id}`} className="block group">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
            {title}
          </h3>
        </Link>

        {/* Question Snippet */}
        <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
          {content}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <User className="w-3.5 h-3.5 text-slate-400" />
            {author?.username || 'Anonymous'}
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
        </div>

        {/* Answer Status */}
        <Link
          to={`/questions/${id}`}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-colors ${
            answerCount > 0
              ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>
            {answerCount === 0 ? 'Be first to answer' : `${answerCount} ${answerCount === 1 ? 'answer' : 'answers'}`}
          </span>
          <ArrowRight className="w-3 h-3 ml-0.5" />
        </Link>
      </div>
    </div>
  );
}
