import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner  from '../../components/common/LoadingSpinner';
import { getMyClassrooms, getMyContent } from '../../api/student';
import {
  School, CalendarDays, User, Video, FileText,
  HelpCircle, Link2, PenLine, ChevronDown, ChevronUp,
  BookMarked, ExternalLink, Inbox,
} from 'lucide-react';

/* ── per-content-type icon + colour ── */
const CONTENT_META = {
  video:    { Icon: Video,      bg: 'bg-red-100    text-red-600',    badge: 'bg-red-50    text-red-600    border-red-100'    },
  pdf:      { Icon: FileText,   bg: 'bg-blue-100   text-blue-600',   badge: 'bg-blue-50   text-blue-600   border-blue-100'   },
  document: { Icon: FileText,   bg: 'bg-blue-100   text-blue-600',   badge: 'bg-blue-50   text-blue-600   border-blue-100'   },
  quiz:     { Icon: HelpCircle, bg: 'bg-purple-100 text-purple-600', badge: 'bg-purple-50 text-purple-600 border-purple-100' },
  link:     { Icon: Link2,      bg: 'bg-green-100  text-green-600',  badge: 'bg-green-50  text-green-600  border-green-100'  },
  text:     { Icon: PenLine,    bg: 'bg-amber-100  text-amber-600',  badge: 'bg-amber-50  text-amber-600  border-amber-100'  },
};
const meta = (type) => CONTENT_META[type] || CONTENT_META.text;

/* ── distinct gradient per classroom index ── */
const GRADIENTS = [
  'from-brand-600  to-brand-800',
  'from-violet-600 to-violet-800',
  'from-emerald-600 to-emerald-800',
  'from-rose-600   to-rose-800',
  'from-amber-600  to-amber-800',
  'from-indigo-600 to-indigo-800',
];

/* ── single classroom section ── */
const ClassroomSection = ({ classroom, index }) => {
  const [contents, setContents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [open,     setOpen]     = useState(true);   // expanded by default

  useEffect(() => {
    getMyContent(classroom.id)
      .then(({ data }) => setContents(data || []))
      .catch(() => setContents([]))
      .finally(() => setLoading(false));
  }, [classroom.id]);

  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">

      {/* ── Header ── */}
      <div className={`bg-gradient-to-r ${gradient} p-5 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs font-medium mb-1 uppercase tracking-wide">Enrolled Classroom</p>
            <h2 className="text-xl font-bold mb-2 truncate">{classroom.class_name}</h2>
            <div className="flex flex-wrap gap-3 text-sm text-white/80">
              <span className="flex items-center gap-1.5"><CalendarDays size={13} /> {classroom.academic_year}</span>
              <span>Section {classroom.section}</span>
            </div>
          </div>
          <School size={48} className="opacity-10 flex-shrink-0 hidden sm:block" />
        </div>

        {/* Teacher chip */}
        {classroom.teacher_name && (
          <div className="flex items-center gap-2 mt-4 bg-white/15 rounded-xl px-3 py-2 w-fit">
            <User size={14} />
            <span className="text-sm font-medium">{classroom.teacher_name}</span>
            {classroom.teacher_email && (
              <span className="text-xs text-white/70 hidden sm:inline">· {classroom.teacher_email}</span>
            )}
          </div>
        )}
      </div>

      {/* ── Content toggle bar ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3 bg-slate-50
                   border-b border-slate-200 hover:bg-slate-100 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <BookMarked size={15} className="text-brand-500" />
          Learning Materials
          {!loading && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-xs">
              {contents.length}
            </span>
          )}
        </span>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      {/* ── Content grid ── */}
      {open && (
        <div className="p-5 bg-white">
          {loading ? (
            <div className="py-6 flex justify-center">
              <LoadingSpinner message="" />
            </div>
          ) : contents.length === 0 ? (
            <div className="text-center py-10">
              <Inbox size={36} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No materials uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {contents.map((c) => {
                const m = meta(c.content_type);
                return (
                  <div
                    key={c.id}
                    onClick={() => c.content_url && window.open(c.content_url, '_blank', 'noopener,noreferrer')}
                    className={`group rounded-xl border border-slate-100 bg-slate-50 p-4 flex flex-col gap-2
                               transition-all hover:shadow-md hover:border-slate-200
                               ${c.content_url ? 'cursor-pointer' : ''}`}
                  >
                    {/* icon + type badge */}
                    <div className="flex items-center justify-between">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${m.bg}`}>
                        <m.Icon size={16} />
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${m.badge}`}>
                        {c.content_type}
                      </span>
                    </div>
                    {/* title */}
                    <p className="text-sm font-semibold text-slate-800 line-clamp-2 group-hover:text-brand-600 transition-colors">
                      {c.title}
                    </p>
                    {/* description */}
                    {c.description && (
                      <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>
                    )}
                    {/* open link */}
                    {c.content_url && (
                      <div className="mt-auto flex items-center gap-1 text-xs text-brand-600 font-medium pt-1">
                        <ExternalLink size={12} /> Open
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Main page ── */
const MyClassroom = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    getMyClassrooms()
      .then(({ data }) => setClassrooms(data || []))
      .catch(() => setError('Failed to load classrooms.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Classrooms</h1>
        <p className="text-slate-500 mt-1 text-sm">
          All classrooms you are enrolled in — with their learning materials
        </p>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : classrooms.length === 0 ? (
        <div className="card text-center py-20">
          <School size={56} className="text-slate-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Not Enrolled Yet</h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Ask your parent to submit an enrollment request for a classroom.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {classrooms.map((cls, i) => (
            <ClassroomSection key={cls.id} classroom={cls} index={i} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyClassroom;
