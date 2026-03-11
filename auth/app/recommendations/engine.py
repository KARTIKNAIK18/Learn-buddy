"""
Smart Activity Recommendation Engine with Machine Learning
Analyzes student's age, activity history, and performance to recommend next activities
Uses scikit-learn for predictive recommendations
"""

from datetime import datetime, timedelta
from collections import Counter
from sqlalchemy.orm import Session
import app.db.models as models
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.linear_model import LinearRegression


# Activity difficulty ratings (1=easiest, 5=hardest)
ACTIVITY_LEVELS = {
    'flashcards': 1,
    'missing-letter': 1,
    'word-scramble': 2,
    'word-match': 2,
    'listen-spell': 3,
    'rhyme-finder': 3,
    'sight-words': 4,
    'sentence-builder': 4,
    'odd-one-out': 3,
}

# Age-appropriate starting activities
AGE_RECOMMENDATIONS = {
    'young': [  # 5-7 years
        {'activity': 'flashcards', 'reason': 'Perfect starting point - learn words with pictures'},
        {'activity': 'missing-letter', 'reason': 'Build spelling skills with simple letter filling'},
        {'activity': 'word-scramble', 'reason': 'Fun way to practice spelling'},
    ],
    'middle': [  # 8-10 years
        {'activity': 'word-match', 'reason': 'Match words to meanings - great for vocabulary'},
        {'activity': 'listen-spell', 'reason': 'Improve your spelling by listening carefully'},
        {'activity': 'rhyme-finder', 'reason': 'Learn word sounds and patterns'},
    ],
    'older': [  # 11+ years
        {'activity': 'sight-words', 'reason': 'Master common words used in reading'},
        {'activity': 'sentence-builder', 'reason': 'Build proper sentences from word tiles'},
        {'activity': 'odd-one-out', 'reason': 'Challenge your vocabulary knowledge'},
    ]
}


