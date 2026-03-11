import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import RecommendedActivities from '../../components/student/RecommendedActivities';
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
            <div className={`card border ${levelColors.border} ${levelColors.bg} mb-7 overflow-hidden relative`}>
              {/* Decorative Background Pattern */}
              <div className="absolute top-0 right-0 opacity-5">
                <Trophy size={120} className={levelColors.text} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                      <Trophy size={12} /> Current Level
                    </p>
                    <p className={`text-4xl font-extrabold ${levelColors.text} flex items-center gap-2`}>
                      {points ? level : '--'}
                      {points && <Sparkles size={24} className="text-amber-400 animate-pulse" />}
                    </p>
                    {points && nextThreshold ? (
                      <p className="text-sm text-slate-500 mt-2 font-medium flex items-center gap-1.5">
                        <Zap size={14} className="text-amber-500" />
                        <span className="font-bold text-slate-700">{nextThreshold - totalPoints} points</span> to next level
                      </p>
                    ) : points ? (
                      <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                        <Star size={14} className="text-amber-400" /> 
                        <span className="font-bold">Maximum level reached!</span>
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500 mt-2">Complete activities to earn points</p>
                    )}
                  </div>

                  {/* Stats Mini Cards */}
                  {points && (
                    <div className="flex gap-3">
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-slate-200 shadow-sm min-w-[100px]">
                        <p className="text-xs text-slate-500 font-medium">Total Points</p>
                        <p className="text-2xl font-extrabold text-slate-900 flex items-center gap-1">
                          <Star size={18} className="text-amber-500" />
                          {totalPoints}
                        </p>
                      </div>
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-slate-200 shadow-sm min-w-[100px]">
                        <p className="text-xs text-slate-500 font-medium">Activities</p>
                        <p className="text-2xl font-extrabold text-slate-900 flex items-center gap-1">
                          <Zap size={18} className="text-blue-500" />
                          {activitiesDone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600">Progress to {level === 'Champion' ? 'Maximum' : Object.keys(LEVEL_NEXT)[Object.keys(LEVEL_NEXT).indexOf(level) + 1]}</span>
                    <span className={`${levelColors.text} text-sm`}>{points ? progressPct : 0}%</span>
                  </div>
                  
                  <div className="relative">
                    {/* Progress Bar Container */}
                    <div className="w-full bg-white rounded-full h-6 border-2 border-slate-200 overflow-hidden shadow-inner relative">
                      {/* Animated Gradient Progress */}
                      <div
                        className={`h-6 rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${progressBarColor}`}
                        style={{ width: `${points ? progressPct : 0}%` }}
                      >
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                             style={{ backgroundSize: '200% 100%' }} />
                      </div>
                      
                      {/* Points Label Inside Bar */}
                      {points && progressPct > 15 && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white z-10 flex items-center gap-1">
                          <Star size={12} fill="white" />
                          {totalPoints} pts
                        </div>
                      )}
                      
                      {/* Target Label */}
                      {points && nextThreshold && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 z-10">
                          {nextThreshold}
                        </div>
                      )}
                    </div>
                    
                    {/* Milestone Markers */}
                    {points && nextThreshold && (
                      <div className="absolute top-0 w-full h-6 pointer-events-none">
                        {[25, 50, 75].map((milestone) => {
                          const milestonePoints = (nextThreshold * milestone) / 100;
                          const isPassed = totalPoints >= milestonePoints;
                          return (
                            <div
                              key={milestone}
                              className="absolute top-0 h-full flex items-center"
                              style={{ left: `${milestone}%` }}
                            >
                              <div className={`w-0.5 h-full ${isPassed ? 'bg-white/50' : 'bg-slate-300'}`} />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Level Milestones */}
                  {points && (
                    <div className="flex justify-between text-xs pt-1">
                      {Object.entries(LEVEL_NEXT).map(([lvl, threshold]) => {
                        const isCurrentOrPassed = threshold === null || (totalPoints >= threshold);
                        const isCurrent = lvl === level;
                        return (
                          <div key={lvl} className={`text-center ${isCurrent ? 'font-bold' : ''}`}>
                            <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${
                              isCurrentOrPassed 
                                ? levelColors.text.replace('text-', 'bg-')
                                : 'bg-slate-300'
                            }`} />
                            <span className={isCurrent ? levelColors.text : 'text-slate-400'}>
                              {lvl}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Activity Breakdown */}
                {points?.breakdown?.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-white/60">
                    <p className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-1.5">
                      <Gamepad2 size={14} /> Activity Breakdown
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {points.breakdown.map((b) => (
                        <div key={b.activity_name}
                          className="bg-white rounded-xl px-3 py-2 text-xs text-slate-700 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                          <span className="font-bold capitalize">{b.activity_name.replace(/-/g, ' ')}</span>
                          <span className="ml-1.5 text-slate-400">×{b.times_completed}</span>
                          <span className="ml-1.5 font-extrabold text-brand-600">+{b.points_earned}pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Activities */}
            <div className="mb-7">
              <RecommendedActivities />
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
