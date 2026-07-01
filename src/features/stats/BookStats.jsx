import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { 
  Clock, BookOpen, Sparkles, Trophy, Compass, Award, CheckCircle2
} from 'lucide-react';

export default function BookStats({ books }) {
  // 1. 기본 통계 메트릭 계산
  const stats = useMemo(() => {
    let totalMinutes = 0;
    let finishedCount = 0;
    let reportsCount = 0;
    let readingCount = 0;
    let wishlistCount = 0;
    let totalPagesRead = 0;
    let totalPages = 0;
    let totalMagicScore = 0;
    let totalRating = 0;
    let ratedBooksCount = 0;

    books.forEach(b => {
      const progressPercent = b.progress || 0;
      const pages = b.pages || 0;
      
      // 독서 시간 파싱 (ex. "20분" -> 20)
      const timeMatch = b.readingTime ? b.readingTime.match(/\d+/) : null;
      const baseMinutes = timeMatch ? parseInt(timeMatch[0], 10) : 15;
      
      // 누적 읽은 시간 계산: 읽은 진척율에 비례
      const actualMinutes = Math.round(baseMinutes * (progressPercent / 100));
      totalMinutes += actualMinutes;

      totalPagesRead += Math.round(pages * (progressPercent / 100));
      totalPages += pages;

      if (progressPercent === 100) {
        finishedCount++;
        if (b.id !== 'stats_magic_book') {
          reportsCount++;
        }
      } else if (progressPercent > 0) {
        readingCount++;
      } else {
        wishlistCount++;
      }

      // 마법 레벨 파싱 (ex. "Lv. 3" -> 3)
      const levelMatch = b.magicLevel ? b.magicLevel.match(/\d+/) : null;
      const levelVal = levelMatch ? parseInt(levelMatch[0], 10) : 1;
      totalMagicScore += levelVal * (progressPercent / 100);

      // 평점 누적
      if (b.rating) {
        totalRating += b.rating;
        ratedBooksCount++;
      }
    });

    const averageProgress = books.length > 0 
      ? Math.round(books.reduce((sum, b) => sum + (b.progress || 0), 0) / books.length) 
      : 0;

    const averageRating = ratedBooksCount > 0 
      ? (totalRating / ratedBooksCount).toFixed(1) 
      : '4.8';

    return {
      totalMinutes,
      finishedCount,
      reportsCount,
      readingCount,
      wishlistCount,
      totalPagesRead,
      totalPages,
      totalMagicScore: Math.round(totalMagicScore * 10) / 10,
      averageProgress,
      averageRating
    };
  }, [books]);

  // 2. 카테고리(장르) 분포 데이터
  const categoryData = useMemo(() => {
    const counts = {};
    books.forEach(b => {
      const cat = b.category || '기타';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.keys(counts).map(name => ({
      name,
      value: counts[name]
    }));
  }, [books]);

  // 카테고리 차트 컬러 테마 (따스하고 명확한 어린이 상상 컬러)
  const COLORS = ['#FF8042', '#0088FE', '#00C49F', '#FFBB28', '#8884d8', '#82ca9d'];

  // 3. 독서 상태별 분포 데이터
  const readingStatusData = useMemo(() => {
    return [
      { status: '읽고 싶은 책', count: stats.wishlistCount },
      { status: '읽는 중', count: stats.readingCount },
      { status: '읽기 완료', count: stats.finishedCount }
    ];
  }, [stats]);

  // 4. 예쁜 맞춤형 독서 성향 추천 및 분석 코멘트
  const analysisResult = useMemo(() => {
    if (books.length === 0) {
      return {
        title: '새로운 모험의 탐험가',
        desc: '책장에 책을 담아 상상 모험을 떠날 준비를 시작해 보세요!',
        badge: '🌱 모험 시작',
        color: 'from-green-400 to-emerald-600'
      };
    }

    // 가장 많이 읽은 카테고리 상위 도출
    const catCounts = {};
    books.forEach(b => {
      catCounts[b.category] = (catCounts[b.category] || 0) + 1;
    });
    
    let favoriteCategory = '동화';
    let maxCount = 0;
    Object.keys(catCounts).forEach(cat => {
      if (catCounts[cat] > maxCount) {
        maxCount = catCounts[cat];
        favoriteCategory = cat;
      }
    });

    if (favoriteCategory === '동화' || favoriteCategory === '나만의 AI 창작') {
      return {
        title: '하늘지기 상상 요정형',
        desc: '알록달록하고 신비로운 스토리에 큰 즐거움을 느끼고 있네요! 생각 주머니가 구름처럼 넓게 펼쳐져 독창적인 이야기를 만드는 특별한 능력을 지녔습니다.',
        badge: '☁️ 구름지기 스페셜리스트',
        color: 'from-amber-400 via-orange-500 to-rose-500'
      };
    } else if (favoriteCategory === '소설') {
      return {
        title: '은하수 우주 사서형',
        desc: '구조화되고 긴장감 넘치는 흥미진진한 모험 서술을 대단히 사랑해요! 은하수 도서관의 은빛 열차 같은 몰입력 높은 사색력을 소유하고 있어요.',
        badge: '🚀 은하수 마스터',
        color: 'from-blue-500 via-indigo-500 to-purple-600'
      };
    } else if (favoriteCategory === '시') {
      return {
        title: '황금빛 이슬 음유시인형',
        desc: '짧고 감동 충만한 말 한마디 구절 속에 은하수 달빛을 가득 담아 음미하는 예술가입니다. 마음속에 영롱하게 반짝이는 별들로 아름다운 화음을 지어냅니다.',
        badge: '✨ 아기 요정 시인',
        color: 'from-fuchsia-400 to-pink-600'
      };
    } else {
      return {
        title: '포근한 바람 동반자형',
        desc: '인생의 경험과 잔잔한 민들레 씨앗 날갯짓 같은 성장을 담은 수필을 좋아해요. 일상의 작은 기쁨을 찾아내고 음미하는 대단한 지혜를 가졌군요.',
        badge: '🌿 동심 일기장 수호자',
        color: 'from-emerald-400 to-teal-600'
      };
    }
  }, [books]);

  // 완독한 도서 리스트 필터링
  const finishedBooks = useMemo(() => {
    return books.filter(b => b.progress === 100);
  }, [books]);

  return (
    <div className="space-y-5" id="bookstats-container">
      {/* Title section with typography pairing */}
      <div className="border-b border-lavender-border pb-3">
        <h2 className="text-xl font-black text-navy-purple tracking-tight font-serif">
          김지우님의 독서 통계
        </h2>
      </div>

      {/* 1. Bento Grid Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Cumulative reading minutes */}
        <div className="bg-white border border-lavender-border shadow-sm rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-purple-gray-text font-bold">누적 독서 시간</span>
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-black font-mono text-navy-purple">
              {stats.totalMinutes} <span className="text-xs font-bold text-purple-gray-text">분</span>
            </h3>
          </div>
        </div>

        {/* Card 2: Cumulative pages read */}
        <div className="bg-white border border-lavender-border shadow-sm rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-purple-gray-text font-bold">누적 읽은 페이지</span>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-black font-mono text-navy-purple">
              {stats.totalPagesRead} <span className="text-xs font-bold text-purple-gray-text">쪽</span>
            </h3>
          </div>
        </div>

        {/* Card 3: Reports count */}
        <div className="bg-white border border-lavender-border shadow-sm rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-purple-gray-text font-bold">누적 독후감 수</span>
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-black font-mono text-navy-purple">
              {stats.reportsCount} <span className="text-xs font-bold text-purple-gray-text">편</span>
            </h3>
          </div>
        </div>
      </div>

      {/* 3. Graphical Charts Row Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Card: Genre / Category Distribution Pie */}
        <div className="bg-white border border-lavender-border p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-navy-purple tracking-tight flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-brand-purple rounded-full inline-block" />
              선호 장르 및 카테고리 분포
            </h4>
            <p className="text-[11px] text-purple-gray-text mt-1 font-medium">어떤 색깔의 글들을 가장 재미있게 읽고 있는지 보여줍니다.</p>
          </div>
          
          <div className="h-48 mt-2.5 flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #eee' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-neutral-450">분석할 도서 카테고리가 비었습니다.</div>
            )}
          </div>
        </div>

        {/* Right Card: Reading Status distribution */}
        <div className="bg-white border border-lavender-border p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-navy-purple tracking-tight flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full inline-block" />
              독서 진행 상태 분포 (Reading Status)
            </h4>
            <p className="text-[11px] text-purple-gray-text mt-1 font-medium">현재 지우 님이 책장에서 탐험 중인 도서들의 독서 진척도 상태별 개수입니다.</p>
          </div>

          <div className="h-48 mt-2.5 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={readingStatusData} margin={{ top: 15, right: 10, left: -25, bottom: 5 }}>
                <XAxis dataKey="status" tick={{ fontSize: 10, fontWeight: 'bold' }} stroke="#888888" tickLine={false} />
                <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} stroke="#888888" tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8f8f8' }}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #eee' }} 
                />
                <Bar dataKey="count" fill="url(#magicGrad)" radius={[6, 6, 0, 0]} name="서적 수">
                  {readingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#f59e0b' : index === 1 ? '#0ea5e9' : '#10b981'} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="magicGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Complete Finished Books Timeline Showcase */}
      <div className="bg-white border border-lavender-border rounded-2xl p-4">
        <h4 className="font-bold text-sm text-navy-purple tracking-tight flex items-center gap-1.5 border-b border-lavender-border pb-2 mb-3">
          <Award className="w-4 h-4 text-emerald-500" />
          완독 명예의 전당 ({stats.finishedCount}권 완독)
        </h4>

        {finishedBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3" id="stats-finished-bookshelf">
            {finishedBooks.map((b) => (
              <div 
                key={b.id} 
                className="bg-white border border-lavender-border rounded-xl p-2.5 flex gap-3 items-center relative overflow-hidden hover:shadow-sm"
              >
                <div className="w-12 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0 border shadow-sm">
                  <img src={b.coverUrl} alt={b.title} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-0.5 flex-grow min-w-0">
                  <h5 className="font-bold text-xs text-navy-purple truncate font-serif">{b.title}</h5>
                  <p className="text-[9px] text-purple-gray-text truncate font-semibold">{b.author} | {b.category}</p>
                  
                  <div className="flex items-center gap-1 text-[9px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded w-max">
                    <CheckCircle2 className="w-2.5 h-2.5 text-green-500" />
                    <span>{b.finishedDate ? `${b.finishedDate} 완료` : '완독 성공!'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-neutral-450 font-medium">
            아직 책을 100% 읽어 완료한 도서가 없네요. <br />
            나만의 서가에서 책을 낭독해서 완독의 깃발을 꽂아 보세요! ✨
          </div>
        )}
      </div>
    </div>
  );
}
