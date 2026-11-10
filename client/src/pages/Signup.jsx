import React, { useState, useContext, useEffect } from 'react';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    branch: 'CSE',
    year: '4th Year',
    rollNumber: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser) navigate('/');
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await updateProfile(userCredential.user, {
        displayName: formData.fullName,
        photoURL: JSON.stringify({
          branch: formData.branch,
          year: formData.year,
          rollNumber: formData.rollNumber || 'N/A'
        })
      });

      await sendEmailVerification(userCredential.user);

      setMessage({
        type: 'success',
        text: 'Account created! Check your email for verification. Redirecting...'
      });

      setTimeout(() => navigate('/'), 2200);
    } catch (err) {
      console.error('Signup error:', err);
      let errorMessage = 'Failed to create account. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <div className="uh-bento-card p-8">
        <div className="mb-6">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
            <i className="bi bi-person-plus text-xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Student Account</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Register with your department details to publish and archive your engineering projects.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="e.g. Riya Patel"
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-xl bg-carbon-900 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            {errors.fullName && <span className="text-xs text-red-400 mt-1 block">{errors.fullName}</span>}
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="student@university.edu"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-xl bg-carbon-900 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            {errors.email && <span className="text-xs text-red-400 mt-1 block">{errors.email}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Engineering Branch</label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-xl bg-carbon-900 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="CSE">Computer Science (CSE)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="ECE">Electronics & Comm. (ECE)</option>
                <option value="EEE">Electrical Eng. (EEE)</option>
                <option value="MECH">Mechanical Eng. (MECH)</option>
                <option value="CIVIL">Civil Engineering (CIVIL)</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Academic Year</label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-xl bg-carbon-900 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              University Roll Number <span className="text-zinc-500">(Optional)</span>
            </label>
            <input
              type="text"
              name="rollNumber"
              placeholder="e.g. 22BCE1042"
              value={formData.rollNumber}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-xl bg-carbon-900 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-xl bg-carbon-900 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
              {errors.password && <span className="text-xs text-red-400 mt-1 block">{errors.password}</span>}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-xl bg-carbon-900 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
              {errors.confirmPassword && (
                <span className="text-xs text-red-400 mt-1 block">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full uh-btn-primary py-2.5 rounded-xl text-sm font-semibold mt-2 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {message.text && (
            <div
              className={`p-3 rounded-xl text-xs border ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {message.text}
            </div>
          )}
        </form>

        <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
          <span>Already have an account?</span>
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Sign in here →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
