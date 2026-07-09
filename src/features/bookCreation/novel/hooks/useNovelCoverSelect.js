import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { BOOK_CREATION_ROUTES } from "../../routes/bookCreationRoutePaths";
import { coverOptions, fallbackData } from "../data/novelCoverSelectOptions";
import { createCoverPrompt } from "../../services/aiGenerateService";
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

  const [selectedCoverId, setSelectedCoverId] = useState(1);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [generatedCoverImageUrl, setGeneratedCoverImageUrl] = useState(null);
  const [coverGenerationError, setCoverGenerationError] = useState(null);

  const selectedCover = useMemo(() => {
    return (
      coverOptions.find((cover) => cover.id === selectedCoverId) ||
      coverOptions[0]
    );
  }, [selectedCoverId]);

  const title = setting.storySeed || "제목 없는 소설";

  const handleConfirmCover = () => {
    const payload = {
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
    handleConfirmCover,
    handleRegenerate,
    isGeneratingCover,
    generatedCoverImageUrl,
    coverGenerationError,
  };
}
