import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard        from '../../components/common/StatCard';
import LoadingSpinner  from '../../components/common/LoadingSpinner';
import { getMyClassrooms, getPendingEnrollments, approveEnrollment, rejectEnrollment } from '../../api/teacher';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen, CalendarDays, ClipboardCheck,
  PlusCircle, UploadCloud, BarChart2, CheckCircle2, XCircle, Users,
} from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [classrooms,   setClassrooms]   = useState([]);
  const [enrollments,  setEnrollments]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [actionIds,    setActionIds]    = useState({}); // id → 'approving'|'rejecting'

  useEffect(() => {
    Promise.all([getMyClassrooms(), getPendingEnrollments()])
      .then(([clsRes, enrRes]) => {
        setClassrooms(clsRes.data  || []);
        setEnrollments(enrRes.data || []);
      })
      .catch(() => setError('Could not load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    setActionIds((p) => ({ ...p, [id]: 'approving' }));
    try {
      await approveEnrollment(id);
      setEnrollments((p) => p.filter((e) => e.id !== id));
    } catch { /* ignore */ }
    finally { setActionIds((p) => { const n = { ...p }; delete n[id]; return n; }); }
  };

  const handleReject = async (id) => {
    setActionIds((p) => ({ ...p, [id]: 'rejecting' }));
    try {
      await rejectEnrollment(id);
      setEnrollments((p) => p.filter((e) => e.id !== id));
    } catch { /* ignore */ }
    finally { setActionIds((p) => { const n = { ...p }; delete n[id]; return n; }); }
  };

  if (loading) return <DashboardLayout><LoadingSpinner message="Loading dashboard…" /></DashboardLayout>;

  const thisYear = new Date().getFullYear().toString();

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Here's what needs your attention today.</p>
      </div>

      {error && <div className="alert-error mb-6">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="My Classrooms"       value={classrooms.length}  icon={<BookOpen size={22} />}       color="brand"  />
        <StatCard title="Pending Enrollments" value={enrollments.length} icon={<ClipboardCheck size={22} />} color="amber"
          subtitle={enrollments.length > 0 ? 'Needs review' : 'All clear'} />
        <StatCard title="This Academic Year"
          value={classrooms.filter(c => c.academic_year === thisYear).length}
          icon={<CalendarDays size={22} />} color="violet"
          subtitle="Active classrooms" />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Classrooms */}
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <BookOpen size={18} className="text-brand-500" /> My Classrooms
            </h2>
            <Link to="/teacher/classrooms" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              Manage →
            </Link>
          </div>
          {classrooms.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-400 text-sm mb-3">No classrooms yet.</p>
              <Link to="/teacher/classrooms" className="btn-primary btn-sm inline-flex">
                <PlusCircle size={15} /> New Classroom
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {classrooms.slice(0, 6).map((c) => (
                <li key={c.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{c.class_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{c.academic_year} · Section {c.section}</p>
                  </div>
                  <Link to={`/teacher/classrooms/${c.id}/students`}
                    className="btn-outline btn-sm flex items-center gap-1">
                    <Users size={13} /> Students
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pending Enrollments */}
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <ClipboardCheck size={18} className="text-amber-500" /> Pending Enrollments
              {enrollments.length > 0 && (
                <span className="badge badge-pending ml-1">{enrollments.length}</span>
              )}
            </h2>
            <Link to="/teacher/enrollments" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              View all →
            </Link>
          </div>
          {enrollments.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle2 size={40} className="text-emerald-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No pending enrollments. All clear!</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {enrollments.slice(0, 5).map((e) => (
                <li key={e.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {e.student_name || e.Studentname || 'Student'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{e.classroom_name || `Classroom #${e.classroom_id}`}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(e.id)}
                      disabled={!!actionIds[e.id]}
                      className="btn-success btn-sm flex items-center gap-1"
                    >
                      <CheckCircle2 size={13} />
                      {actionIds[e.id] === 'approving' ? '…' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(e.id)}
                      disabled={!!actionIds[e.id]}
                      className="btn-danger btn-sm flex items-center gap-1"
                    >
                      <XCircle size={13} />
                      {actionIds[e.id] === 'rejecting' ? '…' : 'Reject'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/teacher/add-content', label: 'Upload Content',    desc: 'Add videos, PDFs and links',   Icon: UploadCloud,    color: 'bg-brand-50   border-brand-100   text-brand-700'   },
          { to: '/teacher/content',     label: 'My Content',        desc: 'View and delete materials',    Icon: BookOpen,       color: 'bg-violet-50  border-violet-100  text-violet-700'  },
          { to: '/teacher/performance', label: 'Student Progress',  desc: 'Track scores and attendance',  Icon: BarChart2,      color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
        ].map(({ to, label, desc, Icon, color }) => (
          <Link key={to} to={to}
            className={`card-hover rounded-2xl border p-5 ${color} flex items-start gap-3`}>
            <Icon size={22} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs opacity-70 mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
