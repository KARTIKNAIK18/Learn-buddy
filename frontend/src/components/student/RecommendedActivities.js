import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecommendations } from '../../api/recommendations';
import { Sparkles, Loader2, ArrowRight, Trophy, Star, Zap } from 'lucide-react';

const RecommendedActivities = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [praise, setPraise] = useState('');

  const praises = [
    "🌟 You're doing amazing! Keep up the great work!",
    "🎉 Fantastic progress! Ready for more fun?",
    "💪 You're a learning superstar! Let's continue!",
    "🚀 Wow! You're learning so fast!",
    "⭐ Keep shining bright! More adventures await!",
    "🏆 You're crushing it! Time for the next challenge!",
    "✨ Incredible work! Let's keep the momentum going!",
    "🎯 You're on fire! Ready for more excitement?",
  ];

  useEffect(() => {
    // Pick a random praise
    setPraise(praises[Math.floor(Math.random() * praises.length)]);
    
    getRecommendations()
      .then(({ data }) => {
        if (data.success) {
          setRecommendations(data.recommendations || []);
        }
      })
      .catch(err => console.error('Failed to load recommendations:', err))
      .finally(() => setLoading(false));
  }, []);

  const getActivityRoute = (activityName) => {
    // Map backend activity names to frontend routes
    const routeMap = {
      'flashcards': 'flashcards',
      'word-scramble': 'scramble',
      'word-match': 'match',
      'listen-spell': 'listen-spell',
      'rhyme-finder': 'rhyme',
      'sight-words': 'sight-words',
      'sentence-builder': 'sentence-builder',
      'missing-letter': 'missing-letter',
      'odd-one-out': 'odd-one-out'
    };
    
    const route = routeMap[activityName] || activityName;
    return `/student/activities/${route}`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50/50';
      case 'medium': return 'border-yellow-200 bg-yellow-50/50';
      case 'low': return 'border-green-200 bg-green-50/50';
      default: return 'border-slate-200 bg-slate-50/50';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return { icon: Trophy, label: 'Challenge', color: 'text-red-600 bg-red-100' };
      case 'medium':
        return { icon: Zap, label: 'Perfect', color: 'text-yellow-600 bg-yellow-100' };
      case 'low':
        return { icon: Star, label: 'Easy Win', color: 'text-green-600 bg-green-100' };
      default:
        return { icon: Sparkles, label: 'Try', color: 'text-slate-600 bg-slate-100' };
    }
  };

  if (loading) {
    return (
      <div className="card border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-indigo-600" size={24} />
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="card border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Praise Message */}
      <div className="mb-4 p-3 rounded-lg bg-white/60 border border-indigo-100">
        <p className="text-center text-sm font-medium text-indigo-900">
          {praise}
        </p>
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
          <Sparkles className="text-indigo-600" size={18} />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-slate-900">Recommended for You</h3>
          <p className="text-xs text-slate-600">Based on your learning progress</p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, idx) => {
          const badge = getPriorityBadge(rec.priority);
          const BadgeIcon = badge.icon;
          
          return (
            <button
              key={idx}
              onClick={() => navigate(getActivityRoute(rec.activity))}
              className={`w-full p-4 rounded-xl border-2 transition-all hover:shadow-md hover:scale-[1.02] text-left ${getPriorityColor(rec.priority)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-slate-900 capitalize">
                      {rec.activity.replace(/-/g, ' ')}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${badge.color}`}>
                      <BadgeIcon size={12} />
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{rec.reason}</p>
                </div>
                <ArrowRight className="text-slate-400 flex-shrink-0 ml-3" size={20} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedActivities;
