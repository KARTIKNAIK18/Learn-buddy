import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  GraduationCap, ChevronDown, ChevronUp,
  Star, Zap, BookOpen, TrendingUp, Hash, User, CircleDashed,
} from 'lucide-react';
import { getClassroomStudents, getStudentPerformance } from '../../api/teacher';

/* ── Level helpers ── */
const LEVEL_COLORS = {
  Beginner: { bg: 'bg-slate-100',   text: 'text-slate-700',   bar: 'from-slate-400 to-slate-500'   },
  Learner:  { bg: 'bg-blue-100',    text: 'text-blue-700',    bar: 'from-blue-400 to-blue-500'    },
  Explorer: { bg: 'bg-violet-100',  text: 'text-violet-700',  bar: 'from-violet-400 to-violet-500'  },
  Champion: { bg: 'bg-amber-100',   text: 'text-amber-700',   bar: 'from-amber-400 to-amber-500'   },
};
const LEVEL_ORDER = ['Beginner', 'Learner', 'Explorer', 'Champion'];
const LEVEL_THRESH = { Beginner: 0, Learner: 100, Explorer: 250, Champion: 500 };

function levelProgress(pts) {
  let idx = 0;
  LEVEL_ORDER.forEach((l, i) => { if (pts >= LEVEL_THRESH[l]) idx = i; });
  const next = LEVEL_ORDER[idx + 1] || null;
  const cur  = LEVEL_ORDER[idx];
  const pct  = next
    ? Math.min(Math.round(((pts - LEVEL_THRESH[cur]) / (LEVEL_THRESH[next] - LEVEL_THRESH[cur])) * 100), 100)
    : 100;
  return { pct, level: cur, nextLevel: next, remaining: next ? LEVEL_THRESH[next] - pts : 0 };
}

/* ── Single student expandable card ── */
const StudentCard = ({ student }) => {
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
        const { data } = await getStudentPerformance(student.student_id);
        setPerf(data);
      } catch {
        setErr('Could not load performance data.');
      } finally {
        setLoading(false);
        setLoaded(true);
      }
    }
  };

  const initials = (student.name || '?').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const lp       = perf ? levelProgress(perf.total_points) : null;
  const lc       = perf ? (LEVEL_COLORS[perf.level] || LEVEL_COLORS.Beginner) : null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header row */}
      <button
        onClick={toggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {initials}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900">{student.name}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Hash size={10} /> Roll&nbsp;{student.roll_no}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <User size={10} /> Age&nbsp;{student.age}
            </span>
            <span className="text-xs text-slate-400">ID:&nbsp;{student.student_id}</span>
          </div>
        </div>
        {/* Level badge (shown once loaded) */}
        {perf && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${lc.bg} ${lc.text}`}>
            {perf.level}
          </span>
        )}
        {open ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 space-y-4">
          {loading && <LoadingSpinner />}
          {err     && <p className="text-xs text-red-500">{err}</p>}

          {perf && (
            <>
              {/* Stat row */}
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

              {/* Level progression bar */}
              <div className="bg-white border border-slate-100 rounded-xl px-4 py-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp size={13} className="text-violet-500" />
                  <span className="text-xs font-semibold text-slate-600">Level Progress</span>
                </div>
                <div className="flex justify-between mb-1.5">
                  {LEVEL_ORDER.map((l) => (
                    <span key={l} className={`text-[10px] font-bold ${l === perf.level ? lc.text : 'text-slate-300'}`}>
                      {l}
                    </span>
                  ))}
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${lc.bar} transition-all duration-700`}
                    style={{ width: `${lp.pct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs font-semibold text-slate-700">{perf.total_points} pts</span>
                  {lp.nextLevel ? (
                    <span className="text-xs text-slate-400">{lp.remaining} pts to {lp.nextLevel}</span>
                  ) : (
                    <span className="text-xs text-amber-600 font-semibold">🏆 Max level!</span>
                  )}
                </div>
              </div>

              {/* Activity breakdown bars */}
              {perf.breakdown?.length > 0 ? (
                <div className="bg-white border border-slate-100 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-slate-600 mb-3">Activity Breakdown</p>
                  <div className="space-y-3">
                    {perf.breakdown.map((b) => {
                      const barPct = perf.total_points > 0
                        ? Math.round((b.points_earned / perf.total_points) * 100) : 0;
                      return (
                        <div key={b.activity_name}>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-medium text-slate-700 capitalize">
                              {b.activity_name.replace(/-/g, ' ')}
                            </span>
                            <span className="text-xs font-bold text-brand-600">+{b.points_earned} pts</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-500"
                                style={{ width: `${barPct}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 w-7 text-right tabular-nums">{barPct}%</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            &times;{b.times_completed} completion{b.times_completed !== 1 ? 's' : ''}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-xl px-4 py-5 text-center">
                  <CircleDashed size={24} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No activities completed yet.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Page ── */
const ClassroomStudents = () => {
  const { id } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    getClassroomStudents(id)
      .then((res) => setStudents(res.data || []))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load students.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="mb-2">
          <Link to="/teacher/classrooms" className="text-brand-600 hover:text-brand-700 text-sm font-medium">
            ← Back to Classrooms
          </Link>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Classroom Students</h1>
            <p className="text-slate-500 mt-1">
              {students.length} active student{students.length !== 1 ? 's' : ''} &middot; Classroom&nbsp;
              <span className="font-mono text-slate-700">{id}</span>
            </p>
          </div>
        </div>

        {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-5">{error}</div>}

        {students.length === 0 ? (
          <div className="card py-16 text-center">
            <GraduationCap size={48} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">No approved students in this classroom yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((s) => (
              <StudentCard key={s.student_id} student={s} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClassroomStudents;
