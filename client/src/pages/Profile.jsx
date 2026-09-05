import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Award, Calendar, MessageSquare, CheckCircle2, Sparkles, 
  Edit3, HelpCircle, ArrowRight, UserCheck 
} from 'lucide-react';

export default function Profile() {
  const { id: paramId } = useParams();
  const { user: currentUser } = useAuth();

  // If viewing /profile without params, target current user's ID
  const targetUserId = paramId || currentUser?.id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' or 'answers'

  // Bio editing state
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [savingBio, setSavingBio] = useState(false);

  const isOwnProfile = currentUser && currentUser.id === targetUserId;

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/users/${targetUserId}`);
        if (res.data.success) {
          setProfile(res.data.profile);
          setBioInput(res.data.profile.bio || '');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetUserId]);

  const handleSaveBio = async () => {
    try {
      setSavingBio(true);
      const res = await API.patch('/users/profile', { bio: bioInput });
      if (res.data.success) {
        setProfile((prev) => ({ ...prev, bio: res.data.user.bio }));
        setIsEditingBio(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update bio.');
    } finally {
      setSavingBio(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Profile Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'This user profile could not be loaded.'}</p>
        <Link
          to="/"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const joinDate = new Date(profile.createdAt).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-linear-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center text-3xl font-extrabold shadow-md shrink-0">
              {profile.username?.[0]?.toUpperCase() || 'U'}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {profile.username}
                </h1>
                {isOwnProfile && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                    You
                  </span>
                )}
              </div>

              {/* Rank & Join Date */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500">
                <span className="font-semibold px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                  <Award className="w-4 h-4 text-amber-600" />
                  {profile.rank?.title}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {joinDate}
                </span>
              </div>
            </div>
          </div>

          {/* Points Pill (Desktop Right) */}
          <div className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center sm:text-right">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-1">
              AskSphere Balance
            </span>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 flex items-center justify-center sm:justify-end gap-1.5">
              <Award className="w-6 h-6 text-amber-500" />
              <span>{profile.points} pts</span>
            </div>
          </div>

        </div>

        {/* Bio Section */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">About</span>
            {isOwnProfile && !isEditingBio && (
              <button
                onClick={() => setIsEditingBio(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Bio</span>
              </button>
            )}
          </div>

          {isEditingBio ? (
            <div className="space-y-3">
              <textarea
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                maxLength={250}
                rows={3}
                placeholder="Tell peers what subjects you love or what you're learning..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{250 - bioInput.length} chars remaining</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingBio(false)}
                    className="px-3 py-1.5 rounded-lg border text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBio}
                    disabled={savingBio}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {savingBio ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600 leading-relaxed italic">
              "{profile.bio || 'No bio yet. Learning and helping on AskSphere!'}"
            </p>
          )}
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase mb-1">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Reputation</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{profile.points}</p>
          <span className="text-xs text-slate-400">Earned Points</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase mb-1">
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            <span>Questions</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{profile.stats?.questionsCount || 0}</p>
          <span className="text-xs text-slate-400">Questions Asked</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase mb-1">
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            <span>Answers</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{profile.stats?.answersCount || 0}</p>
          <span className="text-xs text-slate-400">Peer Answers</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Brainliest</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{profile.stats?.brainliestCount || 0}</p>
          <span className="text-xs text-slate-400">Best Answers</span>
        </div>
      </div>

      {/* Activity Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-6">
          <button
            onClick={() => setActiveTab('questions')}
            className={`pb-2 px-1 text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === 'questions'
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Questions Asked ({profile.questions?.length || 0})
            {activeTab === 'questions' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('answers')}
            className={`pb-2 px-1 text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === 'answers'
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Answers Given ({profile.answers?.length || 0})
            {activeTab === 'answers' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab Content: Questions */}
        {activeTab === 'questions' && (
          <div>
            {profile.questions && profile.questions.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {profile.questions.map((q) => (
                  <div key={q.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md capitalize">
                          {q.subject}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(q.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Link
                        to={`/questions/${q.id}`}
                        className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                      >
                        {q.title}
                      </Link>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                        {q._count?.answers || 0} answers
                      </span>
                      <Link
                        to={`/questions/${q.id}`}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No questions asked yet</p>
                <p className="text-xs text-slate-400 mt-0.5 mb-4">When questions are asked, they will appear here.</p>
                {isOwnProfile && (
                  <Link
                    to="/ask"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Ask a Question
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Answers */}
        {activeTab === 'answers' && (
          <div>
            {profile.answers && profile.answers.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {profile.answers.map((a) => (
                  <div key={a.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md capitalize">
                          {a.question?.subject || 'Subject'}
                        </span>
                        {a.isAccepted && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            Brainliest
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <Link
                      to={`/questions/${a.question?.id}`}
                      className="text-sm font-bold text-slate-800 hover:text-indigo-600 transition-colors block"
                    >
                      Question: {a.question?.title}
                    </Link>

                    <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      "{a.content}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No answers given yet</p>
                <p className="text-xs text-slate-400 mt-0.5 mb-4">Help peers with homework questions to earn reputation points!</p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Browse Questions
                </Link>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
