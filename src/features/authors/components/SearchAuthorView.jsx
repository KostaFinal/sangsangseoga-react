import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthors } from "../../../api/authorApi";
import AuthorSearchSortBar from "./AuthorSearchSortBar";
import AuthorStatCard from "./AuthorStatCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SearchAuthorView() {
  const navigate = useNavigate();
  const onSelectAuthor = (name) => navigate(`/authors/${encodeURIComponent(name)}`);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("followers");
  const [currentPage, setCurrentPage] = useState(1);

  const [authors, setAuthors] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchAuthors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAuthors({
        keyword: search.trim() || undefined,
        sort: sortBy,
        page: currentPage,
        size: 20,
      });
      const data = res.data.data;
      setAuthors(data.items);
      setTotalCount(data.totalCount);
      setTotalPages(Math.ceil(data.totalCount / 20) || 1);
    } catch (err) {
      console.error("작가 목록 조회 실패", err);
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, currentPage]);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // API 응답을 AuthorStatCard가 기대하는 형태로 매핑
  const mapAuthor = (author) => ({
    id: author.id,
    name: author.nickname,
    avatar: author.profileImageUrl,
    followers: author.followerCount,
    worksCount: author.worksCount,
    representativeWork: author.representativeWork
      ? { title: author.representativeWork }
      : null,
  });

  return (
    <div className="w-full max-w-2xl mx-auto py-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#2f2d59] mb-1">작가 소개</h2>
        <p className="text-sm text-[#b9b0dc]">상상서가의 작가들을 만나보세요</p>
        <p className="text-xs text-[#b9b0dc] mt-0.5">총 {totalCount}명의 작가</p>
      </div>

      <AuthorSearchSortBar
        search={search}
        onSearchChange={(val) => { setSearch(val); setCurrentPage(1); }}
        sortBy={sortBy}
        onSortByChange={(val) => { setSortBy(val); setCurrentPage(1); }}
      />

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-4 border-[#6b54e7] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {authors.map(author => (
            <AuthorStatCard
              key={author.id}
              author={mapAuthor(author)}
              onSelect={() => onSelectAuthor(author.nickname)}
            />
          ))}
          {authors.length === 0 && (
            <p className="text-center text-[#b9b0dc] text-sm py-16">검색 결과가 없습니다</p>
          )}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-12">
          <button
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e6e2fc] text-[#7c769d] hover:border-[#6b54e7] hover:text-[#6b54e7] disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${currentPage === p
                ? "bg-[#6b54e7] text-white shadow-sm"
                : "text-[#7c769d] hover:bg-[#f3f0ff] hover:text-[#6b54e7]"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e6e2fc] text-[#7c769d] hover:border-[#6b54e7] hover:text-[#6b54e7] disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
