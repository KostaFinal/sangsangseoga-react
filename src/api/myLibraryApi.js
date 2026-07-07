import api from "./axios";

// 읽고 싶은 책
export const getWishlist = () => api.get("/bookshelves/wishlist");

export const addWishlist = (bookId) =>
  api.post(`/bookshelves/wishlist/${bookId}`);

export const deleteWishlist = (bookId) =>
  api.delete(`/bookshelves/wishlist/${bookId}`);

// 읽는 중
export const getReadingList = () => api.get("/bookshelves/reading");

export const updateReadingProgress = (bookId, currentPage, progress) =>
  api.patch(`/bookshelves/reading/${bookId}/progress`, {
    currentPage,
    progress,
  });

export const completeReading = (bookId) =>
  api.patch(`/bookshelves/reading/${bookId}/complete`);

export const getLastReadingPosition = (bookId) =>
  api.get(`/bookshelves/reading/${bookId}/last-position`);

// 읽기 완료
export const getFinishedList = () => api.get("/bookshelves/finished");

export const rereadBook = (bookId) =>
  api.patch(`/bookshelves/finished/${bookId}/reread`);

// 독서 통계
export const getReadingStats = () => api.get("/bookshelves/stats");

// 독후감
export const getReviews = () =>
  api.get("/bookshelves/reviews");

export const getReview = (reviewId) =>
  api.get(`/bookshelves/reviews/${reviewId}`);

export const createReview = (data) =>
  api.post("/bookshelves/reviews", data);

export const updateReview = (reviewId, data) =>
  api.patch(`/bookshelves/reviews/${reviewId}`, data);

export const deleteReview = (reviewId) =>
  api.delete(`/bookshelves/reviews/${reviewId}`);

export const saveDraft = (reviewId, data) =>
  api.patch(`/bookshelves/reviews/${reviewId}/draft`, data);

export const requestAiFeedback = (reviewId) =>
  api.post(`/bookshelves/reviews/${reviewId}/ai-feedback`);

export const getAiFeedback = (reviewId) =>
  api.get(`/bookshelves/reviews/${reviewId}/ai-feedback`);