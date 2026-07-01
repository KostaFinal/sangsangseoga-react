import React from 'react';
import { motion } from 'motion/react';
import { Star, BookOpen, Award, Calendar, MessageSquare, Book, Heart, BarChart2 } from 'lucide-react';

export default function MainBookshelf({ setActiveTab, onOpenCreateModal }) {
  // 책꽂이에 꽂힌 책 목록 데이터 (미니멀하고 세련된 프리미엄 화이트 감성 고정)
  const shelfBooks = [
    { 
      id: 'wishlist', 
      title: '읽고 싶은 책', 
      color: 'bg-white hover:bg-neutral-50 text-black border-gray-200 shadow-sm', 
      textColor: 'text-neutral-800', 
      icon: Star, 
      desc: '별 달기',
      coverColor: 'bg-gradient-to-br from-white via-neutral-50 to-neutral-100 text-neutral-900 border-neutral-200 shadow-[4px_16px_36px_rgba(0,0,0,0.12)]',
      pageColor: 'bg-[#fffdfa]',
      subTitle: '마음속에 담아둔 책들이 잠에서 깨어납니다.'
    },
    { 
      id: 'reading', 
      title: '읽는 중', 
      color: 'bg-white hover:bg-neutral-50 text-black border-gray-200 shadow-sm', 
      textColor: 'text-neutral-800', 
      icon: BookOpen, 
      desc: '독서 바', 
      progress: 65,
      coverColor: 'bg-gradient-to-br from-white via-neutral-50 to-neutral-100 text-neutral-900 border-neutral-200 shadow-[4px_16px_36px_rgba(0,0,0,0.12)]',
      pageColor: 'bg-[#fcfefe]',
      subTitle: '상상의 세계 속에서 이어지는 흥미진진한 여정'
    },
    { 
      id: 'finished', 
      title: '읽기 완료', 
      color: 'bg-white hover:bg-neutral-50 text-black border-gray-200 shadow-sm', 
      textColor: 'text-neutral-800', 
      icon: Award, 
      desc: '올해 완독',
      coverColor: 'bg-gradient-to-br from-white via-neutral-50 to-neutral-100 text-neutral-900 border-neutral-200 shadow-[4px_16px_36px_rgba(0,0,0,0.12)]',
      pageColor: 'bg-[#fafdfb]',
      subTitle: '지혜의 전당에 수놓인 영광스러운 기록들'
    },
    { 
      id: 'stats', 
      title: '독서 통계', 
      color: 'bg-white hover:bg-neutral-50 text-black border-gray-200 shadow-sm', 
      textColor: 'text-neutral-800', 
      icon: BarChart2, 
      desc: '통계 정원',
      coverColor: 'bg-gradient-to-br from-white via-neutral-50 to-neutral-100 text-neutral-900 border-neutral-200 shadow-[4px_16px_36px_rgba(0,0,0,0.12)]',
      pageColor: 'bg-[#f5f5f5]',
      subTitle: '지성의 성장을 비추는 마법의 별자리표'
    },
    { 
      id: 'calendar', 
      title: '독서 캘린더', 
      color: 'bg-white hover:bg-neutral-50 text-black border-gray-200 shadow-sm', 
      textColor: 'text-neutral-800', 
      icon: Calendar, 
      desc: 'MAR',
      coverColor: 'bg-gradient-to-br from-white via-neutral-50 to-neutral-100 text-neutral-900 border-neutral-200 shadow-[4px_16px_36px_rgba(0,0,0,0.12)]',
      pageColor: 'bg-[#fffbfc]',
      subTitle: '하루하루 기록된 꿈과 낭독의 마법 궤적'
    },
    { 
      id: 'ai-chat', 
      title: '독후감', 
      color: 'bg-white hover:bg-neutral-50 text-black border-gray-200 shadow-sm', 
      textColor: 'text-neutral-800', 
      icon: MessageSquare, 
      desc: 'AI 사서',
      coverColor: 'bg-gradient-to-br from-white via-neutral-50 to-neutral-100 text-neutral-900 border-neutral-200 shadow-[4px_16px_36px_rgba(0,0,0,0.12)]',
      pageColor: 'bg-[#fdfaff]',
      subTitle: '인공지능 사서와 함께 나누는 상상의 대화'
    },
    { 
      id: 'all-books', 
      title: '내가 쓴 책', 
      color: 'bg-white hover:bg-neutral-50 text-black border-gray-200 shadow-sm', 
      textColor: 'text-neutral-800', 
      icon: Book, 
      desc: '작품들',
      coverColor: 'bg-gradient-to-br from-white via-neutral-50 to-neutral-100 text-neutral-900 border-neutral-200 shadow-[4px_16px_36px_rgba(0,0,0,0.12)]',
      pageColor: 'bg-[#fffdfc]',
      subTitle: '지우의 펜 끝에서 탄생한 영원한 마법서들'
    },
    { 
      id: 'saved-author', 
      title: '관심 작가', 
      color: 'bg-white hover:bg-neutral-50 text-black border-gray-200 shadow-sm', 
      textColor: 'text-neutral-800', 
      icon: Heart, 
      desc: '찜 작가',
      coverColor: 'bg-gradient-to-br from-white via-neutral-50 to-neutral-100 text-neutral-900 border-neutral-200 shadow-[4px_16px_36px_rgba(0,0,0,0.12)]',
      pageColor: 'bg-[#fffbfe]',
      subTitle: '깊은 공감을 전하는 가상 거장들의 작업실'
    }
  ];

  // 마법의 별가루 효과 좌표 데이터
  const magicParticles = [
    { id: 1, x: -130, y: -90, delay: 0.1, size: 'text-sm' },
    { id: 2, x: 140, y: -130, delay: 0.2, size: 'text-base' },
    { id: 3, x: -160, y: 30, delay: 0.35, size: 'text-xs' },
    { id: 4, x: 150, y: 80, delay: 0.15, size: 'text-sm' },
    { id: 5, x: -60, y: -180, delay: 0.45, size: 'text-lg' },
    { id: 6, x: 100, y: 150, delay: 0.3, size: 'text-xs' },
  ];

  const handleBookClick = (book) => {
    setActiveTab(book.id);
  };

  return (
    <div className="w-full flex flex-col pt-2 animate-in fade-in duration-500 bg-transparent text-navy-purple relative" id="main-bookshelf-wrapper">
      <div className="flex flex-col w-full" id="bookshelf-workspace-area">
        
        {/* Welcome Header & Simple integrated Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-5 select-none bg-transparent" id="bookshelf-header-container">
          <div>
            <p className="text-neutral-500 text-xs font-bold mb-0.5 tracking-wide">안녕하세요, 상상이님! ✨</p>
            <h2 className="font-plus text-3xl font-extrabold text-navy-purple tracking-tight font-serif">상상이의 서재</h2>
          </div>
          <div className="flex gap-3">
            <div className="bg-white p-2.5 px-3.5 rounded-2xl shadow-sm min-w-[95px] text-center border border-lavender-border group hover:border-brand-purple/40 transition-all duration-300" id="stat-card-writing">
              <p className="text-[10px] font-bold text-neutral-400 mb-0.5">작성 중</p>
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-xl font-black text-navy-purple">3</span>
                <span className="text-[9px] text-navy-purple font-bold">권</span>
              </div>
            </div>
            <div className="bg-white p-2.5 px-3.5 rounded-2xl shadow-sm min-w-[95px] text-center border border-lavender-border group hover:border-brand-purple/40 transition-all duration-300" id="stat-card-finished">
              <p className="text-[10px] font-bold text-neutral-400 mb-0.5">완독 수</p>
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-xl font-black text-navy-purple">45</span>
                <span className="text-[9px] text-navy-purple font-bold">권</span>
              </div>
            </div>
            <div className="bg-white p-2.5 px-3.5 rounded-2xl shadow-sm min-w-[95px] text-center border border-lavender-border group hover:border-brand-purple/40 transition-all duration-300" id="stat-card-streak">
              <p className="text-[10px] font-bold text-neutral-400 mb-0.5">연속 독서</p>
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-xl font-black text-navy-purple">15</span>
                <span className="text-[9px] text-navy-purple font-bold">일</span>
              </div>
            </div>
          </div>
        </div>

        {/* Magical Bookshelf Interface */}
        <div className="relative w-full mt-3 bg-transparent" id="shelf-container">
          {/* Shelf Tab Sheet */}
          <div className="flex justify-center -mb-[1px]" id="shelf-tab-wrapper">
            <div className="bg-white text-navy-purple px-10 py-2 rounded-t-3xl border-t border-x border-lavender-border shadow-sm font-bold text-base tracking-widest z-20 select-none">
              내 서재
            </div>
          </div>

          {/* Outer Frame with elegant borders and deeper shadow for premium light mode */}
          <div className="relative bg-white rounded-3xl border-8 border-lavender-border shadow-[0_12px_40px_-15px_rgba(0,0,0,0.12)] flex items-end justify-center p-6 md:p-8 pb-4 overflow-visible h-[400px]" id="bookshelf-outer-frame">
            
            {/* Animated Books Shelf list */}
            <div className="flex items-end justify-center gap-3 md:gap-6 w-full px-4 max-w-6xl z-20" id="bookshelf-flex-row">
              {shelfBooks.map((book, idx) => {
                const Icon = book.icon;
                return (
                  <motion.div
                    key={book.id}
                    id={`bookshelf-spine-${book.id}`}
                    onClick={() => handleBookClick(book)}
                    whileHover={{ 
                      y: -24, 
                      rotateY: -12, 
                      scale: 1.04, 
                      boxShadow: '-12px 20px 40px rgba(0, 0, 0, 0.08)' 
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 19 }}
                    className="book-spine relative w-12 sm:w-16 md:w-20 rounded-md flex flex-col justify-between items-center py-6 border border-lavender-border bg-white select-none cursor-pointer transition-all border-l-[6px] border-l-neutral-300"
                    style={{ height: `${225 + idx * 6}px` }}
                  >
                    {/* Spine Header Classic Lines */}
                    <div className="absolute top-2 left-0 right-0 h-[2px] bg-neutral-200/50" />
                    <div className="absolute top-3 left-0 right-0 h-[1px] bg-neutral-200/30" />
                    <div className="absolute bottom-2 left-0 right-0 h-[2px] bg-neutral-200/50" />
                    <div className="absolute bottom-3 left-0 right-0 h-[1px] bg-neutral-200/30" />

                    {/* Spine Header Icon */}
                    <div className="flex flex-col items-center gap-1 relative z-10">
                      <Icon className="w-5 h-5 text-neutral-800 opacity-60" />
                    </div>

                    {/* Spine Vertical Title */}
                    <span className="font-extrabold tracking-tight text-xs md:text-sm text-neutral-800 vertical-text py-2 select-none relative z-10">
                      {book.title}
                    </span>

                    {/* Spine footer progress bar or metadata indicator */}
                    <div className="w-full px-2 text-center flex flex-col items-center relative z-10">
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Wooden Shelf Floor with 3D Depth, Rich Material Gradient and shadow lip */}
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-b from-[#efe9e4] to-[#ded6cf] border-t-2 border-[#d2c7be] shadow-[inset_0_4px_6px_rgba(0,0,0,0.06)] z-10 rounded-b-[18px]" id="bookshelf-wooden-floor">
              {/* Shelf highlight edge */}
              <div className="w-full h-[3px] bg-white/45 border-b border-[#cbbbaf]" />
            </div>
          </div>

          {/* Help tooltip below */}
          <div className="mt-8 flex justify-center text-neutral-400 text-xs gap-1.5 cursor-default select-none animate-pulse" id="bookshelf-instructional-tip">
          </div>
        </div>
      </div>
    </div>
  );
}
