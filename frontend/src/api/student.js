import api from './axiosInstance';

// GET  /student/classroom   → list of ALL active classrooms this student is enrolled in (each with teacher info)
export const getMyClassrooms  = () => api.get('/student/classroom');

// GET  /student/content/{classroom_id}  → all content items for this student's classroom
export const getMyContent     = (classroomId) => api.get(`/student/content/${classroomId}`);

// POST /student/points/add  → { activity_name, points }  — record a completed activity
export const addPoints        = (activity_name, points) => api.post('/student/points/add', { activity_name, points });

// GET  /student/points/total → { total_points, activities_completed, level, breakdown[] }
export const getMyPoints      = () => api.get('/student/points/total');

// GET  /student/me → { id, name, email, roll_no, age }
export const getMyProfile     = () => api.get('/student/me');

// GET  /vocab/student  — custom vocab words added by this student's classroom teachers
export const getCustomVocab   = () => api.get('/vocab/student');
