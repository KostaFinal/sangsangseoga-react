import scenarioBg from "../../assets/scenario-bg.png";
import { useNovelScenarioDetail } from "../hooks/useNovelScenarioDetail";

function NovelScenarioDetailPage() {
  const {
    fields,
    scenario,
    form,
    handleChange,
    handleRecommend,
    handleConfirm,
  } = useNovelScenarioDetail();
  return (
    <div className="novel-detail-page">
      <img className="novel-detail-bg" src={scenarioBg} alt="" aria-hidden="true" />
      <div className="novel-detail-overlay" />

      <main className="novel-detail-shell">
        <p className="eyebrow">MIXED DETAIL</p>
        <h1>{scenario.title}</h1>
        <p>선택한 시나리오를 마음에 맞게 수정한 뒤 설정을 확정하세요.</p>

        <section className="detail-form-grid">
          {fields.map(([key, label]) => (
            <label key={key} className="detail-field">
              <span>{label}</span>
              <textarea
                value={form[key]}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </label>
          ))}
        </section>

        <div className="detail-actions">
          <button type="button" className="secondary" onClick={handleRecommend}>
            AI에게 다시 추천받기
          </button>
          <button type="button" onClick={handleConfirm}>
            설정 확정하기 →
          </button>
        </div>
      </main>
    </div>
  );
}

export default NovelScenarioDetailPage;



