import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import QuestionCard from '../components/QuestionCard';
import { Sparkles, CheckCircle2, AlertCircle, MessageSquare, PlusCircle, Search, HelpCircle } from 'lucide-react';

const SUBJECTS = [
  { id: 'all', label: 'All Subjects' },
  { id: 'math', label: '📐 Mathematics' },
  { id: 'science', label: '🔬 Science' },
  { id: 'history', label: '📜 History' },
  { id: 'english', label: '📚 English' },
  { id: 'coding', label: '💻 Coding' },
  { id: 'other', label: '🌐 General' },
];

export default function Home() {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [serverStatus, setServerStatus] = useState({ loading: true, online: false, message: '' });

  // 1. Health check verification
  useEffect(() => {
    API.get('/health')
      .then((res) => {
        setServerStatus({ loading: false, online: true, message: res.data.message });
      })
      .catch(() => {
        setServerStatus({
          loading: false,
          online: false,
          message: 'Backend server is unreachable. Start server on port 5000.',
        });
      });
  }, []);

  // 2. Fetch questions whenever subject or search filter changes
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      try {
        const params = {};
        if (selectedSubject !== 'all') params.subject = selectedSubject;
        if (searchQuery.trim()) params.search = searchQuery.trim();

        const res = await API.get('/questions', { params });
        if (res.data.success) {
          setQuestions(res.data.questions);
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
      } finally {
        setLoadingQuestions(false);
      }
    };

    // Debounce search query slightly
    const timer = setTimeout(() => {
      fetchQuestions();
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedSubject, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Backend API Connection Status Banner */}
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
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <div>
            <span className="font-semibold">
              {serverStatus.loading
                ? 'Connecting to backend...'
                : serverStatus.online
                ? 'Backend API Online'
                : 'Backend Server Offline'}
            </span>
            <p className="text-xs opacity-90 mt-0.5">{serverStatus.message || 'Ready for AskSphere'}</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 bg-white rounded-md border shadow-2xs font-mono font-medium">
          Milestone 3 Feed
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
              className="px-6 py-3 bg-white text-indigo-700 font-bold rounded-xl shadow-xs hover:bg-indigo-50 transition-colors flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Ask a Question (-10 pts)</span>
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

      {/* Search & Subject Filters */}
      <div id="questions-feed" className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">Explore Questions</h2>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords..."
              className="w-full bg-white text-sm rounded-xl pl-10 pr-4 py-2 border border-slate-200 focus:border-indigo-500 focus:outline-none shadow-2xs transition-all"
            />
          </div>
        </div>

        {/* Subject Pills */}
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                selectedSubject === sub.id
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      </div>

      {/* Questions Feed Grid */}
      {loadingQuestions ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4">
              <div className="flex justify-between">
                <div className="w-20 h-5 bg-slate-200 rounded-full" />
                <div className="w-16 h-5 bg-slate-200 rounded-full" />
              </div>
              <div className="w-3/4 h-6 bg-slate-200 rounded-md" />
              <div className="space-y-2">
                <div className="w-full h-4 bg-slate-100 rounded-md" />
                <div className="w-5/6 h-4 bg-slate-100 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No questions found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto mb-6">
            {searchQuery
              ? `No questions match "${searchQuery}". Try a different keyword.`
              : `There are currently no questions in ${selectedSubject === 'all' ? 'the feed' : 'this category'}. Be the first to ask!`}
          </p>
          <Link
            to="/ask"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ask a Question</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {questions.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}

    </div>
  );
}
