import api from './axiosInstance';

// GET  /parents/mystudents   → list of this parent's students
export const getMyStudents       = ()     => api.get('/parents/mystudents');

// POST /parents/addstudent   { name, email, password, age, role:'student' }
export const addStudent          = (data) => api.post('/parents/addstudent', data);

// POST /parents/enroll-student  { student_id, classroom_id }
export const enrollStudent       = (data) => api.post('/parents/enroll-student', data);

// GET  /parents/classrooms  — list all classrooms available for parent to enroll into
export const getAllClassrooms       = ()           => api.get('/parents/classrooms');

// GET  /parents/students/{id}/enrollments — all enrollments for a specific student with classroom+teacher+status
export const getStudentEnrollments  = (studentId) => api.get(`/parents/students/${studentId}/enrollments`);

// GET  /parents/students/{id}/performance — quiz scores + attendance per classroom
export const getStudentPerformance  = (studentId) => api.get(`/parents/students/${studentId}/performance`);
