import api from "./axios";

// 읽고 싶은 책
export const getWishlist = () => api.get("/api/bookshelves/wishlist");

export const addWishlist = (bookId) =>
  api.post(`/api/bookshelves/wishlist/${bookId}`);

export const deleteWishlist = (bookId) =>
  api.delete(`/api/bookshelves/wishlist/${bookId}`);

// 읽는 중
export const getReadingList = () => api.get("/api/bookshelves/reading");

export const updateReadingProgress = (bookId, currentPage, progress) =>
  api.patch(`/api/bookshelves/reading/${bookId}/progress`, {
    currentPage,
    progress,
  });

export const completeReading = (bookId) =>
  api.patch(`/api/bookshelves/reading/${bookId}/complete`);

export const getLastReadingPosition = (bookId) =>
  api.get(`/api/bookshelves/reading/${bookId}/last-position`);

// 읽기 완료
export const getFinishedList = () => api.get("/api/bookshelves/finished");

export const rereadBook = (bookId) =>
  api.patch(`/api/bookshelves/finished/${bookId}/reread`);

// 독서 통계
export const getReadingStats = () => api.get("/api/bookshelves/stats");

// 독후감
export const getReviews = () =>
  api.get("/api/bookshelves/reviews");

export const getReview = (reviewId) =>
  api.get(`/api/bookshelves/reviews/${reviewId}`);

export const createReview = (data) =>
  api.post("/api/bookshelves/reviews", data);

export const updateReview = (reviewId, data) =>
  api.patch(`/api/bookshelves/reviews/${reviewId}`, data);

export const deleteReview = (reviewId) =>
  api.delete(`/api/bookshelves/reviews/${reviewId}`);

export const saveDraft = (reviewId, data) =>
  api.patch(`/api/bookshelves/reviews/${reviewId}/draft`, data);

export const requestAiFeedback = (reviewId) =>
  api.post(`/api/bookshelves/reviews/${reviewId}/ai-feedback`);

export const getAiFeedback = (reviewId) =>
  api.get(`/api/bookshelves/reviews/${reviewId}/ai-feedback`);