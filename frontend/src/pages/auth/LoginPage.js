import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, GraduationCap, Users, BookOpen } from 'lucide-react';
import applicationImage from '../../images/application.png';

// Roles are lowercase strings returned by backend: "teacher", "parents", "student"
const ROLE_REDIRECTS = {
  teacher: '/teacher/dashboard',
  parents: '/parent/dashboard',
  student: '/student/dashboard',
};

const LoginPage = () => {
  const { login, loading, error, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      const dest = ROLE_REDIRECTS[user.role] || '/login';
      navigate(dest, { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setLocalError('Please enter both email and password.');
      return;
    }
    try {
      const role = await login(form.email, form.password);
      const from = location.state?.from?.pathname || ROLE_REDIRECTS[role] || '/login';
      navigate(from, { replace: true });
    } catch (_) {
      // error already set in AuthContext
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — branding ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 bg-navy-900 flex-col items-center justify-center px-12 py-16 relative overflow-hidden">
        {/* Animated orbs */}
        <div className="animate-float     absolute top-10   left-8   w-32 h-32 rounded-full bg-brand-500/10  blur-2xl animate-pulse-soft" />
        <div className="animate-float-alt absolute bottom-16 right-6  w-48 h-48 rounded-full bg-violet-500/10 blur-3xl animate-pulse-soft" />
        <div className="animate-float-slow absolute top-1/2 right-10 w-24 h-24 rounded-full bg-emerald-500/8 blur-2xl" />

        {/* Logo */}
        <div className="animate-float relative z-10">
          <div className="w-40 h-40 rounded-3xl bg-white flex items-center justify-center mb-6 shadow-2xl overflow-hidden border-4 border-brand-500/20 p-2">
            <img 
              src={applicationImage} 
              alt="Learn Buddy" 
              className="w-full h-full object-contain"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>
        </div>

        <h1 className="relative z-10 text-3xl font-bold text-white tracking-tight text-center mb-3 animate-slide-up2">Learn-Buddy</h1>
        <p className="relative z-10 text-slate-400 text-center text-sm leading-relaxed max-w-xs animate-slide-up2" style={{animationDelay:'0.08s'}}>
          A dyslexia-friendly learning space — making reading, writing, and language fun for every learner.
        </p>

        <div className="relative z-10 mt-12 space-y-3 w-full max-w-xs">
          {[
            { role: 'Teacher', desc: 'Create classrooms & manage enrollments', Icon: GraduationCap, color: 'bg-brand-500/20 text-brand-300 border-brand-500/30' },
            { role: 'Parent',  desc: 'Manage your children & enroll them',     Icon: Users,         color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
            { role: 'Student', desc: 'Access your classroom & content',         Icon: BookOpen,      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
          ].map(({ role, desc, Icon, color }, i) => (
            <div
              key={role}
              className={`rounded-xl border px-4 py-3 flex items-center gap-3 animate-slide-up2
                          hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 ${color}`}
              style={{animationDelay:`${0.15 + i * 0.08}s`}}
            >
              <div className="p-2 rounded-lg bg-white/10 shrink-0">
                <Icon size={16} />
              </div>
              <div>
                <p className="font-semibold text-sm">{role}</p>
                <p className="text-xs opacity-80 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-4 relative overflow-hidden"
           style={{background: 'var(--color-surface, #f1f5f9)'}}>
        {/* Animated background shapes */}
        <div className="animate-float-alt absolute -top-20  -right-20  w-72 h-72 rounded-full bg-indigo-100/60  blur-3xl pointer-events-none" />
        <div className="animate-float     absolute -bottom-20 -left-20  w-80 h-80 rounded-full bg-violet-100/50 blur-3xl pointer-events-none" />
        <div className="animate-float-slow absolute top-1/3  right-1/4  w-40 h-40 rounded-full bg-sky-100/40    blur-2xl pointer-events-none" />

        <div className="relative w-full max-w-lg animate-slide-up2 px-4">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-5 lg:hidden">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md overflow-hidden border-2 border-brand-500/20 p-1">
              <img 
                src={applicationImage} 
                alt="Learn Buddy" 
                className="w-full h-full object-contain"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
            <span className="text-xl font-bold text-slate-900">Learn-Buddy</span>
          </div>

          {/* Login Card Container */}
          <div className="bg-white rounded-2xl shadow-2xl p-5 md:p-6 border border-slate-200/60 hover:shadow-3xl transition-shadow duration-300">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 text-center">Welcome back</h2>
            <p className="text-slate-600 text-sm md:text-base mb-4 text-center">
              Sign in to continue your learning journey
            </p>

            {displayError && (
              <div className="alert-error mb-6 animate-slide-up2">{displayError}</div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-3">
            <div className="animate-slide-up2" style={{animationDelay:'0.05s'}}>
              <label className="input-label text-sm font-semibold text-slate-700" htmlFor="email">Email address</label>
              <div className="relative mt-1">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="email" name="email" type="email" autoComplete="email" required
                  className="input pl-11 pr-4 py-3 w-full border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all duration-200 outline-none"
                  placeholder="you@example.com"
                  value={form.email} onChange={handleChange}
                />
              </div>
            </div>

            <div className="animate-slide-up2" style={{animationDelay:'0.1s'}}>
              <label className="input-label text-sm font-semibold text-slate-700" htmlFor="password">Password</label>
              <div className="relative mt-1">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="password" name="password" type="password" autoComplete="current-password" required
                  className="input pl-11 pr-4 py-3 w-full border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all duration-200 outline-none"
                  placeholder="••••••••"
                  value={form.password} onChange={handleChange}
                />
              </div>
            </div>

            <div className="animate-slide-up2" style={{animationDelay:'0.15s'}}>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-base font-semibold mt-2 flex items-center justify-center gap-2
                           hover:scale-[1.02] active:scale-[0.98] transition-all duration-200
                           shadow-lg hover:shadow-xl hover:shadow-brand-500/30 rounded-xl"
              >
                {loading ? (
                  <><span className="spinner-sm" /> Signing in…</>
                ) : (
                  <><LogIn size={18} /> Sign In</>
                )}
              </button>
            </div>
          </form>

          {/* Signup Link Section */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-center text-base text-slate-700">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-brand-600 hover:text-brand-700 font-bold underline decoration-2 underline-offset-4 hover:underline-offset-2 transition-all duration-200"
              >
                Create one →
              </Link>
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
