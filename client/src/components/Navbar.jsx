import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, PlusCircle, User, Award, Search } from 'lucide-react';

export default function Navbar() {
  // Placeholder user state for Milestone 1; Milestone 2 will wire AuthContext
  const user = null; // Set to { username: "Learner123", points: 50 } once logged in

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600 tracking-tight hover:opacity-90">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <HelpCircle className="w-5 h-5" />
          </div>
          <span className="text-slate-900">Ask<span className="text-indigo-600">Sphere</span></span>
        </Link>

        {/* Search Bar Placeholder */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search homework questions, subjects, topics..."
              className="w-full bg-slate-100 text-sm rounded-full pl-10 pr-4 py-2 border border-transparent focus:border-indigo-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Action Buttons & Auth */}
        <div className="flex items-center gap-3">
          <Link
            to="/ask"
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-full shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ask Question</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2.5 py-1.5 rounded-full">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>{user.points} pts</span>
              </div>
              <Link
                to="/profile"
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-medium text-sm transition-colors border border-slate-300"
              >
                <User className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-medium">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-slate-700 hover:text-indigo-600 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 border border-slate-300 hover:border-slate-400 text-slate-800 rounded-full transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
