import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Award, Clock, User, ArrowLeft, MessageSquare, 
  Sparkles, Send, CheckCircle2, AlertCircle, LogIn 
} from 'lucide-react';

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
  const { user, updatePoints } = useAuth();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Answer submission state
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [answerError, setAnswerError] = useState('');
  const [answerSuccess, setAnswerSuccess] = useState('');

  // Brainliest marking state
  const [acceptingId, setAcceptingId] = useState(null);

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

  // Handle posting a new answer
  const handlePostAnswer = async (e) => {
    e.preventDefault();
    setAnswerError('');
    setAnswerSuccess('');

    if (answerContent.trim().length < 10) {
      setAnswerError('Your answer must be at least 10 characters long with helpful explanations.');
      return;
    }

    try {
      setSubmittingAnswer(true);
      const res = await API.post(`/questions/${id}/answers`, {
        content: answerContent.trim(),
      });

      if (res.data.success) {
        // Append new answer to state
        setQuestion((prev) => ({
          ...prev,
          answers: [...prev.answers, res.data.answer],
        }));

        // Update helper's points balance in navbar
        if (res.data.newPoints !== undefined) {
          updatePoints(res.data.newPoints);
        }

        setAnswerSuccess(res.data.message || 'Answer posted successfully!');
        setAnswerContent('');
      }
    } catch (err) {
      setAnswerError(err.response?.data?.message || 'Failed to post answer.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Handle author marking an answer as Brainliest
  const handleAcceptAnswer = async (answerId) => {
    try {
      setAcceptingId(answerId);
      const res = await API.patch(`/answers/${answerId}/accept`);

      if (res.data.success) {
        // Update answers locally: set chosen answer as accepted and others as not
        setQuestion((prev) => ({
          ...prev,
          answers: prev.answers.map((ans) =>
            ans.id === answerId ? { ...ans, isAccepted: true } : { ...ans, isAccepted: false }
          ),
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as Brainliest.');
    } finally {
      setAcceptingId(null);
    }
  };

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

  const isAuthor = user && user.id === question.authorId;
  const hasAlreadyAnswered = user && question.answers?.some((a) => a.authorId === user.id);
  const hasBrainliest = question.answers?.some((a) => a.isAccepted);

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
                {question.author?.username} {isAuthor && <span className="text-indigo-600 font-normal">(You)</span>}
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
      <div className="space-y-6 mb-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <span>Answers ({question.answers?.length || 0})</span>
          </h2>
          {hasBrainliest && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Brainliest Chosen
            </span>
          )}
        </div>

        {question.answers && question.answers.length > 0 ? (
          <div className="space-y-4">
            {question.answers.map((answer) => (
              <div
                key={answer.id}
                className={`bg-white rounded-2xl border p-6 transition-all ${
                  answer.isAccepted
                    ? 'border-amber-400 bg-amber-50/20 ring-2 ring-amber-400/30 shadow-xs'
                    : 'border-slate-200'
                }`}
              >
                {/* Accepted Answer Banner */}
                {answer.isAccepted && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    ✨ Brainliest / Best Answer
                  </div>
                )}

                {/* Content */}
                <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line mb-5">
                  {answer.content}
                </p>

                {/* Footer with Author & Brainliest Action Button */}
                <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-700">
                      {answer.author?.username}
                      {user && user.id === answer.authorId && ' (You)'}
                    </span>
                    <span>•</span>
                    <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Brainliest Button (Only shown to Question Author) */}
                  {isAuthor && !answer.isAccepted && (
                    <button
                      onClick={() => handleAcceptAnswer(answer.id)}
                      disabled={acceptingId === answer.id}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl font-bold text-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{acceptingId === answer.id ? 'Marking...' : 'Mark as Brainliest (+15 pts)'}</span>
                    </button>
                  )}
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
              Be the first peer to provide a helpful answer and claim the <strong>+{question.pointsAward} points bounty</strong>!
            </p>
          </div>
        )}
      </div>

      {/* Answer Submission Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
          <span>Your Answer</span>
          <span className="text-xs font-semibold px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
            Reward: +{question.pointsAward} pts
          </span>
        </h3>

        {!user ? (
          /* Guest CTA */
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center mt-4">
            <p className="text-sm text-slate-700 font-medium mb-3">
              Know the solution? Log in to help this student and earn <strong>+{question.pointsAward} points</strong>!
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                to="/login"
                state={{ from: { pathname: `/questions/${id}` } }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In to Answer</span>
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-sm font-medium rounded-xl transition-colors"
              >
                Create an Account
              </Link>
            </div>
          </div>
        ) : isAuthor ? (
          /* Question Author Notice */
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-sm mt-3">
            You asked this question. When peers submit answers, you can review and select the <strong>Brainliest</strong> answer above!
          </div>
        ) : hasAlreadyAnswered ? (
          /* Already Answered Notice */
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 mt-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>You have already submitted an answer for this question. Thank you for contributing to AskSphere!</span>
          </div>
        ) : (
          /* Active Answer Form */
          <form onSubmit={handlePostAnswer} className="mt-4 space-y-4">
            {answerError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <span>{answerError}</span>
              </div>
            )}

            {answerSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{answerSuccess}</span>
              </div>
            )}

            <div>
              <textarea
                required
                rows={5}
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="Write your step-by-step answer, formulas, or explanations here..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
              />
              <p className="text-xs text-slate-400 mt-1">
                Provide clear, thorough explanations. Getting marked as <strong>Brainliest</strong> awards you a <strong>+15 points bonus</strong>!
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingAnswer || answerContent.trim().length < 10}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submittingAnswer ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Answer (+{question.pointsAward} pts)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}
