import api from "./axios";

export const getMemo = (bookId, pageNo) =>
  api.get(`/api/books/${bookId}/pages/${pageNo}/memos`);
export const addMemo = (bookId, pageNo, content, posX = null, posY = null) =>
  api.post(`/api/books/${bookId}/pages/${pageNo}/memos`, { content, posX, posY });
export const updateMemo = (bookId, pageNo, content, posX = null, posY = null) =>
  api.patch(`/api/books/${bookId}/pages/${pageNo}/memos`, { content, posX, posY });
export const deleteMemo = (bookId, pageNo) =>
  api.delete(`/api/books/${bookId}/pages/${pageNo}/memos`);
