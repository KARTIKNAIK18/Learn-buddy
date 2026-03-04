import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getMyClassrooms, createClassroom } from '../../api/teacher';
import { Plus, X, School, ChevronRight } from 'lucide-react';

const EMPTY_FORM = { class_name: '', academic_year: '', section: '' };

const MyClassrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [showForm, setShowForm]     = useState(false);
  const [error, setError]           = useState(null);
  const [formError, setFormError]   = useState(null);

  const fetchClassrooms = async () => {
    try {
      const { data } = await getMyClassrooms();
      setClassrooms(data || []);
    } catch {
      setError('Failed to load classrooms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClassrooms(); }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.class_name || !form.academic_year || !form.section) {
      setFormError('All fields are required.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await createClassroom(form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchClassrooms();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to create classroom.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Classrooms</h1>
            <p className="text-slate-500 mt-1">Manage your classrooms and students</p>
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={() => { setShowForm(!showForm); setFormError(null); }}>
            {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> New Classroom</>}
          </button>
        </div>

        {showForm && (
          <div className="card mb-6 animate-slide-up">
            <h2 className="font-semibold text-slate-900 mb-4">Create New Classroom</h2>
            {formError && <div className="alert-error mb-4">{formError}</div>}
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="input-label">Class Name</label>
                <input name="class_name" value={form.class_name} onChange={handleChange}
                  placeholder="e.g. Mathematics 101" className="input" />
              </div>
              <div>
                <label className="input-label">Academic Year</label>
                <input name="academic_year" value={form.academic_year} onChange={handleChange}
                  placeholder="e.g. 2025-2026" className="input" />
              </div>
              <div>
                <label className="input-label">Section</label>
                <input name="section" value={form.section} onChange={handleChange}
                  placeholder="e.g. A" className="input" />
              </div>
              <div className="sm:col-span-3 flex justify-end">
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Creating…' : 'Create Classroom'}
                </button>
              </div>
            </form>
          </div>
        )}

        {error && <div className="alert-error mb-5">{error}</div>}

        {loading ? (
          <LoadingSpinner />
        ) : classrooms.length === 0 ? (
          <div className="empty-state card py-20">
            <School size={56} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-700 font-semibold text-lg mb-1">No classrooms yet</p>
            <p className="text-slate-500 text-sm">Click "New Classroom" to create your first one.</p>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th className="tbl-th">Class Name</th>
                  <th className="tbl-th">Academic Year</th>
                  <th className="tbl-th">Section</th>
                  <th className="tbl-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classrooms.map((c) => (
                  <tr key={c.id} className="tbl-row">
                    <td className="tbl-td font-medium text-slate-900">{c.class_name}</td>
                    <td className="tbl-td text-slate-700">{c.academic_year}</td>
                    <td className="tbl-td">
                      <span className="badge-blue">{c.section}</span>
                    </td>
                    <td className="tbl-td">
                      <Link
                        to={`/teacher/classrooms/${c.id}/students`}
                        className="text-brand-600 hover:text-brand-700 font-medium text-sm flex items-center gap-1"
                      >
                        View Students <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyClassrooms;
