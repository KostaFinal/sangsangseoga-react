import { useState, useEffect, useRef } from "react";


const bookTypeToGenre = {
  "NOVEL": "소설", "POEM": "시", "ESSAY": "에세이",
  "FAIRY_TALE": "동화",
};

const genreBadge = (genre) => {
  const map = {
    "NOVEL": { cls: "bg-[#ddd6fe] text-[#5b21b6] border-[#c4b5fd]", label: "소설" },
    "POEM": { cls: "bg-[#e9d5ff] text-[#7e22ce] border-[#d8b4fe]", label: "시" },
    "ESSAY": { cls: "bg-[#ede9ff] text-[#6b54e7] border-[#d4cdf2]", label: "에세이" },
    "FAIRY_TALE": { cls: "bg-[#f3e8ff] text-[#9333ea] border-[#e9d5ff]", label: "동화" },
  };
  return map[genre] || { cls: "bg-[#e6e2fc] text-[#6b54e7] border-[#d4cdf2]", label: bookTypeToGenre[genre] || genre };
};
import { getRecommendations, getBookContents, getBook, increaseViewCount } from "@/src/api/bookApi";
import { getComments, updateComment, deleteComment } from "@/src/api/commentApi";
import { getAuthors, followAuthor, unfollowAuthor } from "@/src/api/authorApi";
import { getLastReadingPosition, updateReadingProgress, rereadBook } from "@/src/api/myLibraryApi";
import { mapBookPagesByGenre } from "../utils/mapBookPages";


