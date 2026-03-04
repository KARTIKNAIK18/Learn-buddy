import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getMyClassrooms, getMyPoints, getMyContent, getMyProfile } from '../../api/student';
import { BookMarked, School, Star, Zap, ArrowRight, Gamepad2, Languages, PenLine, BookOpen, User, Hash, Trophy, Sparkles } from 'lucide-react';

const LEVEL_COLORS = {
  Beginner: { bg: 'bg-slate-100',  text: 'text-slate-700',  border: 'border-slate-200'  },
  Learner:  { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200'   },
  Explorer: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' },
  Champion: { bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-200'  },
};

const LEVEL_NEXT = { Beginner: 100, Learner: 250, Explorer: 500, Champion: null };

const StudentDashboard = () => {
  const [classrooms,   setClassrooms]   = useState([]);
  const [points,       setPoints]       = useState(null);
  const [profile,      setProfile]      = useState(null);
  const [contentCount, setContentCount] = useState(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([
      getMyClassrooms().catch(() => ({ data: [] })),
      getMyPoints().catch(() => ({ data: null })),
      getMyProfile().catch(() => ({ data: null })),
    ]).then(async ([clRes, ptRes, prRes]) => {
      const cls = clRes.data || [];
      setClassrooms(cls);
      setPoints(ptRes.data || null);
      setProfile(prRes.data || null);

      const contentArrays = await Promise.all(
        cls.map((c) => getMyContent(c.id).catch(() => ({ data: [] })))
      );
      setContentCount(contentArrays.reduce((sum, r) => sum + (r.data?.length || 0), 0));
    }).finally(() => setLoading(false));
  }, []);

  const totalPoints    = points?.total_points           ?? null;
  const level          = points?.level                  ?? 'Beginner';
  const activitiesDone = points?.activities_completed   ?? null;
  const levelColors    = LEVEL_COLORS[level] || LEVEL_COLORS.Beginner;
  const nextThreshold  = LEVEL_NEXT[level];
  const progressPct    = nextThreshold
    ? Math.min(100, Math.round(((totalPoints || 0) / nextThreshold) * 100))
    : 100;

  const progressBarColor = {
    'text-slate-700':  'bg-slate-500',
    'text-blue-700':   'bg-blue-500',
    'text-violet-700': 'bg-violet-500',
    'text-amber-700':  'bg-amber-500',
  }[levelColors.text] || 'bg-brand-500';

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <span className="inline-flex w-8 h-8 rounded-xl bg-brand-100 text-brand-600 items-center justify-center flex-shrink-0">
                <User size={16} />
              </span>
              Welcome back{profile?.name ? `, ${profile.name}` : ''}!
            </h1>
            <p className="text-slate-500 mt-1 text-sm flex items-center gap-1.5 ml-10">
              <Sparkles size={13} className="text-amber-400" />
              Keep learning and earning points every day
            </p>
          </div>
          {profile && (
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <User size={18} />
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1.5">
                  <Hash size={12} className="text-slate-400" />
                  <span className="text-slate-500 text-xs">Student ID</span>
                  <span className="font-bold text-slate-900">{profile.id}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Hash size={12} className="text-slate-400" />
                  <span className="text-slate-500 text-xs">Roll No</span>
                  <span className="font-semibold text-slate-700">{profile.roll_no}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
              <StatCard title="Total Points"    value={totalPoints    !== null ? totalPoints    : '--'} icon={<Star size={22} />}      color="yellow" />
              <StatCard title="Activities Done" value={activitiesDone !== null ? activitiesDone : '--'} icon={<Zap size={22} />}       color="blue"   />
              <StatCard title="Content Items"   value={contentCount   !== null ? contentCount   : '--'} icon={<BookMarked size={22} />} color="purple" />
            </div>

            {/* Level Banner */}
            <div className={`card border ${levelColors.border} ${levelColors.bg} mb-7`}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                    <Trophy size={12} /> Current Level
                  </p>
                  <p className={`text-3xl font-extrabold ${levelColors.text}`}>{points ? level : '--'}</p>
                  {points && nextThreshold ? (
                    <p className="text-sm text-slate-500 mt-1 font-medium">{totalPoints} / {nextThreshold} pts to next level</p>
                  ) : points ? (
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1"><Star size={12} className="text-amber-400" /> Highest level reached!</p>
                  ) : (
                    <p className="text-sm text-slate-500 mt-1">Complete activities to earn points</p>
                  )}
                </div>
                <div className="flex-1 min-w-[8rem] max-w-xs">
                  <div className="w-full bg-white rounded-full h-4 border border-slate-200 overflow-hidden shadow-inner">
                    <div
                      className={`h-4 rounded-full transition-all duration-700 ${progressBarColor}`}
                      style={{ width: `${points ? progressPct : 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 text-right font-semibold">{points ? progressPct : 0}%</p>
                </div>
              </div>

              {points?.breakdown?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/60">
                  <p className="text-xs font-bold text-slate-600 mb-2.5">Activity Breakdown</p>
                  <div className="flex flex-wrap gap-2">
                    {points.breakdown.map((b) => (
                      <div key={b.activity_name}
                        className="bg-white rounded-xl px-3 py-1.5 text-xs text-slate-700 border border-slate-200 shadow-sm">
                        <span className="font-bold capitalize">{b.activity_name.replace(/-/g, ' ')}</span>
                        <span className="ml-1.5 text-slate-400">×{b.times_completed}</span>
                        <span className="ml-1.5 font-extrabold text-brand-600">+{b.points_earned}pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* My Classrooms */}
            <div className="mb-7">
              <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <School size={18} className="text-indigo-500" /> My Classrooms
              </h2>
              {classrooms.length === 0 ? (
                <div className="card border border-amber-200 bg-amber-50">
                  <div className="flex items-center gap-3">
                    <School size={28} className="text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-800">Not enrolled yet</p>
                      <p className="text-sm text-amber-700 mt-0.5">
                        Ask your parent to submit an enrollment request for your classroom.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {classrooms.map((c) => (
                    <Link key={c.id} to="/student/classroom"
                      className="card-hover card flex items-center gap-3 no-underline group">
                      <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                        <School size={22} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{c.class_name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{c.academic_year}{c.section && ` — ${c.section}`}</p>
                        {c.teacher_name && <p className="text-xs text-slate-400 truncate">Teacher: {c.teacher_name}</p>}
                      </div>
                      <ArrowRight size={16} className="ml-auto text-slate-300 group-hover:text-brand-600 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Zap size={18} className="text-amber-500" /> Quick Links
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { to: '/student/activities', icon: <Gamepad2 size={24} />,  label: 'Activities',     color: 'bg-brand-100 text-brand-600'    },
                  { to: '/student/reading',    icon: <BookOpen size={24} />,  label: 'Reading Space',  color: 'bg-emerald-100 text-emerald-600' },
                  { to: '/student/language',   icon: <Languages size={24} />, label: 'Language',       color: 'bg-sky-100 text-sky-600'         },
                  { to: '/student/writing',    icon: <PenLine size={24} />,   label: 'Writing Helper', color: 'bg-violet-100 text-violet-600'   },
                ].map(({ to, icon, label, color }) => (
                  <Link key={to} to={to}
                    className="card-hover card flex flex-col items-center gap-2.5 py-6 no-underline group text-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>{icon}</div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-brand-600">{label}</p>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
