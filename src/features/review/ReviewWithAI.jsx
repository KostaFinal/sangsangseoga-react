import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, BookOpen, Trash2, Award, Sparkles, Plus, Clock, Star, Heart } from 'lucide-react';
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  saveDraft,
  requestAiFeedback,
  getFinishedList,
} from "../../api/myLibraryApi";

export default function ReviewWithAI({ onFairyTaleCreated }) {
  // Book Reports list state (Initialized with beautiful real reports matching default books)
  const [reports, setReports] = useState([]);
  const [reviewBooks, setReviewBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const getCoverUrl = (review) => {
    return review.coverImageUrl || review.bookCover || "";
  };

  const mapReviewToReport = (review) => ({
    id: review.reviewId,
    reviewId: review.reviewId,
    bookId: review.bookId,
    bookTitle: review.bookTitle,
    bookCover: getCoverUrl(review),
    date: review.createdAt
      ? new Date(review.createdAt).toLocaleDateString("ko-KR")
      : "",
    content: review.content || "",
    status: review.isDraft ? "작성 중" : undefined,
    feedback: review.aiFeedbackContent || "",
    aiFeedbackCreatedAt: review.aiFeedbackCreatedAt,
    mood: review.aiFeedbackContent ? "AI 평가 완료" : "기록 중",
    sticker: review.aiFeedbackContent ? "👩‍🏫 AI 평가 완료" : "✍️ 독후감",
  });

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await getReviews();
      const list = Array.isArray(res.data.data)
        ? res.data.data
        : [];
      setReports(list.map(mapReviewToReport));
    } catch (err) {
      console.error("독후감 목록 조회 실패", err);
      setToastMessage("독후감 목록을 불러오지 못했습니다.");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const loadReviewBooks = async () => {
    try {
      const finishedRes = await getFinishedList();

      const finished = Array.isArray(finishedRes.data.data)
        ? finishedRes.data.data
        : [];

      setReviewBooks(finished);

      if (finished.length > 0) {
        setNewBookTitle(String(finished[0].bookId));
      } else {
        setNewBookTitle("");
      }
    } catch (err) {
      console.error("독후감 작성용 책 목록 조회 실패", err);
    }
  };

  useEffect(() => {
    loadReviews();
    loadReviewBooks();
  }, []);



  // Form states to add new manual report in UI
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReportId, setEditingReportId] = useState(null);
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newReportTitleText, setNewReportTitleText] = useState('');
  const [newReportContent, setNewReportContent] = useState('');
  const [newReportSticker, setNewReportSticker] = useState('🌲 초록 숲길 도장 쾅!');
  const [newReportMood, setNewReportMood] = useState('따뜻하고 신비로움');
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [newReportFeedback, setNewReportFeedback] = useState('');

  // Edit existing report states
  const [selectedReportForEdit, setSelectedReportForEdit] = useState(null);
  const [editReportContent, setEditReportContent] = useState('');
  const [editReportSticker, setEditReportSticker] = useState('');
  const [editReportMood, setEditReportMood] = useState('');
  const [editReportFeedback, setEditReportFeedback] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Close and reset form helper
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingReportId(null);
    setNewBookTitle(
      reviewBooks.length > 0
        ? String(reviewBooks[0].bookId)
        : ""
    );
    setNewReportContent('');
    setNewReportTitleText('');
    setNewReportMood('따뜻하고 신비로움');
    setNewReportSticker('🌲 초록 숲길 도장 쾅!');
    setNewReportFeedback('');
  };

  const selectedBook = reviewBooks.find(
    (book) => String(book.bookId) === String(newBookTitle)
  );

  const handleAddManualReport = async () => {
    if (!newReportContent.trim()) return;

    if (!selectedBook) {
      setToastMessage("독후감을 작성할 책을 선택해주세요.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    try {
      if (editingReportId) {
        await updateReview(editingReportId, {
          bookId: selectedBook.bookId,
          content: newReportContent,
          isDraft: false,
        });

        setToastMessage("✏️ 독후감이 수정되었습니다!");
      } else {
        await createReview({
          bookId: selectedBook.bookId,
          content: newReportContent,
          isDraft: false,
        });

        setToastMessage("🎉 새로운 독후감이 저장되었습니다!");
      }

      await loadReviews();
      await loadReviewBooks();

      setEditingReportId(null);
      setNewReportContent("");
      setNewReportTitleText("");
      setNewReportFeedback("");
      setIsFormOpen(false);

      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("독후감 저장 실패", err);

      const message =
        err.response?.data?.message || "독후감 저장에 실패했습니다.";

      setToastMessage(message);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleTempSave = async () => {
    if (!newReportContent.trim()) return;

    if (!selectedBook) {
      setToastMessage("임시저장할 책을 선택해주세요.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    try {
      if (editingReportId) {
        await saveDraft(editingReportId, {
          bookId: selectedBook.bookId,
          content: newReportContent,
          isDraft: true,
        });
      } else {
        await createReview({
          bookId: selectedBook.bookId,
          content: newReportContent,
          isDraft: true,
        });
      }

      await loadReviews();
      await loadReviewBooks();

      setEditingReportId(null);
      setNewReportContent("");
      setNewReportTitleText("");
      setNewReportFeedback("");
      setIsFormOpen(false);

      setToastMessage("📝 독후감이 임시저장되었습니다!");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("독후감 임시저장 실패", err);

      const message =
        err.response?.data?.message || "독후감 임시저장에 실패했습니다.";

      setToastMessage(message);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleAiEvaluation = () => {
    if (!newReportContent.trim()) {
      setToastMessage("독후감 내용을 먼저 작성해주세요!");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    if (!selectedBook) {
      setToastMessage("AI 평가를 받을 책을 선택해주세요.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const tempReportForEvaluation = {
      id: editingReportId,
      reviewId: editingReportId,
      bookId: selectedBook.bookId,
      bookTitle: selectedBook.title,
      bookCover: selectedBook.coverImageUrl,
      content: newReportContent,
      feedback: newReportFeedback,
      isNew: !editingReportId,
    };

    setSelectedReportForEdit(tempReportForEvaluation);
    setEditReportContent(newReportContent);
    setEditReportMood(tempReportForEvaluation.feedback ? "AI 평가 완료" : "");
    setEditReportSticker(tempReportForEvaluation.feedback ? "👩‍🏫 AI 평가 완료" : "");
    setEditReportFeedback(tempReportForEvaluation.feedback || "");
  };

  // Delete Book Report Callback
  const handleDeleteReport = async (id) => {
    if (!window.confirm("이 독후감을 삭제하시겠습니까?")) return;

    try {
      await deleteReview(id);

      await loadReviews();

      setToastMessage("🗑️ 독후감이 삭제되었습니다.");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("독후감 삭제 실패", err);

      const message =
        err.response?.data?.message || "독후감 삭제에 실패했습니다.";

      setToastMessage(message);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleEditReport = (report) => {
    // 임시 저장된 독후감이나 기존 독후감을 수정하기 위해 폼을 엽니다.
    setEditingReportId(report.id);
    setNewBookTitle(String(report.bookId));;
    setNewReportContent(report.content);
    setNewReportFeedback(report.feedback || '');
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (report) => {
    setSelectedReportForEdit(report);
    setEditReportContent(report.content);
    setEditReportSticker(report.sticker);
    setEditReportMood(report.mood || '');
    setEditReportFeedback(report.feedback || '');
  };

  const handleAIEvaluateEditedReport = async () => {
    if (!selectedReportForEdit) return;

    if (!editReportContent.trim()) {
      setToastMessage("⚠️ 독후감 내용을 먼저 입력해주세요!");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    try {
      setIsEvaluating(true);

      let reviewId = selectedReportForEdit.reviewId;

      if (selectedReportForEdit.isNew) {
        const created = await createReview({
          bookId: selectedReportForEdit.bookId,
          content: editReportContent,
          isDraft: false,
        });

        reviewId = created.data.data.reviewId;

        setSelectedReportForEdit((prev) => ({
          ...prev,
          id: reviewId,
          reviewId,
          isNew: false,
        }));
      } else {
        await updateReview(reviewId, {
          bookId: selectedReportForEdit.bookId,
          content: editReportContent,
          isDraft: false,
        });
      }

      const res = await requestAiFeedback(reviewId);

      setEditReportFeedback(res.data.data?.aiFeedbackContent || "");
      setEditReportMood("AI 평가 완료");
      setEditReportSticker("👩‍🏫 AI 평가 완료");

      await loadReviews();

      setToastMessage("👩‍🏫 AI 평가가 완료되었습니다!");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("AI 평가 요청 실패", err);

      const message =
        err.response?.data?.message || "AI 평가 요청에 실패했습니다.";

      setToastMessage(message);
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveEditedReport = () => {
    if (!selectedReportForEdit) return;

    setReports((prev) =>
      prev.map((r) =>
        r.id === selectedReportForEdit.id
          ? {
            ...r,
            content: editReportContent,
            sticker: editReportSticker,
            mood: editReportMood,
            feedback: editReportFeedback
          }
          : r
      )
    );

    setSelectedReportForEdit(null);
    setToastMessage("✏️ 독서록이 멋지게 수정되었습니다!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="w-full max-w-[calc(100%-70px)] flex flex-col pt-1 pr-4 animate-in slide-in-from-bottom-6 duration-500 select-none text-navy-purple bg-transparent">
      {/* Page Title */}
      <div className="border-b border-lavender-border pb-4 mb-4">
        <h2 className="text-xl font-black text-navy-purple tracking-tight font-serif">
          독후감
        </h2>
      </div>

      {/* REPORTS LIST VIEW AREA */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-plus text-base font-black text-navy-purple">내가 쓴 독서록 📖 ({reports.length})</h3>
          </div>

          <button
            type="button"
            onClick={() => {
              if (isFormOpen) {
                handleCloseForm();
              } else {
                setIsFormOpen(true);
              }
            }}
            className="flex items-center gap-1.5 bg-brand-purple hover:bg-brand-dark text-white font-bold text-xs px-4 py-2 rounded-full shadow-sm cursor-pointer select-none"
          >
            {isFormOpen ? (
              '작성창 닫기'
            ) : (
              <><Plus className="w-4 h-4" /> 새 독후감 직접 등록하기</>
            )}
          </button>
        </div>

        {/* Collapse Form for creating manual report */}
        {isFormOpen && (
          <div className="bg-white rounded-2xl border border-lavender-border p-3 md:p-4 shadow-xl animate-in slide-in-from-top-4 duration-500 overflow-hidden mb-4">
            {/* Split Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

              {/* Left Side: Book display showcase (Cols 1-5) */}
              <div className="lg:col-span-5 bg-white rounded-xl p-4 flex flex-col justify-between border border-lavender-border shadow-sm relative">

                {/* Book Selector at the top of showcase */}
                <div>
                  <label className="text-[10px] font-black text-navy-purple tracking-tight uppercase block mb-1">
                    📖 현재 작성 중인 책 선택
                  </label>
                  <select
                    value={newBookTitle}
                    onChange={(e) => {
                      const title = e.target.value;
                      setNewBookTitle(title);
                    }}
                    className="w-full bg-white border border-lavender-border rounded-xl px-3 py-2 text-xs font-extrabold text-navy-purple outline-none shadow-sm cursor-pointer hover:border-brand-purple transition-all"
                  >
                    {reviewBooks.map((book) => (
                      <option key={book.bookId} value={book.bookId}>
                        {book.title}
                      </option>
                    ))}
                  </select>

                </div>

                {/* Large Stylized Book Cover with Overlay Badge */}
                <div className="my-3 flex justify-center relative">
                  <div
                    className="w-28 h-40 rounded-xl bg-cover bg-center shadow-lg border border-lavender-border relative group overflow-hidden transition-all duration-300"
                    style={{
                      backgroundImage: `url('${selectedBook?.coverImageUrl || ""}')`
                    }}
                  >
                    {/* absolute overlay badge bottom right corner */}
                    <div className="absolute bottom-2 right-2 bg-brand-purple w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-all">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Title and Author block */}
                <div className="text-center mt-1">
                  <h4 className="text-xs font-black text-navy-purple font-plus tracking-tight">
                    {selectedBook?.title}
                  </h4>
                  <p className="text-[10px] text-purple-gray-text mt-0.5 font-bold">
                    독후감 작성 도서
                  </p>
                </div>

                {/* Pair of rounded bubbles */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="bg-white border border-lavender-border rounded-xl p-2 text-center">
                    <span className="text-[9px] text-purple-gray-text block font-bold">다 읽은 날짜</span>
                    <span className="text-[10px] font-bold text-navy-purple block mt-0.5">
                      {selectedBook?.completedAt
                        ? new Date(selectedBook.completedAt).toLocaleDateString("ko-KR")
                        : "읽는 중"}
                    </span>
                  </div>
                  <div className="bg-white border border-lavender-border rounded-xl p-2 text-center">
                    <span className="text-[9px] text-purple-gray-text block font-bold">독서 시간</span>
                    <span className="text-[10px] font-bold text-navy-purple block mt-0.5">
                      {selectedBook?.readingTime}분
                    </span>
                  </div>
                </div>

              </div>

              {/* Right Side: Notebook Note layout (Cols 6-12) */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-lavender-border p-4 md:p-5 flex flex-col justify-between shadow-sm relative">

                {/* Notes Header Block */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-plus font-black text-xs text-navy-purple flex items-center gap-1.5 animate-pulse">
                      <span className="text-base">🖋️</span> 나만의 소중한 독후감 쓰기
                    </h4>
                  </div>

                  {/* Lined notebook area matching mockup horizontal lined paper */}
                  <div className="relative bg-white rounded-xl border border-lavender-border p-3.5 shadow-inner min-h-[180px] overflow-hidden">
                    <textarea
                      rows={5}
                      value={newReportContent}
                      onChange={(e) => setNewReportContent(e.target.value)}
                      placeholder="동화책을 재미있게 읽고 난 소중한 소감을 적어보세요..."
                      className="w-full min-h-[140px] bg-transparent outline-none text-xs text-navy-purple resize-none tracking-wide font-medium relative z-10"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e6e2fc 31px, #e6e2fc 32px)',
                        backgroundSize: '100% 32px',
                        lineHeight: '32px',
                        paddingTop: '6px'
                      }}
                    />

                    {/* Tilted Pencil Watermark in bottom right corner */}
                    <div className="absolute bottom-4 right-4 pointer-events-none opacity-20 select-none transform rotate-12 transition-all">
                      <svg className="w-12 h-12 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>


                  </div>
                </div>

                {/* Save temporary and Final submit buttons */}
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-lavender-border">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-3 py-1.5 bg-white border border-lavender-border text-navy-purple rounded-full text-xs font-bold shadow-sm hover:bg-lavender-bg transition-all cursor-pointer"
                  >
                    취소
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAiEvaluation}
                      className="px-3 py-1.5 bg-brand-purple text-white rounded-full text-xs font-bold shadow-sm hover:bg-brand-dark transition-all cursor-pointer"
                    >
                      AI 평가 받기
                    </button>

                    <button
                      type="button"
                      onClick={handleTempSave}
                      disabled={!newReportContent.trim()}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-40"
                    >
                      💾 임시저장
                    </button>

                    <button
                      type="button"
                      onClick={handleAddManualReport}
                      disabled={!newReportContent.trim()}
                      className="px-4 py-1.5 bg-brand-purple hover:bg-brand-dark text-white rounded-full text-xs font-bold shadow-md transition-all flex items-center gap-1 disabled:opacity-40 select-none cursor-pointer"
                    >
                      ✅ 저장하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visual reports display grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl border border-lavender-border shadow-sm p-4 hover:shadow-md transition-all flex flex-col justify-between min-h-[160px] group relative border-l-4 border-l-brand-purple hover:-translate-y-0.5 duration-300"
            >
              {/* Trash option button top right */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteReport(report.id);
                }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white text-navy-purple border border-lavender-border flex items-center justify-center transition-all cursor-pointer hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 shadow-xs z-25"
                title="독서록 삭제하기"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditReport(report);
                }}
                className="absolute top-12 right-3 px-2.5 py-1 rounded-full bg-white text-brand-purple border border-lavender-border text-[10px] font-black shadow-xs hover:bg-lavender-bg transition-all z-25 cursor-pointer"
              >
                수정
              </button>

              <div className="flex gap-4">
                {/* Miniature Cover portrait */}
                <div className="w-14 h-20 bg-cover bg-center rounded-lg shadow-md border border-lavender-border flex-shrink-0" style={{ backgroundImage: `url('${report.bookCover}')` }} />

                <div className="min-w-0 pr-6 flex flex-col justify-center">
                  {report.status === '작성 중' && (
                    <span className="ml-1 text-[9px] text-white bg-orange-400 border border-orange-500 font-bold px-2 py-0.5 rounded-full">
                      작성 중
                    </span>
                  )}
                  <h4 className="text-[14px] font-black text-navy-purple font-plus mt-1.5">{report.bookTitle} 읽고서</h4>
                  <span className="text-[11px] text-purple-gray-text font-medium flex items-center gap-1 mt-1">🏛️ 기록일: {report.date}</span>
                </div>
              </div>

              <p className="text-[12px] md:text-[13px] text-navy-purple leading-relaxed font-medium mt-3 bg-white p-4 rounded-2xl border border-lavender-border shadow-xs">
                "{report.content}"
              </p>

              {report.feedback && (
                <div className="mt-3 p-4 bg-[#F3F0FF] rounded-2xl border border-[#D4CDF2] text-[12px] md:text-[13px] leading-relaxed relative flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm select-none shrink-0" title="AI 선생님">👩‍🏫</span>
                    <span className="font-black text-navy-purple block">AI 선생님의 평가 코멘트</span>
                  </div>
                  <p className="italic leading-normal mt-0.5 text-purple-gray-text font-semibold">{report.feedback}</p>
                </div>
              )}


            </div>
          ))}

          {reports.length === 0 && (
            <div className="col-span-full py-10 text-center border-2 border-dashed border-lavender-border rounded-2xl bg-white max-w-lg mx-auto w-full select-none flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">✒️</span>
              <h5 className="font-plus font-bold text-sm text-navy-purple">아직 작성한 독서록이 없어요</h5>
              <p className="text-[10px] text-purple-gray-text max-w-[210px] leading-relaxed">
                [새 독후감 직접 등록하기] 버튼을 눌러 소감을 첫 기록해 등재해 보세요!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Book Report Detail / Edit Modal */}
      {selectedReportForEdit && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
          <div className="bg-white rounded-[2.5rem] border border-lavender-border shadow-2xl p-6 md:p-8 max-w-xl w-full animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-lavender-border mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📖</span>
                  <h4 className="font-plus font-bold text-base text-navy-purple">
                    AI 사서
                  </h4>
                </div>
              </div>

              <div className="flex gap-4 mb-5 items-start">
                <div
                  className="w-16 h-24 bg-cover bg-center rounded-xl shadow-md border border-lavender-border shrink-0"
                  style={{ backgroundImage: `url('${selectedReportForEdit.bookCover}')` }}
                />
                <div>
                  <h5 className="font-plus font-black text-sm text-navy-purple">{selectedReportForEdit.bookTitle}</h5>
                  <p className="text-[10px] text-purple-gray-text mt-1 font-semibold">정서 테마: {selectedReportForEdit.mood || '기록 없음'}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* AI Evaluation trigger button */}
                <button
                  type="button"
                  onClick={handleAIEvaluateEditedReport}
                  disabled={isEvaluating}
                  className="w-full py-3 px-5 bg-brand-purple hover:bg-brand-dark text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer disabled:opacity-40"
                  title="이 소장본을 AI 사서에게 다시 공식 감정 및 재평가해달라고 보냅니다."
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse animate-spin" />
                  <span>이 독후감 실시간 AI 사서의 도움말 ✨</span>
                </button>

                {/* AI Evaluation Loading Animation */}
                {isEvaluating && (
                  <div className="p-5 bg-lavender-bg rounded-2xl border border-lavender-border border-dashed text-center flex flex-col items-center justify-center gap-2 animate-pulse mt-3">
                    <span className="text-xl animate-bounce">👩‍🏫</span>
                    <p className="text-[10px] font-bold text-purple-gray-text">AI 사서 선생님이 돋보기를 들고 독후감 문장을 꼼꼼히 음미 중입니다...</p>
                    <div className="w-24 h-1 bg-zinc-200 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-brand-purple rounded-full w-2/3 animate-pulse" />
                    </div>
                  </div>
                )}

                {/* AI Evaluation Result Block inside Modal */}
                {editReportFeedback && !isEvaluating && (
                  <div className="p-4 bg-lavender-bg rounded-2xl border border-lavender-border text-xs text-navy-purple mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-sm">👩‍🏫</span>
                      <span className="font-extrabold text-navy-purple">AI 사서의 독후감 한 마디</span>
                      <span className="ml-auto text-[9px] bg-brand-purple text-white font-bold px-2 py-0.5 rounded-full">완료</span>
                    </div>
                    <div className="space-y-1.5 bg-white p-3 rounded-xl border border-lavender-border shadow-xs">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-purple-gray-text font-bold">정서 테마:</span>
                        <span className="font-extrabold text-navy-purple">{editReportMood}</span>
                      </div>
                      <div className="h-[1px] bg-lavender-bg my-1" />
                      <p className="text-[10px] leading-relaxed text-purple-gray-text italic">
                        "{editReportFeedback}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2.5 mt-6 pt-4 border-t border-lavender-border">
              <button
                onClick={() => setSelectedReportForEdit(null)}
                className="flex-1 py-3 bg-white border border-lavender-border text-navy-purple font-bold text-xs rounded-full hover:bg-lavender-bg cursor-pointer transition-all"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setSelectedReportForEdit(null);
                  setIsFormOpen(false);
                  setNewReportContent("");
                  setNewReportFeedback("");
                  loadReviews();
                }}
                className="flex-1 py-3 bg-brand-purple hover:bg-brand-dark text-white font-bold text-xs rounded-full cursor-pointer transition-all shadow-md"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating success and saving notifications toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-purple text-white font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-4 duration-300 border border-lavender-border">
          <Sparkles className="w-4 h-4 text-white animate-spin" />
          <span className="text-[11px] font-black">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
