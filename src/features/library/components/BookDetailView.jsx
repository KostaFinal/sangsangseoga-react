import { useState, useEffect } from "react";
import { Heart, ChevronLeft, UserPlus, Check, Flag } from "lucide-react";
import ReportModal from "@/src/shared/components/ReportModal";
import { submitReport, isReported } from "@/src/shared/utils/reports";

export default function BookDetailView({
  book,
  onBack,
  onStartReading,
  onToggleLike,
  onToggleBookmark,
  allBooks,
  onSelectRecommended,
  onSaveComment,
  onSaveReply,
  onSelectAuthor,
  mode = "viewer",
  onUpdateDescription
}) {
  const [commentUser, setCommentUser] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyUser, setReplyUser] = useState("");
  const [replyText, setReplyText] = useState("");
  const [reportTarget, setReportTarget] = useState(null); // { type, id, label }
  const [reportedIds, setReportedIds] = useState([]);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editSummary, setEditSummary] = useState(book.summary || "");

  const handleStartReport = (type, id, label) => setReportTarget({ type, id, label });
  const handleSubmitReport = ({ reason, detail }) => {
    submitReport({ targetType: reportTarget.type, targetId: reportTarget.id, reason, detail });
    setReportedIds(prev => [...prev, reportTarget.id]);
    alert("신고가 접수되었습니다. 검토 후 조치하겠습니다.");
    setReportTarget(null);
  };
  const handleSubmitReply = (e, parentCommentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onSaveReply?.(parentCommentId, replyUser.trim() || "익명의 사색가", replyText.trim());
    setReplyText("");
    setReplyUser("");
    setReplyingTo(null);
  };

  // Generate a beautiful poetic Korean subtitle based on the book
  const getSubtitle = b => {
    if (b.id === "book-1") return "잃어버린 기억들의 아련하고 황홀한 서사";
    if (b.id === "book-2") return "우주의 푸른 꿈을 수여하는 성단 항로";
    if (b.id === "book-3") return "점차 멀어져가는 영원의 가교를 조용히 건너며";

    // Generics based on genre
    switch (b.genre) {
      case "시":
        return "찰나의 순간들이 남기는 서정적 메아리";
      case "에세이":
        return "피로한 영혼에 가만히 건네는 따스한 고독";
      case "소설":
        return "인간의 가녀린 운명이 자아내는 보이지 않는 실타래";
      case "동화":
        return "순수한 상상과 맑은 웃음이 흘러넘치는 동심의 강가";
      case "지식정보":
        return "차분히 정리된 지식과 통찰이 깃든 안내서";
      default:
        return "사유와 고요함이 아늑하게 머무는 마음의 안식처";
    }
  };
  const getTags = genre => {
    switch (genre) {
      case "에세이":
        return ["힐링", "위로", "추억", "전연령"];
      case "시":
        return ["시집", "서정", "감성", "전연령"];
      case "소설":
        return ["이야기", "드라마", "감동", "전연령"];
      case "동화":
        return ["동화책", "비행", "동심", "전연령"];
      case "지식정보":
        return ["지식", "정보", "가이드", "전연령"];
      default:
        return ["문학", "사색", "창작", "전연령"];
    }
  };
  const getHashTags = genre => {
    switch (genre) {
      case "에세이":
        return ["#사색", "#치유", "#가을밤", "#기억"];
      case "시":
        return ["#서정시", "#은유", "#감정선", "#구절"];
      case "소설":
        return ["#이야기", "#인생", "#여정", "#인간"];
      case "동화":
        return ["#상상력", "#아기자기", "#어린이", "#꿈결"];
      case "지식정보":
        return ["#지식정보", "#가이드", "#정리", "#인사이트"];
      default:
        return ["#활자", "#수필", "#감수성", "#상상"];
    }
  };

  // Get dynamic simulated human friendly relative time for comments list
  const getCommentTime = index => {
    if (index === 0) return "21분 전";
    if (index === 1) return "2시간 전";
    if (index === 2) return "5시간 전";
    if (index === 3) return "1일 전";
    return "3일 전";
  };

  // Filter recommendations (other books)
  const recommendations = allBooks.filter(b => b.id !== book.id).slice(0, 4);
  const handleSubmitComment = e => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onSaveComment(commentUser.trim() || "익명의 사색가", commentText.trim());
    setCommentText("");
  };

  // Auto-scroll to top on mounting a new book
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
    setReportedIds([book.id, ...book.comments.map(c => c.id)].filter(id => isReported("book", id) || isReported("comment", id)));
  }, [book.id]);

  const isPoetry = false;
  const isFairytale = book.genre === "동화";

  // Card themes
  const cardBgClass = isPoetry ? "bg-[#fdfbf7] border border-[#e8dfcb] shadow-sm" : "bg-white border border-[#e6e2fc] shadow-sm";

  // Accent badge text and background for the cover banner
  let genreTagText = `📖 정통 소설`;
  let genreTagStyle = "bg-neutral-900 text-white border border-neutral-700 font-extrabold";
  if (isFairytale) {
    genreTagText = `🧸 창작 동화`;
    genreTagStyle = "bg-neutral-900 text-white border border-neutral-700 font-extrabold";
  } else if (book.genre === "시") {
    genreTagText = `❊ 서정시`;
    genreTagStyle = "bg-neutral-900 text-white border border-neutral-700 font-extrabold";
  } else if (book.genre === "에세이") {
    genreTagText = `❀ 감성 에세이`;
    genreTagStyle = "bg-neutral-900 text-white border border-neutral-700 font-extrabold";
  } else if (book.genre === "지식정보") {
    genreTagText = `📚 지식정보`;
    genreTagStyle = "bg-neutral-900 text-white border border-neutral-700 font-extrabold";
  }

  // Cover image container borders
  const coverBorderClass = isPoetry ? "border border-[#dcd3be] rounded-lg" : "border border-black/10 rounded-xl";

  // Subtitle styling - 글씨 크기를 키우고 보라빛 도는 진한 색상으로 교체
  const getSubtitleStyle = () => {
    if (isPoetry) return "text-amber-900 italic font-bold text-base md:text-lg";
    return "text-[#4b3e80] italic font-semibold text-base md:text-lg";
  };

  // Title class (요청하신 대로 '책 제목' 부분은 기존 스타일 혹은 약간만 다듬어 유지)
  const getTitleStyle = () => {
    if (isPoetry) return "text-3xl md:text-[40px] leading-tight font-bold text-[#451a03] tracking-tight";
    return "text-3xl md:text-[42px] leading-tight font-bold text-[#2f2d59] tracking-tight";
  };

  // Action Button (Start reading CTA)
  const getCtaButtonStyle = () => {
    if (isPoetry) {
      return "w-full max-w-sm bg-[#4c0519] border border-[#fb7185]/30 text-[#fecdd3] hover:bg-[#881337] rounded-lg py-4 flex items-center justify-center gap-2.5 font-black text-[16px] tracking-widest transition duration-300 shadow-sm cursor-pointer";
    }
    return "w-full max-w-sm border-2 border-[#5139d6] bg-[#5139d6] rounded-xl py-4 flex items-center justify-center gap-2.5 font-black text-[16px] tracking-widest text-white hover:bg-[#3b25b8] transition duration-300 shadow-md cursor-pointer";
  };

  // Summary design classes
  const getSummaryBoxStyle = () => {
    if (isPoetry) return "bg-[#faf6ee] border border-[#e2d6b5] p-6 md:p-8 rounded-xl";
    return "bg-[#f3f0ff]/70 border border-dashed border-[#b3a6eb] rounded-2xl p-6 md:p-8";
  };
  const getSummaryBorderClass = () => {
    if (isPoetry) return "border-l-2 border-amber-900/40 pl-6 md:pl-8 py-2";
    return "border-l-4 border-[#5139d6] pl-6 md:pl-8 py-2";
  };
  const getSummaryHeaderStyle = () => {
    if (isPoetry) return "text-[19px] md:text-xl font-bold text-amber-950 border-l-2 border-amber-800/60 pl-3 py-0.5 flex items-center gap-2";
    return "text-[19px] md:text-xl font-bold text-[#2f2d59] border-l-4 border-[#6b54e7] pl-3 py-0.5 flex items-center gap-2";
  };

  // Comments Avatar style
  const getCommentAvatarStyle = () => {
    if (isPoetry) return "w-10 h-10 rounded-full bg-[#fdf4ff] border border-[#f3e8ff] text-[#6b21a8] font-bold flex items-center justify-center text-sm shrink-0 shadow-xs";
    return "w-10 h-10 rounded-full bg-[#1e1d3b] border border-black/5 flex items-center justify-center text-[#ffd9b6] font-black text-sm shadow-inner shrink-0";
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-0 py-4 animate-fadeIn font-gowun">
      {/* Back button - 더 굵고 진한 보라색으로 가독성 개선 */}
      <button onClick={onBack} className="group mb-6 flex items-center gap-1.5 text-sm font-black text-[#514c73] hover:text-[#5139d6] transition cursor-pointer">
        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 stroke-[3]" />
        전체 서재로 돌아가기
      </button>

      {/* Main Container Card with Genre-Themed background */}
      <div className={`rounded-3xl p-6 md:p-12 space-y-12 transition-all duration-300 relative ${cardBgClass}`}>

        {/* Upper Layout: Cover and Meta info */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start relative z-10">

          {/* Left Column: 3D Book Cover styled with real shadow */}
          <div className="md:col-span-5 flex justify-center">
            <div className={`relative w-full max-w-[270px] aspect-[3/4.5] bg-white shadow-2xl overflow-hidden group ${coverBorderClass}`}>
              <div className={`absolute top-3 left-3 z-20 px-2.5 py-1 text-[10px] rounded shadow-sm tracking-wide ${genreTagStyle}`}>
                {genreTagText}
              </div>
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" src={book.coverImage} alt={book.title} referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-transparent pointer-events-none" />
              {/* Cover realistic binder edge shadow */}
              <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/25 via-black/10 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Right Column: Title Info Metadata details */}
          <div className="md:col-span-7 flex flex-col space-y-6 text-left">
            <div className="space-y-2">
              <h2 className={getTitleStyle()}>
                {book.title}
              </h2>
              <p className={getSubtitleStyle()}>
                {getSubtitle(book)}
              </p>
              {/* 저자 정보 텍스트 선명화 (text-gray-700 -> text-black / font-bold) */}
              <p className="text-[16px] font-black text-black mt-2 pl-[10px]">
                저자:{" "}
                <span onClick={() => onSelectAuthor(book.author, mode === "owner")} className={`font-black underline decoration-2 cursor-pointer transition duration-150 ${isPoetry ? "text-amber-950 hover:text-black" : "text-[#5139d6] hover:text-[#25158a]"}`} title={`${book.author} 작가소개 보기`}>
                  {book.author}
                </span>
              </p>
            </div>

            {/* Tags Outline Row 1 - 태그 테두리와 글씨색 진하게 강화 */}
            <div className="flex flex-wrap gap-2">
              {getTags(book.genre).map((tag, idx) => (
                <span key={idx} className={`px-3.5 py-1 text-[12px] font-black tracking-normal rounded-full border transition duration-200 cursor-pointer ${isPoetry ? "bg-amber-100/60 border-amber-400 text-amber-950 hover:bg-amber-200" : "bg-neutral-50 border-[#aaa0e3] text-[#3c375e] hover:border-[#5139d6] hover:text-[#5139d6]"}`}>
                  {isPoetry && "❊ "}
                  {tag}
                </span>
              ))}
            </div>

            {/* Likes heart and follow button block - 회색빛에서 뚜렷한 색상 대비로 변경 */}
            <div className="flex flex-wrap items-center gap-3">
              {mode !== "owner" && (
                <button onClick={onToggleLike} className="inline-flex items-center gap-1.5 border-2 px-4 py-2 text-xs md:text-sm font-black rounded-lg transition duration-200 border-[#aaa0e3] text-[#3c375e] hover:bg-[#f3f0ff] hover:border-[#5139d6] bg-white cursor-pointer">
                  <Heart className={`w-4 h-4 stroke-[2.5] ${book.isLikedByMe ? "fill-red-500 stroke-red-500 text-red-500" : "text-[#4b4570]"}`} />
                  <span>좋아요 {book.likes.toLocaleString()}</span>
                </button>
              )}

              {mode !== "owner" && (
                <button onClick={() => setIsFollowing(!isFollowing)} className={`inline-flex items-center gap-1.5 border-2 px-4 py-2 text-xs md:text-sm font-black rounded-lg transition duration-200 shadow-sm cursor-pointer ${isFollowing ? "bg-[#5139d6] text-white border-[#5139d6]" : "border-[#aaa0e3] text-[#3c375e] hover:bg-[#f3f0ff] bg-white"}`}>
                  {isFollowing ? (
                    <>
                      <Check className="w-4 h-4 text-[#ffd9b6] stroke-[3]" />
                      <span>팔로잉</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 stroke-[2.5]" />
                      <span>팔로우</span>
                    </>
                  )}
                </button>
              )}

              {mode !== "owner" && (
                <button
                  onClick={() => !reportedIds.includes(book.id) && handleStartReport("book", book.id, `'${book.title}'`)}
                  disabled={reportedIds.includes(book.id)}
                  className="inline-flex items-center gap-1.5 border px-3 py-2 text-xs font-bold rounded-lg transition duration-200 border-gray-300 text-[#7368a1] hover:text-red-700 hover:border-red-300 hover:bg-red-50 bg-white ml-auto disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-[#b9b0dc] disabled:cursor-default cursor-pointer"
                  title="이 작품 신고하기"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{reportedIds.includes(book.id) ? "신고됨" : "신고"}</span>
                </button>
              )}
            </div>

            {/* Tags outline Row 2 - 해시태그 배경 및 글씨 진하게 */}
            <div className="flex flex-wrap gap-2">
              {getHashTags(book.genre).map((tag, idx) => (
                <span key={idx} className={`px-3 py-1.5 text-xs font-black rounded-md transition cursor-pointer ${isPoetry ? "bg-[#f3eade] text-amber-950 hover:bg-[#ebdcc7]" : "bg-neutral-100 text-[#3c375e] hover:bg-neutral-200"}`}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Thick Border Primary CTA button */}
            <div className="pt-2">
              <button onClick={onStartReading} className={getCtaButtonStyle()}>
                책 펼치기 📖
              </button>
            </div>
          </div>
        </div>

        {/* 작품 소개 section */}
        <div className="space-y-4 text-left relative z-10">
          <h3 className={getSummaryHeaderStyle()}>
            {isPoetry && "❊ "}
            작품소개
          </h3>
          <div className={getSummaryBoxStyle()}>
            <div className={getSummaryBorderClass()}>
              {isEditingDescription ? (
                <div className="space-y-3">
                  <textarea
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    className="w-full min-h-36 border-2 border-[#b3a6eb] rounded-xl p-4 text-sm font-bold text-black outline-none focus:ring-2 focus:ring-[#5139d6] font-gowun bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditSummary(book.summary || "");
                        setIsEditingDescription(false);
                      }}
                      className="px-4 py-2 rounded-lg border-2 border-[#b3a6eb] text-xs font-black text-[#3c375e] cursor-pointer bg-white"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => {
                        onUpdateDescription?.(editSummary);
                        setIsEditingDescription(false);
                      }}
                      className="px-4 py-2 rounded-lg bg-[#5139d6] text-white text-xs font-black cursor-pointer"
                    >
                      저장
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* 작품소개 글씨 두께 및 선명도 대폭 강화 (text-gray-800 -> text-neutral-950 / font-bold) */}
                  <p className="text-[15px] md:text-[16px] leading-[1.8] text-neutral-950 font-bold whitespace-pre-wrap">
                    {book.summary}
                  </p>

                  {mode === "owner" && (
                    <button
                      onClick={() => setIsEditingDescription(true)}
                      className="mt-4 px-4 py-2 rounded-lg border-2 border-[#b3a6eb] text-xs font-black text-[#5139d6] hover:bg-[#f3f0ff] bg-white cursor-pointer"
                    >
                      책 소개 수정
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* 이 책을 좋아한다면 section */}
        {mode !== "owner" && (
          <div className="space-y-6 text-left relative z-10">
            <div className="flex justify-between items-end border-b border-[#b3a6eb] pb-3">
              <h3 className="text-[19px] md:text-xl font-bold text-gray-900">
                이 책을 좋아한다면
              </h3>
              {/* 더 보기 버튼 선명화 */}
              <span className="text-xs md:text-sm text-[#4b3e80] hover:text-black cursor-pointer font-black transition duration-200 underline">
                더 보기
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recommendations.map(rec => (
                <div key={rec.id} onClick={() => onSelectRecommended(rec)} className="group flex flex-col items-center text-center cursor-pointer">
                  <div className="relative aspect-[3/4.5] bg-[#f3f0ff] overflow-hidden border border-[#b3a6eb] shadow-sm group-hover:shadow-md group-hover:border-[#5139d6] transition duration-300 rounded-lg w-full">
                    <img className="w-full h-full object-cover group-hover:scale-105 duration-500 transition-all" src={rec.coverImage} alt={rec.title} referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition duration-350" />
                  </div>
                  {/* 추천 도서명 선명화 */}
                  <h4 className="text-sm font-black text-black mt-2.5 truncate group-hover:text-[#5139d6] w-full px-1">
                    {rec.title}
                  </h4>
                  {/* 추천 저자명 선명화 */}
                  <p className="text-[12px] font-bold text-neutral-600 mt-1 truncate w-full px-1">
                    {rec.author}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 댓글 section */}
        <div id="detail-comments-section" className="space-y-6 text-left pt-2 relative z-10">
          <h3 className="text-[19px] md:text-xl font-bold text-gray-900">
            독자들의 따스한 사색
          </h3>

          {/* Comments feed list layout */}
          <div className="space-y-5 pr-1">
            {book.comments.length === 0 ? (
              <p className="text-sm text-[#3c375e] font-bold py-4 text-center">
                作品에 남겨진 사색이 아직 없습니다. 첫 의견을 심어보세요.
              </p>
            ) : (
              book.comments.map((comment, index) => (
                <div key={comment.id || index} className="pb-5 border-b border-[#b3a6eb] last:border-none last:pb-0">
                  <div className="flex gap-4 items-start">
                    <div className={getCommentAvatarStyle()}>
                      {comment.user.charAt(0)}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        {/* 댓글 유저 이름 두껍게 */}
                        <h5 className="font-black text-[15px] text-black">
                          {comment.user}
                        </h5>
                        {/* 작성 시간 가독성 개선 */}
                        <span className="text-xs font-bold text-[#4b3e80]">
                          {comment.date || getCommentTime(index)}
                        </span>
                      </div>
                      {reportedIds.includes(comment.id) ? (
                        <p className="text-[13px] text-[#7368a1] italic font-bold">신고가 접수된 댓글입니다.</p>
                      ) : (
                        /* 댓글 본문 글씨 진하게 (text-gray-700 -> text-neutral-900 / font-semibold) */
                        <p className="text-[14px] leading-relaxed text-neutral-900 font-semibold">
                          {comment.text}
                        </p>
                      )}
                      <div className="flex items-center gap-3 pt-1">
                        {/* 답글쓰기 / 신고 액션 텍스트 더 굵고 진하게 */}
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="text-xs font-black text-[#5139d6] hover:text-black hover:underline transition cursor-pointer"
                        >
                          답글쓰기
                        </button>

                        {mode !== "owner" && (
                          <button
                            onClick={() => handleStartReport("comment", comment.id, `${comment.user}님의 댓글`)}
                            className="text-xs font-bold text-neutral-400 hover:text-red-600 transition inline-flex items-center gap-0.5 cursor-pointer"
                          >
                            <Flag className="w-3 h-3 stroke-[2.5]" /> 신고
                          </button>
                        )}
                      </div>

                      {/* 답글 입력 폼 */}
                      {replyingTo === comment.id && (
                        <form onSubmit={e => handleSubmitReply(e, comment.id)} className="mt-3 flex gap-2">
                          <input
                            type="text"
                            placeholder="닉네임"
                            value={replyUser}
                            onChange={e => setReplyUser(e.target.value)}
                            className="border-2 border-[#b3a6eb] px-3 py-2 text-xs font-bold text-black w-24 focus:outline-none focus:bg-white placeholder-neutral-500 bg-white rounded-lg focus:ring-2 focus:ring-[#5139d6] font-gowun"
                          />
                          <input
                            type="text"
                            placeholder="답글을 남겨보세요..."
                            required
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            className="flex-1 border-2 border-[#b3a6eb] px-3 py-2 text-xs font-bold text-black focus:outline-none focus:bg-white placeholder-neutral-500 bg-white rounded-lg focus:ring-2 focus:ring-[#5139d6] font-gowun"
                          />
                          <button type="submit" className="text-xs font-black px-3.5 rounded-lg transition shadow-sm cursor-pointer shrink-0 bg-[#5139d6] hover:bg-[#3b25b8] text-white">
                            등록
                          </button>
                        </form>
                      )}

                      {/* 답글 목록 */}
                      {comment.replies?.length > 0 && (
                        <div className="mt-3 pl-4 border-l-2 border-[#b3a6eb] space-y-3">
                          {comment.replies.map((reply, rIdx) => (
                            <div key={reply.id || rIdx} className="flex gap-3 items-start">
                              <div className="w-7 h-7 rounded-full bg-neutral-200 border border-black/5 flex items-center justify-center text-black font-black text-[11px] shrink-0">
                                {reply.user.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-center">
                                  <h6 className="font-black text-xs text-neutral-900">{reply.user}</h6>
                                  <span className="text-[10px] font-bold text-[#4b3e80]">{reply.date}</span>
                                </div>
                                {/* 답글 내용도 명확하게 선명화 */}
                                <p className="text-[13px] leading-relaxed text-neutral-800 font-medium">{reply.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment register form box */}
          <form onSubmit={handleSubmitComment} className="mt-8 space-y-3">
            <div className="flex gap-3">
              <input type="text" placeholder="닉네임" value={commentUser} onChange={e => setCommentUser(e.target.value)} className="border-2 border-[#b3a6eb] px-4.5 py-3.5 text-sm font-bold text-black w-28 md:w-36 focus:outline-none focus:bg-white placeholder-neutral-500 bg-white rounded-lg focus:ring-2 focus:ring-[#5139d6] font-gowun" />
              <div className="relative flex-1 flex">
                <input type="text" placeholder="댓글을 남겨보세요..." required value={commentText} onChange={e => setCommentText(e.target.value)} className="flex-1 border-2 border-[#b3a6eb] py-3.5 pl-4.5 pr-20 text-sm font-bold text-black focus:outline-none focus:bg-white placeholder-neutral-500 bg-white rounded-xl focus:ring-2 focus:ring-[#5139d6] font-gowun" />
                <button type="submit" className="absolute right-1.5 top-1.5 h-[calc(100%-12px)] text-xs font-black px-5 rounded-lg transition shadow-sm cursor-pointer shrink-0 bg-[#5139d6] hover:bg-[#3b25b8] text-white">
                  등록
                </button>
              </div>
            </div>
          </form>
        </div>

      </div>

      <ReportModal
        isOpen={!!reportTarget}
        onClose={() => setReportTarget(null)}
        targetLabel={reportTarget?.label || ""}
        onSubmit={handleSubmitReport}
      />
    </div>
  );
}