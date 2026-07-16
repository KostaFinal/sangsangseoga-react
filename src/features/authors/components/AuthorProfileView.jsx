import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, useOutletContext } from "react-router-dom";
import { Heart, MessageSquare, Eye, ArrowLeft } from "lucide-react";
import { getAuthors, followAuthor, unfollowAuthor } from "../../../api/authorApi";
import { useAuth } from "../../../shared/context/AuthContext";
import { useRequireAuth } from "../../../shared/hooks/useRequireAuth";

// 장르 뱃지 스타일 - 통일감 있는 팔레트
const genreBadge = (genre) => {
  const map = {
    "소설": { cls: "bg-[#ddd6fe] text-[#5b21b6] border-[#c4b5fd]", label: "소설" },
    "시": { cls: "bg-[#e9d5ff] text-[#7e22ce] border-[#d8b4fe]", label: "시" },
    "에세이": { cls: "bg-[#ede9ff] text-[#6b54e7] border-[#d4cdf2]", label: "에세이" },
    "동화": { cls: "bg-[#f3e8ff] text-[#9333ea] border-[#e9d5ff]", label: "동화" },
    "지식정보": { cls: "bg-[#faf5ff] text-[#a855f7] border-[#f3e8ff]", label: "지식정보" },
  };
  return map[genre] || { cls: "bg-[#e6e2fc] text-[#6b54e7] border-[#d4cdf2]", label: genre };
};

