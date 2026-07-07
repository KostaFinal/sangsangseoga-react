import api from "./axios";
 
// 책 목록 조회
export const getBooks = ({ bookType, sort, keyword, page = 1, size = 12 } = {}) =>
  api.get("/api/books", { params: { bookType, sort, keyword, page, size } });
 
// 책 상세 조회
export const getBook = (bookId) => api.get(`/api/books/${bookId}`);
 
// 책 본문 조회
export const getBookContents = (bookId) => api.get(`/api/books/${bookId}/contents`);
 
// 책 추천
export const getRecommendations = (bookId, size = 3) =>
  api.get(`/api/books/${bookId}/recommendations`, { params: { size } });
 
// 좋아요
export const likeBook = (bookId) => api.post(`/api/books/${bookId}/likes`);
export const unlikeBook = (bookId) => api.delete(`/api/books/${bookId}/likes`);
 
// 북마크
export const addBookmark = (bookId, pageNo) => api.post(`/api/books/${bookId}/bookmarks`, { pageNo });
export const removeBookmark = (bookId, pageNo) => api.delete(`/api/books/${bookId}/bookmarks`, { params: { pageNo } });
 
// 주간 랭킹
export const getWeeklyRanking = () => api.get("/api/books/weekly-ranking");
export const getWeeklyNewReleases = () => api.get("/api/books/weekly-new-releases");
