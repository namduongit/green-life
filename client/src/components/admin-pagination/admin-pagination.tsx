import { useState } from "react";

const PAGE_SIZES = [10, 20, 50];

type AdminPaginationProps = {
    page: number;
    totalPages: number;
    onPageChange: (p: number) => void;
    pageSize: number;
    onPageSizeChange: (s: number) => void;
    total?: number;
};

const AdminPagination = ({
    page, totalPages, onPageChange, pageSize, onPageSizeChange, total,
}: AdminPaginationProps) => {
    const [jump, setJump] = useState("");

    // Always render — only nav buttons are hidden when single page
    const showNav = totalPages > 1;

    const pages: (number | "...")[] = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i);
        else if ((i === page - 2 && i > 1) || (i === page + 2 && i < totalPages)) pages.push("...");
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 pb-1 text-sm border-t border-gray-100 mt-1">
            {/* Left: page size + count */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs">Hiển thị:</span>
                    <select
                        value={pageSize}
                        onChange={e => onPageSizeChange(Number(e.target.value))}
                        className="ring-1 ring-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / trang</option>)}
                    </select>
                </div>
                {total !== undefined && (
                    <span className="text-xs text-gray-400">
                        {total === 0 ? "Không có dữ liệu" : `Tổng ${total} bản ghi`}
                    </span>
                )}
            </div>

            {/* Center: page nav (only when multi-page) */}
            {showNav && (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPageChange(page - 1)} disabled={page <= 1}
                        className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                    >
                        <i className="fa-solid fa-chevron-left text-xs" />
                    </button>
                    {pages.map((p, i) => p === "..." ? (
                        <span key={i} className="w-8 text-center text-gray-400 text-xs">…</span>
                    ) : (
                        <button
                            key={i}
                            onClick={() => onPageChange(p as number)}
                            className={`w-8 h-8 rounded border text-xs font-medium ${p === page
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-gray-200 text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                    >
                        <i className="fa-solid fa-chevron-right text-xs" />
                    </button>
                </div>
            )}

            {/* Right: page info + jump */}
            <div className="flex items-center gap-3">
                {showNav && (
                    <span className="text-xs text-gray-400">Trang {page}/{totalPages}</span>
                )}
                {showNav && (
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500">Đến trang:</span>
                        <input
                            type="number" min={1} max={totalPages} value={jump}
                            onChange={e => setJump(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter") {
                                    const n = parseInt(jump);
                                    if (n >= 1 && n <= totalPages) { onPageChange(n); setJump(""); }
                                }
                            }}
                            className="w-14 text-xs text-center ring-1 ring-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-blue-500"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export { PAGE_SIZES };
export default AdminPagination;
