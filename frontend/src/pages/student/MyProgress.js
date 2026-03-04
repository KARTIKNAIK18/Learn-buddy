import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getMyPoints } from '../../api/student';
import { Star, Zap, BarChart2 } from 'lucide-react';

const ProgressBar = ({ value, color = 'bg-brand-500' }) => (
  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
    <div
      className={`h-2.5 rounded-full transition-all duration-500 ${color}`}
      style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }}
    />
  </div>
);

const LEVEL_NEXT = { Beginner: 100, Learner: 250, Explorer: 500, Champion: null };
const LEVEL_COLOR = { Beginner: 'text-slate-600', Learner: 'text-blue-600', Explorer: 'text-violet-600', Champion: 'text-amber-600' };

const MyProgress = () => {
  const [points,  setPoints]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getMyPoints()
      .then(({ data }) => setPoints(data))
      .catch(() => setError('Failed to load progress data.'))
      .finally(() => setLoading(false));
  }, []);

  const level         = points?.level                ?? 'Beginner';
  const totalPoints   = points?.total_points         ?? 0;
  const totalDone     = points?.activities_completed ?? 0;
  const nextThreshold = LEVEL_NEXT[level];
  const progressPct   = nextThreshold ? Math.min(100, Math.round((totalPoints / nextThreshold) * 100)) : 100;
  const levelColor    = LEVEL_COLOR[level] || 'text-slate-600';

  return (
    <DashboardLayout>
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-900">My Progress</h1>
        <p className="text-slate-500 mt-1">Track your points and activity achievements</p>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : !points || points.activities_completed === 0 ? (
        <div className="card text-center py-20">
          <BarChart2 size={56} className="text-slate-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No Activity Data Yet</h2>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Complete some learning activities to start earning points and track your progress!
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Total Points */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
                  <Star size={20} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Total Points</p>
                  <p className="text-xs text-slate-400">Earned from all activities</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-yellow-600">{totalPoints}</p>
            </div>
            <ProgressBar value={progressPct} color="bg-yellow-400" />
            <p className="text-xs text-slate-400 mt-1">
              {nextThreshold ? `${totalPoints} / ${nextThreshold} pts to next level` : 'Maximum level reached!'}
            </p>
          </div>

          {/* Level */}
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                <Zap size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Current Level</p>
                <p className="text-xs text-slate-400">{totalDone} activities completed</p>
              </div>
              <p className={`ml-auto text-2xl font-extrabold ${levelColor}`}>{level}</p>
            </div>
          </div>

          {/* Activity Breakdown */}
          {points.breakdown?.length > 0 && (
            <div className="card">
              <p className="font-semibold text-slate-900 mb-3">Activity Breakdown</p>
              <div className="divide-y divide-slate-100">
                {points.breakdown.map((b) => (
                  <div key={b.activity_name} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 capitalize">
                        {b.activity_name.replace(/-/g, ' ')}
                      </p>
                      <p className="text-xs text-slate-400">Completed {b.times_completed} time{b.times_completed !== 1 ? 's' : ''}</p>
                    </div>
                    <span className="font-bold text-brand-600">+{b.points_earned} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Banner */}
          <div className="card bg-gradient-to-r from-brand-50 to-violet-50 border border-brand-100">
              <h3 className="font-semibold text-slate-900 mb-3">Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white rounded-xl border border-brand-100">
                <p className="text-2xl font-bold text-brand-700">{totalPoints}</p>
                <p className="text-xs text-slate-500 mt-1">Total Points</p>
              </div>
              <div className="text-center p-3 bg-white rounded-xl border border-brand-100">
                <p className={`text-2xl font-bold ${levelColor}`}>{level}</p>
                <p className="text-xs text-slate-500 mt-1">Current Level</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyProgress;
