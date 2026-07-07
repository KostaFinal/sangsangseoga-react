const BOOK_TYPES = {
  FAIRY_TALE: "FAIRY_TALE",
  NOVEL: "NOVEL",
};

const INTERACTION_MODES = new Set(["FREE", "MIXED", "CHOICE"]);
const READER_AGES = new Set([
  "PRESCHOOL",
  "LOWER_ELEMENTARY",
  "UPPER_ELEMENTARY",
  "TEEN",
  "ADULT",
]);

const FAIRY_SETTING_KEYS = [
  "storySeed",
  "pageCount",
  "protagonistName",
  "protagonistDesc",
  "backgroundPlace",
  "problem",
  "importantObject",
  "mood",
  "title",
];

const NOVEL_SETTING_KEYS = [
  "storySeed",
  "genre",
  "protagonist",
  "background",
  "conflict",
  "endingDirection",
  "mood",
  "pointOfView",
  "volume",
  "symbolItem",
  "title",
];

const EMPTY_DRAFT_PARTS = {
  outline: {},
  pages: [],
  scenes: [],
  images: {},
};

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const firstValue = (...values) => {
  const value = values.find(
    (item) => item !== undefined && item !== null && item !== ""
  );
  return value === undefined ? values[values.length - 1] : value;
};

const hasText = (value) => String(value || "").trim() !== "";

const normalizeInteractionMode = (mode) =>
  INTERACTION_MODES.has(mode) ? mode : "MIXED";

const normalizeReaderAge = (readerAge, writerLevel, fallback = "LOWER_ELEMENTARY") => {
  if (READER_AGES.has(readerAge)) return readerAge;
  if (READER_AGES.has(writerLevel)) return writerLevel;
  return fallback;
};

const pickObject = (source, keys) =>
  keys.reduce((acc, key) => {
    if (source[key] !== undefined) {
      acc[key] = source[key];
    }
    return acc;
  }, {});

const toNumberOrValue = (value) => {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? value : numberValue;
};

const splitProtagonist = (value) => {
  if (isPlainObject(value)) {
    return {
      protagonistName: firstValue(value.protagonistName, value.name, ""),
      protagonistDesc: firstValue(value.protagonistDesc, value.desc, value.description, ""),
    };
  }

  const text = String(value || "").trim();
  if (!text) {
    return {
      protagonistName: "",
      protagonistDesc: "",
    };
  }

  const [name, ...descParts] = text.split(/\s*[·,/-]\s*/);
  return {
    protagonistName: name || text,
    protagonistDesc: descParts.join(" ").trim(),
  };
};

const unwrapChoiceValue = (value) => {
  if (isPlainObject(value) && "value" in value) return value.value;
  return value;
};

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

const normalizeImages = (value) => (isPlainObject(value) ? value : {});

const normalizeFairySetting = (state) => {
  const fairyTaleSetting = isPlainObject(state.fairyTaleSetting)
    ? state.fairyTaleSetting
    : {};
  const selectedOptions = isPlainObject(state.selectedChoiceOptions)
    ? state.selectedChoiceOptions
    : {};
  const flat = {
    ...pickObject(state, FAIRY_SETTING_KEYS),
    storySeed: firstValue(
      state.storySeed,
      state.seed,
      unwrapChoiceValue(selectedOptions.storySeed)
    ),
    backgroundPlace: firstValue(
      state.backgroundPlace,
      state.setting,
      unwrapChoiceValue(selectedOptions.backgroundPlace)
    ),
    problem: firstValue(state.problem, state.event, unwrapChoiceValue(selectedOptions.problem)),
    mood: firstValue(state.mood, unwrapChoiceValue(selectedOptions.mood)),
    pageCount: firstValue(state.pageCount, unwrapChoiceValue(selectedOptions.pageCount)),
  };

  const protagonistSource =
    hasText(state.protagonistName) || hasText(state.protagonistDesc)
      ? {
          protagonistName: state.protagonistName,
          protagonistDesc: state.protagonistDesc,
        }
      : firstValue(
          state.protagonist,
          state.character,
          unwrapChoiceValue(selectedOptions.protagonist)
        );
  const protagonist = splitProtagonist(protagonistSource);
  const freeProtagonist = splitProtagonist(fairyTaleSetting.protagonist);

  return {
    storySeed: firstValue(fairyTaleSetting.storySeed, fairyTaleSetting.seed, flat.storySeed, ""),
    pageCount: toNumberOrValue(firstValue(fairyTaleSetting.pageCount, flat.pageCount, 12)),
    protagonistName: firstValue(
      fairyTaleSetting.protagonistName,
      protagonist.protagonistName,
      freeProtagonist.protagonistName,
      ""
    ),
    protagonistDesc: firstValue(
      fairyTaleSetting.protagonistDesc,
      protagonist.protagonistDesc,
      freeProtagonist.protagonistDesc,
      ""
    ),
    backgroundPlace: firstValue(
      fairyTaleSetting.backgroundPlace,
      fairyTaleSetting.setting,
      flat.backgroundPlace,
      ""
    ),
    problem: firstValue(fairyTaleSetting.problem, fairyTaleSetting.event, flat.problem, ""),
    importantObject: firstValue(
      fairyTaleSetting.importantObject,
      fairyTaleSetting.object,
      state.importantObject,
      ""
    ),
    mood: firstValue(fairyTaleSetting.mood, flat.mood, ""),
    title: firstValue(fairyTaleSetting.title, state.title, ""),
  };
};

