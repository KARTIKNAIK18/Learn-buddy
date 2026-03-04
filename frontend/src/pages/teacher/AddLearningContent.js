import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner  from '../../components/common/LoadingSpinner';
import { getMyClassrooms, addContent } from '../../api/teacher';
import { uploadToCloudinary } from '../../api/cloudinary';
import { PlusCircle, UploadCloud, Link2, PenLine, FileText, Video } from 'lucide-react';

const CONTENT_TYPES = ['video', 'pdf', 'text', 'link', 'quiz'];

// Only video uses Cloudinary file upload — PDF uses a pasted URL (Google Drive / Dropbox / etc.)
const FILE_TYPES = ['video'];
const URL_TYPES  = ['link', 'quiz', 'pdf'];

const ACCEPT = { video: 'video/*' };

const TYPE_ICONS = {
  video: Video, pdf: FileText, link: Link2, quiz: Link2, text: PenLine,
};

const EMPTY_FORM = { title: '', content_type: 'video', content_url: '', description: '' };

const AddLearningContent = () => {
  const [classrooms,        setClassrooms]        = useState([]);
  const [selectedClassroom, setSelected]          = useState('');
  const [form,              setForm]              = useState(EMPTY_FORM);
  const [selectedFile,      setSelectedFile]      = useState(null);
  const [uploadProgress,    setUploadProgress]    = useState(0);
  const [loading,           setLoading]           = useState(true);
  const [submitting,        setSubmitting]        = useState(false);
  const [error,             setError]             = useState(null);
  const [formError,         setFormError]         = useState(null);
  const [success,           setSuccess]           = useState('');

  useEffect(() => {
    getMyClassrooms()
      .then(({ data }) => {
        setClassrooms(data || []);
        if (data?.length) setSelected(String(data[0].id));
      })
      .catch(() => setError('Failed to load classrooms.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Reset file when switching type
    if (name === 'content_type') {
      setSelectedFile(null);
      setUploadProgress(0);
      setForm((prev) => ({ ...prev, content_type: value, content_url: '' }));
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0] || null);
    setUploadProgress(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccess('');

    if (!form.title) { setFormError('Title is required.'); return; }
    if (!selectedClassroom) { setFormError('Please select a classroom.'); return; }

    const isFileType = FILE_TYPES.includes(form.content_type);
    const isUrlType  = URL_TYPES.includes(form.content_type);

    if (isFileType && !selectedFile) {
      setFormError('Please select a file to upload.');
      return;
    }
    if (isUrlType && !form.content_url.trim()) {
      setFormError('Please enter a URL.');
      return;
    }

    setSubmitting(true);
    try {
      let finalUrl = form.content_url;

      // Upload file to Cloudinary first if needed
      if (isFileType && selectedFile) {
        setUploadProgress(1); // show bar immediately
        finalUrl = await uploadToCloudinary(selectedFile, setUploadProgress);
      }

      await addContent(selectedClassroom, { ...form, content_url: finalUrl });
      setForm(EMPTY_FORM);
      setSelectedFile(null);
      setUploadProgress(0);
      setSuccess('Content added successfully!');
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setFormError(detail.map((d) => d.msg).join(', '));
      } else {
        setFormError(typeof detail === 'string' ? detail : err.message || 'Failed to add content.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  const isFileType = FILE_TYPES.includes(form.content_type);
  const isUrlType  = URL_TYPES.includes(form.content_type);
  const TypeIcon   = TYPE_ICONS[form.content_type] || PlusCircle;

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="page-heading">Upload Content</h1>
          <p className="page-sub">Share materials with your classroom students</p>
        </div>

        {error && <div className="alert-error mb-5">{error}</div>}

        <div className="card animate-slide-up">
          <h2 className="font-semibold text-slate-900 mb-5">New Content</h2>

          {formError && <div className="alert-error mb-4">{formError}</div>}
          {success   && <div className="alert-success mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Classroom */}
            <div>
              <label className="input-label">Classroom</label>
              <select className="input" value={selectedClassroom} onChange={(e) => setSelected(e.target.value)}>
                {classrooms.length === 0 ? (
                  <option value="">No classrooms available</option>
                ) : classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.class_name} · {c.academic_year} · Sec {c.section}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="input-label">Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Introduction to Fractions"
                className="input"
              />
            </div>

            {/* Content Type */}
            <div>
              <label className="input-label">Content Type *</label>
              <select name="content_type" value={form.content_type} onChange={handleChange} className="input">
                {CONTENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Dynamic input based on type */}
            {isFileType && (
              <div>
                <label className="input-label flex items-center gap-2">
                  <TypeIcon size={16} />
                  Video File *
                </label>
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50/40 transition-colors">
                  <UploadCloud size={28} className="text-slate-300 mb-2" />
                  {selectedFile ? (
                    <span className="text-sm font-medium text-brand-600">{selectedFile.name}</span>
                  ) : (
                    <span className="text-sm text-slate-400">Click to choose a video file</span>
                  )}
                  <input
                    type="file"
                    accept={ACCEPT[form.content_type]}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {/* Upload progress bar */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Uploading to Cloudinary…</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 bg-brand-500 rounded-full transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {isUrlType && (
              <div>
                <label className="input-label flex items-center gap-2">
                  <Link2 size={16} />
                  {form.content_type === 'pdf' ? 'PDF Link *' : 'URL *'}
                </label>
                <input
                  name="content_url"
                  value={form.content_url}
                  onChange={handleChange}
                  placeholder={
                    form.content_type === 'pdf'
                      ? 'Paste a Google Drive or Dropbox public link…'
                      : 'https://...'
                  }
                  className="input"
                />
                {form.content_type === 'pdf' && (
                  <p className="text-xs text-slate-400 mt-1">
                    Google Drive: open file → Share → "Anyone with the link" → copy link.
                    Dropbox: click Share → copy link, change <code>?dl=0</code> to <code>?raw=1</code>.
                  </p>
                )}
              </div>
            )}

            {/* Description / text content */}
            <div>
              <label className="input-label">
                {form.content_type === 'text' ? 'Text Content' : 'Description'}
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={form.content_type === 'text' ? 6 : 3}
                placeholder={
                  form.content_type === 'text'
                    ? 'Write your text content here…'
                    : 'Brief description of the content…'
                }
                className="input resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || classrooms.length === 0}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {submitting
                  ? (uploadProgress > 0 && uploadProgress < 100 ? `Uploading… ${uploadProgress}%` : 'Saving…')
                  : <><PlusCircle size={18} /> Add Content</>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddLearningContent;
