export {
  MODES,
  AGE_OPTIONS,
  TONE_OPTIONS,
  THEME_OPTIONS,
  initialSettings,
  initialAnswers,
  HISTORY_LIMIT,
  PAGE_LIMIT,
} from './utils/essayOptions.js';

export {
  QUESTIONS,
} from './utils/essayQuestions.js';

export {
  createId,
  hasText,
  clean,
  joinText,
  smartTitle,
  polishText,
  makeOpeningEssay,
  makeGuidedParagraph,
  applyGuidedContinueNote,
  makeGuidedEssayThrough,
  getGuidedSuggestion,
  makeFreeEssay,
  makeContinuation,
  reviseSelection,
  splitPages,
  getDisplayTitle,
} from './utils/essayTextUtils.js';
