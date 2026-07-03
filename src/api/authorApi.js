import api from "./axios";

export const followAuthor = (authorId) => api.post(`/api/authors/${authorId}/follows`);
export const unfollowAuthor = (authorId) => api.delete(`/api/authors/${authorId}/follows`);
