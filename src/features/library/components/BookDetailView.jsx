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
  onSelectAuthor
}) {
  const [commentUser, setCommentUser] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyUser, setReplyUser] = useState("");
  const [replyText, setReplyText] = useState("");
  const [reportTarget, setReportTarget] = useState(null); // { type, id, label }
  const [reportedIds, setReportedIds] = useState([]);

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

  // Get custom genre-themed tags matching the screenshot
  const isNovel = book.genre === "소설" || book.genre === "시";
  // 에세이만 amber/크림 톤의 별도 테마를 썼던 것을 제거 — 다른 장르(소설/시/동화/지식정보)와
  // 동일한 무채색 테마로 통일.
  const isPoetry = false;
  const isFairytale = book.genre === "동화";

  // Card themes
  const cardBgClass = isPoetry ? "bg-[#fdfbf7] border border-[#e8dfcb] shadow-sm" : "bg-white border border-[#e6e2fc] shadow-sm";

  // Accent badge text and background for the cover banner
  let genreTagText = `📖 정통 소설`;
  let genreTagStyle = "bg-neutral-900 text-white border border-neutral-700";
  if (isFairytale) {
    genreTagText = `🧸 창작 동화`;
    genreTagStyle = "bg-neutral-900 text-white border border-neutral-700";
  } else if (book.genre === "시") {
    genreTagText = `❊ 서정시`;
    genreTagStyle = "bg-neutral-900 text-white border border-neutral-700";
  } else if (book.genre === "에세이") {
    genreTagText = `❀ 감성 에세이`;
    genreTagStyle = "bg-neutral-900 text-white border border-neutral-700";
  } else if (book.genre === "지식정보") {
    genreTagText = `📚 지식정보`;
    genreTagStyle = "bg-neutral-900 text-white border border-neutral-700";
  }

  // Cover image container borders
  const coverBorderClass = isPoetry ? "border border-[#dcd3be] rounded-lg" : "border border-black/10 rounded-xl";

  // Subtitle styling
  const getSubtitleStyle = () => {
    if (isPoetry) return "text-amber-800 italic font-serif font-semibold text-sm md:text-base";
    return "text-[#b9b0dc] font-serif italic text-sm md:text-base";
  };

  // Title class
  const getTitleStyle = () => {
    if (isPoetry) return "font-serif text-3xl md:text-[40px] leading-tight font-bold text-[#451a03] tracking-tight";
    return "font-serif text-3xl md:text-[42px] leading-tight font-bold text-[#2f2d59] tracking-tight";
  };

  // Action Button (Start reading CTA)
  const getCtaButtonStyle = () => {
    if (isPoetry) {
      return "w-full max-w-sm bg-[#4c0519] border border-[#fb7185]/30 text-[#fecdd3] hover:bg-[#881337] rounded-lg py-4 flex items-center justify-center gap-2.5 font-sans font-bold text-[15px] tracking-widest transition duration-300 shadow-sm cursor-pointer";
    }
    return "w-full max-w-sm border-2 border-[#6b54e7] rounded-xl py-4 flex items-center justify-center gap-2.5 font-sans font-bold text-[15px] tracking-widest text-[#6b54e7] hover:bg-[#6b54e7] hover:text-white transition duration-300 shadow-sm cursor-pointer";
  };

  // Summary design classes
  const getSummaryBoxStyle = () => {
    if (isPoetry) return "bg-[#faf6ee] border border-[#e2d6b5] p-6 md:p-8 rounded-xl";
    return "bg-[#f3f0ff]/40 border border-dashed border-[#d4cdf2] rounded-2xl p-6 md:p-8";
  };
  const getSummaryBorderClass = () => {
    if (isPoetry) return "border-l-2 border-amber-900/40 pl-6 md:pl-8 py-2";
    return "border-l-4 border-[#6b54e7] pl-6 md:pl-8 py-2";
  };
  const getSummaryHeaderStyle = () => {
    if (isPoetry) return "font-serif text-[19px] md:text-xl font-bold text-amber-950 border-l-2 border-amber-800/60 pl-3 py-0.5 flex items-center gap-2";
    return "font-serif text-[19px] md:text-xl font-bold text-[#2f2d59] border-l-4 border-[#6b54e7] pl-3 py-0.5 flex items-center gap-2";
  };

  // Comments Avatar style
  const getCommentAvatarStyle = () => {
    if (isPoetry) return "w-10 h-10 rounded-full bg-[#fdf4ff] border border-[#f3e8ff] text-[#6b21a8] font-serif font-semibold flex items-center justify-center text-sm shrink-0 shadow-xs";
    return "w-10 h-10 rounded-full bg-[#2f2d59] border border-black/5 flex items-center justify-center text-[#ffd9b6] font-bold text-sm font-serif shadow-inner shrink-0";
  };
  return <div className="w-full max-w-4xl mx-auto px-4 md:px-0 py-4 animate-fadeIn">
      {/* Back button */}
      <button onClick={onBack} className="group mb-6 flex items-center gap-1.5 text-sm font-medium text-[#7c769d] hover:text-[#6b54e7] transition">
        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        전체 서재로 돌아가기
      </button>

      {/* Main Container Card with Genre-Themed background */}
      <div className={`rounded-3xl p-6 md:p-12 space-y-12 transition-all duration-300 relative ${cardBgClass}`}>

        {/* Upper Layout: Cover and Meta info */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start relative z-10">
          
          {/* Left Column: 3D Book Cover styled with real shadow */}
          <div className="md:col-span-5 flex justify-center">
            <div className={`relative w-full max-w-[270px] aspect-[3/4.5] bg-white shadow-2xl overflow-hidden group ${coverBorderClass}`}>
              <div className={`absolute top-3 left-3 z-20 px-2.5 py-1 text-[10px] font-sans rounded shadow-sm tracking-wide ${genreTagStyle}`}>
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
              <p className="font-sans text-[15px] font-medium text-gray-700 mt-2 pl-[10px]">
                저자:{" "}
                <span onClick={() => onSelectAuthor(book.author)} className={`font-semibold text-black hover:underline cursor-pointer transition duration-150 ${isPoetry ? "text-amber-900 hover:text-amber-950" : "hover:text-[#6b54e7]"}`} title={`${book.author} 작가소개 보기`}>
                  {book.author}
                </span>
              </p>
            </div>

            {/* Tags Outline Row 1 */}
            <div className="flex flex-wrap gap-2">
              {getTags(book.genre).map((tag, idx) => <span key={idx} className={`px-3.5 py-1 text-[11px] font-sans font-bold tracking-normal rounded-full border transition duration-200 cursor-pointer ${isPoetry ? "bg-amber-50/40 border-amber-200 text-amber-800 hover:bg-amber-100" : "border-[#e6e2fc] text-[#7c769d] hover:border-[#6b54e7]/40 hover:text-[#6b54e7]"}`}>
                  {isPoetry && "❊ "}
                  {tag}
                </span>)}
            </div>

            {/* Likes heart and follow button block */}
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={onToggleLike} className="inline-flex items-center gap-1.5 border px-4 py-2 text-xs md:text-sm font-sans font-bold rounded-lg transition duration-200 border-[#d4cdf2] text-[#7c769d] hover:bg-[#f3f0ff] hover:border-[#6b54e7] bg-white">
                <Heart className={`w-4 h-4 ${book.isLikedByMe ? "fill-red-500 stroke-red-500 text-red-500" : ""}`} />
                <span>좋아요 {book.likes.toLocaleString()}</span>
              </button>

              <button onClick={() => setIsFollowing(!isFollowing)} className={`inline-flex items-center gap-1.5 border px-4 py-2 text-xs md:text-sm font-sans font-bold rounded-lg transition duration-200 shadow-sm ${isFollowing ? "bg-[#6b54e7] text-white border-[#6b54e7]" : "border-[#d4cdf2] text-[#7c769d] hover:bg-[#f3f0ff] bg-white"}`}>
                {isFollowing ? <>
                    <Check className="w-4 h-4 text-[#ffd9b6]" />
                    <span>팔로잉</span>
                  </> : <>
                    <UserPlus className="w-4 h-4" />
                    <span>팔로우</span>
                  </>}
              </button>

              <button
                onClick={() => !reportedIds.includes(book.id) && handleStartReport("book", book.id, `'${book.title}'`)}
                disabled={reportedIds.includes(book.id)}
                className="inline-flex items-center gap-1.5 border px-3 py-2 text-xs font-sans font-medium rounded-lg transition duration-200 border-gray-200 text-[#b9b0dc] hover:text-red-600 hover:border-red-200 hover:bg-red-50 bg-white ml-auto disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-[#b9b0dc] disabled:cursor-default"
                title="이 작품 신고하기"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{reportedIds.includes(book.id) ? "신고됨" : "신고"}</span>
              </button>
            </div>

            {/* Tags outline Row 2 */}
            <div className="flex flex-wrap gap-2">
              {getHashTags(book.genre).map((tag, idx) => <span key={idx} className={`px-3 py-1.5 text-xs font-sans font-bold rounded-md transition cursor-pointer ${isPoetry ? "bg-[#faf6ee] text-amber-800/80 hover:bg-[#f6eeea]" : "bg-gray-50 text-[#7c769d] hover:bg-gray-100"}`}>
                  {tag}
                </span>)}
            </div>

            {/* Thick Border Primary CTA button: Start reading matching customized brand colors */}
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
              <p className="font-sans text-[15px] md:text-[16px] leading-[1.8] text-gray-800 whitespace-pre-wrap">
                {book.summary}
              </p>
            </div>
          </div>
        </div>

        {/* 이 책을 좋아한다면 section */}
        <div className="space-y-6 text-left relative z-10">
          <div className="flex justify-between items-end border-b border-[#e6e2fc] pb-3">
            <h3 className="font-serif text-[19px] md:text-xl font-bold text-gray-900">
              이 책을 좋아한다면
            </h3>
            <span className="text-xs md:text-sm text-[#b9b0dc] font-sans hover:text-black cursor-pointer font-medium transition duration-200">
              더 보기
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recommendations.map(rec => <div key={rec.id} onClick={() => onSelectRecommended(rec)} className="group flex flex-col items-center text-center cursor-pointer">
                <div className="relative aspect-[3/4.5] bg-[#f3f0ff] overflow-hidden border border-[#e6e2fc] shadow-sm group-hover:shadow-md group-hover:border-[#d4cdf2] transition duration-300 rounded-lg">
                  <img className="w-full h-full object-cover group-hover:scale-105 duration-500 transition-all" src={rec.coverImage} alt={rec.title} referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition duration-350" />
                </div>
                <h4 className="font-serif text-sm font-bold text-gray-900 mt-2.5 truncate group-hover:text-black/70">
                  {rec.title}
                </h4>
                <p className="text-[11px] text-neutral-400 mt-1 truncate">
                  {rec.author}
                </p>
              </div>)}
          </div>
        </div>

        {/* 댓글 section */}
        <div id="detail-comments-section" className="space-y-6 text-left pt-2 relative z-10">
          <h3 className="font-serif text-[19px] md:text-xl font-bold text-gray-900">
            독자들의 따스한 사색 {book.comments.length}
          </h3>

          {/* Comments feed list layout */}
          <div className="space-y-5 pr-1">
            {book.comments.length === 0 ? <p className="font-sans text-sm text-[#b9b0dc] py-4 text-center">
                작품에 남겨진 사색이 아직 없습니다. 첫 의견을 심어보세요.
              </p> : book.comments.map((comment, index) => <div key={comment.id || index} className="pb-5 border-b border-[#e6e2fc] last:border-none last:pb-0">
                  <div className="flex gap-4 items-start">
                    {/* Circular visual avatar profile representation with custom background */}
                    <div className={getCommentAvatarStyle()}>
                      {comment.user.charAt(0)}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <h5 className="font-serif font-bold text-sm text-gray-900">
                          {comment.user}
                        </h5>
                        <span className="font-mono text-[11px] text-[#b9b0dc]">
                          {comment.date || getCommentTime(index)}
                        </span>
                      </div>
                      {reportedIds.includes(comment.id) ? (
                        <p className="font-sans text-[13px] text-[#b9b0dc] italic">신고가 접수된 댓글입니다.</p>
                      ) : (
                        <p className="font-sans text-[14px] leading-relaxed text-gray-700">
                          {comment.text}
                        </p>
                      )}
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="text-[11px] font-sans font-bold text-[#b9b0dc] hover:text-gray-900 transition"
                        >
                          답글쓰기
                        </button>
                        <button
                          onClick={() => handleStartReport("comment", comment.id, `${comment.user}님의 댓글`)}
                          className="text-[11px] font-sans font-medium text-gray-300 hover:text-red-600 transition inline-flex items-center gap-0.5"
                        >
                          <Flag className="w-3 h-3" /> 신고
                        </button>
                      </div>

                      {/* 답글 입력 폼 */}
                      {replyingTo === comment.id && (
                        <form onSubmit={e => handleSubmitReply(e, comment.id)} className="mt-3 flex gap-2">
                          <input
                            type="text"
                            placeholder="닉네임"
                            value={replyUser}
                            onChange={e => setReplyUser(e.target.value)}
                            className="border border-[#d4cdf2]/60 px-3 py-2 text-xs font-sans text-black w-24 focus:outline-none focus:bg-white placeholder-gray-400 bg-[#f3f0ff] rounded-lg focus:ring-1 focus:ring-[#6b54e7]/50"
                          />
                          <input
                            type="text"
                            placeholder="답글을 남겨보세요..."
                            required
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            className="flex-1 border border-[#d4cdf2]/60 px-3 py-2 text-xs font-sans text-black focus:outline-none focus:bg-white placeholder-gray-400 bg-[#f3f0ff] rounded-lg focus:ring-1 focus:ring-[#6b54e7]/50"
                          />
                          <button type="submit" className="text-xs font-bold px-3.5 rounded-lg transition shadow-sm cursor-pointer shrink-0 bg-[#6b54e7] hover:bg-[#6148e1] text-white">
                            등록
                          </button>
                        </form>
                      )}

                      {/* 답글 목록 */}
                      {comment.replies?.length > 0 && (
                        <div className="mt-3 pl-4 border-l-2 border-[#e6e2fc] space-y-3">
                          {comment.replies.map((reply, rIdx) => (
                            <div key={reply.id || rIdx} className="flex gap-3 items-start">
                              <div className="w-7 h-7 rounded-full bg-gray-100 border border-black/5 flex items-center justify-center text-[#7c769d] font-bold text-[11px] font-serif shrink-0">
                                {reply.user.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-center">
                                  <h6 className="font-serif font-bold text-xs text-gray-800">{reply.user}</h6>
                                  <span className="font-mono text-[10px] text-[#b9b0dc]">{reply.date}</span>
                                </div>
                                <p className="font-sans text-[13px] leading-relaxed text-[#7c769d]">{reply.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>)}
          </div>

          {/* Comment register form box */}
          <form onSubmit={handleSubmitComment} className="mt-8 space-y-3">
            <div className="flex gap-3">
              <input type="text" placeholder="닉네임" value={commentUser} onChange={e => setCommentUser(e.target.value)} className="border border-[#d4cdf2]/60 px-4.5 py-3.5 text-sm font-sans text-black w-28 md:w-36 focus:outline-none focus:bg-white placeholder-gray-400 bg-[#f3f0ff] rounded-lg focus:ring-1 focus:ring-[#6b54e7]/50" />
              <div className="relative flex-1 flex">
                <input type="text" placeholder="댓글을 남겨보세요..." required value={commentText} onChange={e => setCommentText(e.target.value)} className="flex-1 border border-[#d4cdf2]/60 py-3.5 pl-4.5 pr-20 text-sm font-sans text-black focus:outline-none focus:bg-white placeholder-gray-400 bg-[#f3f0ff] rounded-xl focus:ring-1 focus:ring-[#6b54e7]/50" />
                <button type="submit" className="absolute right-1.5 top-1.5 h-[calc(100%-12px)] text-xs font-bold px-5 rounded-lg transition shadow-sm cursor-pointer shrink-0 bg-[#6b54e7] hover:bg-[#6148e1] text-white">
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
    </div>;
}
