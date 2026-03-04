import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner  from '../../components/common/LoadingSpinner';
import {
  Video, FileText, HelpCircle, Link2, PenLine,
  ExternalLink, Inbox, Trash2, FolderOpen,
} from 'lucide-react';
import { getMyClassrooms, getClassroomContent, deleteContent } from '../../api/teacher';

const TYPE_META = {
  video:    { Icon: Video,      color: 'bg-red-50 text-red-500'     },
  document: { Icon: FileText,   color: 'bg-blue-50 text-blue-500'   },
  quiz:     { Icon: HelpCircle, color: 'bg-purple-50 text-purple-500'},
  link:     { Icon: Link2,      color: 'bg-green-50 text-green-500' },
  text:     { Icon: PenLine,    color: 'bg-yellow-50 text-yellow-500'},
};
const defaultMeta = { Icon: FileText, color: 'bg-slate-100 text-slate-400' };

const ViewContent = () => {
  const [classrooms,       setClassrooms]       = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [contents,         setContents]         = useState([]);
  const [loading,          setLoading]          = useState(false);
  const [loadingClassrooms, setLoadingClassrooms] = useState(true);
  const [error,            setError]            = useState(null);
  const [deletingId,       setDeletingId]       = useState(null);
  const [confirmDeleteId,  setConfirmDeleteId]  = useState(null);

  // Load classrooms once
  useEffect(() => {
    getMyClassrooms()
      .then(({ data }) => {
        setClassrooms(data || []);
        if (data?.length) setSelectedClassroom(String(data[0].id));
      })
      .catch(() => setError('Could not load classrooms.'))
      .finally(() => setLoadingClassrooms(false));
  }, []);

  // Load content whenever classroom changes
  const fetchContent = useCallback(async (cid) => {
    if (!cid) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await getClassroomContent(cid);
      setContents(data || []);
    } catch {
      setError('Could not load content.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContent(selectedClassroom); }, [selectedClassroom, fetchContent]);

  const handleDelete = async (contentId) => {
    setDeletingId(contentId);
    try {
      await deleteContent(selectedClassroom, contentId);
      setContents((prev) => prev.filter((c) => c.id !== contentId));
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to delete content.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="page-heading">My Content</h1>
        <p className="page-sub">View and manage content you have uploaded to each classroom</p>
      </div>

      {error && <div className="alert-error mb-5">{error}</div>}

      {loadingClassrooms ? (
        <LoadingSpinner />
      ) : classrooms.length === 0 ? (
        <div className="card text-center py-20">
          <FolderOpen size={56} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">No classrooms found. Create one first.</p>
        </div>
      ) : (
        <>
          {/* Classroom selector */}
          <div className="mb-6 max-w-sm">
            <label className="input-label">Select Classroom</label>
            <select
              className="input"
              value={selectedClassroom}
              onChange={(e) => { setSelectedClassroom(e.target.value); setConfirmDeleteId(null); }}
            >
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.class_name} — {c.academic_year} ({c.section})
                </option>
              ))}
            </select>
          </div>

          {/* Content list */}
          {loading ? (
            <LoadingSpinner />
          ) : contents.length === 0 ? (
            <div className="card text-center py-16">
              <Inbox size={48} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No content uploaded for this classroom yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contents.map((c) => {
                const meta = TYPE_META[c.content_type] || defaultMeta;
                return (
                  <div key={c.id} className="card flex items-start gap-4">
                    {/* Type icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                      <meta.Icon size={20} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{c.title}</p>
                      {c.description && (
                        <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{c.description}</p>
                      )}
                      <span className="badge badge-gray mt-1.5">{c.content_type}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {c.content_url && (
                        <a
                          href={c.content_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg text-brand-600 hover:bg-brand-50 transition-colors"
                          title="Open link"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}

                      {confirmDeleteId === c.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Delete?</span>
                          <button
                            onClick={() => handleDelete(c.id)}
                            disabled={deletingId === c.id}
                            className="btn-danger btn-sm"
                          >
                            {deletingId === c.id ? '...' : 'Yes'}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="btn-outline btn-sm"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(c.id)}
                          className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Delete content"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default ViewContent;
