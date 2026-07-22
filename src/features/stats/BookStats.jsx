import React, { useEffect, useMemo, useState } from 'react';
import {
  PieChart, Pie, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { getBookGenreLabel } from '../../shared/utils/bookGenre';

const buildCategoryData = (books = []) => {
  const counts = books.reduce((result, book) => {
    const genre = getBookGenreLabel(book);
    result[genre] = (result[genre] || 0) + 1;
    return result;
  }, {});

  const total = books.length;

  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    percent: total > 0 ? Math.round((value / total) * 100) : 0,
  }));
};

export default function BookStats({ getReadingStats, books = [] }) {
  const COLORS = ['#FF8042', '#0088FE', '#00C49F', '#FFBB28', '#8884d8', '#82ca9d'];

  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await getReadingStats();
        setStats(res.data.data);
      } catch (err) {
        console.error('독서 통계 조회 실패:', err);
      }
    };

    loadStats();
  }, [getReadingStats]);

  const finishedBooks = stats?.finishedBooks || [];
  const reviewCount = stats?.reportCount || 0;

  const readCategoryData = useMemo(() => {
    const categoryStats = stats?.categoryStats || [];
    const hasGenreData = categoryStats.some(
      (item) => getBookGenreLabel(item) !== '기타'
    );

    if (!hasGenreData) {
      return buildCategoryData(
        books.filter((book) => book.progress === 100 || book.rereadCount > 0)
      );
    }

    const total = categoryStats.reduce((sum, item) => sum + item.count, 0);

    return categoryStats.map(item => ({
      name: getBookGenreLabel(item),
      value: item.count,
      percent: total > 0 ? Math.round((item.count / total) * 100) : 0
    }));
  }, [stats, books]);

  const writtenCategoryData = useMemo(() => {
    const categoryStats = stats?.writtenCategoryStats || [];
    const hasGenreData = categoryStats.some(
      (item) => getBookGenreLabel(item) !== '기타'
    );

    if (!hasGenreData) {
      return buildCategoryData(
        books.filter((book) => book.isMyWrittenBook)
      );
    }

    const total = categoryStats.reduce(
      (sum, item) => sum + item.count,
      0
    );

    return categoryStats.map(item => ({
      name: getBookGenreLabel(item),
      value: item.count,
      percent: total > 0
        ? Math.round((item.count / total) * 100)
        : 0
    }));
  }, [stats, books]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white border border-lavender-border rounded-xl px-3 py-2 shadow-md text-[11px] font-bold text-navy-purple">
        <p>{data.name}</p>
        <p className="text-brand-purple">{data.percent}%</p>
      </div>
    );
  };

  const renderCategoryChart = (data, emptyText) => {
    if (data.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-xs text-purple-gray-text">
          {emptyText}
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={75}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
            label={({ name, value }) => `${name} ${value}권`}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-5 pr-24" id="bookstats-container">
      <div className="border-b border-lavender-border pb-3">
        <h2 className="text-xl font-black text-navy-purple tracking-tight">
          나의 서재 현황
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 min-h-[560px]">
        <div className="bg-white border border-lavender-border p-6 rounded-3xl shadow-sm flex flex-col">
          <div>
            <h4 className="font-bold text-sm text-navy-purple tracking-tight flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-brand-purple rounded-full inline-block" />
              선호 장르 및 카테고리 분포
              <span className="text-[10px] text-purple-gray-text font-bold ml-1">
                읽은 책 {stats?.completedBookCount || finishedBooks.length}권 · 독후감 {reviewCount}편
              </span>
            </h4>
            <p className="text-[11px] text-purple-gray-text mt-1 font-medium">
              완독한 책을 기준으로 어떤 장르를 많이 읽었는지 보여줍니다.
            </p>
          </div>

          <div className="flex-1 min-h-[430px] mt-4">
            {renderCategoryChart(readCategoryData, '아직 완독한 책이 없습니다.')}
          </div>
        </div>

        <div className="bg-white border border-lavender-border p-6 rounded-3xl shadow-sm flex flex-col">
          <div>
            <h4 className="font-bold text-sm text-navy-purple tracking-tight flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full inline-block" />
              선호 장르 및 카테고리 분포
              <span className="text-[10px] text-purple-gray-text font-bold ml-1">
                내가 쓴 책 {stats?.writtenBookCount || 0}권
              </span>
            </h4>
            <p className="text-[11px] text-purple-gray-text mt-1 font-medium">
              내가 작성한 책을 기준으로 어떤 장르를 많이 만들었는지 보여줍니다.
            </p>
          </div>

          <div className="flex-1 min-h-[430px] mt-4">
            {renderCategoryChart(writtenCategoryData, '아직 작성한 책이 없습니다.')}
          </div>
        </div>
      </div>
    </div>
  );
}
