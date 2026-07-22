import { useEffect, useMemo, useState } from 'react';
import {
  createPreviewPages,
  ensureLineBreaks,
  getContentBase,
  getTitleIdeas,
  joinPoemText,
} from '../utils/poemTextUtils.js';
import { generatePoem, rewritePoemSelection, toReaderAge, translatePoemContent, translatePoemTitle } from '../services/poemCreationService.js';
import { publishBook } from '../../../../api/bookApi.js';
import { mapWithConcurrency } from '../../utils/concurrency.js';
import useCreationExitGuard from '../../hooks/useCreationExitGuard.js';

// 페이지 번역 동시 요청 개수 - 너무 많이 한꺼번에 보내면 Gemini가 일시 과부하(503)를
// 낼 수 있어(실측: 11개 동시 요청 중 3개 실패) 3~4개 선에서 안전하게 맞춘다.
const TRANSLATE_CONCURRENCY = 3;

const defaultSettings = {
  mode: '',
  authorAge: '',
  topic: '',
  style: '',
  length: '',
  mood: '',
};

const defaultAnswers = {
  speaker: '',
  subject: '',
  firstScene: '',
  emotionChange: '',
  ending: '',
  requiredPhrase: '',
};

const initialPoemBody = '아직 시가 없어요.\n내용을 입력해주세요.';

const createPoem = (order = 1) => ({
  id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
  title: '아직 제목이 없어요',
  content: initialPoemBody,
  order,
  answers: { ...defaultAnswers },
  freeRequest: '',
  generationSource: '',
  coverReady: false,
  illustrationReady: false,
});

