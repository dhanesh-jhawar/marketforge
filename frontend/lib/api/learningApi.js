import { apiClient } from './client.js';

export const learningApi = {
  getModules: () => apiClient('/learning/modules'),
  getLessons: (moduleId) => apiClient(`/learning/lessons${moduleId ? `?moduleId=${moduleId}` : ''}`),
  getLesson: (id) => apiClient(`/learning/lessons/${id}`),
  getRecommended: () => apiClient('/learning/recommended'),
  completeLesson: (id) => apiClient(`/learning/lessons/${id}/complete`, { method: 'POST' }),
  getQuiz: (lessonId) => apiClient(`/quiz/${lessonId}`),
  submitQuiz: (lessonId, answers) => apiClient(`/quiz/${lessonId}/submit`, { method: 'POST', body: { answers } }),
  getSkills: () => apiClient('/skills'),
  getGlossary: (q) => apiClient(`/glossary${q ? `?q=${encodeURIComponent(q)}` : ''}`),
};
