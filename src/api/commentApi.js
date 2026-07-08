import api from "./axios";

export const getComments = (bookId, cursor = null, size = 20) =>
  api.get(`/api/books/${bookId}/comments`, { params: { cursor, size } });
export const addComment = (bookId, content, replyToCommentId = null) =>
  api.post(`/api/books/${bookId}/comments`, { content, replyToCommentId });
export const addReply = (commentId, content) =>
  api.post(`/api/comments/${commentId}/replies`, { content });
export const updateComment = (commentId, content) =>
  api.patch(`/api/comments/${commentId}`, { content });
export const deleteComment = (commentId) =>
  api.delete(`/api/comments/${commentId}`);
