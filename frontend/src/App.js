import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ── Auth ──────────────────────────────────────────────────────────────────────
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute   from './components/common/ProtectedRoute';

// ── Accessibility ─────────────────────────────────────────────────────────────
import { AccessibilityProvider } from './context/AccessibilityContext';
import AccessibilityToolbar      from './components/accessibility/AccessibilityToolbar';

// ── Auth pages ────────────────────────────────────────────────────────────────
import LoginPage  from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// ── Teacher pages ─────────────────────────────────────────────────────────────
import TeacherDashboard   from './pages/teacher/TeacherDashboard';
import MyClassrooms       from './pages/teacher/MyClassrooms';
import ClassroomStudents  from './pages/teacher/ClassroomStudents';
import PendingEnrollments from './pages/teacher/PendingEnrollments';
import AddLearningContent from './pages/teacher/AddLearningContent';
import ViewContent        from './pages/teacher/ViewContent';
import StudentPerformance from './pages/teacher/StudentPerformance';
import ManageVocabulary  from './pages/teacher/ManageVocabulary';

// ── Parent pages ──────────────────────────────────────────────────────────────
import ParentDashboard from './pages/parent/ParentDashboard';
import MyStudents      from './pages/parent/MyStudents';
import EnrollStudent   from './pages/parent/EnrollStudent';

// ── Student pages ─────────────────────────────────────────────────────────────
import StudentDashboard    from './pages/student/StudentDashboard';
import MyClassroom         from './pages/student/MyClassroom';
import LearningContent     from './pages/student/LearningContent';
import LearningActivities    from './pages/student/LearningActivities';
import ReadingSpace          from './pages/student/ReadingSpace';
import FlashCardsActivity    from './pages/student/activities/FlashCardsActivity';
import WordScrambleActivity  from './pages/student/activities/WordScrambleActivity';
import WordMatchActivity     from './pages/student/activities/WordMatchActivity';
import ListenSpellActivity   from './pages/student/activities/ListenSpellActivity';
import RhymeFinderActivity   from './pages/student/activities/RhymeFinderActivity';
import SightWordsActivity       from './pages/student/activities/SightWordsActivity';
import MissingLetterActivity    from './pages/student/activities/MissingLetterActivity';
import SentenceBuilderActivity  from './pages/student/activities/SentenceBuilderActivity';
import OddOneOutActivity        from './pages/student/activities/OddOneOutActivity';
import LanguageLearning         from './pages/student/LanguageLearning';
import WritingHelper            from './pages/student/WritingHelper';
import MyProgress               from './pages/student/MyProgress';

// Roles returned by backend (exact lowercase strings)
const T = ['teacher'];
const P = ['parents'];
const S = ['student'];

const protect = (roles, el) => <ProtectedRoute allowedRoles={roles}>{el}</ProtectedRoute>;

// Wrapper that adds the accessibility toolbar to every student page
const StudentLayout = ({ children }) => (
  <AccessibilityProvider>
    {children}
    <AccessibilityToolbar />
  </AccessibilityProvider>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ─── Public ───────────────────────────────────────────────── */}
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* ─── Teacher ──────────────────────────────────────────────── */}
          <Route path="/teacher/dashboard"              element={protect(T, <TeacherDashboard />)} />
          <Route path="/teacher/classrooms"             element={protect(T, <MyClassrooms />)} />
          <Route path="/teacher/classrooms/:id/students" element={protect(T, <ClassroomStudents />)} />
          <Route path="/teacher/enrollments"            element={protect(T, <PendingEnrollments />)} />
          <Route path="/teacher/add-content"            element={protect(T, <AddLearningContent />)} />
          <Route path="/teacher/content"                element={protect(T, <ViewContent />)} />
          <Route path="/teacher/performance"            element={protect(T, <StudentPerformance />)} />
          <Route path="/teacher/vocabulary"             element={protect(T, <ManageVocabulary />)} />

          {/* ─── Parent ───────────────────────────────────────────────── */}
          <Route path="/parent/dashboard" element={protect(P, <ParentDashboard />)} />
          <Route path="/parent/students"  element={protect(P, <MyStudents />)} />
          <Route path="/parent/enroll"    element={protect(P, <EnrollStudent />)} />

          {/* ─── Student (wrapped in AccessibilityProvider + Toolbar) ─── */}
          <Route path="/student/dashboard" element={protect(S, <StudentLayout><StudentDashboard /></StudentLayout>)} />
          <Route path="/student/classroom" element={protect(S, <StudentLayout><MyClassroom /></StudentLayout>)} />
          <Route path="/student/content"     element={protect(S, <StudentLayout><LearningContent /></StudentLayout>)} />
          <Route path="/student/activities"                  element={protect(S, <StudentLayout><LearningActivities /></StudentLayout>)} />
          <Route path="/student/activities/flashcards"      element={protect(S, <StudentLayout><FlashCardsActivity /></StudentLayout>)} />
          <Route path="/student/activities/scramble"        element={protect(S, <StudentLayout><WordScrambleActivity /></StudentLayout>)} />
          <Route path="/student/activities/match"           element={protect(S, <StudentLayout><WordMatchActivity /></StudentLayout>)} />
          <Route path="/student/activities/listen-spell"    element={protect(S, <StudentLayout><ListenSpellActivity /></StudentLayout>)} />
          <Route path="/student/activities/rhyme"           element={protect(S, <StudentLayout><RhymeFinderActivity /></StudentLayout>)} />
          <Route path="/student/activities/sight-words"     element={protect(S, <StudentLayout><SightWordsActivity /></StudentLayout>)} />
          <Route path="/student/activities/missing-letter"   element={protect(S, <StudentLayout><MissingLetterActivity /></StudentLayout>)} />
          <Route path="/student/activities/sentence-builder" element={protect(S, <StudentLayout><SentenceBuilderActivity /></StudentLayout>)} />
          <Route path="/student/activities/odd-one-out"      element={protect(S, <StudentLayout><OddOneOutActivity /></StudentLayout>)} />
          <Route path="/student/reading"       element={protect(S, <StudentLayout><ReadingSpace /></StudentLayout>)} />
          <Route path="/student/language"      element={protect(S, <StudentLayout><LanguageLearning /></StudentLayout>)} />
          <Route path="/student/writing"       element={protect(S, <StudentLayout><WritingHelper /></StudentLayout>)} />
          <Route path="/student/progress"      element={protect(S, <StudentLayout><MyProgress /></StudentLayout>)} />

          {/* ─── Fallback ─────────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

