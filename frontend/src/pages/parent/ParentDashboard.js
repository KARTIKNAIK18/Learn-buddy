import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getMyStudents, getStudentEnrollments, getStudentPerformance } from '../../api/parent';
import {
  Users, ClipboardList, School, User, ArrowRight, Clock, CheckCircle,
  Star, Zap, BookOpen, TrendingUp, ChevronDown, ChevronUp, CircleDashed,
} from 'lucide-react';

/* ─── level helpers ─── */
const LEVEL_COLORS = {
  Beginner: { bg: 'bg-slate-100',   text: 'text-slate-700',   bar: 'from-slate-400 to-slate-500'   },
  Learner:  { bg: 'bg-blue-100',    text: 'text-blue-700',    bar: 'from-blue-400 to-blue-500'    },
  Explorer: { bg: 'bg-violet-100',  text: 'text-violet-700',  bar: 'from-violet-400 to-violet-500'  },
  Champion: { bg: 'bg-amber-100',   text: 'text-amber-700',   bar: 'from-amber-400 to-amber-500'   },
};
const LEVEL_ORDER  = ['Beginner', 'Learner', 'Explorer', 'Champion'];
const LEVEL_THRESH = { Beginner: 0, Learner: 100, Explorer: 250, Champion: 500 };

function levelProg(pts) {
  let idx = 0;
  LEVEL_ORDER.forEach((l, i) => { if (pts >= LEVEL_THRESH[l]) idx = i; });
  const cur  = LEVEL_ORDER[idx];
  const next = LEVEL_ORDER[idx + 1] || null;
  const pct  = next
    ? Math.min(Math.round(((pts - LEVEL_THRESH[cur]) / (LEVEL_THRESH[next] - LEVEL_THRESH[cur])) * 100), 100)
    : 100;
  return { pct, level: cur, nextLevel: next, remaining: next ? LEVEL_THRESH[next] - pts : 0 };
}

