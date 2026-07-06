import api from "./axios";

// 작가 검색 목록
export const getAuthors = ({ keyword, sort = "followers", page = 1, size = 20 } = {}) =>
  api.get("/api/authors", { params: { keyword, sort, page, size } });

// 작가 팔로우
export const followAuthor = (authorId) => api.post(`/api/authors/${authorId}/follows`);

// 작가 언팔로우
export const unfollowAuthor = (authorId) => api.delete(`/api/authors/${authorId}/follows`);
