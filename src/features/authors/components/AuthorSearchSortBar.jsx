import { Search } from "lucide-react";

export default function AuthorSearchSortBar({ search, onSearchChange, sortBy, onSortByChange }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-16">
      <div className="relative flex-grow">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b54e7]" />
        <input
          type="text"
          placeholder="작가 이름으로 검색..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full bg-white border-2 border-[#c4b5fd] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#2f2d59] placeholder:text-[#7c769d] focus:outline-none focus:border-[#6b54e7] transition-all"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSortByChange("followers")}
          className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
            sortBy === "followers"
              ? "bg-[#6b54e7] text-white border-[#6b54e7] shadow-sm"
              : "bg-white border-[#c4b5fd] text-[#5c5480] hover:border-[#6b54e7] hover:text-[#6b54e7]"
          }`}
        >
          팔로워 순
        </button>
        <button
          onClick={() => onSortByChange("works")}
          className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
            sortBy === "works"
              ? "bg-[#6b54e7] text-white border-[#6b54e7] shadow-sm"
              : "bg-white border-[#c4b5fd] text-[#5c5480] hover:border-[#6b54e7] hover:text-[#6b54e7]"
          }`}
        >
          활동 많은 순
        </button>
      </div>
    </div>
  );
}