/* ─── per-student performance card ─── */
const StudentPerfCard = ({ student }) => {
  const [open,    setOpen]    = useState(false);
  const [perf,    setPerf]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState(null);
  const [loaded,  setLoaded]  = useState(false);

  const toggle = async () => {
    setOpen((v) => !v);
    if (!loaded) {
      setLoading(true);
      try {
        const { data } = await getStudentPerformance(student.id);
        setPerf(data);
      } catch {
        setErr('Could not load progress.');
      } finally {
        setLoading(false);
        setLoaded(true);
      }
    }
  };

  const initials = (student.Studentname || student.name || '?').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const lc = perf ? (LEVEL_COLORS[perf.level] || LEVEL_COLORS.Beginner) : null;
  const lp = perf ? levelProg(perf.total_points) : null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      <button
        onClick={toggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900">{student.Studentname || student.name}</p>
          <p className="text-xs text-slate-400">Age {student.age} · ID {student.id}</p>
        </div>
        {perf && lc && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${lc.bg} ${lc.text}`}>
            {perf.level}
          </span>
        )}
        {perf && (
          <span className="text-xs font-semibold text-amber-600 flex-shrink-0">⭐ {perf.total_points} pts</span>
        )}
        {open ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 space-y-4">
          {loading && <LoadingSpinner />}
          {err     && <p className="text-xs text-red-500">{err}</p>}

          {perf && lc && lp && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-3 text-center">
                  <Star size={15} className="text-amber-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-amber-700">{perf.total_points}</p>
                  <p className="text-xs text-amber-600">Points</p>
                </div>
                <div className={`border rounded-xl px-3 py-3 text-center ${lc.bg}`}>
                  <Zap size={15} className={`mx-auto mb-1 ${lc.text}`} />
                  <p className={`text-sm font-bold ${lc.text}`}>{perf.level}</p>
                  <p className={`text-xs ${lc.text} opacity-70`}>Level</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-3 text-center">
                  <BookOpen size={15} className="text-emerald-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-emerald-700">{perf.activities_completed}</p>
                  <p className="text-xs text-emerald-600">Done</p>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-xl px-4 py-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp size={13} className={lc.text} />
                  <span className="text-xs font-semibold text-slate-600">Level Progress</span>
                </div>
                <div className="flex justify-between mb-1.5">
                  {LEVEL_ORDER.map((l) => (
                    <span key={l} className={`text-[10px] font-bold ${l === perf.level ? lc.text : 'text-slate-300'}`}>{l}</span>
                  ))}
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${lc.bar} transition-all duration-700`} style={{ width: `${lp.pct}%` }} />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs font-semibold text-slate-700">{perf.total_points} pts</span>
                  {lp.nextLevel
                    ? <span className="text-xs text-slate-400">{lp.remaining} pts to {lp.nextLevel}</span>
                    : <span className="text-xs text-amber-600 font-semibold">🏆 Max level!</span>
                  }
                </div>
              </div>

              {perf.breakdown?.length > 0 ? (
                <div className="bg-white border border-slate-100 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-slate-600 mb-3">Activity Breakdown</p>
                  <div className="space-y-3">
                    {perf.breakdown.map((b) => {
                      const pct = perf.total_points > 0 ? Math.round((b.points_earned / perf.total_points) * 100) : 0;
                      return (
                        <div key={b.activity_name}>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-medium text-slate-700 capitalize">{b.activity_name.replace(/-/g, ' ')}</span>
                            <span className="text-xs font-bold text-violet-600">+{b.points_earned} pts</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-indigo-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[10px] text-slate-400 w-7 text-right tabular-nums">{pct}%</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">&times;{b.times_completed} completion{b.times_completed !== 1 ? 's' : ''}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-xl px-4 py-5 text-center">
                  <CircleDashed size={22} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No activities completed yet. Encourage {student.Studentname || student.name} to start!</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const ParentDashboard = () => {
  const [students, setStudents]         = useState([]);
  const [enrollmentMap, setEnrollmentMap] = useState({}); // studentId → enrollment[]
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    getMyStudents()
      .then(async ({ data }) => {
        const list = data || [];
        setStudents(list);
        // Fetch enrollments for each student in parallel
        const results = await Promise.allSettled(
          list.map((s) => getStudentEnrollments(s.id))
        );
        const map = {};
        results.forEach((r, i) => {
          map[list[i].id] = r.status === 'fulfilled' ? (r.value.data || []) : [];
        });
        setEnrollmentMap(map);
      })
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  // Aggregate enrollment stats across all students
  const allEnrollments = Object.values(enrollmentMap).flat();
  const activeCount    = allEnrollments.filter((e) => e.status === 'ACTIVE').length;
  const pendingCount   = allEnrollments.filter((e) => e.status === 'PENDING').length;

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Parent Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your children's learning journey</p>
        </div>

        {error && <div className="alert-error mb-6">{error}</div>}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard title="My Students"       value={students.length} icon={<Users size={22} />}       color="blue"   />
          <StatCard title="Active Classes"     value={activeCount}     icon={<School size={22} />}      color="green"  />
          <StatCard title="Pending Requests"   value={pendingCount}    icon={<ClipboardList size={22} />} color={pendingCount > 0 ? 'amber' : 'purple'} />
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link to="/parent/students" className="card-hover card flex items-center gap-4 no-underline group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Users size={24} />
            </div>
            <div>
              <p className="font-semibold text-slate-900">My Students</p>
              <p className="text-sm text-slate-500">View profiles, classrooms &amp; performance</p>
            </div>
            <ArrowRight size={18} className="ml-auto text-slate-400 group-hover:text-brand-600" />
          </Link>
          <Link to="/parent/enroll" className="card-hover card flex items-center gap-4 no-underline group">
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
              <ClipboardList size={24} />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Enroll Student</p>
              <p className="text-sm text-slate-500">Request classroom enrollment</p>
            </div>
            <ArrowRight size={18} className="ml-auto text-slate-400 group-hover:text-brand-600" />
          </Link>
        </div>

        {/* Students quick view with enrollment chips */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Students Overview</h2>
            <Link to="/parent/students" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              Manage →
            </Link>
          </div>

          {students.length === 0 ? (
            <div className="text-center py-10 empty-state">
              <User size={40} className="text-slate-300 mb-3 mx-auto" />
              <p className="text-sm text-slate-500 mb-3">No students added yet.</p>
              <Link to="/parent/students" className="btn-primary btn-sm">Add Student</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((s) => {
                const enrols  = enrollmentMap[s.id] || [];
                const active  = enrols.filter((e) => e.status === 'ACTIVE');
                const pending = enrols.filter((e) => e.status === 'PENDING');
                const initials = (s.Studentname || s.name || '?')
                  .split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
                return (
                  <div key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">{s.Studentname || s.name}</p>
                      <p className="text-xs text-slate-500">Age {s.age}</p>
                    </div>
                    {/* Enrollment chips */}
                    <div className="flex flex-wrap gap-2">
                      {active.map((e) => (
                        <span key={e.enrollment_id} className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                          <CheckCircle size={10} /> {e.class_name}
                        </span>
                      ))}
                      {pending.map((e) => (
                        <span key={e.enrollment_id} className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                          <Clock size={10} /> {e.class_name} (pending)
                        </span>
                      ))}
                      {enrols.length === 0 && (
                        <span className="text-xs text-slate-400 italic">Not enrolled</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Student Progress / Performance */}
        <div className="card mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-violet-500" />
              Student Progress
            </h2>
            <Link to="/parent/students" className="text-sm text-brand-600 hover:text-brand-700 font-medium">Full details →</Link>
          </div>
          {students.length === 0 ? (
            <div className="text-center py-8">
              <CircleDashed size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Add a student to track their progress.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((s) => <StudentPerfCard key={s.id} student={s} />)}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;
