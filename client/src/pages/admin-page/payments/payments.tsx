import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../../lib/api/api";
import { useExecute } from "../../../hooks/execute";
import InputSearch from "../../../components/input/input-search/input-search";
import Stats from "../../../components/stats/stats";
import Table from "../../../components/table/table";
import type { TableBody, TableHeader } from "../../../components/table/table";

/* ─── Types ─── */
type Transaction = {
    id: string;
    paymentType: string;
    amount: number;
    requestId: string;
    createdAt: string;
    orderId: string;
    account: { id: string; email: string } | null;
    order: {
        id: string;
        status: string;
        paymentMethod: string;
        paymentStatus: string;
        totalAmount: number;
        recipientName: string;
    } | null;
};

type PaginationInfo = { page: number; limit: number; total: number; totalPages: number };

/* ─── Constants ─── */
const PAY_TYPE_OPTIONS = [
    { label: "Tất cả", value: "" },
    { label: "Momo", value: "Momo" },
    { label: "SePay", value: "SePay" },
    { label: "COD", value: "Cod" },
];

const SORT_OPTIONS = [
    { label: "Mới nhất", value: "createdAt_desc" },
    { label: "Cũ nhất", value: "createdAt_asc" },
    { label: "Số tiền ↓", value: "amount_desc" },
    { label: "Số tiền ↑", value: "amount_asc" },
];

const PAGE_SIZES = [10, 20, 50];

const payTypeStyle: Record<string, string> = {
    Momo: "text-pink-700 bg-pink-100",
    SePay: "text-blue-700 bg-blue-100",
    Cod: "text-gray-700 bg-gray-100",
};

const orderStatusText: Record<string, string> = {
    Pending: "Chờ xác nhận", Confirm: "Đã xác nhận",
    InTransit: "Đang giao", Done: "Hoàn thành", Cancled: "Đã hủy",
};
const orderStatusClass: Record<string, string> = {
    Pending: "text-yellow-700 bg-yellow-100", Confirm: "text-blue-700 bg-blue-100",
    InTransit: "text-indigo-700 bg-indigo-100", Done: "text-green-700 bg-green-100",
    Cancled: "text-red-700 bg-red-100",
};

const formatDT = (v: string) =>
    new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    }).format(new Date(v));

