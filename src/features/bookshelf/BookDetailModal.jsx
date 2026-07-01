import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, BookOpen, Clock, ThumbsUp, MessageSquare, AlertTriangle, Heart, Edit2, Trash2 } from 'lucide-react';

export default function BookDetailModal({ book, onClose, onStartReading, onOpenViewer, setActiveTab, onLike, onAddReview, onUpdateReview, onDeleteReview, onReportReview, onToggleFavorite }) {
  if (!book) return null;

  const [newReview, setNewReview] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingComment, setEditingComment] = useState('');
  const isWishlist = book.progress === 0 && book.author !== '지우와 상상 AI';
  const isReading = book.progress && book.progress > 0 && book.progress < 100;
  const isFinished = book.progress === 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.4 }}
        id="book-detail-modal"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-lavender-border flex flex-col md:flex-row h-[600px] text-navy-purple"
      >
        <button
          onClick={onClose}
          id="close-detail-modal-btn"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md border border-lavender-border flex items-center justify-center text-navy-purple hover:bg-lavender-card hover:scale-105 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-full md:w-1/3 bg-gradient-to-br from-lavender-bg to-white p-6 flex flex-col items-center border-b md:border-b-0 md:border-r border-lavender-border shrink-0">
          <div className="relative w-36 h-52 rounded-2xl overflow-hidden shadow-lg border border-lavender-border group mt-4">
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="mt-6 w-full space-y-2">
            <div className="flex justify-between items-center text-xs text-purple-gray-text bg-lavender-bg/50 p-2 rounded-lg">
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3"/> 조회 수</span>
              <span className="font-bold">{book.totalViews || 0}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-purple-gray-text bg-lavender-bg/50 p-2 rounded-lg">
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3"/> 페이지</span>
              <span className="font-bold">{book.pages || 0}쪽</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onLike(book.id)}
                className="flex-1 flex justify-between items-center text-xs text-brand-purple bg-lavender-bg/50 p-2 rounded-lg hover:bg-lavender-bg transition-all"
              >
                <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3"/> 좋아요</span>
                <span className="font-bold">{book.totalLikes || 0}</span>
              </button>
              <button
                onClick={() => onToggleFavorite(book.id)}
                className={`flex items-center justify-center p-2 rounded-lg transition-all ${book.isFavorite ? 'text-rose-500 bg-rose-50' : 'text-purple-gray-text bg-lavender-bg/50 hover:text-rose-500 hover:bg-rose-50'}`}
              >
                <Heart className={`w-4 h-4 ${book.isFavorite ? 'fill-rose-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-grow p-6 md:p-8 flex flex-col justify-start overflow-y-auto">
          <div className="space-y-4">
            <div>
              <h2 className="font-plus font-black text-2xl text-navy-purple tracking-tight leading-snug">{book.title}</h2>
              <p className="text-xs text-purple-gray-text mt-1 font-medium">지은이: {book.author}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-brand-purple uppercase tracking-wider">책 소개</h4>
              <p className="text-xs text-purple-gray-text leading-relaxed">{book.description}</p>
            </div>

            <div className="pt-4 border-t border-lavender-border">
              <h4 className="text-xs font-bold text-navy-purple mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-purple"/> 리뷰 ({book.reviews?.length || 0})
              </h4>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="리뷰를 작성하세요..."
                  className="flex-grow text-xs p-2 rounded-lg border border-lavender-border focus:ring-1 focus:ring-brand-purple outline-none"
                />
                <button
                  onClick={() => {
                    onAddReview(book.id, { user: '사용자', comment: newReview, date: '2026.06.25' });
                    setNewReview('');
                  }}
                  className="px-3 py-1 bg-brand-purple text-white text-xs font-bold rounded-lg hover:bg-brand-dark"
                >
                  등록
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {book.reviews?.map(review => (
                  <div key={review.id} className="flex justify-between items-start text-xs bg-lavender-bg/30 p-2 rounded-lg">
                    {editingReviewId === review.id ? (
                      <div className="flex gap-2 flex-grow">
                        <input
                          type="text"
                          value={editingComment}
                          onChange={(e) => setEditingComment(e.target.value)}
                          className="flex-grow text-xs p-1 rounded-lg border border-lavender-border focus:ring-1 focus:ring-brand-purple outline-none"
                        />
                        <button 
                          onClick={() => {
                            onUpdateReview(book.id, review.id, editingComment);
                            setEditingReviewId(null);
                          }}
                          className="text-brand-purple font-bold"
                        >
                          저장
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-navy-purple text-[10px]">{review.user}</span>
                          <p className="text-purple-gray-text">{review.comment}</p>
                        </div>
                        <div className="flex gap-2">
                          {review.user === '사용자' ? (
                            <>
                              <button onClick={() => {setEditingReviewId(review.id); setEditingComment(review.comment);}} className="text-blue-500 hover:text-blue-700">
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button onClick={() => onDeleteReview(book.id, review.id)} className="text-rose-500 hover:text-rose-700">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <button onClick={() => onReportReview(book.id, review.id)} className="text-rose-400 hover:text-rose-600">
                              <AlertTriangle className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