export default function usePoemCreationState({ initialView = 'step1', onGoToMyBooks, onBookComplete }) {
  const [currentView, setCurrentView] = useState(initialView);
  const [settings, setSettings] = useState(defaultSettings);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [variant, setVariant] = useState(0);
  const [poems, setPoems] = useState([createPoem(1)]);
  const [activePoem, setActivePoem] = useState(0);
  const [activePreviewPage, setActivePreviewPage] = useState(0);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationNotice, setGenerationNotice] = useState('');
  const [aiTitleIdeas, setAiTitleIdeas] = useState([]);
  const [coverImage, setCoverImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const poem = poems[activePoem] || poems[0];
  const answers = poem?.answers || defaultAnswers;
  const previewPages = useMemo(() => createPreviewPages(poems), [poems]);
  const localTitleIdeas = useMemo(() => getTitleIdeas(settings, poem), [settings, poem]);
  const titleIdeas = aiTitleIdeas.length ? aiTitleIdeas : localTitleIdeas;
  const guardedSteps = ['step2', 'step3'];

  // step3(미리보기) → step2(작업)로 되돌아가는 것은 내용을 잃지 않으므로 확인 없이 허용한다.
  const {
    showExitModal: showBackModal,
    pendingView,
    requestViewChange,
    confirmLeave: confirmBack,
    cancelLeave: cancelBack,
  } = useCreationExitGuard({
    currentView,
    setCurrentView,
    isGuardedView: (view) => guardedSteps.includes(view),
    shouldGuard: (from, to) => {
      if (from === 'step3' && to === 'step2') return false;
      return guardedSteps.includes(from);
    },
    onConfirmLeave: () => resetStep3(),
  });

  useEffect(() => {
    setActivePreviewPage((prev) => Math.min(prev, Math.max(0, previewPages.length - 1)));
  }, [previewPages.length]);

  useEffect(() => {
    setAiTitleIdeas([]);
    setGenerationNotice('');
  }, [poem?.id]);

  const updatePoem = (patch) => {
    setPoems((prev) => prev.map((item, index) => (index === activePoem ? { ...item, ...patch } : item)));
  };

  const updatePoemById = (poemId, patch) => {
    setPoems((prev) => prev.map((item) => (item.id === poemId ? { ...item, ...patch } : item)));
  };

  // 답변형 "시 만들기"/"AI 전체 재생성" — draft.setting.mode를 ANSWER로 보내 answers 기반 시 전체를 생성한다.
  const makePoem = async (nextPatch = {}, options = {}) => {
    const nextPoem = { ...poem, ...nextPatch };
    setIsGenerating(true);
    setGenerationNotice('');

    const response = await generatePoem({ settings, poem: nextPoem, isContinuation: false });

    if (!response.ok) {
      // 가짜 문장으로 대충 채우면 사용자가 이걸 진짜 결과로 착각하기 쉽다.
      // 실패했을 땐 본문을 건드리지 않고 실패했다는 것만 명확히 알린다.
      setGenerationNotice('시 생성에 실패했어요. 다시 시도해 주세요.');
      setIsGenerating(false);
      return;
    }

    const title = poem.title === '아직 제목이 없어요' ? response.title || getTitleIdeas(settings, nextPoem)[0] : poem.title;
    setAiTitleIdeas(response.titleIdeas || []);
    updatePoem({
      ...nextPatch,
      title,
      content: ensureLineBreaks(response.content),
      generationSource: options.generationSource || settings.mode || 'answer',
    });
    setVariant((v) => v + 1);
    setIsGenerating(false);
  };

  const updateCurrentPoemAnswers = (nextAnswers) => {
    updatePoem({ answers: nextAnswers });
  };

  const updateCurrentPoemFreeRequest = (freeRequest) => {
    updatePoem({ freeRequest });
  };

  // 자유형 "AI에게 요청하기" — 기존 본문이 있으면 이어쓰기(isContinuation), 없으면 새로 생성한다.
  const requestFreePoemText = async () => {
    const base = getContentBase(poem.content);
    const isContinuation = base.trim().length > 0;

    setIsGenerating(true);
    setGenerationNotice('');

    const response = await generatePoem({ settings, poem, isContinuation });

    setIsGenerating(false);

    if (!response.ok) {
      setGenerationNotice('AI 응답을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
      return { ok: false };
    }

    if (!isContinuation) {
      setAiTitleIdeas(response.titleIdeas || []);
    }

    const title = poem.title === '아직 제목이 없어요' ? response.title || getTitleIdeas(settings, poem)[0] : poem.title;
    const generatedContent = ensureLineBreaks(response.content);
    const nextContent = isContinuation ? joinPoemText(base, generatedContent) : generatedContent;

    updatePoem({
      title,
      content: nextContent,
      freeRequest: '',
      generationSource: 'free-ask',
    });
    setVariant((v) => v + 1);
    return { ok: true };
  };

  // 답변형/자유형 공용 "수정하기" — 선택된 부분만 AI로 다시 쓴다.
  const requestPoemRevision = async ({ selectedText, editRequest }) => {
    if (!selectedText.trim() || !editRequest.trim()) return { ok: false };

    setIsGenerating(true);
    setGenerationNotice('');

    const response = await rewritePoemSelection({ settings, poem, selectedText, editRequest });

    setIsGenerating(false);

    if (!response.ok || !response.revisedText) {
      setGenerationNotice('AI 응답을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
      return { ok: false };
    }

    updatePoem({ content: poem.content.replace(selectedText, ensureLineBreaks(response.revisedText)) });
    return { ok: true };
  };

  const resetStep3 = () => {
    setQuestionIndex(0);
    setPoems([createPoem(1)]);
    setActivePoem(0);
    setActivePreviewPage(0);
  };

  const addPoem = () => {
    const nextOrder = poems.length + 1;
    const next = createPoem(nextOrder);
    next.title = `새 시 ${nextOrder}`;
    setPoems((prev) => [...prev, next]);
    setActivePoem(poems.length);
    setQuestionIndex(0);
  };

  const deletePoem = () => {
    if (poems.length === 1) {
      return;
    }
    setPoems((prev) => prev
      .filter((_, index) => index !== activePoem)
      .map((item, index) => ({ ...item, order: index + 1 })));
    setActivePoem((prev) => Math.max(0, prev - 1));
  };

  const buildPublishPayload = async () => {
    const bookTitle = poems.length > 1 ? `${poems[0]?.title || '나의 시'} 외 ${poems.length - 1}편` : poems[0]?.title || '나의 시집';
    // description은 본문 발췌가 아니라 작품 소개문이다. 실제 시 내용을 그대로 잘라 넣지 않는다.
    const description = `주제: ${settings.topic || '자유 주제'} / 분위기: ${settings.mood || '자유로운 감성'} / ${settings.style || '자유시'} ${poems.length}편`;
    const readerAge = toReaderAge(settings.authorAge);

    // 페이지별로 영어 번역(content_text_en)을 채운다. 구분 페이지(content 없음)는 번역할
    // 게 없으니 건너뛴다. 한꺼번에 다 병렬로 보내면(Promise.all) 페이지가 많을 때 Gemini에
    // 요청이 몰려 503(과부하)이 났었고, 완전히 하나씩만(순차) 하면 안전하지만 너무 느리다.
    // 동시에 최대 TRANSLATE_CONCURRENCY개 페이지까지만 처리해 속도와 안정성을 같이 맞춘다.
    const pages = await mapWithConcurrency(previewPages, TRANSLATE_CONCURRENCY, async (page) => {
      const translated = await translatePoemContent(page.content, page.title);
      return {
        pageNo: page.pageNumber,
        // 같은 시가 여러 페이지로 이어질 때(isContinued)는 제목을 비우고, 각 시의 첫 페이지에만
        // 제목을 실어서 리더에서 시가 바뀌는 지점을 구분할 수 있게 한다(한 책에 시가 여러 편 있을 때 필요).
        title: page.isContinued ? null : page.title,
        titleEn: page.isContinued ? null : await translatePoemTitle(page.title),
        contentTextKo: page.content,
        contentTextEn: translated.text,
        contentFontSizeEn: translated.fontSize,
        imageUrl: null,
      };
    });

    return {
      bookType: 'POEM',
      authorAgeGroup: readerAge,
      readerAgeGroup: readerAge,
      creationMode: settings.mode === 'free' ? 'FREE' : 'ANSWER',
      title: bookTitle,
      description,
      confirmedSettings: JSON.stringify(settings),
      coverImageUrl: coverImage?.url || null,
      pages,
    };
  };

  const completeAndMove = async () => {
    setIsSaving(true);
    setSaveError('');

    let requestBody;
    let bookId;

    try {
      requestBody = await buildPublishPayload();
      const response = await publishBook(requestBody);
      bookId = response.data?.data?.bookId;
    } catch (error) {
      setSaveError(error.response?.data?.message || error.message || '책 저장에 실패했습니다. 다시 시도해 주세요.');
      setIsSaving(false);
      return;
    }

    const book = { id: bookId, title: requestBody.title, coverUrl: requestBody.coverImageUrl };
    const payload = {
      genre: 'poem',
      book,
      targetPage: 'my-library',
      targetTab: 'all-books',
      activeTab: 'all-books',
      targetComponent: 'AllBooksTab',
    };

    setIsSaving(false);
    setShowCompleteModal(false);
    onBookComplete?.(book);
    onGoToMyBooks?.(payload);

    if (typeof window !== 'undefined') {
      window.localStorage?.setItem('sangsang:my-library-active-tab', 'all-books');
      window.dispatchEvent(new CustomEvent('sangsang:book-completed', { detail: payload }));
      window.dispatchEvent(new CustomEvent('sangsang:go-to-my-books', { detail: payload }));
    }
  };


  return {
    currentView,
    setCurrentView,
    settings,
    setSettings,
    questionIndex,
    setQuestionIndex,
    variant,
    setVariant,
    poems,
    activePoem,
    setActivePoem,
    activePreviewPage,
    setActivePreviewPage,
    showBackModal,
    showCompleteModal,
    setShowCompleteModal,
    poem,
    answers,
    initialPoemBody,
    previewPages,
    titleIdeas,
    updatePoem,
    updatePoemById,
    makePoem,
    resetStep3,
    requestViewChange,
    confirmBack,
    cancelBack,
    addPoem,
    deletePoem,
    updateCurrentPoemAnswers,
    updateCurrentPoemFreeRequest,
    completeAndMove,
    isGenerating,
    generationNotice,
    requestFreePoemText,
    requestPoemRevision,
    coverImage,
    setCoverImage,
    isSaving,
    saveError,
  };
}
