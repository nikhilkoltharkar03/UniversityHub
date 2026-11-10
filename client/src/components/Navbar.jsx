import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { getInitials } from './ProjectCard';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/projects') {
      return location.pathname.startsWith('/projects');
    }
    return location.pathname === path;
  };

  const navLinkClass = (path) =>
    `uh-nav-tab px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
      isActive(path)
        ? 'uh-nav-tab-active font-semibold'
        : 'text-slate-400 hover:text-white'
    }`;

  return (
    <div className="sticky top-3.5 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <header className="backdrop-blur-2xl bg-[#10121A]/85 border border-white/[0.11] rounded-2xl px-4 sm:px-5 h-15 py-2.5 flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-3 text-left group no-underline"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 text-[#07080C] flex items-center justify-center font-extrabold text-xs tracking-tight shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform">
            UH
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white block leading-none">
              University<span className="text-sky-400">Hub</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Project Archive
            </span>
          </div>
        </Link>

        {/* Center Tubelight Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-[#07080C]/80 p-1.5 rounded-xl border border-white/[0.08]">
          <Link to="/" className={navLinkClass('/')}>
            Home
          </Link>
          <Link to="/projects" className={navLinkClass('/projects')}>
            Browse Projects
          </Link>
          <Link to="/analytics" className={navLinkClass('/analytics')}>
            Analytics
          </Link>
          <Link to="/about" className={navLinkClass('/about')}>
            About
          </Link>
          {currentUser && (
            <Link to="/dashboard" className={navLinkClass('/dashboard')}>
              My Submissions
            </Link>
          )}
          {currentUser?.email === 'admin@universityhub.com' && (
            <Link to="/admin" className={navLinkClass('/admin')}>
              Admin Review
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={() => navigate('/projects')}
            className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#07080C]/90 border border-white/[0.09] text-xs text-slate-300 hover:text-white hover:border-sky-400/40 transition-all"
          >
            <svg
              className="w-3.5 h-3.5 text-sky-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span>Quick Search</span>
            <kbd className="text-[10px] font-mono bg-white/[0.08] px-1.5 py-0.5 rounded text-slate-300">
              ⌘K
            </kbd>
          </button>

          {!currentUser ? (
            <div className="flex items-center gap-2">
              <Link to="/login" className="uh-btn-secondary">
                Sign In
              </Link>
              <Link to="/signup" className="uh-btn-primary">
                <span>Create Account</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link to="/upload" className="uh-btn-primary">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.4"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Submit Project</span>
              </Link>

              <Link
                to="/profile"
                title={currentUser.displayName || currentUser.email}
                className="flex items-center gap-2 pl-2 border-l border-white/[0.1] no-underline"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border border-white/20 flex items-center justify-center text-xs font-bold text-sky-300 hover:border-sky-400 transition-colors">
                  {getInitials(currentUser.displayName || currentUser.email)}
                </div>
              </Link>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/15 text-slate-400 hover:text-rose-300 border border-white/[0.08] transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white"
          aria-label="Toggle Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 backdrop-blur-2xl bg-[#10121A]/95 border border-white/[0.11] rounded-2xl p-4 shadow-2xl space-y-2">
          <div className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white hover:bg-white/[0.08] no-underline"
            >
              Home
            </Link>
            <Link
              to="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white hover:bg-white/[0.08] no-underline"
            >
              Browse Projects
            </Link>
            <Link
              to="/analytics"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white hover:bg-white/[0.08] no-underline"
            >
              Analytics
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white hover:bg-white/[0.08] no-underline"
            >
              About
            </Link>
            {currentUser && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white hover:bg-white/[0.08] no-underline"
                >
                  My Submissions
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white hover:bg-white/[0.08] no-underline"
                >
                  Profile
                </Link>
                {currentUser.email === 'admin@universityhub.com' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-sky-400 hover:bg-white/[0.08] no-underline"
                  >
                    Admin Review
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
            {!currentUser ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="uh-btn-secondary w-full"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="uh-btn-primary w-full"
                >
                  Create Account
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/upload"
                  onClick={() => setMobileMenuOpen(false)}
                  className="uh-btn-primary w-full"
                >
                  + Submit Project
                </Link>
                <button onClick={handleLogout} className="uh-btn-secondary w-full text-rose-300">
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
