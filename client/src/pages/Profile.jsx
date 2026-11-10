import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUserProfileData } from '../utils/userHelpers';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const { currentUser } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      const profileData = getUserProfileData(currentUser);
      setUserProfile(profileData);
      setLoading(false);
    } else {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (loading || !userProfile) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16">
        <div className="uh-bento-card h-80 animate-pulse bg-carbon-800/50" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <div className="mb-6">
        <div className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-1.5">
          STUDENT RECORD · ACCOUNT PROFILE
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">My Academic Profile</h1>
      </div>

      <div className="uh-bento-card p-7">
        <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-xl font-bold">
              {(userProfile.displayName || 'S').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{userProfile.displayName}</h2>
              <p className="text-xs text-zinc-400 font-mono">{userProfile.email}</p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              userProfile.emailVerified
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}
          >
            {userProfile.emailVerified ? 'Verified Email' : 'Unverified Email'}
          </span>
        </div>

        <div className="space-y-3.5 text-sm mb-7">
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-zinc-400">Department / Branch</span>
            <span className="font-mono text-white font-medium">{userProfile.branch}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-zinc-400">Academic Year</span>
            <span className="font-mono text-white font-medium">{userProfile.year}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-zinc-400">Roll Number</span>
            <span className="font-mono text-white font-medium">{userProfile.rollNumber}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="uh-btn-primary px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <i className="bi bi-grid"></i>
            My Submissions
          </button>
          <button
            onClick={() => navigate('/upload')}
            className="uh-btn-secondary px-5 py-2.5 rounded-xl text-xs font-semibold text-zinc-200 flex items-center gap-2"
          >
            <i className="bi bi-cloud-arrow-up"></i>
            Submit New Project
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
