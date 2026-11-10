import React, { useState, useContext, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      setMessage({
        type: 'success',
        text: 'Signed in! Redirecting to archive...'
      });
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Failed to sign in. Please check your credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="uh-bento-card p-8">
        <div className="mb-7">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
            <i className="bi bi-box-arrow-in-right text-xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sign in to UniversityHub</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Use your student or faculty account to upload projects and manage submissions.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="name@university.edu"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
              className="w-full rounded-xl bg-carbon-900 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            {errors.email && (
              <span className="text-xs text-red-400 mt-1 block">{errors.email}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="current-password"
              className="w-full rounded-xl bg-carbon-900 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            {errors.password && (
              <span className="text-xs text-red-400 mt-1 block">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full uh-btn-primary py-2.5 rounded-xl text-sm font-semibold mt-2 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
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
          <span>New to UniversityHub?</span>
          <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Create student account →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
