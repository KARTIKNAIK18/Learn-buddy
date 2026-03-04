import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ReadAloudButton from '../../components/accessibility/ReadAloudButton';
import { getMyClassrooms, getMyContent } from '../../api/student';
import { Video, FileText, HelpCircle, Link2, PenLine, List, Inbox } from 'lucide-react';

const CONTENT_TYPE_META = {
  video:    { Icon: Video,       color: 'bg-red-50 text-red-600',      badge: 'badge-red'    },
  document: { Icon: FileText,    color: 'bg-blue-50 text-blue-600',    badge: 'badge-blue'   },
  quiz:     { Icon: HelpCircle,  color: 'bg-purple-50 text-purple-600', badge: 'badge-violet' },
  link:     { Icon: Link2,       color: 'bg-green-50 text-green-600',  badge: 'badge-active' },
  text:     { Icon: PenLine,     color: 'bg-yellow-50 text-yellow-600', badge: 'badge-pending'},
};

const LearningContent = () => {
  const [contents, setContents]     = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [filter, setFilter]         = useState('all');
  const [clsFilter, setClsFilter]   = useState('all');
  const [search, setSearch]         = useState('');

  useEffect(() => {
    getMyClassrooms()
      .then(({ data: clsList }) => {
        setClassrooms(clsList || []);
        if (!clsList?.length) { setLoading(false); return; }
        return Promise.all(
          clsList.map((cls) =>
            getMyContent(cls.id)
              .then(({ data }) =>
                (data || []).map((item) => ({ ...item, classroom_name: cls.class_name, classroom_id: cls.id }))
              )
              .catch(() => [])
          )
        );
      })
      .then((results) => {
        if (!results) return;
        const all = results.flat();
        setContents(all);
        setFiltered(all);
      })
      .catch(() => setError('Failed to load content.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = contents;
    if (clsFilter !== 'all') result = result.filter((c) => c.classroom_id === Number(clsFilter));
    if (filter !== 'all')    result = result.filter((c) => c.content_type === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.title.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [contents, filter, clsFilter, search]);

  const types = ['all', ...new Set(contents.map((c) => c.content_type))];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Learning Content</h1>
        <p className="text-slate-500 mt-1">
          {classrooms.length > 1
            ? `Materials from ${classrooms.length} classrooms`
            : 'All materials shared by your teacher'}
        </p>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {/* Classroom tabs (only if enrolled in 2+) */}
      {classrooms.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setClsFilter('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors
              ${clsFilter === 'all' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >All Classrooms</button>
          {classrooms.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setClsFilter(String(cls.id))}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors
                ${clsFilter === String(cls.id) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >{cls.class_name}</button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search content…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5
                ${filter === t
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
              {t === 'all'
                ? <><List size={14} /> All</>
                : <>{CONTENT_TYPE_META[t] ? React.createElement(CONTENT_TYPE_META[t].Icon, { size: 14 }) : null} {t}</>
              }
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Inbox size={48} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">
            {search || filter !== 'all' ? 'No results found.' : 'No learning content yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const meta = CONTENT_TYPE_META[c.content_type] || CONTENT_TYPE_META.text;
            return (
              <div
                key={c.id}
                onClick={() => c.content_url && window.open(c.content_url, '_blank', 'noopener,noreferrer')}
                className={`card flex flex-col transition-shadow ${c.content_url ? 'cursor-pointer hover:shadow-md group' : ''}`}
              >
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                    <meta.Icon size={24} />
                  </div>
                  <ReadAloudButton text={`${c.title}. ${c.description || ''}`} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2 group-hover:text-brand-600 transition-colors">{c.title}</h3>
                {c.description && (
                  <p className="text-sm text-slate-500 mb-3 line-clamp-3 flex-1">{c.description}</p>
                )}
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`badge ${meta.badge}`}>{c.content_type}</span>
                    {classrooms.length > 1 && c.classroom_name && (
                      <span className="badge bg-slate-100 text-slate-600 border-slate-200">{c.classroom_name}</span>
                    )}
                  </div>
                  {c.content_url && (
                    <span className="text-sm text-brand-600 font-medium group-hover:underline">Open →</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default LearningContent;
