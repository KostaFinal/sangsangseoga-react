import { useEffect, useState } from "react";
import { AlertTriangle, Flag, ShieldAlert } from "lucide-react";
import {
    getReceivedReports,
    getSubmittedReports,
} from "@/src/api/myLibraryApi";

const STATUS_OPTIONS = [
    { value: "", label: "전체" },
    { value: "PENDING", label: "처리 중" },
    { value: "RESOLVED", label: "조치 완료" },
    { value: "REJECTED", label: "신고 반려" },
];

const TARGET_LABELS = {
    BOOK: "책",
    COMMENT: "댓글",
};

const STATUS_LABELS = {
    PENDING: "처리 중",
    RESOLVED: "조치 완료",
    REJECTED: "신고 반려",
};

const ACTION_LABELS = {
    BOOK_HIDE: "책 비공개 처리",
    COMMENT_DELETE: "댓글 삭제",
    REPORT_REJECT: "신고 반려",
};

const REASON_LABELS = {
    SPAM: "스팸",
    ABUSE: "욕설 및 비방",
    SEXUAL: "음란성 콘텐츠",
    OTHER: "기타",
};

const formatDate = value => {
    if (!value) return "-";

    const dateTime = String(value).trim();
    const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(dateTime);
    const normalizedDateTime = hasTimezone ? dateTime : `${dateTime}Z`;
    const date = new Date(normalizedDateTime);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export default function ReportHistoryTab() {
    const [activeType, setActiveType] = useState("submitted");
    const [status, setStatus] = useState("");
    const [reports, setReports] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadReports = async () => {
            try {
                setLoading(true);
                setErrorMessage("");

                const response =
                    activeType === "submitted"
                        ? await getSubmittedReports({
                            status: status || undefined,
                            page,
                            size: 10,
                        })
                        : await getReceivedReports({
                            page,
                            size: 10,
                        });

                if (cancelled) return;

                const data = response.data?.data;

                setReports(Array.isArray(data?.items) ? data.items : []);
                setTotalCount(data?.totalCount ?? 0);
                setHasNext(Boolean(data?.hasNext));
            } catch (error) {
                if (cancelled) return;

                console.error("신고 내역 조회 실패:", error);
                setReports([]);
                setTotalCount(0);
                setHasNext(false);
                setErrorMessage("신고 내역을 불러오지 못했습니다.");
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadReports();

        return () => {
            cancelled = true;
        };
    }, [activeType, status, page]);

    const handleTypeChange = nextType => {
        setActiveType(nextType);
        setStatus("");
        setPage(1);
    };

    const handleStatusChange = event => {
        setStatus(event.target.value);
        setPage(1);
    };

    return (
        <section className="w-full pr-16 md:pr-24 text-navy-purple">
            <div className="mb-6 flex items-center gap-3">

                <div>
                    <h2 className="text-2xl font-black text-navy-purple">신고 내역</h2>

                </div>
            </div>

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex rounded-xl border border-lavender-border bg-white p-1 shadow-sm">
                    <button
                        type="button"
                        onClick={() => handleTypeChange("submitted")}
                        className={`rounded-md px-4 py-2 text-sm font-medium ${activeType === "submitted"
                            ? "bg-brand-purple text-white shadow-sm"
                            : "text-purple-gray-text hover:bg-lavender-bg hover:text-brand-purple"
                            }`}
                    >
                        신고 내역
                    </button>

                    <button
                        type="button"
                        onClick={() => handleTypeChange("received")}
                        className={`rounded-md px-4 py-2 text-sm font-medium ${activeType === "received"
                            ? "bg-brand-purple text-white shadow-sm"
                            : "text-purple-gray-text hover:bg-lavender-bg hover:text-brand-purple"
                            }`}
                    >
                        피신고 내역
                    </button>
                </div>

                {activeType === "submitted" && (
                    <select
                        value={status}
                        onChange={handleStatusChange}
                        className="rounded-xl border border-lavender-border bg-white px-3 py-2 text-sm font-medium text-navy-purple outline-none transition-colors focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/10"
                    >
                        {STATUS_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="mb-3 text-sm font-bold text-purple-gray-text">
                총 {totalCount}건
            </div>

            {loading && (
                <div className="rounded-2xl border border-lavender-border bg-white px-6 py-12 text-center text-purple-gray-text shadow-sm">
                    신고 내역을 불러오는 중입니다.
                </div>
            )}

            {!loading && errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-600">
                    {errorMessage}
                </div>
            )}

            {!loading && !errorMessage && reports.length === 0 && (
                <div className="rounded-2xl border border-lavender-border bg-white px-6 py-12 text-center shadow-sm">
                    <Flag className="mx-auto mb-3 h-9 w-9 text-brand-purple/60" />
                    <p className="font-medium text-purple-gray-text">
                        조회된 신고 내역이 없습니다.
                    </p>
                </div>
            )}

            {!loading && !errorMessage && reports.length > 0 && (
                <div className="space-y-4">
                    {reports.map(report => (
                        <article
                            key={report.reportId}
                            className="rounded-2xl border border-lavender-border bg-white p-5 shadow-sm transition-all hover:border-brand-purple/40 hover:shadow-md"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-xl bg-lavender-bg p-2">
                                        <AlertTriangle className="h-5 w-5 text-brand-purple" />
                                    </div>

                                    <div>
                                        <div className="mb-1 flex flex-wrap items-center gap-2">
                                            <span className="rounded-full bg-lavender-bg px-2.5 py-1 text-xs font-bold text-brand-purple">
                                                {TARGET_LABELS[report.targetType] ??
                                                    report.targetType}
                                            </span>

                                            <span className="rounded-full border border-lavender-border bg-white px-2.5 py-1 text-xs font-bold text-navy-purple">
                                                {STATUS_LABELS[report.status] ?? report.status}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-navy-purple">
                                            {report.targetTitle || "삭제되었거나 확인할 수 없는 대상"}
                                        </h3>

                                    </div>
                                </div>

                                <span className="text-xs font-medium text-purple-gray-text">
                                    {formatDate(report.createdAt)}
                                </span>
                            </div>

                            <div className="mt-4 grid gap-3 border-t border-lavender-border pt-4 text-sm md:grid-cols-2">
                                <div>
                                    <span className="text-purple-gray-text">신고 사유</span>
                                    <p className="mt-1 font-semibold text-navy-purple">
                                        {REASON_LABELS[report.reason] ?? report.reason}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-purple-gray-text">처리 결과</span>
                                    <p className="mt-1 font-semibold text-navy-purple">
                                        {report.actionType
                                            ? ACTION_LABELS[report.actionType] ?? report.actionType
                                            : "처리 중 입니다."}
                                    </p>
                                </div>

                                {report.reasonDetail && (
                                    <div className="md:col-span-2">
                                        <span className="text-purple-gray-text">상세 신고 내용</span>
                                        <p className="mt-1 text-navy-purple">
                                            {report.reasonDetail}
                                        </p>
                                    </div>
                                )}

                                {report.resolvedReason && (
                                    <div className="md:col-span-2">
                                        <span className="text-purple-gray-text">관리자 처리 사유</span>
                                        <p className="mt-1 text-navy-purple">
                                            {report.resolvedReason}
                                        </p>
                                    </div>
                                )}

                                {report.processedAt && (
                                    <div className="md:col-span-2">
                                        <span className="text-purple-gray-text">처리 일시</span>
                                        <p className="mt-1 text-navy-purple">
                                            {formatDate(report.processedAt)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {!loading && !errorMessage && totalCount > 0 && (
                <div className="mt-6 flex items-center justify-center gap-3">
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage(current => Math.max(1, current - 1))}
                        className="rounded-xl border border-lavender-border bg-white px-4 py-2 text-sm font-bold text-brand-purple transition-colors hover:bg-lavender-bg disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        이전
                    </button>

                    <span className="text-sm font-bold text-purple-gray-text">{page}페이지</span>

                    <button
                        type="button"
                        disabled={!hasNext}
                        onClick={() => setPage(current => current + 1)}
                        className="rounded-xl border border-lavender-border bg-white px-4 py-2 text-sm font-bold text-brand-purple transition-colors hover:bg-lavender-bg disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        다음
                    </button>
                </div>
            )}
        </section>
    );
}
