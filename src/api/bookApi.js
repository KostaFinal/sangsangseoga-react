import api from "./axios";

// 책 목록 조회
export const getBooks = ({ bookType, sort, keyword, authorId, page = 1, size = 12 } = {}) =>
  api.get("/api/books", { params: { bookType, sort, keyword, authorId, page, size } });

// 책 상세 조회
export const getBook = (bookId) => api.get(`/api/books/${bookId}`);

// 책 본문 조회
export const getBookContents = (bookId) => api.get(`/api/books/${bookId}/contents`);

// 책 읽기 시작 시 조회수 증가
export const increaseViewCount = (bookId) => api.post(`/api/books/${bookId}/view`);

// 책 추천
export const getRecommendations = (bookId, size = 3) =>
  api.get(`/api/books/${bookId}/recommendations`, { params: { size } });

// 좋아요
export const likeBook = (bookId) => api.post(`/api/books/${bookId}/likes`);
export const unlikeBook = (bookId) => api.delete(`/api/books/${bookId}/likes`);
 
// 북마크 - 책 한 권당 하나뿐이라 등록 시 pageNo로 위치를 옮기고, 취소/조회는 페이지 구분이 없다.
export const addBookmark = (bookId, pageNo) => api.post(`/api/books/${bookId}/bookmarks`, { pageNo });
export const removeBookmark = (bookId) => api.delete(`/api/books/${bookId}/bookmarks`);
export const getBookmark = (bookId) => api.get(`/api/books/${bookId}/bookmarks`);
 
// 주간 랭킹
export const getWeeklyRanking = () => api.get("/api/books/weekly-ranking");
export const getWeeklyNewReleases = () => api.get("/api/books/weekly-new-releases");

// 내가 쓴 책 목록 조회
export const getMyBooks = () => api.get("/api/books/my");

// [테스트용] 주간 인기 랭킹 즉시 재집계 (크론과 동일 로직을 즉시 실행, 확인 끝나면 제거 예정)
export const triggerWeeklyRankingAggregate = () => api.post("/api/books/weekly-ranking/aggregate");

// 제작 완료 책 최종 저장
export const publishBook = (payload) =>
  api.post("/api/books", payload);
