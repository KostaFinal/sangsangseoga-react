import { useState } from "react";
import { ArrowRight, Heart, MessageSquare, Flag } from "lucide-react";
import ReportModal from "@/src/shared/components/ReportModal";
import { submitReport, isReported } from "@/src/shared/utils/reports";

// 장르 뱃지 스타일 - 통일감 있는 팔레트
const genreBadge = (genre) => {
  const map = {
   "소설":    { cls: "bg-[#ddd6fe] text-[#5b21b6] border-[#c4b5fd]", label: "소설" },
"시":      { cls: "bg-[#e9d5ff] text-[#7e22ce] border-[#d8b4fe]", label: "시" },
"에세이":  { cls: "bg-[#ede9ff] text-[#6b54e7] border-[#d4cdf2]", label: "에세이" },
"동화":    { cls: "bg-[#f3e8ff] text-[#9333ea] border-[#e9d5ff]", label: "동화" },
"지식정보":{ cls: "bg-[#faf5ff] text-[#a855f7] border-[#f3e8ff]", label: "지식정보" },
  };
  return map[genre] || { cls: "bg-[#e6e2fc] text-[#6b54e7] border-[#d4cdf2]", label: genre };
};

export const authorsRegistry = {
  "이서윤": {
    name: "이서윤",
    avatar: "https://picsum.photos/300/300",
    followers: 12845,
    publishedWorksCount: 12,
    bio: "일상의 작은 순간에서 이야기를 발견하고, 따뜻한 문장으로 마음을 전하고자 합니다.",
    themeColor: "bg-[#6b54e7] hover:bg-[#6148e1]",
    accentBg: "bg-[#6b54e7]/10",
    textAccent: "text-[#6b54e7]"
  },
  "김하늘": {
    name: "김하늘",
    avatar: "https://picsum.photos/seed/book1/300/300",
    followers: 8520,
    publishedWorksCount: 5,
    bio: "밤하늘을 수놓는 무수한 별빛처럼, 마음을 움직이는 신비로운 이야기를 창조합니다.",
    themeColor: "bg-[#6b54e7] hover:bg-[#6148e1]",
    accentBg: "bg-[#6b54e7]/10",
    textAccent: "text-[#6b54e7]"
  },
  "정연우": {
    name: "정연우",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300",
    followers: 6120,
    publishedWorksCount: 8,
    bio: "흐르는 시간 속에서 반짝이는 순간을 수집하여, 글이라는 영원한 그릇에 단단히 담습니다.",
    themeColor: "bg-[#b45309] hover:bg-[#92400e]",
    accentBg: "bg-[#b45309]/10",
    textAccent: "text-[#b45309]"
  },
  "박지현": {
    name: "박지현",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300&h=300",
    followers: 9410,
    publishedWorksCount: 10,
    bio: "모래사장에 새긴 바람의 흔적과 푸른 파도 소리처럼, 누구나 가슴 한편에 품고 살아가는 그리움을 수놓습니다.",
    themeColor: "bg-[#5179e6] hover:bg-[#6148e1]",
    accentBg: "bg-[#5179e6]/10",
    textAccent: "text-[#5179e6]"
  },
  "한유진": {
    name: "한유진",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300&h=300",
    followers: 4230,
    publishedWorksCount: 4,
    bio: "도시의 서늘한 안개와 길게 늘어진 달빛 아래서, 인간 본성이 지닌 내밀하고 서정적인 심연을 집필합니다.",
    themeColor: "bg-[#2f2d59] hover:bg-[#231f45]",
    accentBg: "bg-[#2f2d59]/10",
    textAccent: "text-[#2f2d59]"
  },
  "윤지민": {
    name: "윤지민",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300&h=300",
    followers: 11050,
    publishedWorksCount: 15,
    bio: "심해 바닷물 속에 잠긴 조용한 아틀란티스 유적처럼, 세상의 소음에서 완전히 이탈한 마음 치유 기행을 꿈꿉니다.",
    themeColor: "bg-[#5179e6] hover:bg-[#6148e1]",
    accentBg: "bg-[#5179e6]/10",
    textAccent: "text-[#5179e6]"
  },
  "이지안": {
    name: "이지안",
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=300&h=300",
    followers: 7340,
    publishedWorksCount: 7,
    bio: "출퇴근길 지하철 열차 안에서 느끼는 고즈넉한 온기처럼, 서로 상처 입은 우리가 마음으로 이어지는 조용한 일상의 기적을 말하고 싶습니다.",
    themeColor: "bg-[#be123c] hover:bg-[#9f1239]",
    accentBg: "bg-[#be123c]/10",
    textAccent: "text-[#be123c]"
  },
  "배수빈": {
    name: "배수빈",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300",
    followers: 5980,
    publishedWorksCount: 9,
    bio: "지직거리는 LP 판 아래 번지는 향긋한 연꽃차 향기처럼, 기억 깊은 구석을 다듬는 따스하고 단아한 수필을 지향합니다.",
    themeColor: "bg-[#c2410c] hover:bg-[#9a3412]",
    accentBg: "bg-[#c2410c]/10",
    textAccent: "text-[#c2410c]"
  }
};

