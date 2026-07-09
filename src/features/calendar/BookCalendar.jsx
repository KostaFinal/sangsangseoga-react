import React, { useMemo, useState, useEffect } from 'react';
import { Plus, Check, Trash2, X, Edit3 } from 'lucide-react';
import {
  getReadingPlans,
  createReadingPlan as createReadingPlanApi,
  updateReadingPlan as updateReadingPlanApi,
  deleteReadingPlan as deleteReadingPlanApi,
  completeReadingPlan as completeReadingPlanApi,
} from '../../api/myLibraryApi';

export default function BookCalendar({ books = [] }) {
  const today = new Date();
  const todayString = today.toISOString().slice(0, 10);

  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [readingPlans, setReadingPlans] = useState([]);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  const [form, setForm] = useState({
    bookId: '',
    targetPage: '',
    memo: ''
  });

  const [editingPlanId, setEditingPlanId] = useState(null);

  const loadReadingPlans = async () => {
    try {
      const res = await getReadingPlans();
      setReadingPlans(res.data.data || []);
    } catch (err) {
      console.error('독서 계획 조회 실패:', err);
      setReadingPlans([]);
    }
  };

  useEffect(() => {
    loadReadingPlans();
  }, []);

  const monthLabel = `${currentMonth.getFullYear()}년 ${currentMonth.getMonth() + 1}월`;

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0).getDate();
    const startDay = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDate; day++) {
      const date = new Date(year, month, day);
      days.push(date.toISOString().slice(0, 10));
    }

    return days;
  }, [currentMonth]);

  const plansByDate = readingPlans.filter(plan => plan.planDate === selectedDate);

  const moveMonth = (amount) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
  };

  const openCreateModal = () => {
    setForm({
      bookId: '',
      targetPage: '',
      memo: ''
    });
    setIsPlanModalOpen(true);
    setEditingPlanId(null);
  };

  const handleSubmitReadingPlan = async () => {
    if (!form.bookId) return;

    const payload = {
      bookId: Number(form.bookId),
      planDate: selectedDate,
      targetPage: form.targetPage ? Number(form.targetPage) : null,
      memo: form.memo
    };

    try {
      if (editingPlanId) {
        await updateReadingPlanApi(editingPlanId, payload);
      } else {
        await createReadingPlanApi(payload);
      }

      await loadReadingPlans();
      setEditingPlanId(null);
      setIsPlanModalOpen(false);
    } catch (err) {
      console.error('독서 계획 저장 실패:', err);
      alert('독서 계획 저장에 실패했습니다.');
    }
  };

  const openEditModal = (plan) => {
    setEditingPlanId(plan.planId);
    setSelectedDate(plan.planDate);
    setForm({
      bookId: plan.bookId,
      targetPage: plan.targetPage,
      memo: plan.memo
    });
    setIsPlanModalOpen(true);
  };

  const handleCompleteReadingPlan = async (planId) => {
    try {
      await completeReadingPlanApi(planId);
      await loadReadingPlans();
    } catch (err) {
      console.error('독서 계획 완료 실패:', err);
      alert('완료 처리에 실패했습니다.');
    }
  };

  const handleDeleteReadingPlan = async (planId) => {
    try {
      await deleteReadingPlanApi(planId);
      await loadReadingPlans();
    } catch (err) {
      console.error('독서 계획 삭제 실패:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-6 bg-transparent text-navy-purple pr-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 select-none">
        <div>
          <h3 className="font-plus text-xl font-black text-navy-purple">독서 계획표</h3>
          <p className="text-xs text-purple-gray-text mt-1">
            날짜별로 읽을 책과 목표 페이지를 계획해보세요.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="mr-20 flex items-center gap-1.5 bg-brand-purple hover:bg-brand-dark text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-sm cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          계획 추가
        </button>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-5">
        <div className="bg-white border border-lavender-border rounded-3xl shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => moveMonth(-1)}
              className="px-3 py-1.5 rounded-full border border-lavender-border text-xs font-bold text-purple-gray-text hover:bg-lavender-bg"
            >
              이전
            </button>

            <h4 className="font-plus font-black text-lg text-navy-purple">
              {monthLabel}
            </h4>

            <button
              onClick={() => moveMonth(1)}
              className="px-3 py-1.5 rounded-full border border-lavender-border text-xs font-bold text-purple-gray-text hover:bg-lavender-bg"
            >
              다음
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-purple-gray-text mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-14" />;
              }

              const dayNumber = Number(date.slice(-2));
              const count = readingPlans.filter(plan => plan.planDate === date).length;
              const isSelected = selectedDate === date;

              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`h-14 rounded-2xl border text-xs font-bold transition-all ${isSelected
                    ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
                    : 'bg-white text-navy-purple border-lavender-border hover:bg-lavender-bg hover:border-brand-purple/50'
                    }`}
                >
                  <div>{dayNumber}</div>
                  {count > 0 && (
                    <div className={`mt-1 text-[9px] ${isSelected ? 'text-white' : 'text-brand-purple'}`}>
                      계획 {count}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-lavender-border rounded-3xl shadow-sm p-5 min-h-[420px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-plus font-bold text-sm text-navy-purple">
                선택한 날짜의 계획
              </h4>
              <p className="text-[10px] text-purple-gray-text mt-1">{selectedDate}</p>
            </div>

            <button
              onClick={openCreateModal}
              className="text-xs font-bold text-brand-purple hover:text-brand-dark"
            >
              + 추가
            </button>
          </div>

          {plansByDate.length === 0 ? (
            <div className="h-[300px] flex flex-col items-center justify-center border border-dashed border-lavender-border rounded-2xl text-center">
              <p className="text-sm font-bold text-navy-purple">
                아직 등록된 계획이 없어요.
              </p>
              <p className="text-[10px] text-purple-gray-text mt-1">
                계획 추가 버튼으로 오늘 읽을 책을 정해보세요.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {plansByDate.map(plan => (
                <div
                  key={plan.planId}
                  className={`border rounded-2xl p-4 transition-all ${plan.isCompleted
                    ? 'bg-lavender-bg/40 border-lavender-border opacity-75'
                    : 'bg-white border-lavender-border hover:border-brand-purple/50 hover:shadow-sm'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      {plan.coverImageUrl && (
                        <img
                          src={plan.coverImageUrl}
                          alt={plan.bookTitle}
                          className="w-14 h-20 object-cover rounded-xl border border-lavender-border"
                          referrerPolicy="no-referrer"
                        />
                      )}

                      <div className="flex-1">
                        <h5 className="font-plus font-bold text-sm text-navy-purple">
                          {plan.bookTitle}
                        </h5>
                        <p className="text-[10px] text-purple-gray-text mt-1">
                          목표 페이지: {plan.targetPage || '-'}p
                        </p>
                        <p className="text-[10px] text-purple-gray-text mt-1">
                          메모: {plan.memo || '없음'}
                        </p>

                        {plan.isCompleted && (
                          <p className="text-[10px] text-green-600 font-bold mt-2">
                            완료됨
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleCompleteReadingPlan(plan.planId)}
                        disabled={plan.isCompleted}
                        className="flex items-center gap-1.5 bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 font-bold text-xs px-3 py-2 rounded-xl transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        완료
                      </button>

                      <button
                        onClick={() => openEditModal(plan)}
                        className="flex items-center gap-1.5 bg-lavender-bg text-brand-purple hover:bg-lavender-card font-bold text-xs px-3 py-2 rounded-xl transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        수정
                      </button>

                      <button
                        onClick={() => handleDeleteReadingPlan(plan.planId)}
                        className="flex items-center gap-1.5 bg-rose-50 text-rose-500 hover:bg-rose-100 font-bold text-xs px-3 py-2 rounded-xl transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        삭제
                      </button>
                    </div>
                  </div>
                  {plan.isCompleted ? (
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                      완료
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold">
                      진행중
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-lavender-border shadow-2xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h4 className="font-plus font-black text-lg text-navy-purple">
                {editingPlanId ? '독서 계획 수정' : '독서 계획 등록'}
              </h4>

              <button
                onClick={() => {
                  setEditingPlanId(null);
                  setIsPlanModalOpen(false);
                }}
                className="w-8 h-8 rounded-full border border-lavender-border flex items-center justify-center text-purple-gray-text hover:bg-lavender-bg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-purple-gray-text">책 선택</label>
                <select
                  value={form.bookId}
                  disabled={editingPlanId !== null}
                  onChange={(e) => setForm(prev => ({ ...prev, bookId: e.target.value }))}
                  className="mt-1 w-full bg-white border border-lavender-border focus:border-brand-purple rounded-xl px-3 py-2 text-xs outline-none text-navy-purple"
                >
                  <option value="">책을 선택하세요</option>
                  {books.map(book => (
                    <option key={book.id} value={book.id}>
                      {book.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-purple-gray-text">계획 날짜</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-1 w-full bg-white border border-lavender-border focus:border-brand-purple rounded-xl px-3 py-2 text-xs outline-none text-navy-purple"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-purple-gray-text">목표 페이지</label>
                <input
                  type="number"
                  value={form.targetPage}
                  onChange={(e) => setForm(prev => ({ ...prev, targetPage: e.target.value }))}
                  placeholder="예: 50"
                  className="mt-1 w-full bg-white border border-lavender-border focus:border-brand-purple rounded-xl px-3 py-2 text-xs outline-none text-navy-purple"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-purple-gray-text">메모</label>
                <textarea
                  value={form.memo}
                  onChange={(e) => setForm(prev => ({ ...prev, memo: e.target.value }))}
                  placeholder="오늘 읽을 계획을 적어보세요."
                  className="mt-1 w-full bg-white border border-lavender-border focus:border-brand-purple rounded-xl px-3 py-2 text-xs outline-none text-navy-purple resize-none h-24"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="px-4 py-2 bg-white text-brand-purple hover:bg-lavender-bg rounded-full text-xs font-bold border border-lavender-border"
              >
                취소
              </button>

              <button
                onClick={handleSubmitReadingPlan}
                disabled={!form.bookId}
                className="px-5 py-2 bg-brand-purple hover:bg-brand-dark text-white rounded-full text-xs font-bold disabled:opacity-45 transition-all"
              >
                {editingPlanId ? '저장' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}