import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner  from '../../components/common/LoadingSpinner';
import { getMyClassrooms } from '../../api/teacher';
import { addVocabWord, getMyVocabWords, deleteVocabWord } from '../../api/teacher';
import { uploadToCloudinary } from '../../api/cloudinary';
import {
  Languages, PlusCircle, Trash2, BookOpen, Globe,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Upload, Image, Volume2,
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'Alphabets', 'Animals', 'Colors', 'Numbers', 'Food', 'Body Parts',
  'Places', 'Actions', 'Objects', 'Family', 'Weather', 'Transport', 'Custom',
];

const EMPTY_FORM = { category: 'Animals', customCategory: '', en: '', kn: '', tul: '', classroom_id: '' };

const ManageVocabulary = () => {
  const [words,      setWords]      = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [toast,      setToast]      = useState(null); // { type: 'success'|'error', msg }
  const [deletingId, setDeletingId] = useState(null);
  const [filter,     setFilter]     = useState('All');
  const [showForm,   setShowForm]   = useState(true);
  
  // File upload states
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [imageProgress, setImageProgress] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [uploading,     setUploading]     = useState(false);

  // Grouped view
  const categories = ['All', ...Array.from(new Set(words.map((w) => w.category))).sort()];
  const filtered   = filter === 'All' ? words : words.filter((w) => w.category === filter);

  useEffect(() => {
    Promise.all([getMyVocabWords(), getMyClassrooms()])
      .then(([wRes, cRes]) => {
        setWords(wRes.data || []);
        setClassrooms(cRes.data || []);
      })
      .catch(() => showToast('error', 'Could not load data.'))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.en.trim()) return showToast('error', 'English word is required.');
    
    setSaving(true);
    setUploading(true);
    
    try {
      let imageUrl = null;
      let audioUrl = null;
      
      // Upload image if selected
      if (selectedImage) {
        setImageProgress(0);
        imageUrl = await uploadToCloudinary(selectedImage, setImageProgress);
      }
      
      // Upload audio if selected
      if (selectedAudio) {
        setAudioProgress(0);
        audioUrl = await uploadToCloudinary(selectedAudio, setAudioProgress);
      }
      
      setUploading(false);
      
      const category = form.category === 'Custom' && form.customCategory.trim()
        ? form.customCategory.trim()
        : form.category;
      const payload = {
        category,
        en:           form.en.trim(),
        kn:           form.kn.trim() || null,
        tul:          form.tul.trim() || null,
        classroom_id: form.classroom_id ? Number(form.classroom_id) : null,
        image_url:    imageUrl,
        audio_url:    audioUrl,
      };
      const res = await addVocabWord(payload);
      setWords((w) => [...w, res.data]);
      setForm({ ...EMPTY_FORM, category: form.category });
      setSelectedImage(null);
      setSelectedAudio(null);
      setImageProgress(0);
      setAudioProgress(0);
      showToast('success', `"${res.data.en}" added!`);
    } catch (err) {
      showToast('error', err?.response?.data?.detail || err.message || 'Failed to add word.');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDelete = async (id, word) => {
    if (!window.confirm(`Remove "${word}"?`)) return;
    setDeletingId(id);
    try {
      await deleteVocabWord(id);
      setWords((w) => w.filter((x) => x.id !== id));
      showToast('success', `"${word}" removed.`);
    } catch {
      showToast('error', 'Delete failed.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner message="Loading vocabulary…" /></DashboardLayout>;

  return (
    <DashboardLayout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold animate-slide-up
          ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Languages size={24} className="text-indigo-500" /> Manage Vocabulary
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Add custom words in English, Kannada, and Tulu for your students' Language Learning page.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Add Word Form ──────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="card">
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center justify-between w-full mb-1"
            >
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <PlusCircle size={18} className="text-indigo-500" /> Add New Word
              </h2>
              {showForm ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>

            {showForm && (
              <form onSubmit={handleAdd} className="mt-4 space-y-4">

                {/* Category */}
                <div>
                  <label className="input-label">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => set('category', e.target.value)}
                    className="input"
                  >
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {form.category === 'Custom' && (
                  <div>
                    <label className="input-label">Custom Category Name</label>
                    <input
                      className="input"
                      placeholder="e.g. Classroom Objects"
                      value={form.customCategory}
                      onChange={(e) => set('customCategory', e.target.value)}
                    />
                  </div>
                )}

                {/* Classroom */}
                <div>
                  <label className="input-label">Classroom <span className="text-xs font-normal text-slate-400">(optional — leave blank for all)</span></label>
                  <select
                    value={form.classroom_id}
                    onChange={(e) => set('classroom_id', e.target.value)}
                    className="input"
                  >
                    <option value="">All my classrooms</option>
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>{c.class_name} — {c.section || 'No section'}</option>
                    ))}
                  </select>
                </div>

                {/* English */}
                <div>
                  <label className="input-label">
                    <span className="inline-flex items-center gap-1"><Globe size={14} /> English Word</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    className="input"
                    placeholder="e.g. Butterfly"
                    value={form.en}
                    onChange={(e) => set('en', e.target.value)}
                    required
                  />
                </div>

                {/* Kannada */}
                <div>
                  <label className="input-label">ಕನ್ನಡ (Kannada) <span className="text-xs font-normal text-slate-400">optional</span></label>
                  <input
                    className="input"
                    placeholder="e.g. ಚಿಟ್ಟೆ"
                    value={form.kn}
                    onChange={(e) => set('kn', e.target.value)}
                  />
                </div>

                {/* Tulu */}
                <div>
                  <label className="input-label">ತುಳು (Tulu) <span className="text-xs font-normal text-slate-400">optional</span></label>
                  <input
                    className="input"
                    placeholder="e.g. ಪಾಲ್"
                    value={form.tul}
                    onChange={(e) => set('tul', e.target.value)}
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="input-label">
                    <span className="inline-flex items-center gap-1"><Image size={14} /> Image</span>
                    <span className="text-xs font-normal text-slate-400 ml-2">GIF, JPG, PNG, or MP4</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setSelectedImage(e.target.files[0])}
                    className="input text-sm"
                  />
                  {selectedImage && (
                    <p className="text-xs text-green-600 mt-1">✓ {selectedImage.name}</p>
                  )}
                  {uploading && imageProgress > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all" 
                          style={{ width: `${imageProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Uploading image: {imageProgress}%</p>
                    </div>
                  )}
                </div>

                {/* Audio Upload */}
                <div>
                  <label className="input-label">
                    <span className="inline-flex items-center gap-1"><Volume2 size={14} /> Sound Effect</span>
                    <span className="text-xs font-normal text-slate-400 ml-2">MP3 or WAV</span>
                  </label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setSelectedAudio(e.target.files[0])}
                    className="input text-sm"
                  />
                  {selectedAudio && (
                    <p className="text-xs text-green-600 mt-1">✓ {selectedAudio.name}</p>
                  )}
                  {uploading && audioProgress > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all" 
                          style={{ width: `${audioProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Uploading audio: {audioProgress}%</p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {uploading
                    ? <><span className="animate-spin">⏳</span> Uploading files…</>
                    : saving
                    ? <><span className="animate-spin">⏳</span> Saving…</>
                    : <><PlusCircle size={16} /> Add Word</>}
                </button>
              </form>
            )}
          </div>

          {/* Stats mini card */}
          <div className="mt-4 card flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <BookOpen size={22} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{words.length}</p>
              <p className="text-xs text-slate-500">Custom words added</p>
            </div>
          </div>
        </div>

        {/* ── Word List ──────────────────────────────────────── */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800">Your Words</h2>
              {/* Category filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 text-slate-600 bg-white"
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Languages size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No words yet. Add some using the form!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                {filtered.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 hover:border-indigo-200 transition-all group"
                  >
                    {/* Category badge */}
                    <span className="badge bg-indigo-100 text-indigo-700 flex-shrink-0 text-xs">{w.category}</span>

                    {/* Words */}
                    <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold mb-0.5">EN</p>
                        <p className="font-bold text-slate-800">{w.en}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold mb-0.5">KN</p>
                        <p className="font-medium text-slate-700">{w.kn || <span className="italic text-slate-300">—</span>}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold mb-0.5">TUL</p>
                        <p className="font-medium text-slate-700">{w.tul || <span className="italic text-slate-300">—</span>}</p>
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(w.id, w.en)}
                      disabled={deletingId === w.id}
                      className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageVocabulary;
