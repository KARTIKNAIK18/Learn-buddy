import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getMyPoints } from '../../api/student';
import { Star, Zap, BarChart2, Trophy, TrendingUp, Award, Target, Flame, Calendar, Activity } from 'lucide-react';

const ProgressBar = ({ value, max = 100, color = 'bg-brand-500', showLabel = false, label = '' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs font-medium">
          <span className="text-slate-600">{label}</span>
          <span className="text-slate-900">{value} / {max}</span>
        </div>
      )}
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className={`h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden ${color}`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
};

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
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
            <BarChart2 size={18} className="text-violet-600" />
          </div>
          My Progress
        </h1>
        <p className="text-slate-500 mt-1 ml-10">Track your points, achievements, and learning journey</p>
      </div>

      {error && (
        <div className="alert-error mb-5">{error}</div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : !points || points.activities_completed === 0 ? (
        <div className="card text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <BarChart2 size={40} className="text-slate-300" />
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-2">No Activity Data Yet</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Complete some learning activities to start earning points and track your progress!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Total Points Card */}
            <div className="card border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center shadow-sm">
                    <Star size={24} className="text-yellow-600" fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Points</p>
                    <p className="text-3xl font-extrabold text-yellow-600">{totalPoints}</p>
                  </div>
                </div>
              </div>
              <ProgressBar value={progressPct} color="bg-yellow-500" />
              <p className="text-xs text-slate-600 mt-2 font-medium">
                {nextThreshold ? `${nextThreshold - totalPoints} points to ${Object.keys(LEVEL_NEXT)[Object.keys(LEVEL_NEXT).indexOf(level) + 1]}` : '🎉 Maximum level!'}
              </p>
            </div>

            {/* Current Level Card */}
            <div className="card border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center shadow-sm">
                    <Trophy size={24} className="text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Current Level</p>
                    <p className={`text-3xl font-extrabold ${levelColor}`}>{level}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Zap size={16} className="text-blue-500" />
                <span className="font-semibold">{totalDone}</span>
                <span>activities completed</span>
              </div>
            </div>

            {/* Activities Completed Card */}
            <div className="card border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shadow-sm">
                    <Activity size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Activities</p>
                    <p className="text-3xl font-extrabold text-blue-600">{totalDone}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <TrendingUp size={16} className="text-emerald-500" />
                <span className="font-semibold">{points.breakdown?.length || 0}</span>
                <span>different activities</span>
              </div>
            </div>
          </div>

          {/* Level Progress Banner */}
          <div className={`card border-2 ${level === 'Champion' ? 'border-amber-300 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50' : 'border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50'} relative overflow-hidden`}>
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 opacity-5">
              <Trophy size={160} className={levelColor} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={20} className={levelColor.replace('text-', 'text-')} />
                <h3 className="font-bold text-slate-900 text-lg">Level Journey</h3>
              </div>
              
              {/* Level Path */}
              <div className="flex justify-between items-center mb-4">
                {Object.entries(LEVEL_NEXT).map(([lvl, threshold], idx) => {
                  const isPassed = threshold === null || totalPoints >= threshold;
                  const isCurrent = lvl === level;
                  const LevelColor = LEVEL_COLOR[lvl];
                  
                  return (
                    <div key={lvl} className="flex-1 flex items-center">
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-4 transition-all ${
                          isCurrent 
                            ? `${LevelColor.replace('text-', 'bg-')}/20 border-current ${LevelColor} shadow-lg scale-110`
                            : isPassed 
                              ? `${LevelColor.replace('text-', 'bg-')}/30 ${LevelColor} border-current`
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}>
                          {isPassed ? <Trophy size={20} /> : <Target size={20} />}
                        </div>
                        <p className={`text-xs font-bold mt-2 ${isCurrent ? levelColor : isPassed ? 'text-slate-700' : 'text-slate-400'}`}>
                          {lvl}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {threshold !== null ? `${threshold}pts` : 'MAX'}
                        </p>
                      </div>
                      {idx < Object.keys(LEVEL_NEXT).length - 1 && (
                        <div className={`h-1 flex-1 -mx-2 rounded ${isPassed ? LevelColor.replace('text-', 'bg-') : 'bg-slate-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Progress Bar */}
              {nextThreshold && (
                <div className="mt-4">
                  <ProgressBar 
                    value={totalPoints} 
                    max={nextThreshold} 
                    color={levelColor.replace('text-', 'bg-')}
                    showLabel={true}
                    label={`Progress to ${Object.keys(LEVEL_NEXT)[Object.keys(LEVEL_NEXT).indexOf(level) + 1]}`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Activity Breakdown */}
          {points.breakdown?.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <BarChart2 size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Activity Breakdown</h3>
                  <p className="text-xs text-slate-500">Your performance across different activities</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {points.breakdown
                  .sort((a, b) => b.points_earned - a.points_earned)
                  .map((b, idx) => {
                    const maxPoints = Math.max(...points.breakdown.map(x => x.points_earned));
                    const percentage = (b.points_earned / maxPoints) * 100;
                    
                    return (
                      <div key={b.activity_name} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                              idx === 0 ? 'bg-amber-100 text-amber-600' :
                              idx === 1 ? 'bg-slate-200 text-slate-600' :
                              idx === 2 ? 'bg-orange-100 text-orange-600' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                              #{idx + 1}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 capitalize group-hover:text-brand-600 transition-colors">
                                {b.activity_name.replace(/-/g, ' ')}
                              </p>
                              <p className="text-xs text-slate-500">
                                Completed <span className="font-semibold text-slate-700">{b.times_completed}</span> time{b.times_completed !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-extrabold text-brand-600 text-lg">+{b.points_earned}</p>
                            <p className="text-xs text-slate-500">points</p>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-700"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Achievement Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Achievements Card */}
            <div className="card border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
              <div className="flex items-center gap-2 mb-4">
                <Award size={20} className="text-emerald-600" />
                <h3 className="font-bold text-slate-900">Achievements</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-100">
                  <span className="text-sm font-medium text-slate-700">🎯 First Steps</span>
                  <span className="text-xs font-bold text-emerald-600">{totalDone >= 1 ? '✓' : '—'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-100">
                  <span className="text-sm font-medium text-slate-700">⭐ Rising Star</span>
                  <span className="text-xs font-bold text-emerald-600">{totalPoints >= 50 ? '✓' : '—'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-100">
                  <span className="text-sm font-medium text-slate-700">🏆 Champion</span>
                  <span className="text-xs font-bold text-emerald-600">{level === 'Champion' ? '✓' : '—'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-100">
                  <span className="text-sm font-medium text-slate-700">🎨 Variety Master</span>
                  <span className="text-xs font-bold text-emerald-600">{(points.breakdown?.length || 0) >= 5 ? '✓' : '—'}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="card border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} className="text-slate-600" />
                <h3 className="font-bold text-slate-900">Quick Stats</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <span className="text-sm text-slate-600">Average Points/Activity</span>
                  <span className="font-bold text-slate-900">{totalDone > 0 ? (totalPoints / totalDone).toFixed(1) : 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <span className="text-sm text-slate-600">Most Played</span>
                  <span className="font-bold text-slate-900 capitalize">
                    {points.breakdown?.[0]?.activity_name.replace(/-/g, ' ') || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <span className="text-sm text-slate-600">Unique Activities</span>
                  <span className="font-bold text-slate-900">{points.breakdown?.length || 0} / 9</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <span className="text-sm text-slate-600">Next Milestone</span>
                  <span className="font-bold text-slate-900">
                    {nextThreshold ? `${nextThreshold}pts` : 'Complete!'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyProgress;
