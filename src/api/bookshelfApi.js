import api from "./axios";

export const getWishlistBookshelf = () => api.get("/api/bookshelves/wishlist");
export const getReadingBookshelf = () => api.get("/api/bookshelves/reading");
export const getFinishedBookshelf = () => api.get("/api/bookshelves/finished");

export const updateReadingProgress = (bookId, currentPage, progress) =>
  api.patch(`/api/bookshelves/reading/${bookId}/progress`, { currentPage, progress });

export const completeReading = (bookId) =>
  api.patch(`/api/bookshelves/reading/${bookId}/complete`);

export const rereadFinishedBook = (bookId) =>
  api.patch(`/api/bookshelves/finished/${bookId}/reread`);

export const removeWishlistBook = (bookId) =>
  api.delete(`/api/bookshelves/wishlist/${bookId}`);
