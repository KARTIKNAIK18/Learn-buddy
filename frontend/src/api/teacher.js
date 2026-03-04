import api from './axiosInstance';

// GET  /teachers/classrooms/  → list of classrooms owned by this teacher
export const getMyClassrooms    = ()     => api.get('/teachers/classrooms/');

// POST /teachers/createclassroom  { class_name, academic_year, section }
export const createClassroom    = (data) => api.post('/teachers/createclassroom', data);

// PUT  /teachers/approve-enrollment/{id}/approve
export const approveEnrollment  = (id)   => api.put(`/teachers/approve-enrollment/${id}/approve`);

// DELETE /teachers/approve-enrollment/{id}/reject
export const rejectEnrollment   = (id)   => api.delete(`/teachers/approve-enrollment/${id}/reject`);

// GET  /teachers/enrollments  → list of pending enrollments for this teacher's classrooms
export const getPendingEnrollments = () => api.get('/teachers/enrollments');

// GET  /teachers/classrooms/{id}/students  → list of active students in a classroom
export const getClassroomStudents  = (id) => api.get(`/teachers/classrooms/${id}/students`);


// POST /classroom/{classroom_id}/add-content  — classroom_id must be in body too (Pydantic requires it)
export const addContent = (cid, data) => api.post(`/classroom/${cid}/add-content`, { ...data, classroom_id: Number(cid) });

// GET  /classroom/{classroom_id}/content  — list content uploaded to a classroom
export const getClassroomContent = (cid) => api.get(`/classroom/${cid}/content`);

// DELETE /classroom/{classroom_id}/content/{content_id}  — remove a content item
export const deleteContent = (cid, contentId) => api.delete(`/classroom/${cid}/content/${contentId}`);

// GET  /teachers/all-students  — all unique active students across teacher's classrooms
export const getAllStudents = () => api.get('/teachers/all-students');

// GET  /teachers/students/{student_id}/performance  — activity-based points summary for a student
export const getStudentPerformance = (studentId) => api.get(`/teachers/students/${studentId}/performance`);

// ── Vocabulary ────────────────────────────────────────────────────────────────

// POST /vocab/  { classroom_id?, category, en, kn, tul }  — teacher adds a word
export const addVocabWord     = (data)   => api.post('/vocab/', data);

// GET  /vocab/my  — all vocab words added by this teacher
export const getMyVocabWords  = ()       => api.get('/vocab/my');

// DELETE /vocab/{id}  — delete a word
export const deleteVocabWord  = (id)     => api.delete(`/vocab/${id}`);
