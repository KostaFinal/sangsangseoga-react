import { Search } from "lucide-react";

export default function AuthorSearchSortBar({ search, onSearchChange, sortBy, onSortByChange }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-grow">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b9b0dc]" />
        <input
          type="text"
          placeholder="작가 이름으로 검색..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full bg-[#f8f7ff] border border-[#e6e2fc] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#2f2d59] placeholder:text-[#b9b0dc] focus:outline-none focus:border-[#6b54e7] focus:bg-white transition-all"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSortByChange("followers")}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
            sortBy === "followers"
              ? "bg-[#6b54e7] text-white border-[#6b54e7] shadow-sm"
              : "bg-white border-[#e6e2fc] text-[#7c769d] hover:border-[#6b54e7]/40 hover:text-[#6b54e7]"
          }`}
        >
          팔로워 순
        </button>
        <button
          onClick={() => onSortByChange("works")}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
            sortBy === "works"
              ? "bg-[#6b54e7] text-white border-[#6b54e7] shadow-sm"
              : "bg-white border-[#e6e2fc] text-[#7c769d] hover:border-[#6b54e7]/40 hover:text-[#6b54e7]"
          }`}
        >
          활동 많은 순
        </button>
      </div>
    </div>
  );
}
