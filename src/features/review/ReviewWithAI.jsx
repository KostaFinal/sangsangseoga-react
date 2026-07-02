import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, BookOpen, Trash2, Award, Sparkles, Plus, Clock, Star, Heart } from 'lucide-react';

export default function AIChatModal({ onFairyTaleCreated }) {
  // Book Reports list state (Initialized with beautiful real reports matching default books)
  const [reports, setReports] = useState([
    {
      id: 'report_1',
      bookTitle: '별이 빛나는 숲',
      bookCover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB39WyhX1GndPch_fxx0U_w2STtxNammzCcK1mQbgpf-frWT0D5Ytvcbe3gYWsGt1kv5KdG-GMAPEPJKAKogLLkoAWbNnjGWcuLdUmcnZ4NJcyefYy63AFu6Cm22b8B9Hu9OTA-TJAxUZP9L50FU90sWPwTWkD7Ul_DW6p7mKhn66z1yvG6k0m76l0weZVEhpckBx1WYFciywZymNGfdhgAoXk6xXup-D4YM878r_GGMASHuN4sI06TRr5TgECMD6Xzzw9Gjcwe1bLY',
      date: '2026. 06. 19',
      content: '길을 잃어버린 외로운 아기 고양이와 개구리가 나와서 서로 별을 밤하늘에 높이 달아주는 환상적인 이야기가 너무 슬프고 귀여웠어요! 이 책을 읽고 나니 저도 주위에 배고프거나 외로운 친구들이 생기면, 개구리 친구처럼 제 마음의 가장 반짝이는 착한 별빛 하나를 손에 쥐여주고 싶은 따끈한 감정이 무럭무럭 피어났습니다.',
      sticker: '🌟 아기별빛 도장 쾅!',
      mood: '감동적이고 소중함',
      feedback: '외로운 아기 고양이와 개구리가 나누는 별빛 우정을 너무나 사랑스럽게 표현해 주었어요. 타인에게 마음의 가장 고운 별빛 하나를 손에 쥐여주고 싶다는 지우 님의 이타적이고 사려 깊은 대목에 제 가슴도 촉촉이 달궈졌답니다! 최고의 감상서예요! 🌟'
    },
    {
      id: 'report_2',
      bookTitle: '꿈꾸는 심야 빵집',
      bookCover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI6_9o3ivagt0U0ZJhyWk8kCy6y8zQGge0rR_epJsHnAoDaUJTRODbMbk3INGzHpSouisJV6Y4L_DG1Nvajif5PIfDVzzLzXtyalNpAlPNJ9n3jvkCr3mS2LVMy3oJqWPTtXYBWOPJXZavJsN5Tm0Ozy_5MIV0hMt6fFyADARfXlazAqdfWuNHDodoUJ-Zp7uw5Gj2QIQ9iDrUKv_-BXF3iNJhxyUmZXpjWJ5YTxHeKpwoIumUKLx090wOlIdRY1rslqNke_9guV17',
      date: '2026. 06. 15',
      content: '자정 야심한 어스름 밤에만 열리는 신비의 빵집에서 크루아상을 베어 물자 마음 한구석의 서럽고 슬픈 마음이 눈 녹듯 달콤하게 녹아내렸어요. 저도 속이 쓰리거나 슬픈 날에는 엄마가 주신 따스한 모닝빵 향기가 생각나는데 주인공 마음에 가득 이입됐어요. 나중에 기회가 된다면 저도 아픈 마법을 물리치는 맛있는 쿠키 전설을 베이킹하고 싶어요!',
      sticker: '🥐 우수 보리도장 쾅!',
      mood: '포근하고 맛있음',
      feedback: '한밤의 빵집에서 번져오는 따스하고 깊은 연대의 소감을 완벽하고 조화롭게 직감하셨군요! 아픔을 물리치는 맛있는 빵의 전설을 구워내고 싶다는 지우 님의 환상적인 도전에 격려 가득한 기립 박수를 보냅니다! 🥐'
    }
  ]);

  // Form states to add new manual report in UI
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReportId, setEditingReportId] = useState(null);
  const [newBookTitle, setNewBookTitle] = useState('마법의 숲 이야기');
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
    setNewBookTitle('마법의 숲 이야기');
    setNewReportContent('');
    setNewReportTitleText('');
    setNewReportMood('따뜻하고 신비로움');
    setNewReportSticker('🌲 초록 숲길 도장 쾅!');
    setNewReportFeedback('');
  };

  // Form states to add new manual report in UI
  const bookMockDetails = {
    '마법의 숲 이야기': {
      title: '마법의 숲 이야기',
      author: '김나영 작가',
      category: '판타지 동화',
      coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaajwucx0MiEGBOEqlH3JWyLNBqtuRFCJv-5b5b8ZG-2NpRzq5SnaiJ4XIq_WIQpGvgrRVBHvbPoIrZqeNtVF8qWklW8bxnTO_MS0-ZN2wFIn7f2Y8tvIiAnhbGrxt3MPfbfrGkuQ5FIM4DVClC1fb1LrdK8-xXc7u4ek09EmdqZVZYi5Vf3qbzswrA4xaKVVgEaVFv_7Q2CJp2AazkjIl4z2PpwxI2h1xFh3O_jufUm-ezgdapCmEgShw0EObLmwNAkmzjVpO80-j',
      readDate: '2024.06.01',
      readingTime: '1시간 45분',
      tags: ['#용기', '#모험', '#우정'],
      sticker: '🌲 초록 숲길 도장 쾅!'
    },
    '꿈꾸는 심야 빵집': {
      title: '꿈꾸는 심야 빵집',
      author: '이온정 작가',
      category: '치유 판타지',
      coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI6_9o3ivagt0U0ZJhyWk8kCy6y8zQGge0rR_epJsHnAoDaUJTRODbMbk3INGzHpSouisJV6Y4L_DG1Nvajif5PIfDVzzLzXtyalNpAlPNJ9n3jvkCr3mS2LVMy3oJqWPTtXYBWOPJXZavJsN5Tm0Ozy_5MIV0hMt6fFyADARfXlazAqdfWuNHDodoUJ-Zp7uw5Gj2QIQ9iDrUKv_-BXF3iNJhxyUmZXpjWJ5YTxHeKpwoIumUKLx090wOlIdRY1rslqNke_9guV17',
      readDate: '2026.06.15',
      readingTime: '1시간 20분',
      tags: ['#치유', '#베이킹', '#우정'],
      sticker: '🥐 미소 크루아상 도장 쾅!'
    },
    '크리스탈 드래곤의 비밀': {
      title: '크리스탈 드래곤의 비밀',
      author: '김마법 작가',
      category: '모험 판타지',
      coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB39WyhX1GndPch_fxx0U_w2STtxNammzCcK1mQbgpf-frWT0D5Ytvcbe3gYWsGt1kv5KdG-GMAPEPJKAKogLLkoAWbNnjGWcuLdUmcnZ4NJcyefYy63AFu6Cm22b8B9Hu9OTA-TJAxUZP9L50FU90sWPwTWkD7Ul_DW6p7mKhn66z1yvG6k0m76l0weZVEhpckBx1WYFciywZymNGfdhgAoXk6xXup-D4YM878r_GGMASHuN4sI06TRr5TgECMD6Xzzw9Gjcwe1bLY',
      readDate: '2026.06.19',
      readingTime: '2시간 10분',
      tags: ['#마법', '#용기', '#비밀'],
      sticker: '🐉 루비 용기 도장 쾅!'
    },
    '별이 빛나는 숲': {
      title: '별이 빛나는 숲',
      author: '정은하 작가',
      category: '정서/우정',
      coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB39WyhX1GndPch_fxx0U_w2STtxNammzCcK1mQbgpf-frWT0D5Ytvcbe3gYWsGt1kv5KdG-GMAPEPJKAKogLLkoAWbNnjGWcuLdUmcnZ4NJcyefYy63AFu6Cm22b8B9Hu9OTA-TJAxUZP9L50FU90sWPwTWkD7Ul_DW6p7mKhn66z1yvG6k0m76l0weZVEhpckBx1WYFciywZymNGfdhgAoXk6xXup-D4YM878r_GGMASHuN4sI06TRr5TgECMD6Xzzw9Gjcwe1bLY',
      readDate: '2026.06.21',
      readingTime: '1시간 40분',
      tags: ['#마음', '#별빛', '#우정'],
      sticker: '🌟 아기별빛 도장 쾅!'
    },
    '우주 탐험대의 모험': {
      title: '우주 탐험대의 모험',
      author: '박코스모 작가',
      category: '우주 과학',
      coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPVBWqLsCBgg8PJuoJJomJC3f8OSvgE89YHcxnMWKBy4wvRvL1cZQN6QDSbPrmqpA04kfaFL2WLamfw2T7ahBXAP-9D0-TGdKVb_uoubDPsJezesu4X-K9HiU_oKXf_tB7Hy4Bok0W0ay0YbQVSQ9fXyrxDGxFAOPnnFbdoS6IibG-20KBf-1LDX2uNBWVRt8IaSkxGr-5Ju6m1k8HKa6v72K1NKdKOODyRlIvMbFo9t1A9QzUF49YmARdMrheFQYF97bn-chMLXQr',
      readDate: '2026.06.18',
      readingTime: '1시간 30분',
      tags: ['#외계인', '#우주', '#정의'],
      sticker: '🚀 우주 행성 도장 쾅!'
    },
    '구름 숲의 고래': {
      title: '구름 숲의 고래',
      author: '백하늘 작가',
      category: '몽상 힐링',
      coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqU0q2tsuY49QpxmLW2CixftHPCOVizwH7o7_7Ql8eS8QyvIkh-LBUyb3zLgeH3yRNrc-Ivvnpy9OXaF88U0hiW70rAXtzgPDa00noBKay9Of0v33ID6x0j09bf1P47A20K63bxE5WtAZcF7CEFXP1jTVW2a1ZwDfMstqZt-AYa7QIGdFZo6jV_JHRQe2ELJ22cFSVnTiqQeyhHpxat_g-n-oljAMS0lY3_k1Il6G6RZ33oqrhr9eLDy5bnMwaYHqAYggrwnlK07cQ',
      readDate: '2026.06.20',
      readingTime: '1시간 15분',
      tags: ['#바다', '#고래', '#행복'],
      sticker: '🐳 무지개 고래 도장 쾅!'
    }
  };

  // Library book covers for selection mapping
  const bookCovers = {
    '크리스탈 드래곤의 비밀': 'https://lh3.googleusercontent.com/aida-public/AB6AXuB39WyhX1GndPch_fxx0U_w2STtxNammzCcK1mQbgpf-frWT0D5Ytvcbe3gYWsGt1kv5KdG-GMAPEPJKAKogLLkoAWbNnjGWcuLdUmcnZ4NJcyefYy63AFu6Cm22b8B9Hu9OTA-TJAxUZP9L50FU90sWPwTWkD7Ul_DW6p7mKhn66z1yvG6k0m76l0weZVEhpckBx1WYFciywZymNGfdhgAoXk6xXup-D4YM878r_GGMASHuN4sI06TRr5TgECMD6Xzzw9Gjcwe1bLY',
    '꿈꾸는 심야 빵집': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI6_9o3ivagt0U0ZJhyWk8kCy6y8zQGge0rR_epJsHnAoDaUJTRODbMbk3INGzHpSouisJV6Y4L_DG1Nvajif5PIfDVzzLzXtyalNpAlPNJ9n3jvkCr3mS2LVMy3oJqWPTtXYBWOPJXZavJsN5Tm0Ozy_5MIV0hMt6fFyADARfXlazAqdfWuNHDodoUJ-Zp7uw5Gj2QIQ9iDrUKv_-BXF3iNJhxyUmZXpjWJ5YTxHeKpwoIumUKLx090wOlIdRY1rslqNke_9guV17',
    '별이 빛나는 숲': 'https://lh3.googleusercontent.com/aida-public/AB6AXuB39WyhX1GndPch_fxx0U_w2STtxNammzCcK1mQbgpf-frWT0D5Ytvcbe3gYWsGt1kv5KdG-GMAPEPJKAKogLLkoAWbNnjGWcuLdUmcnZ4NJcyefYy63AFu6Cm22b8B9Hu9OTA-TJAxUZP9L50FU90sWPwTWkD7Ul_DW6p7mKhn66z1yvG6k0m76l0weZVEhpckBx1WYFciywZymNGfdhgAoXk6xXup-D4YM878r_GGMASHuN4sI06TRr5TgECMD6Xzzw9Gjcwe1bLY',
    '우주 탐험대의 모험': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPVBWqLsCBgg8PJuoJJomJC3f8OSvgE89YHcxnMWKBy4wvRvL1cZQN6QDSbPrmqpA04kfaFL2WLamfw2T7ahBXAP-9D0-TGdKVb_uoubDPsJezesu4X-K9HiU_oKXf_tB7Hy4Bok0W0ay0YbQVSQ9fXyrxDGxFAOPnnFbdoS6IibG-20KBf-1LDX2uNBWVRt8IaSkxGr-5Ju6m1k8HKa6v72K1NKdKOODyRlIvMbFo9t1A9QzUF49YmARdMrheFQYF97bn-chMLXQr',
    '구름 숲의 고래': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqU0q2tsuY49QpxmLW2CixftHPCOVizwH7o7_7Ql8eS8QyvIkh-LBUyb3zLgeH3yRNrc-Ivvnpy9OXaF88U0hiW70rAXtzgPDa00noBKay9Of0v33ID6x0j09bf1P47A20K63bxE5WtAZcF7CEFXP1jTVW2a1ZwDfMstqZt-AYa7QIGdFZo6jV_JHRQe2ELJ22cFSVnTiqQeyhHpxat_g-n-oljAMS0lY3_k1Il6G6RZ33oqrhr9eLDy5bnMwaYHqAYggrwnlK07cQ'
  };


  // Manual Book Report Add Callback
  const handleAddManualReport = () => {
    if (!newReportContent.trim()) return;

    const selectedDetails = bookMockDetails[newBookTitle] || bookMockDetails['마법의 숲 이야기'];

    // AI 평가 피드백이 비어 있다면 사용자 플로우의 원활한 연결을 위해 자동 생성
    let finalFeedback = newReportFeedback;
    let finalSticker = newReportSticker;
    let finalMood = newReportMood || '따뜻하고 신비로움';

    if (!finalFeedback.trim()) {
      const evaluation = evaluateBookReportContent(selectedDetails.title, newReportContent);
      finalFeedback = evaluation.feedback;
      finalSticker = evaluation.sticker;
      finalMood = evaluation.mood;
    }

    if (editingReportId) {
      setReports((prev) =>
        prev.map((r) =>
          r.id === editingReportId
            ? {
                ...r,
                bookTitle: selectedDetails.title,
                bookCover: selectedDetails.coverUrl,
                content: newReportContent,
                sticker: finalSticker,
                mood: finalMood,
                status: undefined, // 완료로 복구
                feedback: finalFeedback
              }
            : r
        )
      );
      setEditingReportId(null);
      setToastMessage("✏️ 독서록이 성공적으로 수정되어 등재되었습니다!");
    } else {
      const newReport = {
        id: `manual_${Date.now()}`,
        bookTitle: selectedDetails.title,
        bookCover: selectedDetails.coverUrl,
        date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        content: newReportContent,
        sticker: finalSticker,
        mood: finalMood,
        feedback: finalFeedback
      };
      setReports((prev) => [newReport, ...prev]);
      setToastMessage("🎉 새로운 독서록이 등재되었습니다!");
    }

    setNewReportContent('');
    setNewReportTitleText('');
    setNewReportFeedback('');
    setIsFormOpen(false);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Click temporary save
  const handleTempSave = () => {
    if (!newReportContent.trim()) return;

    const coverUrl = bookMockDetails[newBookTitle]?.coverUrl || 'https://via.placeholder.com/150';

    if (editingReportId) {
      setReports((prev) =>
        prev.map((r) =>
          r.id === editingReportId
            ? {
                ...r,
                bookTitle: newBookTitle,
                bookCover: coverUrl,
                content: newReportContent,
                status: '작성 중',
                mood: newReportMood,
                sticker: newReportSticker,
                feedback: r.feedback || newReportFeedback
              }
            : r
        )
      );
      setEditingReportId(null);
    } else {
      const tempReport = {
        id: Date.now().toString(),
        bookTitle: newBookTitle,
        bookCover: coverUrl,
        date: new Date().toLocaleDateString(),
        content: newReportContent,
        status: '작성 중',
        mood: newReportMood,
        sticker: newReportSticker,
        feedback: newReportFeedback
      };
      setReports((prev) => [tempReport, ...prev]);
    }

    setNewReportContent('');
    setNewReportTitleText('');
    setNewReportFeedback('');
    setIsFormOpen(false); // Close the form
    setToastMessage("📝 작성 중인 독후감이 임시 보관함에 안전하게 저장되었습니다!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAiEvaluation = () => {
    if (!newReportContent.trim()) {
      setToastMessage("독후감 내용을 먼저 작성해주세요!");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    
    // 현재 내용을 임시로 설정하여 평가 모달을 엽니다.
    const tempReportForEvaluation = {
      bookTitle: newBookTitle,
      content: newReportContent,
      mood: newReportMood,
      sticker: newReportSticker,
      feedback: editingReportId ? (reports.find(r => r.id === editingReportId)?.feedback || '') : newReportFeedback,
      isNew: !editingReportId
    };
    
    setSelectedReportForEdit(tempReportForEvaluation);
    setEditReportContent(newReportContent);
    setEditReportMood(newReportMood);
    setEditReportSticker(newReportSticker);
    setEditReportFeedback(tempReportForEvaluation.feedback); // 초기화 또는 기존 평가 유지
  };

  // Delete Book Report Callback
  const handleDeleteReport = (id) => {
    setReports((prev) => prev.filter(r => r.id !== id));
  };

  const handleEditReport = (report) => {
    // 임시 저장된 독후감이나 기존 독후감을 수정하기 위해 폼을 엽니다.
    setEditingReportId(report.id);
    setNewBookTitle(report.bookTitle);
    setNewReportContent(report.content);
    setNewReportMood(report.mood || '');
    setNewReportSticker(report.sticker || '');
    setNewReportFeedback(report.feedback || '');
    setIsFormOpen(true);
  };

  const evaluateBookReportContent = (bookTitle, content) => {
    const text = content.trim();
    const rawLength = text.length;
    
    if (rawLength < 10) {
      return {
        sticker: '✍️ 연필 상상 도장 쾅!',
        mood: '새내기 독서가의 다짐',
        feedback: '독후감이 조금 짧아서 아쉬워요! 책 속에서 기억에 남는 장면이나 인물, 혹은 느끼거나 배운 점을 한 줄만 더 보완해서 AI 평가를 다시 받아볼까요? 🌟'
      };
    }

    let sticker = '🌟 아기별빛 도장 쾅!';
    let mood = '포근하고 따뜻함';
    let feedback = '';

    const lower = text.toLowerCase();
    if (lower.includes('고래') || lower.includes('바다') || lower.includes('푸른이') || lower.includes('물고기')) {
      sticker = '🐳 무지개 고래 도장 쾅!';
      mood = '은하수 바다의 신비';
      feedback = `넓디넓은 푸른 바다의 물결과 은하수처럼 반짝이는 감수성이 깃든 소감입니다! 주인공 고래 '푸른이'의 마음속 고뇌에 세심히 공감하는 독자님의 고운 온기가 느껴져 뭉클해지는 독서록입니다. 🐳`;
    } else if (lower.includes('드래곤') || lower.includes('크리스탈') || lower.includes('모험') || lower.includes('우정')) {
      sticker = '🐉 루비 용기 도장 쾅!';
      mood = '불타는 용기와 모험';
      feedback = `전설 속 드래곤을 향해 모험을 펼치는 용기와 우정을 아주 생생하게 짚어주셨군요! 위기를 헤쳐나가는 대항마로 우정을 꼽아주신 지우 님의 정의로운 선함이 글 속에서 번쩍인답니다. 🐉`;
    } else if (lower.includes('빵') || lower.includes('심야') || lower.includes('크루아상') || lower.includes('버터')) {
      sticker = '🥐 미소 크루아상 도장 쾅!';
      mood = '포근하고 달콤한 치유';
      feedback = `어둠 속 자정 홀연히 피어오르는 달콤한 버터 냄새와 포근한 베이킹의 위로가 글줄 가득 녹아있네요! 타인에게 치유와 용기를 주고 싶어하는 이타적인 꿈이 오감으로 녹아들어 깊은 영감을 줍니다! 🥐`;
    } else if (lower.includes('숲') || lower.includes('나무') || lower.includes('초록') || lower.includes('꽃')) {
      sticker = '🌲 초록 숲길 도장 쾅!';
      mood = '자연의 싱그러운 온기';
      feedback = `우거진 초록 숲길을 나란히 거니는 듯한 싱그럽고 맑은 미소가 머금어지는 문학적인 표현들이 가득합니다. 자연과 조화를 이루는 소중함을 멋지게 이해해주셨어요! 🌲`;
    } else if (lower.includes('우주') || lower.includes('별') || lower.includes('달') || lower.includes('하늘')) {
      sticker = '🚀 우주 행성 도장 쾅!';
      mood = '무한한 우주의 경이로움';
      feedback = `미지의 우주 궤도를 넘나들듯 넓고 웅장한 가상 상상력이 마음껏 숨 쉬는 뛰어난 평론입니다! 캄캄함 속에서도 환하게 제 역할을 해내는 우주성처럼 빛나는 영지가 느껴집니다. ⭐`;
    } else {
      const feedbacks = [
        `책의 내용을 자신만의 독창적인 어휘와 생각으로 완벽하게 수놓은 명작 독후감입니다. 행간 하나하나마다 정성이 묻어 있어 읽는이마저 사색에 잠기게 만드는 특별한 힘이 있어요! ✨`,
        `주인공이 겪었던 슬픔과 성장에 깊숙이 매치되어 친구가 되겠다고 용기 내는 지우 님의 맑고 깨끗한 마음씨가 담긴 최우수 독서록입니다. 참 자랑스럽습니다! ⭐`,
        `어린 시절의 소중한 동심과 감각들이 독후감 문장 속에 사르르 녹아있는 감동적인 이야기로 탄생했군요. 앞으로도 따스함과 상상을 피워내는 훌륭한 독자님이 되길 바랄게요! ❤️`
      ];
      const idx = (content.length + content.charCodeAt(0)) % feedbacks.length;
      feedback = feedbacks[idx];
    }

    return { sticker, mood, feedback };
  };

  const handleOpenEditModal = (report) => {
    setSelectedReportForEdit(report);
    setEditReportContent(report.content);
    setEditReportSticker(report.sticker);
    setEditReportMood(report.mood || '');
    setEditReportFeedback(report.feedback || '');
  };

  const handleAIEvaluateEditedReport = () => {
    if (!editReportContent.trim()) {
      setToastMessage("⚠️ 소장 중인 독후감 내용을 먼저 입력해주세요!");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    // 이미 평가되었고 내용이 변경되지 않았으면 재평가 방지
    if (selectedReportForEdit.feedback && editReportContent === selectedReportForEdit.content) {
      setToastMessage("이미 AI 평가가 완료되었습니다.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsEvaluating(true);
    setTimeout(() => {
      const result = evaluateBookReportContent(selectedReportForEdit.bookTitle, editReportContent);
      setEditReportSticker(result.sticker);
      setEditReportMood(result.mood);
      setEditReportFeedback(result.feedback);
      setIsEvaluating(false);
      setToastMessage("🧙‍♂️ AI 선생님의 지혜로운 온기 평가가 적용되었습니다!");
      setTimeout(() => setToastMessage(null), 3000);
    }, 1200);
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
    <div className="w-full flex flex-col pt-1 animate-in slide-in-from-bottom-6 duration-500 select-none text-navy-purple bg-transparent">
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
                        if (bookMockDetails[title]) {
                          setNewReportSticker(bookMockDetails[title].sticker);
                        }
                      }}
                      className="w-full bg-white border border-lavender-border rounded-xl px-3 py-2 text-xs font-extrabold text-navy-purple outline-none shadow-sm cursor-pointer hover:border-brand-purple transition-all"
                    >
                      {Object.keys(bookMockDetails).map((title) => (
                        <option key={title} value={title}>
                          {title}
                        </option>
                      ))}
                    </select>

                  </div>

                  {/* Large Stylized Book Cover with Overlay Badge */}
                  <div className="my-3 flex justify-center relative">
                    <div 
                      className="w-28 h-40 rounded-xl bg-cover bg-center shadow-lg border border-lavender-border relative group overflow-hidden transition-all duration-300"
                      style={{ backgroundImage: `url('${bookMockDetails[newBookTitle]?.coverUrl || ""}')` }}
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
                      {bookMockDetails[newBookTitle]?.title}
                    </h4>
                    <p className="text-[10px] text-purple-gray-text mt-0.5 font-bold">
                      {bookMockDetails[newBookTitle]?.author}
                    </p>
                  </div>

                  {/* Pair of rounded bubbles */}
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-white border border-lavender-border rounded-xl p-2 text-center">
                      <span className="text-[9px] text-purple-gray-text block font-bold">다 읽은 날짜</span>
                      <span className="text-[10px] font-bold text-navy-purple block mt-0.5">
                        {bookMockDetails[newBookTitle]?.readDate || "2024.06.01"}
                      </span>
                    </div>
                    <div className="bg-white border border-lavender-border rounded-xl p-2 text-center">
                      <span className="text-[9px] text-purple-gray-text block font-bold">독서 시간</span>
                      <span className="text-[10px] font-bold text-navy-purple block mt-0.5">
                        {bookMockDetails[newBookTitle]?.readingTime || "1시간 45분"}
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
                onClick={() => handleEditReport(report)}
                className="bg-white rounded-2xl border border-lavender-border shadow-sm p-4 hover:shadow-md transition-all flex flex-col justify-between min-h-[160px] group relative border-l-4 border-l-brand-purple cursor-pointer hover:-translate-y-0.5 duration-300"
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

                <div className="flex gap-4">
                  {/* Miniature Cover portrait */}
                  <div className="w-14 h-20 bg-cover bg-center rounded-lg shadow-md border border-lavender-border flex-shrink-0" style={{ backgroundImage: `url('${report.bookCover}')` }} />
                  
                  <div className="min-w-0 pr-6 flex flex-col justify-center">
                    <span className="text-[10px] text-brand-purple bg-brand-purple/10 border border-brand-purple/20 font-semibold px-2.5 py-0.5 rounded-full self-start">
                      {report.bookTitle}
                    </span>
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
                    독서록 상세 보기 & 수정
                  </h4>
                </div>
                <span className="text-[10px] bg-lavender-bg text-brand-purple font-bold px-3 py-1 rounded-full border border-lavender-border">
                  {selectedReportForEdit.date}
                </span>
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
                  <span>이 독후감 실시간 AI 사서 평가받기 ✨</span>
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
                      <span className="font-extrabold text-navy-purple">AI 사서의 독서 심사 결과</span>
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
                  if (selectedReportForEdit.isNew) {
                    // Create new report with AI evaluation directly!
                    const selectedDetails = bookMockDetails[newBookTitle] || bookMockDetails['마법의 숲 이야기'];
                    const newReport = {
                      id: `manual_${Date.now()}`,
                      bookTitle: selectedDetails.title,
                      bookCover: selectedDetails.coverUrl,
                      date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }),
                      content: editReportContent,
                      sticker: editReportSticker,
                      mood: editReportMood || '따뜻하고 신비로움',
                      feedback: editReportFeedback
                    };
                    setReports((prev) => [newReport, ...prev]);
                    setToastMessage("🎉 AI 평가가 포함된 새로운 독서록이 등재되었습니다!");
                    setIsFormOpen(false);
                    setNewReportContent('');
                    setNewReportFeedback('');
                  } else {
                    // Update existing report
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
                    setToastMessage("✏️ AI 평가가 반영된 독서록이 수정되었습니다!");
                  }
                  setSelectedReportForEdit(null);
                  setTimeout(() => setToastMessage(null), 3000);
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
