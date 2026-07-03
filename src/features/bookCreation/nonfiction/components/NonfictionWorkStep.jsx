import React from 'react';
import { short } from '../nonfictionShared.js';
import NonfictionFlowPills from './NonfictionFlowPills.jsx';
import NonfictionPageHead from './NonfictionPageHead.jsx';
import NonfictionAccordionCard from './NonfictionAccordionCard.jsx';
import NonfictionEmptyBlock from './NonfictionEmptyBlock.jsx';
import NonfictionImageCard from './NonfictionImageCard.jsx';
import NonfictionLearningCard from './NonfictionLearningCard.jsx';

export default function NonfictionWorkStep({ units, activeIndex, setActiveIndex, activeUnit, updateUnit, setModal, go, hasAnyContent }) {
  return (
    <section className="nf-card-page nf-card-unit-page">
      <NonfictionFlowPills active={3} />
      <NonfictionPageHead
        title="내용을 차근차근 완성해요"
        desc="본문을 쓰고, 필요한 이미지와 마무리를 선택해 책의 형태로 다듬어 보세요."
      />

      <div className="nf-card-unit-nav">
        {units.map((unit, index) => (
          <button type="button" key={unit.id} className={index === activeIndex ? 'active' : ''} onClick={() => setActiveIndex(index)}>
            <span>{index + 1}</span>
            <strong>{short(unit.title, 28)}</strong>
          </button>
        ))}
      </div>

      <div className="nf-card-unit-shell">
        <div className="nf-card-unit-focus">
          <div className="nf-card-unit-top">
            <div>
              <span>현재 목차 {activeIndex + 1} / {units.length}</span>
              <input value={activeUnit.title} onChange={(event) => updateUnit({ title: event.target.value }, false)} />
            </div>
          </div>

          <NonfictionAccordionCard
            title="본문 작성"
            desc="직접 쓰거나 AI 도움으로 단원 본문을 만들어요."
            open={activeUnit.opened === 'body'}
            onOpen={() => updateUnit({ opened: activeUnit.opened === 'body' ? '' : 'body' }, false)}
            actionLabel="본문 만들기"
            onAction={() => setModal('ai')}
          >
            <textarea
              className="nf-card-body-editor"
              value={activeUnit.content}
              onChange={(event) => updateUnit({ content: event.target.value }, false)}
              placeholder="본문을 직접 쓰거나, 버튼을 눌러 AI 도움을 받아 보세요."
            />
          </NonfictionAccordionCard>

          <NonfictionAccordionCard
            title="이미지"
            desc="필요한 이미지를 추가해보세요."
            open={activeUnit.opened === 'image'}
            onOpen={() => updateUnit({ opened: activeUnit.opened === 'image' ? '' : 'image' }, false)}
            actionLabel={activeUnit.image ? '이미지 삭제' : '이미지 추가'}
            onAction={() => activeUnit.image ? updateUnit({ image: null, opened: 'image' }) : setModal('image')}
          >
            {activeUnit.image ? <NonfictionImageCard image={activeUnit.image} /> : <NonfictionEmptyBlock text="이미지 추가를 누르면 AI에게 이미지 생성 요청을 보낼 수 있어요." />}
          </NonfictionAccordionCard>

          <NonfictionAccordionCard
            title="마무리"
            desc="핵심 정리, 용어 설명, 확인 질문을 본문 끝에 넣어요."
            open={activeUnit.opened === 'learning'}
            onOpen={() => updateUnit({ opened: activeUnit.opened === 'learning' ? '' : 'learning' }, false)}
            actionLabel="마무리 추가"
            onAction={() => setModal('learning')}
          >
            {activeUnit.learning ? <NonfictionLearningCard learning={activeUnit.learning} /> : <NonfictionEmptyBlock text="마무리 만들기를 누르면 단원 끝에 들어갈 학습 요소가 자동으로 만들어져요." />}
          </NonfictionAccordionCard>
        </div>

      </div>

      <div className="nf-card-bottom-actions">
        <button type="button" className="nf-card-ghost" onClick={() => go('step2')}>이전</button>
        <button type="button" className="nf-card-primary" disabled={!hasAnyContent} onClick={() => go('step4')}>미리보기로 이동</button>
      </div>
    </section>
  );
}
