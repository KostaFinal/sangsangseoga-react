const DEFAULT_PAGE_COUNT = 12;

const isPlainObject = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isPresent = (value) => value !== undefined && value !== null && value !== "";

const firstPresent = (...values) => values.find(isPresent);

const toArray = (value) => (Array.isArray(value) ? value : []);

const toPageCount = (value) => {
  const pageCount = Number(value);
  return Number.isFinite(pageCount) && pageCount > 0
    ? pageCount
    : DEFAULT_PAGE_COUNT;
};

const normalizeProtagonistValue = (value) => {
  if (isPlainObject(value)) {
    const protagonistName = firstPresent(
      value.protagonistName,
      value.name,
      value.title,
      value.label
    );
    const protagonistDesc = firstPresent(
      value.protagonistDesc,
      value.desc,
      value.description,
      value.summary
    );
    const protagonist = firstPresent(value.protagonist, protagonistName);

    return {
      protagonistName,
      protagonistDesc,
      protagonist,
    };
  }

  return {
    protagonistName: value,
    protagonistDesc: "",
    protagonist: value,
  };
};

const omitKeys = (data, keys) =>
  Object.fromEntries(Object.entries(data).filter(([key]) => !keys.includes(key)));

export function normalizeFairyTaleDraftState(rawData = {}, overrides = {}) {
  const raw = isPlainObject(rawData) ? rawData : {};
  const overrideData = isPlainObject(overrides) ? overrides : {};
  const merged = {
    ...raw,
    ...overrideData,
  };
  const setting = {
    ...(isPlainObject(raw.fairyTaleSetting) ? raw.fairyTaleSetting : {}),
    ...(isPlainObject(overrideData.fairyTaleSetting)
      ? overrideData.fairyTaleSetting
      : {}),
  };
  const character = firstPresent(
    setting.character,
    merged.character,
    setting.protagonist,
    merged.protagonist
  );
  const normalizedCharacter = normalizeProtagonistValue(character);
  const protagonistName = firstPresent(
    setting.protagonistName,
    merged.protagonistName,
    normalizedCharacter.protagonistName
  );
  const protagonistDesc = firstPresent(
    setting.protagonistDesc,
    merged.protagonistDesc,
    normalizedCharacter.protagonistDesc
  );
  const protagonist = firstPresent(
    setting.protagonist,
    merged.protagonist,
    normalizedCharacter.protagonist,
    protagonistName
  );
  const pageCount = toPageCount(
    firstPresent(setting.pageCount, merged.pageCount)
  );
  const creationMode = firstPresent(
    raw.creationMode,
    overrideData.creationMode,
    overrideData.interactionMode,
    merged.creationMode,
    merged.interactionMode,
    raw.interactionMode
  );
  const interactionMode = firstPresent(
    raw.interactionMode,
    overrideData.interactionMode,
    overrideData.creationMode,
    merged.interactionMode,
    merged.creationMode,
    raw.creationMode,
    creationMode
  );
  const standardSetting = {
    storySeed: firstPresent(
      setting.storySeed,
      setting.seed,
      merged.storySeed,
      merged.seed
    ) || "",
    protagonistName: protagonistName || "",
    protagonistDesc: protagonistDesc || "",
    protagonist: protagonist || "",
    backgroundPlace: firstPresent(
      setting.backgroundPlace,
      setting.setting,
      merged.backgroundPlace,
      merged.setting
    ) || "",
    problem: firstPresent(
      setting.problem,
      setting.event,
      merged.problem,
      merged.event
    ) || "",
    mood: firstPresent(setting.mood, merged.mood) || "",
    lesson: firstPresent(setting.lesson, merged.lesson) || "",
    importantObject: firstPresent(
      setting.importantObject,
      merged.importantObject
    ) || "",
    title: firstPresent(setting.title, merged.title) || "",
    pageCount,
  };

  return {
    ...omitKeys(merged, ["reader" + "Age", "reader" + "Ages"]),
    bookType: "FAIRY_TALE",
    creationMode,
    interactionMode,
    writerLevel: merged.writerLevel,
    pageCount,
    fairyTaleSetting: standardSetting,
    pagePlans: toArray(merged.pagePlans),
    fairyTalePages: toArray(merged.fairyTalePages),
    pageImages: toArray(merged.pageImages),
    previousAnswers: toArray(merged.previousAnswers),
  };
}
