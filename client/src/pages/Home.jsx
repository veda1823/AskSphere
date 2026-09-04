import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Sparkles, CheckCircle2, AlertCircle, MessageSquare, Award, Clock } from 'lucide-react';

const SUBJECTS = [
  { id: 'all', label: 'All Subjects' },
  { id: 'math', label: '📐 Mathematics' },
  { id: 'science', label: '🔬 Science' },
  { id: 'history', label: '📜 History' },
  { id: 'english', label: '📚 English' },
  { id: 'coding', label: '💻 Coding' },
];

export default function Home() {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [serverStatus, setServerStatus] = useState({ loading: true, online: false, message: '' });

  useEffect(() => {
    // Health check test to verify full-stack connection
    API.get('/health')
      .then((res) => {
        setServerStatus({ loading: false, online: true, message: res.data.message });
      })
      .catch((err) => {
        setServerStatus({
          loading: false,
          online: false,
          message: 'Could not connect to backend server at http://localhost:5000',
        });
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Backend API Connection Status Banner (Milestone 1 Verification) */}
      <div className={`mb-8 p-4 rounded-xl border flex items-center justify-between text-sm ${
        serverStatus.loading
          ? 'bg-slate-50 border-slate-200 text-slate-600'
          : serverStatus.online
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}>
        <div className="flex items-center gap-3">
          {serverStatus.loading ? (
            <div className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
          ) : serverStatus.online ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600" />
          )}
          <div>
            <span className="font-semibold">
              {serverStatus.loading
                ? 'Connecting to backend...'
                : serverStatus.online
                ? 'Backend API Connected'
                : 'Backend Server Offline'}
            </span>
            <p className="text-xs opacity-90 mt-0.5">{serverStatus.message || 'Ready for Milestone 1 testing'}</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 bg-white rounded-md border shadow-2xs font-mono font-medium">
          Milestone 1 Setup
        </span>
      </div>

      {/* Hero Section */}
      <div className="bg-linear-to-r from-indigo-600 to-violet-700 text-white rounded-2xl p-8 sm:p-10 shadow-md mb-10 text-center sm:text-left relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/40 text-xs font-semibold uppercase tracking-wider mb-4 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            Brainly-Style Peer Learning
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Ask any question. Get answers. Earn points.
          </h1>
          <p className="text-indigo-100 text-base sm:text-lg mb-6 leading-relaxed">
            Stuck on a tricky homework problem or concept? Ask our student community and get step-by-step help from peers.
          </p>
          <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
            <Link
              to="/ask"
              className="px-6 py-3 bg-white text-indigo-700 font-bold rounded-xl shadow-xs hover:bg-indigo-50 transition-colors"
            >
              Ask a Question (-10 pts)
            </Link>
            <a
              href="#questions-feed"
              className="px-6 py-3 bg-indigo-500/30 hover:bg-indigo-500/50 text-white font-semibold rounded-xl transition-colors border border-indigo-300/30"
            >
              Browse Questions (+10 pts)
            </a>
          </div>
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div id="questions-feed" className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-3">Filter by Subject</h2>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedSubject === sub.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      </div>

      {/* Placeholder Feed (Preview of Milestone 3) */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">Questions Feed will load here</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          In Milestone 2 & 3, questions submitted by users will appear here with points bounties, subject tags, and answers count.
        </p>
      </div>

    </div>
  );
}
