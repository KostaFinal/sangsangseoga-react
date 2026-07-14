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

  const hasRequestedInitialConcepts = useRef(false);

  const selectedCover = useMemo(() => {
    return (
      coverOptions.find((cover) => cover.id === selectedCoverId) ||
      coverOptions[0]
    );
  }, [coverOptions, selectedCoverId]);

  const title = setting.storySeed || "제목 없는 소설";

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

  const handleConfirmCover = () => {
    const payload = {
      bookType: "NOVEL",
      setting,
      scenes,
      cover: selectedCover,
      coverImageUrl: generatedCoverImageUrl,
    };

    console.log("표지 확정 데이터:", payload);

    navigate(BOOK_CREATION_ROUTES.NOVEL.COMPLETE, {
      state: payload,
    });
  };

  // 표지 프롬프트(Gemini) 생성 → 표지 이미지(Replicate) 생성 2단계로 실제 API를 호출한다.
  // DB/S3 저장은 하지 않고, 생성된 imageUrl은 이 화면의 state에만 보관해 미리보기로 표시한다.
  const handleRegenerate = async () => {
    if (isGeneratingCover) return;

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
    isLoadingConcepts,
    conceptFallbackNotice,
    handleRegenerateConcepts,
    handleConfirmCover,
    handleRegenerate,
    isGeneratingCover,
    generatedCoverImageUrl,
    coverGenerationError,
  };
}
