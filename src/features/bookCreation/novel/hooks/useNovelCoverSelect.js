import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import { coverOptions as fallbackCoverOptions, fallbackData } from "../data/novelCoverSelectOptions";
import { createCoverPrompt, createCoverConcepts } from "../../services/aiGenerateService";
import {
  requestGenerateImage,
  extractImageUrl,
  extractAiStatus,
  extractAiMessage,
  extractCoverPrompt,
} from "../../services/imageGenerateService";
import { publishBook } from "../../../../api/bookApi";
import { splitScenesIntoPageRequests } from "../utils/novelPageSplitter";

export function useNovelCoverSelect() {
  const navigate = useNavigate();
  const location = useLocation();

  const data = location.state || fallbackData;
  const setting = data.setting || fallbackData.setting;
  const scenes = data.scenes || [];

  // 4개 그라데이션 팔레트(themeClass)는 고정으로 재활용하고, title/description만 이야기에
  // 맞춰 AI가 채운다. AI 응답이 없거나 실패하면 novelCoverSelectOptions.js의 고정값을 그대로 쓴다.
  const [coverOptions, setCoverOptions] = useState(fallbackCoverOptions);
  const [selectedCoverId, setSelectedCoverId] = useState(1);
  const [isLoadingConcepts, setIsLoadingConcepts] = useState(false);
  const [conceptFallbackNotice, setConceptFallbackNotice] = useState(false);
  const [shownConceptTitles, setShownConceptTitles] = useState([]);

  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [generatedCoverImageUrl, setGeneratedCoverImageUrl] = useState(null);
  const [coverGenerationError, setCoverGenerationError] = useState(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const isPublishingRef = useRef(false);

  const hasRequestedInitialConcepts = useRef(false);
  // isGeneratingCover(state)만으로 막으면 재렌더링 전에 온 두 번째 클릭이 새어 들어가
  // Replicate에 동시 요청 2건이 나가버린다(둘 중 하나가 429/오류로 500 응답). ref로 즉시 잠근다.
  const isGeneratingCoverRef = useRef(false);

  const selectedCover = useMemo(() => {
    return (
      coverOptions.find((cover) => cover.id === selectedCoverId) ||
      coverOptions[0]
    );
  }, [coverOptions, selectedCoverId]);

  const [title, setTitle] = useState(() => setting.storySeed || "제목 없는 소설");

  const requestCoverConcepts = async (excludeTitles) => {
    setIsLoadingConcepts(true);
    setConceptFallbackNotice(false);

    const response = await createCoverConcepts(
      { ...setting, bookType: "NOVEL" },
      { cardCount: fallbackCoverOptions.length, excludeTitles }
    );

    // Spring 응답은 { data: { result: <Python envelope> } } 형태이고,
    // Python envelope 자체의 result가 { concepts: [...] }를 담고 있다.
    const concepts = response.ok ? response.data?.data?.result?.result?.concepts : null;

    setIsLoadingConcepts(false);

    if (!Array.isArray(concepts) || concepts.length === 0) {
      setConceptFallbackNotice(true);
      if (!response.ok) {
        console.warn("CREATE_COVER_CONCEPTS failed:", response.message);
      }
      return;
    }

    const nextOptions = fallbackCoverOptions.map((base, index) => ({
      ...base,
      title: concepts[index]?.title || base.title,
      description: concepts[index]?.description || base.description,
    }));

    setCoverOptions(nextOptions);
    setShownConceptTitles((prev) => [...prev, ...nextOptions.map((option) => option.title)]);
    setSelectedCoverId(nextOptions[0].id);
  };

  useEffect(() => {
    // StrictMode 개발 모드 이중 마운트 때문에 초기 요청이 두 번 나가지 않도록 막는다.
    if (hasRequestedInitialConcepts.current) return;
    hasRequestedInitialConcepts.current = true;
    requestCoverConcepts([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegenerateConcepts = () => {
    requestCoverConcepts(shownConceptTitles);
  };

  // 소설 내부 데이터는 scene(장면) 단위로 다루고, 화면/상태 명칭도 scenes를 그대로 쓴다.
  // 공통 발행 API(BookPublishRequestDto.PageRequest)는 pages[]만 받으므로, 발행 직전 이 지점에서만
  // scenes를 pages[] 형식으로 변환한다(소설을 페이지 구조로 바꾸는 게 아니라 API 경계 호환 변환).
  // 장면 본문이 리더 한 페이지보다 길면 splitScenesIntoPageRequests가 여러 행으로 쪼개
  // pageNo가 실제 화면에 보이는 페이지 수와 일치하도록 만든다(가장 큰 글씨 기준으로 계산해
  // 글자 크기를 줄여도 잘리지 않음).
  const buildNovelPublishPayload = () => ({
    bookType: "NOVEL",
    authorAgeGroup: setting.writerLevel || "TEEN",
    readerAgeGroup: setting.writerLevel || "TEEN",
    creationMode: setting.interactionMode || "MIXED",
    title,
    description: [setting.genre, setting.protagonist].filter(Boolean).join(" · ") || title,
    confirmedSettings: JSON.stringify(setting),
    coverImageUrl: generatedCoverImageUrl,
    pages: splitScenesIntoPageRequests(scenes),
  });

  const handleConfirmCover = async () => {
    if (isPublishingRef.current) return;
    isPublishingRef.current = true;

    setIsPublishing(true);
    setPublishError(null);

    try {
      const requestBody = buildNovelPublishPayload();
      const response = await publishBook(requestBody);
      const bookId = response.data?.data?.bookId;

      navigate(BOOK_CREATION_ROUTES.NOVEL.COMPLETE, {
        state: {
          bookType: "NOVEL",
          setting,
          scenes,
          cover: selectedCover,
          coverImageUrl: generatedCoverImageUrl,
          bookId,
        },
      });
    } catch (error) {
      setPublishError(
        error.response?.data?.message || "소설 저장에 실패했습니다. 다시 시도해 주세요."
      );
    } finally {
      setIsPublishing(false);
      isPublishingRef.current = false;
    }
  };

  // 표지 프롬프트(Gemini) 생성 → 표지 이미지(Replicate) 생성 2단계로 실제 API를 호출한다.
  // DB/S3 저장은 하지 않고, 생성된 imageUrl은 이 화면의 state에만 보관해 미리보기로 표시한다.
  const handleRegenerate = async () => {
    if (isGeneratingCoverRef.current) return;
    isGeneratingCoverRef.current = true;

    setIsGeneratingCover(true);
    setCoverGenerationError(null);

    try {
      const promptState = {
        ...data,
        bookType: "NOVEL",
        images: { ...(data.images || {}) },
      };

      const promptResponse = await createCoverPrompt(promptState, {});

      if (!promptResponse.ok) {
        setCoverGenerationError(promptResponse.message || "표지 프롬프트 생성에 실패했습니다.");
        return;
      }

      const status = extractAiStatus(promptResponse.data);
      const coverPrompt = extractCoverPrompt(promptResponse.data);

      if (status !== "SUCCESS" || !coverPrompt) {
        setCoverGenerationError(
          extractAiMessage(promptResponse.data) ||
            "표지 프롬프트를 생성하지 못했습니다. 이전 단계 설정값을 확인해 주세요."
        );
        return;
      }

      // coverPrompt는 이미 Gemini가 style(장르 분위기)을 반영해 만든 완성된 영어 프롬프트이므로,
      // 이미지 생성 API에는 style을 다시 넘기지 않는다(중복 반영 및 미지원 값 400 오류 방지).
      const imageResponse = await requestGenerateImage({
        promptText: coverPrompt,
        imageType: "COVER",
        aspectRatio: "3:4",
      });

      if (!imageResponse.ok) {
        setCoverGenerationError(imageResponse.message || "표지 이미지 생성에 실패했습니다.");
        return;
      }

      const imageUrl = extractImageUrl(imageResponse.data);

      if (!imageUrl) {
        setCoverGenerationError("이미지 URL을 받지 못했습니다.");
        return;
      }

      setGeneratedCoverImageUrl(imageUrl);
    } finally {
      setIsGeneratingCover(false);
      isGeneratingCoverRef.current = false;
    }
  };

  return {
    coverOptions,
    data,
    navigate,
    setting,
    selectedCoverId,
    setSelectedCoverId,
    selectedCover,
    title,
    setTitle,
    isLoadingConcepts,
    conceptFallbackNotice,
    handleRegenerateConcepts,
    handleConfirmCover,
    handleRegenerate,
    isGeneratingCover,
    generatedCoverImageUrl,
    coverGenerationError,
    isPublishing,
    publishError,
  };
}
