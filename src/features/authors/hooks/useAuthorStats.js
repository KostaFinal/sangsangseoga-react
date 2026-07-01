import { useMemo } from "react";
import { authorsRegistry } from "../components/AuthorProfileView";

// 책 목록에서 작가별 통계(작품 수 / 팔로워 / 활동 점수 / 대표작)를 계산하는 훅.
// 뷰 컴포넌트에서 로직을 분리해서, 통계 계산 방식이 바뀌어도 뷰는 손댈 필요 없게 함.
export function useAuthorStats(allBooks) {
  return useMemo(() => {
    const map = new Map();
    allBooks.forEach(b => {
      const existing = map.get(b.author);
      if (existing) {
        existing.worksCount += 1;
        existing.activityScore += b.likes * 2 + b.commentsCount;
        if (b.likes > existing.representativeWork.likes) {
          existing.representativeWork = { title: b.title, year: (b.createdAt || "").split(".")[0], likes: b.likes };
        }
      } else {
        const registryEntry = authorsRegistry[b.author];
        map.set(b.author, {
          name: b.author,
          avatar: registryEntry?.avatar || null,
          worksCount: 1,
          followers: registryEntry?.followers ?? Math.floor(Math.random() * 5000),
          activityScore: b.likes * 2 + b.commentsCount,
          representativeWork: { title: b.title, year: (b.createdAt || "").split(".")[0], likes: b.likes },
        });
      }
    });
    return Array.from(map.values());
  }, [allBooks]);
}

// 검색어 + 정렬 기준으로 필터링/정렬된 작가 목록을 반환하는 훅.
export function useFilteredAuthors(authorStats, search, sortBy) {
  return useMemo(() => {
    const key = sortBy === "followers" ? "followers" : "activityScore";
    return authorStats
      .filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b[key] - a[key]);
  }, [authorStats, search, sortBy]);
}
