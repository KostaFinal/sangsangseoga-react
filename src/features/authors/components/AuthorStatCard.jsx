import { motion } from "motion/react";
import AuthorAvatar from "./AuthorAvatar";

export default function AuthorStatCard({ author, onSelect }) {
  return (
    <motion.button
      onClick={() => onSelect(author.name)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group relative w-full flex items-center gap-6 py-5 pl-7 pr-6 text-left rounded-2xl bg-white border border-[#e3def7] shadow-[0_4px_20px_-4px_rgba(107,84,231,0.06)] hover:border-[#b4a9ec] hover:shadow-[0_12px_28px_-8px_rgba(107,84,231,0.16)] transition-[box-shadow,border-color] duration-300 font-gowun"
    >
      {/* 왼쪽 책등 스파인 효과 */}
      <span className="absolute left-0 top-4 bottom-4 w-[4px] rounded-r-full bg-gradient-to-b from-[#5179e6] via-[#6b54e7] to-[#835af1] opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

      {/* 프로필 이미지 */}
      <div className="relative flex-shrink-0">
        <AuthorAvatar name={author.name} src={author.avatar} size={76} />
      </div>

      {/* 정보 영역 */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        {/* 상단: 이름 + 통계 정보 */}
        <div className="flex items-baseline gap-3">
          {/* [기준점] 가장 어두운 네이비 블랙 */}
          <span className="text-[18px] font-bold text-[#110f24] group-hover:text-[#6b54e7] transition-colors tracking-tight">
            {author.name}
          </span>
          {/* [수정 - 더 진하게] 통계 정보 (기존보다 명도를 낮추어 선명함 강화) */}
          <span className="text-[12px] font-bold text-[#5c538c] tracking-wide">
            팔로워 {author.followers >= 1000 ? `${(author.followers / 1000).toFixed(1)}k` : author.followers}
            <span className="mx-1.5 text-[#9d92d6]">·</span>
            작품 {author.worksCount}
          </span>
        </div>
        
        {/* 하단: 대표작품 라벨 + 제목 */}
        {/* [수정 - 더 진하게] 제목 색상을 이름 직전 단계인 #2f2852로 묵직하게 조정 */}
        <div className="flex items-center gap-1 text-[14px] text-[#2f2852] font-bold min-w-0">
          {/* [수정 - 더 진하게] 라벨도 흐려 보이지 않게 톤 다운 */}
          <span className="text-[#69619a] font-semibold flex-shrink-0">대표작품:</span>
          <p className="truncate">
            {author.representativeWork ? `「${author.representativeWork.title}」` : "작품 없음"}
          </p>
        </div>
      </div>

      {/* 오른쪽 화살표 버튼 */}
      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#f6f5ff] group-hover:bg-[#6b54e7] text-[#9789de] group-hover:text-white transition-all duration-300 transform group-hover:translate-x-0.5">
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </motion.button>
  );
}