export default function AuthorProfileView() {
  const { authorName: rawAuthorName } = useParams();
  const authorName = decodeURIComponent(rawAuthorName);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "owner" ? "owner" : "viewer";
  const { books: allBooks, handleToggleLike } = useOutletContext();
  const { currentUser } = useAuth();
  const requireAuth = useRequireAuth();
  const onSelectBook = (book) => navigate(`/friends/${book.id}`);
  const onBackToDirectory = () => navigate("/authors");

  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(null);
  const [authorRecord, setAuthorRecord] = useState(null); // getAuthors API의 원본 항목
  const [followBusy, setFollowBusy] = useState(false);

  const realAuthorBooks = allBooks.filter(b => b.author.trim() === authorName.trim());

  const authorProfile = {
    name: authorRecord?.nickname || authorName,
    avatar: authorRecord?.profileImageUrl || null,
    worksCount: authorRecord?.worksCount ?? realAuthorBooks.length,
    bio: authorRecord?.introduction || "아직 작성된 소개글이 없습니다.",
  };

  const effectiveAuthorId = authorRecord?.id ?? realAuthorBooks[0]?.authorId ?? null;
  const displayFollowers = followerCount ?? 0;
  // mode 뿐 아니라 memberId 비교로도 본인 프로필인지 확인 (mode가 못 갱신되는 진입 경로 대비)
  const isOwnProfile = mode === "owner" ||
    (currentUser?.memberId != null && effectiveAuthorId != null && String(currentUser.memberId) === String(effectiveAuthorId));

  useEffect(() => {
    let cancelled = false;
    getAuthors({ keyword: authorName, size: 20 })
      .then(res => {
        if (cancelled) return;
        const items = res.data?.data?.items || [];
        const matched = items.find(a => a.nickname?.trim() === authorName.trim());
        if (matched) {
          setAuthorRecord(matched);
          setIsFollowing(!!matched.isFollowedByMe);
          setFollowerCount(matched.followerCount);
        }
      })
      .catch(() => { });
    return () => { cancelled = true; };
  }, [authorName]);


  const handleToggleFollow = async () => {
    if (!effectiveAuthorId || followBusy || !requireAuth()) return;
    const wasFollowing = isFollowing;
    setFollowBusy(true);
    setIsFollowing(!wasFollowing);
    setFollowerCount(prev => (prev == null ? prev : (wasFollowing ? prev - 1 : prev + 1)));
    try {
      if (wasFollowing) {
        await unfollowAuthor(effectiveAuthorId);
      } else {
        const res = await followAuthor(effectiveAuthorId);
        const data = res?.data?.data;
        if (data?.followerCount != null) setFollowerCount(data.followerCount);
      }
      window.dispatchEvent(new CustomEvent("favorite-author-updated"));
    } catch (err) {
      setIsFollowing(wasFollowing);
      setFollowerCount(prev => (prev == null ? prev : (wasFollowing ? prev + 1 : prev - 1)));
      console.error("팔로우 처리 실패", err);
    } finally {
      setFollowBusy(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-0 py-8 animate-fadeIn font-gowun">

      {/* 1. 상단 내비게이션 (요청하신 프로필 왼쪽 위 배치) */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBackToDirectory} className="inline-flex items-center gap-1.5 text-sm text-[#4d4671] hover:text-[#6b54e7] font-bold transition">
          <ArrowLeft className="w-4 h-4" /> 작가 목록
        </button>
      </div>

      {/* 2. 프로필 헤더 */}
      <div className="flex flex-col bg-white rounded-2xl p-7 md:p-10 border border-[#e3def7] shadow-[0_4px_20px_-4px_rgba(107,84,231,0.06)] mb-8 text-left gap-7">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
          <div className="relative shrink-0">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden p-1 border-2 border-[#e6e2fc] shadow-md">
              {authorProfile.avatar ? (
                <img src={authorProfile.avatar} alt={authorProfile.name} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full rounded-full bg-[#6b54e7] flex items-center justify-center text-white text-3xl font-black">
                  {authorProfile.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="absolute right-1 bottom-1 w-6 h-6 bg-[#6b54e7] border-2 border-white rounded-full flex items-center justify-center shadow-xs">
              <span className="text-[10px] text-white">✓</span>
            </div>
          </div>

          <div className="space-y-4 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center sm:justify-start">
              <h2 className="text-3xl md:text-4xl font-bold text-[#110f24] tracking-tight">
                {authorProfile.name}
              </h2>
              {!isOwnProfile && (
                <div className="flex gap-2 justify-center sm:justify-start">
                  <button
                    onClick={handleToggleFollow}
                    disabled={!effectiveAuthorId || followBusy}
                    className={`px-5 py-1.5 rounded-full text-xs font-bold transition duration-300 shadow-xs cursor-pointer border disabled:opacity-50 disabled:cursor-default ${isFollowing
                      ? "bg-[#6b54e7] hover:bg-[#6148e1] text-white border-transparent"
                      : "bg-white text-[#69619a] border-gray-200 hover:text-[#6b54e7] hover:border-[#d4cdf2]"
                      }`}
                  >
                    {isFollowing ? "팔로잉" : "팔로우"}
                  </button>
                </div>
              )}
            </div>

            {/* 통계 정보 - 가독성을 위해 더 진하게 변경 */}
            <div className="flex items-center gap-8 justify-center sm:justify-start">
              <div className="text-center">
                <p className="text-[11px] font-bold text-[#69619a] uppercase tracking-wide">팔로워</p>
                <p className="text-lg font-bold text-[#110f24] mt-0.5">{displayFollowers.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-[11px] font-bold text-[#69619a] uppercase tracking-wide">작품 수</p>
                <p className="text-lg font-bold text-[#110f24] mt-0.5">{authorProfile.worksCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 작가 소개글 - 텍스트색 더 진하고 선명하게 변경 */}
        <div className="w-full border-l-[3px] border-[#6b54e7] pl-6 py-2 bg-[#f6f5ff] rounded-r-2xl pr-4">
          <p className="text-[16px] leading-relaxed text-[#2f2852] font-semibold whitespace-pre-line">
            &ldquo;{authorProfile.bio}&rdquo;
          </p>
        </div>
      </div>

      {/* 3. 작가의 작품 영역 */}
      <div className="space-y-6 text-left">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-[22px] font-bold text-[#110f24]">작가의 작품</h3>
            <p className="text-xs text-[#5c538c] font-bold tracking-wide mt-1">
              {authorProfile.name} 작가의 따스한 문학적 여정을 함께 거닐어 보세요.
            </p>
          </div>
        </div>

        {realAuthorBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-[#faf9ff] rounded-2xl border border-[#e3def7]">
            <p className="text-[#69619a] text-sm font-bold">아직 등록된 작품이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {realAuthorBooks.map((book) => {
              const badge = genreBadge(book.genre);
              return (
                <div key={book.id} onClick={() => onSelectBook(book)} className="group cursor-pointer">
                  {/* 도서 표지 - friendsLibraryView와 동일한 카드 포맷 */}
                  <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-sm border border-gray-200 group-hover:shadow-md group-hover:border-[#d4cdf2] transition-all duration-300 group-hover:-translate-y-1 bg-white">
                    <img
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={book.coverImage}
                      alt={book.title}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/75 via-transparent to-transparent" />
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold border backdrop-blur-sm ${badge.cls}`}>
                      {badge.label}
                    </div>
                    <div className="absolute bottom-0 inset-x-0 p-3 text-left">
                      <h4 className="text-white text-[13px] font-semibold leading-tight line-clamp-2 mb-1.5">{book.title}</h4>
                      <div className="flex items-center gap-2.5 text-white/80 text-[10px]">
                        <button onClick={e => handleToggleLike(e, book.id)} className="flex items-center gap-1 hover:text-white transition cursor-pointer">
                          <Heart className={`w-3.5 h-3.5 ${book.isLikedByMe ? "fill-red-400 stroke-red-400" : ""}`} />
                          {book.likes >= 1000 ? `${(book.likes / 1000).toFixed(1)}k` : book.likes}
                        </button>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {book.commentsCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {(book.viewCount ?? 0) >= 1000 ? `${(book.viewCount / 1000).toFixed(1)}k` : (book.viewCount ?? 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>


    </div >
  );
}