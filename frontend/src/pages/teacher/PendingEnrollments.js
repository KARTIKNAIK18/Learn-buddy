import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getPendingEnrollments, approveEnrollment, rejectEnrollment } from '../../api/teacher';
import { CheckCircle, XCircle, UserCheck } from 'lucide-react';

const PendingEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [actionId, setActionId]       = useState(null); // tracks which row is processing

  const fetchEnrollments = () => {
    setLoading(true);
    getPendingEnrollments()
      .then((res) => setEnrollments(res.data || []))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load enrollments.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEnrollments(); }, []);

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await approveEnrollment(id);
      setEnrollments((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to approve enrollment.');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    setActionId(id);
    try {
      await rejectEnrollment(id);
      setEnrollments((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reject enrollment.');
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Pending Enrollments</h1>
          <p className="text-slate-500 mt-1">Review and approve student enrollment requests</p>
        </div>

        {error && <div className="alert-error mb-5">{error}</div>}

        <div className="card animate-slide-up">
          {enrollments.length === 0 ? (
            <div className="empty-state py-12">
              <UserCheck size={48} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500">No pending enrollment requests.</p>
            </div>
          ) : (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th className="tbl-th">#</th>
                    <th className="tbl-th">Student</th>
                    <th className="tbl-th">Classroom</th>
                    <th className="tbl-th">Status</th>
                    <th className="tbl-th text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e, i) => (
                    <tr key={e.id} className="tbl-row">
                      <td className="tbl-td text-slate-500">{i + 1}</td>
                      <td className="tbl-td">
                        <p className="font-semibold text-slate-900">{e.student_name || e.Studentname || `Student #${e.student_id}`}</p>
                        <p className="text-xs text-slate-400">ID: {e.student_id}</p>
                      </td>
                      <td className="tbl-td">
                        <p className="font-medium text-slate-700">{e.classroom_name || `Classroom #${e.classroom_id}`}</p>
                        <p className="text-xs text-slate-400">Ref: {e.id}</p>
                      </td>
                      <td className="tbl-td"><span className="badge-pending">{e.status}</span></td>
                      <td className="tbl-td">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(e.id)}
                            disabled={actionId === e.id}
                            className="btn-success btn-sm flex items-center gap-1.5"
                          >
                            <CheckCircle size={15} />
                            {actionId === e.id ? 'Processing…' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(e.id)}
                            disabled={actionId === e.id}
                            className="btn-danger btn-sm flex items-center gap-1.5"
                          >
                            <XCircle size={15} />
                            {actionId === e.id ? '…' : 'Reject'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PendingEnrollments;