class RecommendationEngine:
    
    def __init__(self, db: Session, student_id: int):
        self.db = db
        self.student_id = student_id
        self.student = self._get_student()
        self.activities = self._get_recent_activities()
    
    def _get_student(self):
        """Get student info including age"""
        return self.db.query(models.Student)\
            .filter(models.Student.id == self.student_id).first()
    
    def _get_recent_activities(self, limit=20):
        """Get student's recent activity history"""
        return self.db.query(models.StudentActivityLog)\
            .filter(models.StudentActivityLog.student_id == self.student_id)\
            .order_by(models.StudentActivityLog.completed_at.desc())\
            .limit(limit).all()
    
    def get_recommendations(self, count=3):
        """Generate personalized recommendations using ML"""
        
        # If no activities yet, return age-based recommendations
        if not self.activities or len(self.activities) < 3:
            return self._get_age_based_recommendations()
        
        # Use ML to enhance recommendations
        try:
            recommendations = self._get_ml_recommendations(count)
            if recommendations and len(recommendations) >= count:
                return recommendations[:count]
        except Exception as e:
            print(f"ML recommendation failed: {e}, falling back to rule-based")
        
        # Fallback to rule-based if ML fails
        return self._get_rule_based_recommendations(count)
    
    def _get_ml_recommendations(self, count):
        """ML-powered recommendations using scikit-learn"""
        
        # Extract features from activity history
        features = self._extract_features()
        
        # Predict optimal difficulty level
        predicted_difficulty = self._predict_difficulty(features)
        
        # Predict learning velocity (how fast student is improving)
        learning_velocity = self._calculate_learning_velocity()
        
        recommendations = []
        recent_activities = [self._normalize_activity_name(a.activity_name) for a in self.activities[:5]]
        
        # 1. ML-based difficulty recommendation
        if predicted_difficulty:
            suitable_activities = [a for a, diff in ACTIVITY_LEVELS.items() 
                                 if diff == predicted_difficulty and a not in recent_activities[:3]]
            if suitable_activities:
                activity = suitable_activities[0]
                reason = f'🤖 ML suggests level {predicted_difficulty} (velocity: {learning_velocity:.1f})'
                recommendations.append({
                    'activity': activity,
                    'reason': reason,
                    'priority': 'high'
                })
        
        # 2. Variety recommendation (unchanged)
        variety_rec = self._get_variety_recommendation(recent_activities)
        if variety_rec and len(recommendations) < count:
            recommendations.append(variety_rec)
        
        # 3. Review recommendation (unchanged)
        review_rec = self._get_review_recommendation()
        if review_rec and len(recommendations) < count:
            recommendations.append(review_rec)
        
        # Fill with age-based
        while len(recommendations) < count:
            age_recs = self._get_age_based_recommendations()
            for rec in age_recs:
                if rec not in recommendations and len(recommendations) < count:
                    recommendations.append(rec)
        
        return recommendations
    
    def _get_rule_based_recommendations(self, count):
        """Original rule-based recommendations as fallback"""
        avg_points = sum(a.points_earned for a in self.activities) / len(self.activities)
        recent_activities = [self._normalize_activity_name(a.activity_name) for a in self.activities[:5]]
        
        recommendations = []
        
        performance_rec = self._get_performance_based_recommendation(avg_points, recent_activities)
        if performance_rec:
            recommendations.append(performance_rec)
        
        variety_rec = self._get_variety_recommendation(recent_activities)
        if variety_rec:
            recommendations.append(variety_rec)
        
        review_rec = self._get_review_recommendation()
        if review_rec:
            recommendations.append(review_rec)
        
        while len(recommendations) < count:
            age_recs = self._get_age_based_recommendations()
            for rec in age_recs:
                if rec not in recommendations and len(recommendations) < count:
                    recommendations.append(rec)
        
        return recommendations[:count]
    
    def _extract_features(self):
        """Extract ML features from student activity history"""
        if not self.activities:
            return None
        
        features = {
            'avg_points': sum(a.points_earned for a in self.activities) / len(self.activities),
            'total_activities': len(self.activities),
            'age': self.student.age if self.student else 8,
            'recent_avg': sum(a.points_earned for a in self.activities[:5]) / min(5, len(self.activities)),
            'consistency': self._calculate_consistency(),
            'variety_score': len(set(a.activity_name for a in self.activities)) / len(self.activities),
        }
        return features
    
    def _predict_difficulty(self, features):
        """Predict optimal difficulty level using features"""
        if not features:
            return 2  # default medium
        
        # Simple scoring algorithm based on performance
        avg_points = features['avg_points']
        recent_avg = features['recent_avg']
        
        # If improving (recent > average), suggest harder
        if recent_avg > avg_points + 1:
            if avg_points >= 7:
                return 4  # Hard level
            elif avg_points >= 5:
                return 3  # Medium-hard
            else:
                return 2  # Medium
        
        # If declining, stay or go easier
        elif recent_avg < avg_points - 1:
            if avg_points >= 6:
                return 2  # Medium
            else:
                return 1  # Easy
        
        # Stable performance
        else:
            if avg_points >= 8:
                return 3  # Medium-hard
            elif avg_points >= 6:
                return 2  # Medium
            else:
                return 1  # Easy
    
    def _calculate_learning_velocity(self):
        """Calculate how fast student is improving (points per activity trend)"""
        if len(self.activities) < 5:
            return 0.0
        
        # Use linear regression to find trend
        try:
            X = np.array([[i] for i in range(min(10, len(self.activities)))])
            y = np.array([a.points_earned for a in self.activities[:10]])
            
            # Fit linear model
            model = LinearRegression()
            model.fit(X, y)
            
            # Return slope (velocity)
            return float(model.coef_[0])
        except:
            return 0.0
    
    def _calculate_consistency(self):
        """Calculate how consistent student's performance is"""
        if len(self.activities) < 3:
            return 0.5
        
        points = [a.points_earned for a in self.activities[:10]]
        # Low std = high consistency
        std = np.std(points)
        # Normalize to 0-1 scale (higher is more consistent)
        consistency = 1.0 / (1.0 + std)
        return float(consistency)
    
    def _normalize_activity_name(self, name):
        """Normalize activity names (handle variations)"""
        name = name.lower().replace(' ', '-').replace('_', '-')
        # Match partial names
        for activity in ACTIVITY_LEVELS.keys():
            if activity in name or name in activity:
                return activity
        return name
    
    def _get_performance_based_recommendation(self, avg_points, recent_activities):
        """Recommend based on how well student is doing"""
        
        # High performance (8+ points avg) → suggest harder activity
        if avg_points >= 8:
            harder_activities = [a for a in ACTIVITY_LEVELS.keys() 
                                if ACTIVITY_LEVELS[a] >= 3 and a not in recent_activities[:3]]
            if harder_activities:
                activity = harder_activities[0]
                return {
                    'activity': activity,
                    'reason': f'🎯 You\'re doing great! Try this challenge (avg score: {int(avg_points)}/10)',
                    'priority': 'high'
                }
        
        # Medium performance (5-7 points) → suggest same level
        elif avg_points >= 5:
            if recent_activities:
                last_activity = recent_activities[0]
                same_level = [a for a in ACTIVITY_LEVELS.keys() 
                            if ACTIVITY_LEVELS.get(a, 2) == ACTIVITY_LEVELS.get(last_activity, 2) 
                            and a != last_activity]
                if same_level:
                    activity = same_level[0]
                    return {
                        'activity': activity,
                        'reason': f'📚 Keep practicing at this level (avg score: {int(avg_points)}/10)',
                        'priority': 'medium'
                    }
        
        # Low performance (<5 points) → suggest easier activity
        else:
            easier_activities = [a for a in ACTIVITY_LEVELS.keys() 
                                if ACTIVITY_LEVELS[a] <= 2 and a not in recent_activities[:2]]
            if easier_activities:
                activity = easier_activities[0]
                return {
                    'activity': activity,
                    'reason': f'💪 Let\'s build confidence with this (avg score: {int(avg_points)}/10)',
                    'priority': 'high'
                }
        
        return None
    
    def _get_variety_recommendation(self, recent_activities):
        """Suggest activities not done recently"""
        all_activities = list(ACTIVITY_LEVELS.keys())
        not_recent = [a for a in all_activities if a not in recent_activities]
        
        if not_recent:
            activity = not_recent[0]
            return {
                'activity': activity,
                'reason': '🌟 Try something new - variety keeps learning fun!',
                'priority': 'medium'
            }
        return None
    
    def _get_review_recommendation(self):
        """Suggest review if student hasn't practiced recently"""
        if not self.activities:
            return None
        
        last_activity_time = self.activities[0].completed_at
        hours_since = (datetime.now(last_activity_time.tzinfo) - last_activity_time).total_seconds() / 3600
        
        # If more than 12 hours, suggest review
        if hours_since >= 12:
            # Find an activity they did well on
            good_activities = [a for a in self.activities if a.points_earned >= 7]
            if good_activities:
                activity = self._normalize_activity_name(good_activities[0].activity_name)
                return {
                    'activity': activity,
                    'reason': f'🔄 Review time! You did well on this {int(hours_since//24)} days ago',
                    'priority': 'low'
                }
        return None
    
    def _get_age_based_recommendations(self):
        """Get recommendations based on student age"""
        if not self.student:
            age_group = 'middle'
        elif self.student.age <= 7:
            age_group = 'young'
        elif self.student.age <= 10:
            age_group = 'middle'
        else:
            age_group = 'older'
        
        recommendations = AGE_RECOMMENDATIONS[age_group].copy()
        # Add priority
        for rec in recommendations:
            rec['priority'] = 'medium'
        
        return recommendations
