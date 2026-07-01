import AuthorAvatar from "./AuthorAvatar";

export default function AuthorStatCard({ author, onSelect }) {
  return (
    <button
      onClick={() => onSelect(author.name)}
      className="w-full flex gap-4 py-5 text-left hover:bg-[#f8f7ff] transition-colors rounded-xl px-3 -mx-3 group"
    >
      <AuthorAvatar name={author.name} src={author.avatar} size={72} />

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <p className="font-semibold text-[15px] text-[#2f2d59] group-hover:text-[#6b54e7] transition-colors mb-1">
          {author.name}
        </p>
        <p className="text-xs text-[#b9b0dc] mb-2">
          팔로워 {author.followers >= 1000 ? `${(author.followers / 1000).toFixed(1)}k` : author.followers}
          &nbsp;·&nbsp; 작품 {author.worksCount}
        </p>
        <p className="text-xs text-[#7c769d] truncate">
          대표작품: {author.representativeWork.title}
        </p>
      </div>

      <div className="flex items-center text-[#d4cdf2] group-hover:text-[#6b54e7] transition-colors self-center">
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </button>
  );
}
