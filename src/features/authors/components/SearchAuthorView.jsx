import { useState } from "react";
import { useAuthorStats, useFilteredAuthors } from "../hooks/useAuthorStats";
import AuthorSearchSortBar from "./AuthorSearchSortBar";
import AuthorStatCard from "./AuthorStatCard";

export default function SearchAuthorView({ allBooks, onSelectAuthor }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("followers");

  const authorStats = useAuthorStats(allBooks);
  const filteredAndSortedAuthors = useFilteredAuthors(authorStats, search, sortBy);

  return (
    <div className="w-full max-w-2xl mx-auto py-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#2f2d59] mb-1">작가 소개</h2>
        <p className="text-sm text-[#b9b0dc]">상상서가의 작가들을 만나보세요</p>
      </div>

      <AuthorSearchSortBar
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      <div className="divide-y divide-[#f3f0ff]">
        {filteredAndSortedAuthors.map(author => (
          <AuthorStatCard key={author.name} author={author} onSelect={onSelectAuthor} />
        ))}
        {filteredAndSortedAuthors.length === 0 && (
          <p className="text-center text-[#b9b0dc] text-sm py-16">검색 결과가 없습니다</p>
        )}
      </div>
    </div>
  );
}
