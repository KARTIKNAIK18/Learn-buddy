import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  getMyStudents,
  addStudent,
  getStudentEnrollments,
  getStudentPerformance,
} from '../../api/parent';
import {
  User,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  School,
  Star,
  Zap,
  CircleDashed,
  Clock,
  CheckCircle,
  XCircle,
  BookOpen,
  TrendingUp,
} from 'lucide-react';

const EMPTY_FORM = { name: '', email: '', password: '', age: '' };

const STATUS_MAP = {
  ACTIVE:    { label: 'Active',    cls: 'bg-green-100 text-green-700'  },
  PENDING:   { label: 'Pending',   cls: 'bg-amber-100 text-amber-700'  },
  DROPPED:   { label: 'Dropped',   cls: 'bg-red-100   text-red-700'    },
  COMPLETED: { label: 'Completed', cls: 'bg-slate-100 text-slate-600'  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_MAP[status] || STATUS_MAP.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
      {status === 'ACTIVE'    && <CheckCircle size={11} />}
      {status === 'PENDING'   && <Clock size={11} />}
      {status === 'DROPPED'   && <XCircle size={11} />}
      {status === 'COMPLETED' && <BookOpen size={11} />}
      {cfg.label}
    </span>
  );
};

const StudentCard = ({ student }) => {
  const [open, setOpen]               = useState(false);
  const [loaded, setLoaded]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const [progress, setProgress]       = useState(null);   // { total_points, level, activities_completed, breakdown }
  const [detailErr, setDetailErr]     = useState(null);

  const toggle = async () => {
    setOpen((prev) => !prev);
    if (!loaded) {
      setLoading(true);
      setDetailErr(null);
      const [eRes, pRes] = await Promise.allSettled([
        getStudentEnrollments(student.id),
        getStudentPerformance(student.id),
      ]);
      if (eRes.status === 'fulfilled') setEnrollments(eRes.value.data || []);
      if (pRes.status === 'fulfilled') setProgress(pRes.value.data || null);
      if (eRes.status === 'rejected' && pRes.status === 'rejected')
        setDetailErr('Could not load details.');
      setLoaded(true);
      setLoading(false);
    }
  };

  const initials = (student.Studentname || student.name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const activeCount  = enrollments.filter((e) => e.status === 'ACTIVE').length;
  const pendingCount = enrollments.filter((e) => e.status === 'PENDING').length;

  const LEVEL_COLORS = {
    Beginner: 'bg-slate-100 text-slate-700',
    Learner:  'bg-blue-100 text-blue-700',
    Explorer: 'bg-violet-100 text-violet-700',
    Champion: 'bg-amber-100 text-amber-700',
  };
  const levelCls = LEVEL_COLORS[progress?.level] || LEVEL_COLORS.Beginner;

  const levelProgress = (pts) => {
    const THRESH = [
      { name: 'Beginner', min: 0 },
      { name: 'Learner',  min: 100 },
      { name: 'Explorer', min: 250 },
      { name: 'Champion', min: 500 },
    ];
    let idx = 0;
    for (let i = 0; i < THRESH.length; i++) {
      if (pts >= THRESH[i].min) idx = i;
    }
    const current = THRESH[idx];
    const next    = THRESH[idx + 1] || null;
    const pct     = next ? ((pts - current.min) / (next.min - current.min)) * 100 : 100;
    return {
      pct:       Math.min(Math.round(pct), 100),
      nextLevel: next ? next.name : null,
      remaining: next ? next.min - pts : 0,
    };
  };

  return (
    <div className="card overflow-hidden p-0">
      <div className="flex items-center gap-4 p-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900">{student.Studentname || student.name}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-slate-400">{student.email || 'no email'}</span>
            {student.age  && <span className="text-xs text-slate-400">Age&nbsp;{student.age}</span>}
            {student.roll_no && <span className="text-xs text-slate-400">Roll&nbsp;{student.roll_no}</span>}
            <span className="text-xs text-slate-400">ID:&nbsp;{student.id}</span>
          </div>
        </div>
        {loaded && (
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            {activeCount > 0 && (
              <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                {activeCount} class{activeCount !== 1 ? 'es' : ''}
              </span>
            )}
            {pendingCount > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                {pendingCount} pending
              </span>
            )}
            {progress?.level && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${levelCls}`}>
                {progress.level}
              </span>
            )}
          </div>
        )}
        <button
          onClick={toggle}
          className="flex-shrink-0 text-slate-500 hover:text-brand-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 space-y-5">
          {loading && <LoadingSpinner />}
          {detailErr && <p className="text-sm text-red-500">{detailErr}</p>}

          {!loading && loaded && (
            <>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <School size={15} className="text-brand-600" />
                  <h3 className="text-sm font-semibold text-slate-700">Classrooms</h3>
                </div>
                {enrollments.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Not enrolled in any classroom yet.</p>
                ) : (
                  <div className="space-y-2">
                    {enrollments.map((e) => (
                      <div
                        key={e.enrollment_id}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white border border-slate-100 rounded-xl px-3 py-2.5"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{e.class_name}</p>
                          <p className="text-xs text-slate-500">
                            {e.academic_year} &middot; Sec {e.section} &middot; Teacher: {e.teacher_name}
                          </p>
                        </div>
                        <StatusBadge status={e.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Learning Progress */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={15} className="text-violet-600" />
                  <h3 className="text-sm font-semibold text-slate-700">Learning Progress</h3>
                </div>
                {!progress || progress.activities_completed === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-xl px-4 py-6 text-center">
                    <CircleDashed size={28} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No activities completed yet.</p>
                    <p className="text-xs text-slate-400 mt-0.5">Encourage {student.Studentname || student.name} to start learning!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-3 text-center">
                        <Star size={16} className="text-amber-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-amber-700">{progress.total_points}</p>
                        <p className="text-xs text-amber-600">Points</p>
                      </div>
                      <div className={`border rounded-xl px-3 py-3 text-center ${LEVEL_COLORS[progress.level] || 'bg-slate-50 border-slate-100'}`}>
                        <Zap size={16} className="mx-auto mb-1 text-current" />
                        <p className="text-sm font-bold">{progress.level}</p>
                        <p className="text-xs">Level</p>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-3 text-center">
                        <BookOpen size={16} className="text-emerald-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-emerald-700">{progress.activities_completed}</p>
                        <p className="text-xs text-emerald-600">Done</p>
                      </div>
                    </div>
                    {/* Level progression bar */}
                    {(() => {
                      const { pct, nextLevel, remaining } = levelProgress(progress.total_points);
                      const LEVELS = ['Beginner', 'Learner', 'Explorer', 'Champion'];
                      const BAR_COLOR = {
                        Beginner: 'from-slate-400 to-slate-500',
                        Learner:  'from-blue-400 to-blue-500',
                        Explorer: 'from-violet-400 to-violet-500',
                        Champion: 'from-amber-400 to-amber-500',
                      };
                      return (
                        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3">
                          <div className="flex justify-between mb-1.5">
                            {LEVELS.map((l) => (
                              <span
                                key={l}
                                className={`text-[10px] font-bold ${
                                  l === progress.level ? 'text-violet-600' : 'text-slate-300'
                                }`}
                              >
                                {l}
                              </span>
                            ))}
                          </div>
                          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${BAR_COLOR[progress.level] || 'from-slate-400 to-slate-500'} transition-all duration-700`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-1.5">
                            <span className="text-xs font-semibold text-slate-700">{progress.total_points} pts</span>
                            {nextLevel ? (
                              <span className="text-xs text-slate-400">{remaining} pts to {nextLevel}</span>
                            ) : (
                              <span className="text-xs text-amber-600 font-semibold">🏆 Max level!</span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                    {progress.breakdown && progress.breakdown.length > 0 && (
                      <div className="bg-white border border-slate-100 rounded-xl px-4 py-3">
                        <p className="text-xs font-semibold text-slate-600 mb-3">Activity Breakdown</p>
                        <div className="space-y-3">
                          {progress.breakdown.map((b, i) => {
                            const barPct = progress.total_points > 0
                              ? Math.round((b.points_earned / progress.total_points) * 100) : 0;
                            return (
                              <div key={i}>
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs font-medium text-slate-700 capitalize">
                                    {b.activity_name.replace(/-/g, ' ')}
                                  </span>
                                  <span className="text-xs font-bold text-violet-600">+{b.points_earned} pts</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-violet-400 to-indigo-500 transition-all duration-500"
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
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const MyStudents = () => {
  const [students, setStudents]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);
  const [formError, setFormError]   = useState(null);

  const fetchStudents = async () => {
    try {
      const { data } = await getMyStudents();
      setStudents(data || []);
    } catch {
      setError('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.age) {
      setFormError('All fields are required.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await addStudent({ name: form.name, email: form.email, password: form.password, age: Number(form.age), role: 'student' });
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchStudents();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to add student.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Students</h1>
            <p className="text-slate-500 mt-1">View profiles, classrooms and performance for each child</p>
          </div>
          <button
            className="btn-primary flex items-center gap-2"
            onClick={() => { setShowForm(!showForm); setFormError(null); }}
          >
            {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Student</>}
          </button>
        </div>

        {showForm && (
          <div className="card mb-6 animate-slide-up">
            <h2 className="font-semibold text-slate-900 mb-4">Add New Student</h2>
            {formError && <div className="alert-error mb-4">{formError}</div>}
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Alex Smith" className="input" />
              </div>
              <div>
                <label className="input-label">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="student@example.com" className="input" />
              </div>
              <div>
                <label className="input-label">Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Set a password" className="input" />
              </div>
              <div>
                <label className="input-label">Age</label>
                <input name="age" type="number" min="5" max="18" value={form.age} onChange={handleChange} placeholder="e.g. 10" className="input" />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Adding...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        )}

        {error && <div className="alert-error mb-5">{error}</div>}

        {loading ? (
          <LoadingSpinner />
        ) : students.length === 0 ? (
          <div className="empty-state card py-20 text-center">
            <User size={56} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-700 font-semibold text-lg mb-1">No students yet</p>
            <p className="text-slate-500 text-sm">Click "Add Student" to add your first child.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((s) => (
              <StudentCard key={s.id} student={s} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyStudents;
