import api from "./axios";

export const likeBook = (bookId) => api.post(`/api/books/${bookId}/likes`);
export const unlikeBook = (bookId) => api.delete(`/api/books/${bookId}/likes`);
export const addBookmark = (bookId, pageNo) => api.post(`/api/books/${bookId}/bookmarks`, { pageNo });
export const removeBookmark = (bookId, pageNo) => api.delete(`/api/books/${bookId}/bookmarks`, { params: { pageNo } });
export const getWeeklyRanking = () => api.get("/api/books/weekly-ranking");
export const getWeeklyNewReleases = () => api.get("/api/books/weekly-new-releases");