import { Heart, ChevronLeft, UserPlus, Check, Flag } from "lucide-react";
import ReportModal from "@/src/shared/components/ReportModal";
import { submitReport, getReportedIds } from "@/src/shared/utils/reports";

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
  onUpdateDescription,
  onUpdateStatus,
  onUpdateTags,
  onDeleteBook,
  onViewCountSynced,
  currentUser,
  scrollToCommentId,
}) {
  const [localBook, setLocalBook] = useState(book);
  const [commentText, setCommentText] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // { id, nickname } of parent comment
  const [expandedReplyIds, setExpandedReplyIds] = useState([]);
  const [reportTarget, setReportTarget] = useState(null); // { type, id, label }
  const [isBookReported, setIsBookReported] = useState(false);
  const [reportedCommentIds, setReportedCommentIds] = useState([]);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editDescription, setEditDescription] = useState(localBook.description || "");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [editTags, setEditTags] = useState(book.tags || []);
  const [newTag, setNewTag] = useState("");
  const [isSavingTags, setIsSavingTags] = useState(false);
  const [isDeletingBook, setIsDeletingBook] = useState(false);

  const handleStartReport = (type, id, label) => setReportTarget({ type, id, label });
  const handleSubmitReport = async ({ reason, detail }) => {
    try {
      await submitReport({ targetType: reportTarget.type, targetId: reportTarget.id, reason, detail });
      if (reportTarget.type === "book") {
        setIsBookReported(true);
      } else if (reportTarget.type === "comment") {
        setReportedCommentIds(prev => [...prev, reportTarget.id]);
      }
      alert("신고가 접수되었습니다. 검토 후 조치하겠습니다.");
      setReportTarget(null);
    } catch (err) {
      alert(err?.response?.data?.message || "신고 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  const isOwnComment = (c) =>
    currentUser?.memberId != null && c?.memberId != null && String(c.memberId) === String(currentUser.memberId);

  const handleStartEditComment = (c) => {
    setEditingCommentId(c.id);
    setEditingCommentText(c.content || c.text || "");
  };
  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };
  const handleSaveEditComment = async (commentId) => {
    const text = editingCommentText.trim();
    if (!text) return;
    try {
      const res = await updateComment(commentId, text);
      const saved = res?.data?.data;
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, content: saved?.content || text } : c));
    } catch (err) {
      console.error("댓글 수정 실패", err);
    } finally {
      setEditingCommentId(null);
      setEditingCommentText("");
    }
  };
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId && c.replyToCommentId !== commentId));
    } catch (err) {
      console.error("댓글 삭제 실패", err);
    }
  };

  const formatCommentDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
  };

  // Generate a beautiful poetic Korean subtitle based on the book

  // Get dynamic simulated human friendly relative time for comments list

  const [recommendations, setRecommendations] = useState([]);
  useEffect(() => {
    if (!book?.id) return;
    getRecommendations(book.id, 4)
      .then(res => {
        const items = res.data?.data?.items || [];
        setRecommendations(items.map(item => ({ ...item, coverImage: item.coverImageUrl })));
      })
      .catch(() => setRecommendations([]));
  }, [book?.id]);

  // 이 책을 이전에 읽은 기록(진행률)이 있는지 조회 - 있으면 "이어읽기", 없으면 "책 펼치기"
  const [readingPosition, setReadingPosition] = useState(null);
  useEffect(() => {
    const bookId = book.bookId || book.id;
    if (!bookId) return;
    getLastReadingPosition(bookId)
      .then(res => setReadingPosition(res.data?.data))
      .catch(() => setReadingPosition(null));
  }, [book.id]);

  const [tags, setTags] = useState(book.tags || []);
  // book.id당 한 번만 호출되도록 가드 (StrictMode 개발 모드 이중 마운트로 인한 중복 요청 방지)
  const viewedBookIdRef = useRef(null);
  useEffect(() => {
    const bookId = book.bookId || book.id;
    if (!bookId || viewedBookIdRef.current === bookId) return;
    viewedBookIdRef.current = bookId;
    getBook(bookId)
      .then(res => {
        const data = res.data?.data;
        setTags(data?.tags || []);
      })
      .catch(() => setTags([]));
  }, [book.id]);

  useEffect(() => {
    if (!book?.authorId) return;
    getAuthors({ keyword: book.author, size: 20 })
      .then(res => {
        const items = res.data?.data?.items || [];
        const matched = items.find(a => String(a.id) === String(book.authorId));
        if (matched) setIsFollowing(!!matched.isFollowedByMe);
      })
      .catch(() => { });
  }, [book?.authorId, book?.author]);

  const handleToggleFollow = async () => {
    if (!book?.authorId || followBusy) return;
    const wasFollowing = isFollowing;
    setFollowBusy(true);
    setIsFollowing(!wasFollowing);
    try {
      if (wasFollowing) {
        await unfollowAuthor(book.authorId);
      } else {
        await followAuthor(book.authorId);
      }
    } catch (err) {
      setIsFollowing(wasFollowing);
      console.error("팔로우 처리 실패", err);
    } finally {
      setFollowBusy(false);
    }
  };

  const [comments, setComments] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNextComment, setHasNextComment] = useState(false);

  useEffect(() => {
    if (!book?.id) return;
    getComments(book.id)
      .then(res => {
        const data = res.data?.data;
        setComments(data?.items || []);
        setNextCursor(data?.nextCursor || null);
        setHasNextComment(data?.hasNext || false);
      })
      .catch(() => setComments([]));
  }, [book?.id]);

  const loadMoreComments = async () => {
    if (!hasNextComment || !nextCursor) return;
    try {
      const res = await getComments(book.id, nextCursor);
      const data = res.data?.data;
      setComments(prev => [...prev, ...(data?.items || [])]);
      setNextCursor(data?.nextCursor || null);
      setHasNextComment(data?.hasNext || false);
    } catch (err) {
      console.error("댓글 더보기 실패", err);
    }
  };
  const handleSubmitComment = async e => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const text = commentText.trim();
    setCommentText("");

    if (replyingTo) {
      const parentCommentId = replyingTo.id;
      setReplyingTo(null);
      try {
        const res = await onSaveReply?.(parentCommentId, currentUser?.nickname || "익명의 사색가", text);
        const saved = res?.data?.data;
        setComments(prev => [...prev, {
          id: saved?.id,
          memberId: saved?.memberId,
          nickname: saved?.nickname || currentUser?.nickname || "익명의 사색가",
          content: saved?.content || text,
          createdAt: saved?.createdAt || new Date().toISOString(),
          replyToCommentId: parentCommentId,
        }]);
        setExpandedReplyIds(prev => prev.includes(parentCommentId) ? prev : [...prev, parentCommentId]);
      } catch (err) {
        console.error("답글 작성 실패", err);
      }
      return;
    }

    try {
      const res = await onSaveComment(currentUser?.nickname || "익명의 사색가", text);
      const saved = res?.data?.data;
      if (saved) {
        setComments(prev => [{
          id: saved.id,
          memberId: saved.memberId,
          nickname: saved.nickname || currentUser?.nickname || "익명의 사색가",
          content: saved.content || text,
          createdAt: saved.createdAt || new Date().toISOString(),
          replyToCommentId: null,
        }, ...prev]);
      }
    } catch (err) {
      console.error("댓글 작성 실패", err);
    }
  };

  // Auto-scroll to top on mounting a new book
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [book.id]);

  useEffect(() => {
    getReportedIds("book").then(ids => setIsBookReported(ids.includes(book.id))).catch(() => { });
    getReportedIds("comment").then(ids => setReportedCommentIds(ids)).catch(() => { });
  }, [book.id]);

  useEffect(() => {
    setLocalBook(book);
  }, [book]);

  useEffect(() => {
    setEditDescription(localBook.description || "");
  }, [localBook.description]);

  const topLevelComments = comments.filter(c => !c.replyToCommentId);
  const repliesByParent = comments.reduce((acc, c) => {
    if (c.replyToCommentId) {
      (acc[c.replyToCommentId] ||= []).push(c);
    }
    return acc;
  }, {});

  // 신고 대상 확인 등으로 특정 댓글을 딥링크한 경우, 해당 댓글까지 스크롤 이동 + 하이라이트
  // (커서 기반 페이지네이션이라 대상이 아직 안 불러와진 페이지에 있으면 자동으로 더보기를 반복 호출)
  const [highlightedCommentId, setHighlightedCommentId] = useState(null);
  const [commentNotFound, setCommentNotFound] = useState(false);
  const isAutoLoadingMoreRef = useRef(false);
  useEffect(() => {
    if (!scrollToCommentId) return;
    const target = comments.find(c => String(c.id) === String(scrollToCommentId));
    if (!target) {
      if (hasNextComment && !isAutoLoadingMoreRef.current) {
        isAutoLoadingMoreRef.current = true;
        loadMoreComments().finally(() => { isAutoLoadingMoreRef.current = false; });
      } else if (comments.length > 0) {
        setCommentNotFound(true);
      }
      return;
    }
    setCommentNotFound(false);
    if (target.replyToCommentId != null) {
      setExpandedReplyIds(prev => prev.includes(target.replyToCommentId) ? prev : [...prev, target.replyToCommentId]);
    }
    const el = document.getElementById(`comment-${scrollToCommentId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedCommentId(scrollToCommentId);
      const timer = setTimeout(() => setHighlightedCommentId(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [scrollToCommentId, comments, hasNextComment, expandedReplyIds]);

  const isPoetry = false;
  const isFairytale = localBook.genre === "동화";

  // Card themes
  const cardBgClass = isPoetry ? "bg-[#fdfbf7] border border-[#e8dfcb] shadow-sm" : "bg-white border border-[#e6e2fc] shadow-sm";

  // Accent badge text and background for the cover banner
  const badge = genreBadge(localBook.genre);
  const genreTagText = badge.label;
  const genreTagStyle = badge.cls;

  // Cover image container borders
  const coverBorderClass = isPoetry ? "border border-[#dcd3be] rounded-lg" : "border border-black/10 rounded-xl";

  // Subtitle styling - 글씨 크기를 키우고 보라빛 도는 진한 색상으로 교체

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

  const normalizeTag = (value) =>
    value.trim().replace(/^#/, "").trim();

  const handleAddTag = () => {
    const normalizedTag = normalizeTag(newTag);

    if (!normalizedTag) {
      return;
    }

    if (normalizedTag.length > 50) {
      alert("태그는 50자 이하로 입력해 주세요.");
      return;
    }

    if (editTags.includes(normalizedTag)) {
      alert("이미 등록된 태그입니다.");
      return;
    }

    if (editTags.length >= 10) {
      alert("태그는 최대 10개까지 등록할 수 있습니다.");
      return;
    }

    setEditTags(prev => [...prev, normalizedTag]);
    setNewTag("");
  };

  const handleChangeTag = (index, value) => {
    const normalizedValue = value.replace(/^#/, "");

    setEditTags(prev =>
      prev.map((tag, tagIndex) =>
        tagIndex === index ? normalizedValue : tag
      )
    );
  };

  const handleDeleteTag = (index) => {
    setEditTags(prev =>
      prev.filter((_, tagIndex) => tagIndex !== index)
    );
  };

  const handleCancelTagEdit = () => {
    setEditTags(tags);
    setNewTag("");
    setIsEditingTags(false);
  };

  const handleSaveTags = async () => {
    const bookId = localBook.bookId || localBook.id;

    const normalizedTags = editTags
      .map(normalizeTag)
      .filter(Boolean)
      .filter((tag, index, array) =>
        array.indexOf(tag) === index
      );

    if (normalizedTags.some(tag => tag.length > 50)) {
      alert("태그는 50자 이하로 입력해 주세요.");
      return;
    }

    if (normalizedTags.length > 10) {
      alert("태그는 최대 10개까지 등록할 수 있습니다.");
      return;
    }

    try {
      setIsSavingTags(true);

      await onUpdateTags?.(bookId, normalizedTags);

      setTags(normalizedTags);

      setLocalBook(prev => ({
        ...prev,
        tags: normalizedTags,
      }));

      setEditTags(normalizedTags);
      setNewTag("");
      setIsEditingTags(false);
    } catch (error) {
      console.error("태그 수정 실패", error);
      alert("태그 수정에 실패했습니다.");
    } finally {
      setIsSavingTags(false);
    }
  };

  useEffect(() => {
    setEditTags(tags);
  }, [tags]);

  useEffect(() => {
    setIsEditingTags(false);
    setNewTag("");
  }, [book.id]);

  const handleDeleteBook = async () => {
    if (isDeletingBook) {
      return;
    }

    const confirmed = window.confirm(
      "정말 이 책을 삭제하시겠습니까?\n삭제된 책은 목록에서 더 이상 보이지 않습니다."
    );

    if (!confirmed) {
      return;
    }

    const bookId = localBook.bookId || localBook.id;

    try {
      setIsDeletingBook(true);

      await onDeleteBook?.(bookId);
    } catch (error) {
      console.error("책 삭제 실패", error);
      alert("책 삭제에 실패했습니다.");
      setIsDeletingBook(false);
    }
  };

  const handleReadingBookmarkSave = async (
    bookId,
    currentPage,
    totalPages,
    readingTime = 0
  ) => {
    const safeTotalPages = Math.max(1, totalPages);

    const progress = Math.min(
      100,
      Math.max(
        0,
        Math.floor((currentPage / safeTotalPages) * 100)
      )
    );

    await updateReadingProgress(
      bookId,
      currentPage,
      progress,
      readingTime
    );
  };

  const handleReadingTimeSave = async (
    bookId,
    readingTime = 0
  ) => {
    if (readingTime < 1) return;

    await updateReadingProgress(bookId, readingTime);
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
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" src={localBook.coverImage} alt={localBook.title} referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#000000]/20 via-transparent to-transparent pointer-events-none" />
              {/* Cover realistic binder edge shadow */}
              <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-[#000000]/25 via-[#000000]/10 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Right Column: Title Info Metadata details */}
          <div className="md:col-span-7 flex flex-col space-y-6 text-left">
            <div className="space-y-2">
              <h2 className={getTitleStyle()}>
                {localBook.title}
              </h2>
              {/* 저자 정보 텍스트 선명화 (text-gray-700 -> text-black / font-bold) */}
              <p className="text-[16px] font-black text-black mt-2 pl-[10px]">
                저자:{" "}
                <span onClick={() => onSelectAuthor(localBook.author, mode === "owner")} className={`font-black underline decoration-2 cursor-pointer transition duration-150 ${isPoetry ? "text-amber-950 hover:text-black" : "text-[#5139d6] hover:text-[#25158a]"}`} title={`${localBook.author} 작가소개 보기`}>
                  {localBook.author}
                </span>
              </p>
            </div>

            {/* Tags Outline Row 1 - 태그 테두리와 글씨색 진하게 강화 */}
            <div className="flex flex-wrap gap-2">

            </div>

            {/* Likes heart and follow button block - 회색빛에서 뚜렷한 색상 대비로 변경 */}
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={(e) => onToggleLike(e, book.bookId || book.id)} className="inline-flex items-center gap-1.5 border-2 px-4 py-2 text-xs md:text-sm font-black rounded-lg transition duration-200 border-[#aaa0e3] text-[#3c375e] hover:bg-[#f3f0ff] hover:border-[#5139d6] bg-white cursor-pointer">
                <Heart className={`w-4 h-4 stroke-[2.5] ${localBook.isLikedByMe ? "fill-red-500 stroke-red-500 text-red-500" : "text-[#4b4570]"}`} />
                <span>좋아요 {localBook.likes.toLocaleString()}</span>
              </button>

              {mode !== "owner" && (
                <button
                  onClick={handleToggleFollow}
                  disabled={!book?.authorId || followBusy}
                  className={`inline-flex items-center gap-1.5 border-2 px-4 py-2 text-xs md:text-sm font-black rounded-lg transition duration-200 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-default ${isFollowing ? "bg-[#5139d6] text-white border-[#5139d6]" : "border-[#aaa0e3] text-[#3c375e] hover:bg-[#f3f0ff] bg-white"}`}
                >
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
                  onClick={() => !isBookReported && handleStartReport("book", book.id, `'${localBook.title}'`)}
                  disabled={isBookReported}
                  className="inline-flex items-center gap-1.5 border px-3 py-2 text-xs font-bold rounded-lg transition duration-200 border-gray-300 text-[#7368a1] hover:text-red-700 hover:border-red-300 hover:bg-red-50 bg-white ml-auto disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-[#b9b0dc] disabled:cursor-default cursor-pointer"
                  title="이 작품 신고하기"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{isBookReported ? "신고됨" : "신고"}</span>
                </button>
              )}
            </div>

            {/* Tags outline Row 2 - 해시태그 배경 및 글씨 진하게 */}
            <div className="space-y-3">
              {!isEditingTags ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    {tags.length > 0 ? (
                      tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg border border-[#d4cdf2] bg-[#f3f0ff] text-[#5139d6]"
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs font-bold text-[#7368a1]">
                        등록된 태그가 없습니다.
                      </span>
                    )}
                  </div>

                  {mode === "owner" && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditTags(tags);
                        setIsEditingTags(true);
                      }}
                      className="text-xs font-black text-[#5139d6] hover:underline cursor-pointer"
                    >
                      태그 편집
                    </button>
                  )}
                </>
              ) : (
                <div className="rounded-xl border-2 border-[#d4cdf2] bg-[#faf9ff] p-4 space-y-3">
                  <div className="space-y-2">
                    {editTags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2"
                      >
                        <span className="text-sm font-black text-[#5139d6]">
                          #
                        </span>

                        <input
                          type="text"
                          maxLength={50}
                          value={tag}
                          onChange={e =>
                            handleChangeTag(index, e.target.value)
                          }
                          className="flex-1 rounded-lg border border-[#b3a6eb] bg-white px-3 py-2 text-xs font-bold text-[#2f2d59] outline-none focus:border-[#5139d6]"
                        />

                        <button
                          type="button"
                          onClick={() => handleDeleteTag(index)}
                          className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={50}
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="새 태그 입력"
                      className="flex-1 rounded-lg border border-[#b3a6eb] bg-white px-3 py-2 text-xs font-bold text-[#2f2d59] outline-none focus:border-[#5139d6]"
                    />

                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="rounded-lg bg-[#ede9ff] px-4 py-2 text-xs font-black text-[#5139d6] hover:bg-[#ddd6fe] cursor-pointer"
                    >
                      추가
                    </button>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleCancelTagEdit}
                      disabled={isSavingTags}
                      className="rounded-lg border-2 border-[#b3a6eb] bg-white px-4 py-2 text-xs font-black text-[#3c375e] cursor-pointer disabled:opacity-50"
                    >
                      취소
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveTags}
                      disabled={isSavingTags}
                      className="rounded-lg bg-[#5139d6] px-4 py-2 text-xs font-black text-white hover:bg-[#3b25b8] cursor-pointer disabled:opacity-50"
                    >
                      {isSavingTags ? "저장 중..." : "저장"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Thick Border Primary CTA button */}
            <div className="pt-2">
              <button
                onClick={async () => {
                  const bookId = book.bookId || book.id;
                  const isCompleted = readingPosition?.readingStatus === "COMPLETED";
                  const currentPage = isCompleted ? 1 : (readingPosition?.currentPage || 1);
                  const progress = isCompleted ? 1 : (readingPosition?.progress || 1);

                  try {
                    if (isCompleted) {
                      await rereadBook(bookId);
                    } else {
                      await updateReadingProgress(bookId, currentPage, progress);
                    }
                  } catch (err) {
                    console.error("읽기 시작 처리 실패", err);
                  }

                  // 책을 펼쳐 읽기 시작하는 시점에만 조회수 반영
                  increaseViewCount(bookId)
                    .then(res => {
                      const viewCount = res.data?.data;
                      if (viewCount != null) onViewCountSynced?.(bookId, viewCount);
                    })
                    .catch(() => { });

                  const res = await getBookContents(bookId);
                  const pageItems = res.data?.data?.items || [];
                  const viewerPages = mapBookPagesByGenre(book.bookType, pageItems);
                  const startPageIndex = Math.max(0, currentPage - 1);

                  onStartReading({
                    ...book,
                    id: bookId,
                    bookId,
                    startPageIndex,
                    pages: viewerPages.length > 0 ? viewerPages : [
                      {
                        id: "page-empty",
                        backgroundColor: "#ffffff",
                        elements: [
                          {
                            id: "text-empty",
                            type: "text",
                            x: 60,
                            y: 100,
                            w: 360,
                            h: 300,
                            html: "본문 준비 중입니다.",
                            fontSize: 18,
                          },
                        ],
                      },
                    ],

                    onReadingBookmarkSave: handleReadingBookmarkSave,
                    onReadingTimeSave: handleReadingTimeSave,
                  });
                }}
                className={getCtaButtonStyle()}
              >
                {readingPosition?.readingStatus === "COMPLETED"
                  ? "다시 읽기"
                  : readingPosition?.progress > 0
                    ? "이어읽기"
                    : "책 펼치기"} 📖
              </button>
              {readingPosition?.readingStatus === "COMPLETED" && (
                <p className="mt-2 max-w-sm text-center text-xs font-bold text-[#7368a1]">
                  ✓ 완독 · 다시 펼쳐볼 수 있어요
                </p>
              )}
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
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full min-h-36 border-2 border-[#b3a6eb] rounded-xl p-4 text-sm font-bold text-black outline-none focus:ring-2 focus:ring-[#5139d6] font-gowun bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditDescription(localBook.description || "");
                        setIsEditingDescription(false);
                      }}
                      className="px-4 py-2 rounded-lg border-2 border-[#b3a6eb] text-xs font-black text-[#3c375e] cursor-pointer bg-white"
                    >
                      취소
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const bookId = book.bookId || book.id;

                          await onUpdateDescription?.(
                            bookId,
                            editDescription
                          );

                          const res = await getBook(bookId);
                          const latestBook = res.data?.data;

                          if (latestBook) {
                            setLocalBook(prev => ({
                              ...prev,
                              ...latestBook,
                              coverImage:
                                latestBook.coverImageUrl ||
                                prev.coverImage ||
                                "/default-book-cover.png",
                              likes:
                                latestBook.likeCount ??
                                prev.likes ??
                                0,
                              genre:
                                bookTypeToGenre[latestBook.bookType] ||
                                latestBook.bookType ||
                                prev.genre,
                            }));

                            setEditDescription(latestBook.description || "");
                          }

                          setIsEditingDescription(false);
                        } catch (e) {
                          console.error("책 소개 수정 실패", e);
                          alert("책 소개 수정에 실패했습니다.");
                        }
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
                    {localBook.description}
                  </p>

                  {mode === "owner" && (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setIsEditingDescription(true)}
                        className="px-4 py-2 rounded-lg border-2 border-[#b3a6eb] text-xs font-black text-[#5139d6] hover:bg-[#f3f0ff] bg-white cursor-pointer"
                      >
                        책 소개 수정
                      </button>

                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="book-status"
                          className="text-xs font-black text-[#3c375e]"
                        >
                          공개 여부
                        </label>

                        <select
                          id="book-status"
                          value={localBook.status || "PUBLISHED"}
                          onChange={async (e) => {
                            const bookId = localBook.bookId || localBook.id;
                            const previousStatus = localBook.status || "PUBLISHED";
                            const nextStatus = e.target.value;

                            setLocalBook(prev => ({
                              ...prev,
                              status: nextStatus,
                            }));

                            try {
                              await onUpdateStatus?.(bookId, nextStatus);
                            } catch (error) {
                              console.error("공개 여부 변경 실패", error);

                              setLocalBook(prev => ({
                                ...prev,
                                status: previousStatus,
                              }));
                            }
                          }}
                          className="rounded-lg border-2 border-[#b3a6eb] bg-white px-3 py-2 text-xs font-black text-[#5139d6] outline-none focus:border-[#5139d6]"
                        >
                          <option value="PUBLISHED">공개</option>
                          <option value="HIDDEN">비공개</option>
                        </select>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-black ${localBook.status === "HIDDEN"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-[#ede9ff] text-[#5139d6]"
                            }`}
                        >
                          {localBook.status === "HIDDEN" ? "비공개" : "공개 중"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleDeleteBook}
                        disabled={isDeletingBook}
                        className="ml-auto px-4 py-2 rounded-lg border-2 border-red-200 bg-white text-xs font-black text-red-600 hover:bg-red-50 hover:border-red-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeletingBook ? "삭제 중..." : "책 삭제"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* 이 책을 좋아한다면 section */}
        {mode !== "owner" && (
          <div className="space-y-6 text-left relative z-10">
            <div className="border-b border-[#b3a6eb] pb-3">
              <h3 className="text-[19px] md:text-xl font-bold text-gray-900">
                이 책을 좋아한다면
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recommendations.map(rec => {
                const recBadge = genreBadge(rec.bookType);
                return (
                <div key={rec.id} onClick={() => onSelectRecommended(rec)} className="group flex flex-col items-center text-center cursor-pointer">
                  <div className="relative aspect-[3/4.5] bg-[#f3f0ff] overflow-hidden border border-[#b3a6eb] shadow-sm group-hover:shadow-md group-hover:border-[#5139d6] transition duration-300 rounded-lg w-full">
                    <img className="w-full h-full object-cover group-hover:scale-105 duration-500 transition-all" src={rec.coverImage} alt={rec.title} referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-[#000000]/5 group-hover:bg-transparent transition duration-350" />
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold border backdrop-blur-sm ${recBadge.cls}`}>
                      {recBadge.label}
                    </div>
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
                );
              })}
            </div>
          </div>
        )}

        {/* 댓글 section */}
        <div id="detail-comments-section" className="space-y-6 text-left pt-2 relative z-10">
          <h3 className="text-[19px] md:text-xl font-bold text-gray-900">
            독자들의 따스한 사색
          </h3>

          {commentNotFound && (
            <p className="text-sm font-bold text-[#7C769D] bg-[#FAF9FF] border border-[#E6E2FC] rounded-xl px-4 py-3">
              이미 삭제되었거나 존재하지 않는 댓글입니다.
            </p>
          )}

          {/* Comments feed list layout */}
          <div className="space-y-5 pr-1">
            {topLevelComments.length === 0 ? (
              <p className="text-sm text-[#3c375e] font-bold py-4 text-center">
                作品에 남겨진 사색이 아직 없습니다. 첫 의견을 심어보세요.
              </p>
            ) : (
              topLevelComments.map((comment, index) => (
                <div
                  key={comment.id || index}
                  id={`comment-${comment.id}`}
                  className={`pb-5 border-b border-[#b3a6eb] last:border-none last:pb-0 transition-all rounded-xl ${reportedCommentIds.includes(comment.id) ? "opacity-50" : ""} ${highlightedCommentId != null && String(highlightedCommentId) === String(comment.id) ? "ring-2 ring-[#6b54e7] bg-[#f3f0ff] -mx-3 px-3 py-2" : ""}`}
                >
                  <div className="flex gap-4 items-start">
                    <div className={getCommentAvatarStyle()}>
                      {(comment.nickname || comment.user || "?").charAt(0)}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        {/* 댓글 유저 이름 두껍게 */}
                        <h5 className="font-black text-[15px] text-black">
                          {comment.nickname || comment.user}
                        </h5>
                        {/* 작성 시간 가독성 개선 */}
                        <span className="text-xs font-bold text-[#4b3e80]">
                          {comment.date || formatCommentDate(comment.createdAt)}
                        </span>
                      </div>
                      {reportedCommentIds.includes(comment.id) ? (
                        <p className="text-[13px] text-neutral-400 italic font-normal">신고가 접수된 댓글입니다.</p>
                      ) : editingCommentId === comment.id ? (
                        <div className="space-y-2 pt-1">
                          <textarea
                            value={editingCommentText}
                            onChange={e => setEditingCommentText(e.target.value)}
                            className="w-full min-h-20 border-2 border-[#b3a6eb] rounded-lg p-2.5 text-[13px] font-bold text-black outline-none focus:ring-2 focus:ring-[#5139d6] font-gowun bg-white"
                          />
                          <div className="flex justify-end gap-2">
                            <button onClick={handleCancelEditComment} className="text-xs font-black px-3 py-1.5 rounded-lg border-2 border-[#b3a6eb] text-[#3c375e] bg-white cursor-pointer">
                              취소
                            </button>
                            <button onClick={() => handleSaveEditComment(comment.id)} className="text-xs font-black px-3 py-1.5 rounded-lg bg-[#5139d6] hover:bg-[#3b25b8] text-white cursor-pointer">
                              저장
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* 댓글 본문 글씨 진하게 (text-gray-700 -> text-neutral-900 / font-semibold) */
                        <p className="text-[14px] leading-relaxed text-neutral-900 font-semibold">
                          {comment.content || comment.text}
                        </p>
                      )}
                      {editingCommentId !== comment.id && !reportedCommentIds.includes(comment.id) && (
                        <div className="flex items-center gap-3 pt-1">
                          {/* 답글쓰기 / 수정 / 삭제 / 신고 액션 텍스트 더 굵고 진하게 */}
                          <button
                            onClick={() => {
                              setReplyingTo(replyingTo?.id === comment.id ? null : { id: comment.id, nickname: comment.nickname || comment.user });
                              document.getElementById("detail-comment-input")?.focus();
                            }}
                            className="text-xs font-black text-[#5139d6] hover:text-black hover:underline transition cursor-pointer"
                          >
                            답글쓰기
                          </button>

                          {isOwnComment(comment) && (
                            <>
                              <button
                                onClick={() => handleStartEditComment(comment)}
                                className="text-xs font-black text-neutral-500 hover:text-black hover:underline transition cursor-pointer"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-xs font-black text-neutral-500 hover:text-red-600 hover:underline transition cursor-pointer"
                              >
                                삭제
                              </button>
                            </>
                          )}

                          {mode !== "owner" && !isOwnComment(comment) && (
                            <button
                              onClick={() => handleStartReport("comment", comment.id, `${comment.nickname || comment.user}님의 댓글`)}
                              className="text-xs font-bold text-neutral-400 hover:text-red-600 transition inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              <Flag className="w-3 h-3 stroke-[2.5]" /> 신고
                            </button>
                          )}
                        </div>
                      )}

                      {/* 답글 목록 */}
                      {(repliesByParent[comment.id]?.length > 0) && (() => {
                        const replies = repliesByParent[comment.id];
                        const isExpanded = expandedReplyIds.includes(comment.id) || replies.length < 2;
                        return (
                          <div className="mt-3 pl-4 space-y-3">
                            {isExpanded && replies.map((reply, rIdx) => (
                              <div
                                key={reply.id || rIdx}
                                id={`comment-${reply.id}`}
                                className={`flex gap-2 items-start transition-all rounded-lg ${reportedCommentIds.includes(reply.id) ? "opacity-50" : ""} ${highlightedCommentId != null && String(highlightedCommentId) === String(reply.id) ? "ring-2 ring-[#6b54e7] bg-[#f3f0ff] -mx-2 px-2 py-1.5" : ""}`}
                              >
                                <div className="w-7 h-7 rounded-full bg-neutral-200 border border-black/5 flex items-center justify-center text-black font-black text-[11px] shrink-0">
                                  {(reply.nickname || reply.user || "?").charAt(0)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-center">
                                    <h6 className="font-black text-xs text-neutral-900">{reply.nickname || reply.user}</h6>
                                    <span className="text-[10px] font-bold text-[#4b3e80]">{reply.date || formatCommentDate(reply.createdAt)}</span>
                                  </div>
                                  {reportedCommentIds.includes(reply.id) ? (
                                    <p className="text-[12px] text-neutral-400 italic font-normal">신고가 접수된 댓글입니다.</p>
                                  ) : editingCommentId === reply.id ? (
                                    <div className="space-y-2 pt-1">
                                      <textarea
                                        value={editingCommentText}
                                        onChange={e => setEditingCommentText(e.target.value)}
                                        className="w-full min-h-16 border-2 border-[#b3a6eb] rounded-lg p-2 text-[12px] font-bold text-black outline-none focus:ring-2 focus:ring-[#5139d6] font-gowun bg-white"
                                      />
                                      <div className="flex justify-end gap-2">
                                        <button onClick={handleCancelEditComment} className="text-[11px] font-black px-2.5 py-1 rounded-lg border-2 border-[#b3a6eb] text-[#3c375e] bg-white cursor-pointer">
                                          취소
                                        </button>
                                        <button onClick={() => handleSaveEditComment(reply.id)} className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-[#5139d6] hover:bg-[#3b25b8] text-white cursor-pointer">
                                          저장
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      {/* 답글 내용도 원댓글과 동일한 톤으로 통일 */}
                                      <p className="text-[13px] leading-relaxed text-neutral-900 font-semibold">{reply.content || reply.text}</p>
                                      {(isOwnComment(reply) || mode !== "owner") && (
                                        <div className="flex items-center gap-2.5 pt-0.5">
                                          {isOwnComment(reply) && (
                                            <>
                                              <button
                                                onClick={() => handleStartEditComment(reply)}
                                                className="text-[11px] font-black text-neutral-500 hover:text-black hover:underline transition cursor-pointer"
                                              >
                                                수정
                                              </button>
                                              <button
                                                onClick={() => handleDeleteComment(reply.id)}
                                                className="text-[11px] font-black text-neutral-500 hover:text-red-600 hover:underline transition cursor-pointer"
                                              >
                                                삭제
                                              </button>
                                            </>
                                          )}
                                          {mode !== "owner" && !isOwnComment(reply) && (
                                            <button
                                              onClick={() => handleStartReport("comment", reply.id, `${reply.nickname || reply.user}님의 답글`)}
                                              className="text-[11px] font-bold text-neutral-400 hover:text-red-600 transition inline-flex items-center gap-0.5 cursor-pointer"
                                            >
                                              <Flag className="w-2.5 h-2.5 stroke-[2.5]" /> 신고
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                            {replies.length >= 2 && (
                              <button
                                onClick={() => setExpandedReplyIds(prev =>
                                  isExpanded ? prev.filter(id => id !== comment.id) : [...prev, comment.id]
                                )}
                                className="text-xs font-black text-[#5139d6] hover:text-black hover:underline transition cursor-pointer flex items-center gap-1"
                              >
                                {isExpanded ? "답글 접기" : `답글 ${replies.length}개 더보기`}
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))
            )}
            {hasNextComment && (
              <button onClick={loadMoreComments} className="w-full py-2 text-sm text-[#6b54e7] hover:text-[#5139d6] font-bold border border-[#e6e2fc] rounded-xl hover:bg-[#f3f0ff] transition mt-4">
                댓글 더보기
              </button>
            )}
          </div>

          {/* Comment register form box */}
          <form onSubmit={handleSubmitComment} className="mt-8 space-y-3">
            {replyingTo && (
              <div className="flex items-center justify-between bg-[#f3f0ff] border border-[#b3a6eb] rounded-lg px-3 py-2">
                <span className="text-xs font-bold text-[#5139d6]">
                  <span className="font-black">{replyingTo.nickname}</span>님에게 답글 작성 중
                </span>
                <button type="button" onClick={() => setReplyingTo(null)} className="text-xs font-bold text-neutral-500 hover:text-black cursor-pointer">
                  취소
                </button>
              </div>
            )}
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e6e2fc] border border-[#b3a6eb] flex items-center justify-center shrink-0 overflow-hidden mt-1">
                {currentUser?.profileImageUrl
                  ? <img src={currentUser.profileImageUrl} alt="프로필" className="w-full h-full object-cover" />
                  : <span className="text-[#5139d6] font-black text-sm">{(currentUser?.nickname || "?").charAt(0)}</span>
                }
              </div>
              <div className="relative flex-1 flex">
                <input
                  id="detail-comment-input"
                  type="text"
                  placeholder={replyingTo ? "답글을 남겨보세요..." : "댓글을 남겨보세요..."}
                  required
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  className="flex-1 border-2 border-[#b3a6eb] py-3.5 pl-4.5 pr-20 text-sm font-bold text-black focus:outline-none focus:bg-white placeholder-neutral-500 bg-white rounded-xl focus:ring-2 focus:ring-[#5139d6] font-gowun"
                />
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