const normalizeNovelChoiceMinutes = (state) => {
  const scenario = isPlainObject(state.scenario) ? state.scenario : {};
  const filters = isPlainObject(state.filters) ? state.filters : {};

  return {
    storySeed: firstValue(scenario.seed, scenario.title, ""),
    genre: firstValue(scenario.genre, filters.genre, ""),
    protagonist: firstValue(scenario.protagonist, filters.protagonist, ""),
    background: firstValue(filters.background, scenario.background, ""),
    conflict: firstValue(scenario.conflict, ""),
    ending: firstValue(filters.ending, ""),
    mood: firstValue(scenario.mood, filters.mood, ""),
  };
};

export const normalizeNovelScenarioState = (state = {}) => {
  const choiceMinutes = normalizeNovelChoiceMinutes(state);

  return {
    ...state,
    bookType: BOOK_TYPES.NOVEL,
    interactionMode: normalizeInteractionMode(state.interactionMode || "CHOICE"),
    writerLevel: state.writerLevel || "TEEN",
    minutes: {
      ...choiceMinutes,
      ...(isPlainObject(state.minutes) ? state.minutes : {}),
    },
  };
};

const normalizeNovelSetting = (state) => {
  const setting = isPlainObject(state.setting) ? state.setting : {};
  const minutes = isPlainObject(state.minutes) ? state.minutes : {};
  const directing = isPlainObject(state.directing)
    ? state.directing
    : isPlainObject(setting.directing)
      ? setting.directing
      : {};
  const choiceMinutes = normalizeNovelChoiceMinutes(state);
  const source = {
    ...choiceMinutes,
    ...setting,
    ...pickObject(state, NOVEL_SETTING_KEYS),
    ...minutes,
  };

  return {
    storySeed: firstValue(source.storySeed, source.seed, ""),
    genre: firstValue(source.genre, ""),
    protagonist: firstValue(source.protagonist, ""),
    background: firstValue(source.background, source.backgroundPlace, ""),
    conflict: firstValue(source.conflict, source.problem, ""),
    endingDirection: firstValue(source.endingDirection, source.ending, ""),
    mood: firstValue(directing.mood, source.mood, ""),
    pointOfView: firstValue(directing.pointOfView, source.pointOfView, ""),
    volume: firstValue(directing.volume, source.volume, ""),
    symbolItem: firstValue(source.symbolItem, source.importantObject, ""),
    title: firstValue(source.title, ""),
  };
};

export const toBookDraft = (state = {}) => {
  const bookType =
    state.bookType === BOOK_TYPES.NOVEL ? BOOK_TYPES.NOVEL : BOOK_TYPES.FAIRY_TALE;
  const writerLevel = state.writerLevel || (bookType === BOOK_TYPES.NOVEL ? "TEEN" : null);
  const interactionMode = normalizeInteractionMode(state.interactionMode);
  const readerAge = normalizeReaderAge(
    state.readerAge,
    writerLevel,
    bookType === BOOK_TYPES.NOVEL ? "TEEN" : "LOWER_ELEMENTARY"
  );

  return {
    bookType,
    meta: {
      interactionMode,
      writerLevel,
      readerAge,
    },
    setting:
      bookType === BOOK_TYPES.NOVEL
        ? normalizeNovelSetting(state)
        : normalizeFairySetting(state),
    outline: isPlainObject(state.outline) ? state.outline : EMPTY_DRAFT_PARTS.outline,
    pages: normalizeArray(state.pages || state.fairyTalePages),
    scenes: normalizeArray(state.scenes),
    images: normalizeImages(state.images),
  };
};

export const toAiGenerateRequest = (taskType, state = {}, extra = {}) => ({
  taskType,
  draft: toBookDraft(state),
  extra,
});