export default function AuthorProfileView({
  authorName,
  allBooks,
  onSelectBook,
  onBackToLibrary,
  onBackToDirectory
}) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [hasReported, setHasReported] = useState(() => isReported("author", authorName));

  const handleSubmitReport = ({ reason, detail }) => {
    submitReport({ targetType: "author", targetId: authorName, reason, detail });
    setHasReported(true);
    setIsReportOpen(false);
    alert("신고가 접수되었습니다. 검토 후 조치하겠습니다.");
  };

  const authorProfile = authorsRegistry[authorName] || {
    name: authorName,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300&h=300",
    followers: Math.abs(authorName.charCodeAt(0) * 153 % 4500) + 1200,
    publishedWorksCount: allBooks.filter(b => b.author === authorName).length || 3,
    bio: "독자 여러분께 감미롭고 평안한 사색의 밤을 전하는 상상서가 소속 작가입니다.",
    themeColor: "bg-[#6b54e7] hover:bg-[#6148e1]",
    accentBg: "bg-[#6b54e7]/10",
    textAccent: "text-[#6b54e7]"
  };

  const realAuthorBooks = allBooks.filter(b => b.author.trim() === authorName.trim());

  const handleFollowToggle = () => setIsFollowing(!isFollowing);
  const displayFollowers = isFollowing ? authorProfile.followers + 1 : authorProfile.followers;

  return <div className="w-full max-w-4xl mx-auto px-4 md:px-0 py-8 animate-fadeIn">
    
    {/* 1. 프로필 헤더 */}
    <div className="flex flex-col bg-white rounded-2xl p-7 md:p-10 border border-[#e6e2fc] shadow-sm mb-8 text-left gap-7">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
        <div className="relative shrink-0">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden p-1 border-2 border-[#e6e2fc] shadow-md">
            <img src={authorProfile.avatar} alt={authorProfile.name} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
          </div>
          <div className="absolute right-1 bottom-1 w-6 h-6 bg-[#6b54e7] border-2 border-white rounded-full flex items-center justify-center shadow-xs">
            <span className="text-[10px] text-white">✓</span>
          </div>
        </div>

        <div className="space-y-4 text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center sm:justify-start">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#2f2d59] tracking-tight">
              {authorProfile.name}
            </h2>
            <button onClick={handleFollowToggle} className={`px-5 py-1.5 rounded-full text-xs font-sans font-bold transition duration-300 shadow-xs cursor-pointer ${isFollowing ? "bg-gray-150 text-[#7c769d] border border-gray-250 hover:bg-gray-200" : `${authorProfile.themeColor} text-white`}`}>
              {isFollowing ? "팔로잉" : "팔로우"}
            </button>
            <button
              onClick={() => !hasReported && setIsReportOpen(true)}
              disabled={hasReported}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-sans font-medium border border-gray-200 text-[#b9b0dc] hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#b9b0dc] disabled:cursor-default"
            >
              <Flag className="w-3 h-3" />
              {hasReported ? "신고됨" : "신고"}
            </button>
          </div>
          <div className="flex items-center gap-8 justify-center sm:justify-start">
            <div className="text-center">
              <p className="text-[10px] font-mono tracking-wider text-[#b9b0dc] font-bold uppercase">팔로워</p>
              <p className="font-serif text-lg font-bold text-gray-900 mt-0.5">{displayFollowers.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-mono tracking-wider text-[#b9b0dc] font-bold uppercase">작품 수</p>
              <p className="font-serif text-lg font-bold text-gray-900 mt-0.5">{authorProfile.publishedWorksCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full border-l-[3px] border-[#6b54e7]/40 pl-6 py-2 select-text bg-[#f3f0ff]/40 rounded-r-2xl pr-4">
        <p className="font-serif text-[15px] md:text-[16px] italic leading-relaxed text-[#7c769d] font-medium whitespace-pre-line">
          &ldquo;{authorProfile.bio}&rdquo;
        </p>
      </div>
    </div>

    {/* 2. 작가의 작품 - 이미지 그리드 */}
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="font-serif text-[22px] md:text-2xl font-bold text-[#1a1c1d]">작가의 작품</h3>
          <p className="text-xs text-[#b9b0dc] font-sans tracking-wide mt-1">
            {authorProfile.name} 작가의 따스한 문학적 여정을 함께 거닐어 보세요.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {onBackToDirectory && (
            <button onClick={onBackToDirectory} className="inline-flex items-center gap-1.5 text-sm text-[#7c769d] hover:text-[#6b54e7] font-medium transition duration-200">
              작가 목록
            </button>
          )}
          <button onClick={onBackToLibrary} className="inline-flex items-center gap-1.5 text-sm text-[#7c769d] hover:text-[#6b54e7] font-medium transition duration-200">
            전체 서재 <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {realAuthorBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-[#faf9ff] rounded-2xl border border-[#e6e2fc]">
          <p className="text-[#7c769d] text-sm font-medium">아직 등록된 작품이 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
          {realAuthorBooks.map((book) => {
            const badge = genreBadge(book.genre);
            return (
              <div
                key={book.id}
                onClick={() => onSelectBook(book)}
                className="group cursor-pointer"
              >
                {/* 표지 */}
                <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-sm border border-[#f0eeff] group-hover:shadow-md group-hover:border-[#d4cdf2] transition-all duration-300 group-hover:-translate-y-1 bg-[#f8f7ff]">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={book.coverImage}
                    alt={book.title}
                    referrerPolicy="no-referrer"
                  />

                  {/* 장르 뱃지 */}
                  <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold border backdrop-blur-sm ${badge.cls}`}>
                    {badge.label}
                  </div>

                  {/* 좋아요/댓글 */}
                  <div className="absolute bottom-2 left-0 right-0 px-2 flex items-center gap-2 text-white/80 text-[10px]">
                    <span className="flex items-center gap-0.5">
                      <Heart className="w-2.5 h-2.5" />
                      {book.likes >= 1000 ? `${(book.likes / 1000).toFixed(1)}k` : book.likes}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <MessageSquare className="w-2.5 h-2.5" />
                      {book.commentsCount}
                    </span>
                  </div>
                </div>

                {/* 제목 + 읽으러가기 */}
                <div className="mt-2.5 px-0.5">
                  <p className="text-[13px] font-semibold text-[#2f2d59] leading-tight line-clamp-1 group-hover:text-[#6b54e7] transition-colors">
                    {book.title}
                  </p>
                  <p className="text-[10px] text-[#b9b0dc] mt-0.5 group-hover:text-[#7c769d] transition-colors">
                    읽으러 가기 →
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

    <ReportModal
      isOpen={isReportOpen}
      onClose={() => setIsReportOpen(false)}
      targetLabel={`작가 '${authorProfile.name}'`}
      onSubmit={handleSubmitReport}
    />
  </div>;
}