/* ─── Pagination ─── */
const Pagination = ({ page, totalPages, onPageChange, pageSize, onPageSizeChange }: {
    page: number; totalPages: number;
    onPageChange: (p: number) => void;
    pageSize: number; onPageSizeChange: (s: number) => void;
}) => {
    const [jump, setJump] = useState("");
    const pages: (number | "...")[] = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i);
        else if ((i === page - 2 && i > 1) || (i === page + 2 && i < totalPages)) pages.push("...");
    }
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm">
            <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs">Hiển thị:</span>
                <select value={pageSize} onChange={e => onPageSizeChange(Number(e.target.value))}
                    className="ring-1 ring-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-blue-500">
                    {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / trang</option>)}
                </select>
            </div>
            <div className="flex items-center gap-1">
                <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">
                    <i className="fa-solid fa-chevron-left text-xs" />
                </button>
                {pages.map((p, i) => p === "..." ? (
                    <span key={i} className="w-8 text-center text-gray-400">…</span>
                ) : (
                    <button key={i} onClick={() => onPageChange(p as number)}
                        className={`w-8 h-8 rounded border text-xs font-medium ${p === page ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                        {p}
                    </button>
                ))}
                <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">
                    <i className="fa-solid fa-chevron-right text-xs" />
                </button>
            </div>
            <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">Đến trang:</span>
                <input type="number" min={1} max={totalPages} value={jump}
                    onChange={e => setJump(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { const n = parseInt(jump); if (n >= 1 && n <= totalPages) { onPageChange(n); setJump(""); } } }}
                    className="w-14 text-xs text-center ring-1 ring-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-blue-500" />
            </div>
        </div>
    );
};

/* ─── Main Page ─── */
const AdminPayments = () => {
    const { query, loading } = useExecute();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [payTypeFilter, setPayTypeFilter] = useState("");
    const [sortOption, setSortOption] = useState("createdAt_desc");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(searchInput); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const fetchTransactions = useCallback(async (
        p: number, ps: number, pt: string, sort: string, search: string
    ) => {
        const [sortBy, sortOrder] = sort.split("_");
        const params = new URLSearchParams({
            page: String(p), limit: String(ps),
            ...(pt && { paymentType: pt }),
            sortBy, sortOrder,
            ...(search && { search }),
        });
        const res = await query(api.get(`/api/payment/transactions?${params}`));
        if (res?.data) {
            const d = res.data as any;
            const items = Array.isArray(d.data) ? d.data : Array.isArray(d) ? d : [];
            const pag = d.pagination ?? { page: p, limit: ps, total: items.length, totalPages: 1 };
            setTransactions(items);
            setPagination(pag);
        }
    }, []);

    useEffect(() => {
        fetchTransactions(page, pageSize, payTypeFilter, sortOption, debouncedSearch);
    }, [page, pageSize, payTypeFilter, sortOption, debouncedSearch]);

    /* ── Stats ── */
    const stats = useMemo(() => {
        const total = pagination.total;
        const momo = transactions.filter(t => t.paymentType === "Momo").length;
        const sepay = transactions.filter(t => t.paymentType === "SePay").length;
        const totalAmt = transactions.reduce((s, t) => s + t.amount, 0);
        return { total, momo, sepay, totalAmt };
    }, [transactions, pagination]);

    /* ── Table ── */
    const tableHead: TableHeader = [
        "Mã GD", "Phương thức", "Số tiền", "Tài khoản",
        "Trạng thái đơn", "Người nhận", "Thời gian",
    ];

    const tableBody: TableBody = transactions.map(tx => ([
        { reactNode: <div className="max-w-40 truncate text-xs font-mono" title={tx.requestId}>{tx.requestId}</div>, clipboard: tx.requestId },
        {
            reactNode: (
                <span className={`px-2 py-1 rounded text-xs font-medium ${payTypeStyle[tx.paymentType] ?? "bg-gray-100 text-gray-600"}`}>
                    {tx.paymentType}
                </span>
            )
        },
        { reactNode: <span className="font-semibold text-sm">{tx.amount.toLocaleString("vi-VN")} đ</span> },
        { reactNode: <div className="max-w-44 truncate text-xs text-gray-600" title={tx.account?.email ?? ""}>{tx.account?.email ?? "—"}</div> },
        {
            reactNode: tx.order ? (
                <span className={`px-2 py-0.5 rounded text-xs ${orderStatusClass[tx.order.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {orderStatusText[tx.order.status] ?? tx.order.status}
                </span>
            ) : <span className="text-gray-400 text-xs">—</span>
        },
        { reactNode: <div className="max-w-36 truncate text-xs" title={tx.order?.recipientName ?? ""}>{tx.order?.recipientName ?? "—"}</div> },
        formatDT(tx.createdAt),
    ]));

    return (
        <div className="px-8 pt-5 space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-blue-700 text-2xl font-semibold">Cổng thanh toán</h1>
                <p className="text-gray-500 text-sm">Lịch sử giao dịch qua Momo và SePay</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-5">
                <Stats icon={<i className="fa-solid fa-receipt" />} title="Tổng giao dịch" des={`${pagination.total} GD`} />
                <Stats icon={<i className="fa-solid fa-wallet" />} title="Tổng giá trị" des={`${stats.totalAmt.toLocaleString("vi-VN")} đ`} />
                <Stats icon={<i className="fa-solid fa-m" />} iconColor="text-pink-600" iconBg="bg-pink-100" title="Momo" des={`${stats.momo} GD`} />
                <Stats icon={<i className="fa-solid fa-s" />} iconColor="text-blue-600" iconBg="bg-blue-100" title="SePay" des={`${stats.sepay} GD`} />
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                <InputSearch searchInput={searchInput} setSearchInput={setSearchInput} opts={{ width: "w-72" }} />

                {/* Payment type filter */}
                <div className="flex gap-1.5">
                    {PAY_TYPE_OPTIONS.map(opt => (
                        <button key={opt.value} onClick={() => { setPayTypeFilter(opt.value); setPage(1); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${payTypeFilter === opt.value
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-gray-300 text-gray-600 hover:border-blue-400"
                                }`}>
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Sort */}
                <div className="ring-1 ring-gray-300 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-600 ml-auto">
                    <select value={sortOption} onChange={e => { setSortOption(e.target.value); setPage(1); }}
                        className="text-sm text-gray-700 focus:outline-none bg-transparent">
                        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>

                <span className="text-xs text-gray-400 whitespace-nowrap">
                    {pagination.total} giao dịch · Trang {page}/{pagination.totalPages}
                </span>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-10 text-gray-400 text-sm">Đang tải dữ liệu...</div>
            ) : transactions.length === 0 ? (
                <div className="py-16 text-center text-gray-400 text-sm">Không có giao dịch nào</div>
            ) : (
                <>
                    <Table tableHead={tableHead} tableBody={tableBody} />
                    <Pagination
                        page={page} totalPages={Math.max(pagination.totalPages, 1)}
                        onPageChange={setPage}
                        pageSize={pageSize} onPageSizeChange={s => { setPageSize(s); setPage(1); }}
                    />
                </>
            )}
        </div>
    );
};

export default AdminPayments;
