import { motion } from "motion/react";

const AVATAR_COLORS = [
  "bg-rose-100/50 text-rose-700",
  "bg-sky-100/50 text-sky-700",
  "bg-amber-100/50 text-amber-700",
  "bg-emerald-100/50 text-emerald-700",
];

function hashName(name) {
  return name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

export default function AuthorStatCard({ author, onSelect }) {
  const color = AVATAR_COLORS[hashName(author.name) % AVATAR_COLORS.length];

  return (
    <motion.button
      onClick={() => onSelect(author.name)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group w-full flex flex-col text-left rounded-2xl bg-white border border-[#e3def7] shadow-[0_4px_20px_-4px_rgba(107,84,231,0.06)] hover:border-[#b4a9ec] hover:shadow-[0_12px_28px_-8px_rgba(107,84,231,0.16)] transition-[box-shadow,border-color] duration-300 font-gowun overflow-hidden"
    >
      {/* 프로필 사진 - 이미지는 위쪽 배경 안에 원형으로, 텍스트는 그 아래 */}
      <div className="relative w-full pt-6 pb-3 flex items-center justify-center bg-white">
        {author.avatar ? (
          <img
            src={author.avatar}
            alt={author.name}
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${color} font-serif font-bold text-2xl transition-transform duration-300 group-hover:scale-105`}>
            {author.name.slice(0, 1)}
          </div>
        )}
      </div>

      {/* 정보 영역 - 이미지 아래: 작가명 / 팔로워·작품수 / 대표작 */}
      <div className="flex flex-col items-center text-center gap-0.5 p-3">
        <span className="text-[14px] font-bold text-[#110f24] group-hover:text-[#6b54e7] transition-colors tracking-tight">
          {author.name}
        </span>
        <span className="text-[11px] font-bold text-[#5c538c] tracking-wide">
          팔로워 {author.followers >= 1000 ? `${(author.followers / 1000).toFixed(1)}k` : author.followers}
          <span className="mx-1 text-[#9d92d6]">·</span>
          작품 {author.worksCount}
        </span>
        <p className="text-[11px] text-[#2f2852] font-bold w-full truncate mt-0.5">
          <span className="text-[#69619a] font-semibold">대표작: </span>
          {author.representativeWork ? `「${author.representativeWork.title}」` : "작품 없음"}
        </p>
      </div>
    </motion.button>
  );
}
