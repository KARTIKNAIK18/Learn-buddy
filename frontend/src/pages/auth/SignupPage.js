import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signupUser } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Shield, Hash, UserPlus, GraduationCap, Users, BookOpen } from 'lucide-react';
import applicationImage from '../../images/application.png';

const ROLES = [
  { value: 'teacher', label: 'Teacher',  desc: 'Create classrooms & manage enrollments', Icon: GraduationCap },
  { value: 'parents', label: 'Parent',   desc: 'Manage your children & enroll them',     Icon: Users         },
  { value: 'student', label: 'Student',  desc: 'Access your classroom & content',        Icon: BookOpen      },
];

const EMPTY_FORM = { name: '', email: '', password: '', confirmPassword: '', role: 'teacher', age: '' };

const SignupPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]         = useState(EMPTY_FORM);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (user) navigate('/login', { replace: true });
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, role, age } = form;

    if (!name || !email || !password || !role) {
      setError('Name, email, password and role are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = { name, email, password, role };
      // age is optional — only send when provided
      if (age) payload.age = parseInt(age, 10);

      await signupUser(payload);
      setSuccess('Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Signup failed. Please try again.';
      setError(Array.isArray(msg) ? msg.map((m) => m.msg).join(' ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — branding ───────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 bg-navy-900 flex-col items-center justify-center px-12 py-16">
        <div className="w-40 h-40 rounded-3xl bg-white flex items-center justify-center mb-6 shadow-2xl overflow-hidden border-4 border-brand-500/20 p-2">
          <img 
            src={applicationImage} 
            alt="Learn Buddy" 
            className="w-full h-full object-contain"
            style={{ imageRendering: 'crisp-edges' }}
          />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight text-center mb-3">
          Join Learn-Buddy
        </h1>
        <p className="text-slate-400 text-center text-sm leading-relaxed max-w-xs mb-10">
          Choose your role and get started in seconds.
        </p>

        <div className="space-y-3 w-full max-w-xs">
          {ROLES.map(({ value, label, desc }) => (
            <div
              key={value}
              onClick={() => { setForm((p) => ({ ...p, role: value })); setError(''); }}
              className={`rounded-xl border px-4 py-3 cursor-pointer transition-all
                ${form.role === value
                  ? value === 'teacher'
                    ? 'bg-brand-500/30 text-brand-200 border-brand-400/50 ring-1 ring-brand-500/50'
                    : value === 'parents'
                    ? 'bg-violet-500/30 text-violet-200 border-violet-400/50 ring-1 ring-violet-500/50'
                    : 'bg-emerald-500/30 text-emerald-200 border-emerald-400/50 ring-1 ring-emerald-500/50'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:border-slate-600/60'
                }`}
            >
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs opacity-70 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ──────────────────────────────────────── */}
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

          {/* Signup Card Container */}
          <div className="bg-white rounded-2xl shadow-2xl p-5 md:p-6 border border-slate-200/60 hover:shadow-3xl transition-shadow duration-300">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 text-center">Create account</h2>
            <p className="text-slate-600 text-sm md:text-base mb-4 text-center">
              Join us and start your learning journey
            </p>

            {error   && <div className="alert-error mb-4 animate-slide-up2">{error}</div>}
            {success && <div className="alert-success mb-4 animate-slide-up2">{success}</div>}

            <form onSubmit={handleSubmit} noValidate className="space-y-3">
            {/* Name */}
            <div className="animate-slide-up2" style={{animationDelay:'0.05s'}}>
              <label className="input-label text-sm font-semibold text-slate-700" htmlFor="name">Full Name</label>
              <div className="relative mt-1">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input id="name" name="name" type="text" autoComplete="name" required
                  className="input pl-11 pr-4 py-3 w-full border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all duration-200 outline-none"
                  placeholder="Jane Smith" value={form.name} onChange={handleChange} />
              </div>
            </div>

            {/* Email */}
            <div className="animate-slide-up2" style={{animationDelay:'0.09s'}}>
              <label className="input-label text-sm font-semibold text-slate-700" htmlFor="email">Email Address</label>
              <div className="relative mt-1">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input id="email" name="email" type="email" autoComplete="email" required
                  className="input pl-11 pr-4 py-3 w-full border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all duration-200 outline-none"
                  placeholder="you@example.com" value={form.email} onChange={handleChange} />
              </div>
            </div>

            {/* Password */}
            <div className="animate-slide-up2" style={{animationDelay:'0.13s'}}>
              <label className="input-label text-sm font-semibold text-slate-700" htmlFor="password">Password</label>
              <div className="relative mt-1">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input id="password" name="password" type="password" autoComplete="new-password" required
                  className="input pl-11 pr-4 py-3 w-full border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all duration-200 outline-none"
                  placeholder="Min. 6 characters" value={form.password} onChange={handleChange} />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="animate-slide-up2" style={{animationDelay:'0.17s'}}>
              <label className="input-label text-sm font-semibold text-slate-700" htmlFor="confirmPassword">Confirm Password</label>
              <div className="relative mt-1">
                <Shield size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required
                  className="input pl-11 pr-4 py-3 w-full border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all duration-200 outline-none"
                  placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} />
              </div>
            </div>

            {/* Role */}
            <div className="animate-slide-up2" style={{animationDelay:'0.21s'}}>
              <label className="input-label text-sm font-semibold text-slate-700" htmlFor="role">Role</label>
              <select id="role" name="role" required
                className="input mt-1 py-3 w-full border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all duration-200 outline-none"
                value={form.role} onChange={handleChange}>
                {ROLES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Age (optional) */}
            <div className="animate-slide-up2" style={{animationDelay:'0.25s'}}>
              <label className="input-label text-sm font-semibold text-slate-700" htmlFor="age">
                Age <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative mt-1">
                <Hash size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input id="age" name="age" type="number" min="5" max="100"
                  className="input pl-11 pr-4 py-3 w-full border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all duration-200 outline-none"
                  placeholder="e.g. 25" value={form.age} onChange={handleChange} />
              </div>
            </div>

            <div className="animate-slide-up2" style={{animationDelay:'0.29s'}}>
              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3.5 text-base font-semibold mt-2 flex items-center justify-center gap-2
                           hover:scale-[1.02] active:scale-[0.98] transition-all duration-200
                           shadow-lg hover:shadow-xl hover:shadow-brand-500/30 rounded-xl">
                {loading ? (
                  <><span className="spinner-sm" /> Creating account…</>
                ) : (
                  <><UserPlus size={18} /> Create Account</>
                )}
              </button>
            </div>
          </form>

          {/* Login Link Section */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-center text-base text-slate-700">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-brand-600 hover:text-brand-700 font-bold underline decoration-2 underline-offset-4 hover:underline-offset-2 transition-all duration-200"
              >
                Sign in →
              </Link>
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
