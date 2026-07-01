const STORAGE_KEY = "sangsang_reports";

function loadReports() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveReports(reports) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

// targetType: "comment" | "book" | "author"
export function submitReport({ targetType, targetId, reason, detail }) {
  const reports = loadReports();
  reports.push({
    id: `report-${Date.now()}`,
    targetType,
    targetId,
    reason,
    detail,
    date: new Date().toISOString(),
  });
  saveReports(reports);
}

export function isReported(targetType, targetId) {
  return loadReports().some(r => r.targetType === targetType && r.targetId === targetId);
}
