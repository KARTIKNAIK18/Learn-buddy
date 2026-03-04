import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, GraduationCap, Users, BookOpen } from 'lucide-react';

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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center mb-6 shadow-xl shadow-brand-900/40">
            <span className="text-white font-black text-2xl tracking-tight">LB</span>
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
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden"
           style={{background: 'var(--color-surface, #f1f5f9)'}}>
        {/* Animated background shapes */}
        <div className="animate-float-alt absolute -top-20  -right-20  w-72 h-72 rounded-full bg-indigo-100/60  blur-3xl pointer-events-none" />
        <div className="animate-float     absolute -bottom-20 -left-20  w-80 h-80 rounded-full bg-violet-100/50 blur-3xl pointer-events-none" />
        <div className="animate-float-slow absolute top-1/3  right-1/4  w-40 h-40 rounded-full bg-sky-100/40    blur-2xl pointer-events-none" />

        <div className="relative w-full max-w-sm animate-slide-up2">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-base">LB</span>
            </div>
            <span className="text-xl font-bold text-slate-900">Learn-Buddy</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-600 hover:text-brand-700 font-semibold transition-colors">
              Create one →
            </Link>
          </p>

          {displayError && (
            <div className="alert-error mb-6 animate-slide-up2">{displayError}</div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="animate-slide-up2" style={{animationDelay:'0.05s'}}>
              <label className="input-label" htmlFor="email">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="email" name="email" type="email" autoComplete="email" required
                  className="input pl-9 transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                  placeholder="you@example.com"
                  value={form.email} onChange={handleChange}
                />
              </div>
            </div>

            <div className="animate-slide-up2" style={{animationDelay:'0.1s'}}>
              <label className="input-label" htmlFor="password">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="password" name="password" type="password" autoComplete="current-password" required
                  className="input pl-9 transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                  placeholder="••••••••"
                  value={form.password} onChange={handleChange}
                />
              </div>
            </div>

            <div className="animate-slide-up2" style={{animationDelay:'0.15s'}}>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base mt-1 flex items-center justify-center gap-2
                           hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150
                           shadow-md hover:shadow-lg hover:shadow-brand-500/25"
              >
                {loading ? (
                  <><span className="spinner-sm" /> Signing in…</>
                ) : (
                  <><LogIn size={17} /> Sign In</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
