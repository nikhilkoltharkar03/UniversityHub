import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Upload from './pages/Upload';
import { About } from './pages/About';
import Analytics from './pages/Analytics';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import StudentDashboard from './pages/StudentDashboard';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-wrapper">
          {/* 21st.dev Ambient Aurora & Architectural Grid Canvas */}
          <div className="ambient-canvas">
            <div className="aurora-orb-1"></div>
            <div className="aurora-orb-2"></div>
          </div>

          <Navbar />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/analytics" element={<Analytics />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <Upload />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Clean Global Footer */}
          <footer className="relative z-10 border-t border-white/[0.08] bg-[#07080C]/80 backdrop-blur-md py-6 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <div>UniversityHub · Student Engineering Project Archive</div>
              <div className="flex items-center gap-5">
                <Link to="/" className="hover:text-white text-slate-400 no-underline transition-colors">
                  Home
                </Link>
                <Link to="/projects" className="hover:text-white text-slate-400 no-underline transition-colors">
                  Browse Archive
                </Link>
                <Link to="/analytics" className="hover:text-white text-slate-400 no-underline transition-colors">
                  Analytics
                </Link>
                <Link to="/about" className="hover:text-white text-slate-400 no-underline transition-colors">
                  About
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
