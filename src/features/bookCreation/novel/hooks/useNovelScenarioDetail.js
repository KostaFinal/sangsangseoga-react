import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  fallbackScenario,
  fallbackSetupData,
  fields,
} from "../data/novelScenarioDetailOptions";

export function useNovelScenarioDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const scenario = location.state?.scenario || fallbackScenario;
  const setupData = location.state || fallbackSetupData;

  const [form, setForm] = useState({
    storySeed: scenario.storySeed || "",
    genre: scenario.genre || "",
    protagonist: scenario.protagonist || "",
    background: scenario.background || "",
    conflict: scenario.conflict || "",
    ending: scenario.ending || "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleRecommend = () => {
    setForm((prev) => ({
      ...prev,
      conflict: "주인공이 진실을 밝힐수록 자신이 사건의 일부였다는 단서를 발견한다",
      ending: "진실을 밝히지만 모든 기억을 되찾지는 못하는 여운 있는 결말",
    }));
  };

  const handleConfirm = () => {
    navigate("/bookmaker/novel/confirm", {
      state: {
        ...setupData,
        minutes: form,
      },
    });
  };

  return {
    fields,
    scenario,
    form,
    handleChange,
    handleRecommend,
    handleConfirm,
  };
}
