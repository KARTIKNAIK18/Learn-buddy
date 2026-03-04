import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getMyStudents, getAllClassrooms, enrollStudent } from '../../api/parent';
import { Send } from 'lucide-react';

const EnrollStudent = () => {
  const [students, setStudents]           = useState([]);
  const [classrooms, setClassrooms]       = useState([]);
  const [selectedStudent, setStudent]     = useState('');
  const [selectedClassroom, setClassroom] = useState('');
  const [loading, setLoading]             = useState(true);
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState(null);
  const [success, setSuccess]             = useState('');

  useEffect(() => {
    Promise.all([getMyStudents(), getAllClassrooms()])
      .then(([sRes, cRes]) => {
        setStudents(sRes.data || []);
        setClassrooms(cRes.data || []);
        if (sRes.data?.length) setStudent(String(sRes.data[0].id));
        if (cRes.data?.length) setClassroom(String(cRes.data[0].id));
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to load data. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedClassroom) {
      setError('Please select both a student and a classroom.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess('');
    try {
      await enrollStudent({ student_id: Number(selectedStudent), classroom_id: Number(selectedClassroom) });
      setSuccess('Enrollment request submitted! Awaiting teacher approval.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit enrollment request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Enroll Student</h1>
          <p className="text-slate-500 mt-1">Request enrollment for your child into a classroom</p>
        </div>

        {error && <div className="alert-error mb-5">{error}</div>}
        {success && <div className="alert-success mb-5">{success}</div>}

        <div className="card max-w-lg animate-slide-up">
          <h2 className="font-semibold text-slate-900 mb-5">New Enrollment Request</h2>
          <form onSubmit={handleEnroll} className="space-y-4">
            <div>
              <label className="input-label">Select Student</label>
              <select className="input" value={selectedStudent} onChange={(e) => setStudent(e.target.value)}>
                {students.length === 0 ? (
                  <option value="">No students found</option>
                ) : (
                  students.map((s) => (
                    <option key={s.id} value={s.id}>{s.Studentname}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="input-label">Select Classroom</label>
              <select className="input" value={selectedClassroom} onChange={(e) => setClassroom(e.target.value)}>
                {classrooms.length === 0 ? (
                  <option value="">No classrooms available</option>
                ) : (
                  classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.class_name} · {c.academic_year} · Sec {c.section}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || students.length === 0 || classrooms.length === 0}
                className="btn-primary w-full"
              >
                {submitting ? 'Submitting…' : <span className="flex items-center gap-2"><Send size={16} /> Submit Enrollment Request</span>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EnrollStudent;
