import { useCallback, useEffect, useMemo, useState } from "react";
import InputSearch from "../../../components/input/input-search/input-search";
import Stats from "../../../components/stats/stats";
import Table from "../../../components/table/table";
import type { TableBody, TableHeader } from "../../../components/table/table";
import type { OrderPaymentMethod, OrderPaymentStatus, OrderStatus } from "../../../lib/types/enums.typs";
import type { OrderDetailRep, OrderRep } from "../../../services/order/order.type";
import { useExecute } from "../../../hooks/execute";
import { getOrder, advanceOrderStatus, cancelOrderAdmin, getOrderById } from "../../../services/order/order.service";
import { useToastContext } from "../../../contexts/toast-message/toast-message";
import { useModalConfirmContext } from "../../../contexts/modal-confirm/modal-confirm";

/* ─── Constants ─── */
const STATUS_TABS: { label: string; value: string }[] = [
    { label: "Tất cả", value: "" },
    { label: "Chờ xác nhận", value: "Pending" },
    { label: "Đã xác nhận", value: "Confirm" },
    { label: "Đang giao", value: "InTransit" },
    { label: "Hoàn thành", value: "Done" },
    { label: "Đã hủy", value: "Cancled" },
];

const statusText: Record<OrderStatus, string> = {
    Pending: "Chờ xác nhận", Confirm: "Đã xác nhận",
    InTransit: "Đang giao", Done: "Hoàn thành", Cancled: "Đã hủy",
};
const statusClass: Record<OrderStatus, string> = {
    Pending: "text-yellow-700 bg-yellow-100", Confirm: "text-blue-700 bg-blue-100",
    InTransit: "text-indigo-700 bg-indigo-100", Done: "text-green-700 bg-green-100",
    Cancled: "text-red-700 bg-red-100",
};
const payMethodText: Record<OrderPaymentMethod, string> = { Cod: "COD", Momo: "Momo", SePay: "SePay" };
const payStatusText: Record<OrderPaymentStatus, string> = { UnPaid: "Chưa TT", Paid: "Đã TT" };
const payStatusClass: Record<OrderPaymentStatus, string> = {
    UnPaid: "text-orange-700 bg-orange-100", Paid: "text-emerald-700 bg-emerald-100",
};
const STATUS_FLOW: Record<string, string | null> = {
    Pending: "Confirm", Confirm: "InTransit", InTransit: "Done", Done: null, Cancled: null,
};

const PAGE_SIZES = [10, 20, 50];

const formatDT = (v: Date | string) =>
    new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    }).format(new Date(v));

/* ─── Shared input/label style (matching AddProduct/AddAccount pattern) ─── */
const inputCls = "px-3 ring-1 ring-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-600 py-2 w-full text-sm";

/* ─────────────────── Order Detail Modal ─────────────────── */
const OrderDetailModal = ({
    orderId,
    onClose,
    onAdvance,
    onCancel,
}: {
    orderId: string;
    onClose: () => void;
    onAdvance: (id: string) => Promise<void>;
    onCancel: (id: string) => Promise<void>;
}) => {
    const { query, loading } = useExecute();
    const [detail, setDetail] = useState<OrderDetailRep | null>(null);

    useEffect(() => {
        query(getOrderById(orderId)).then(res => {
            if (res?.data) setDetail(res.data as unknown as OrderDetailRep);
        });
    }, [orderId]);

    const canAdvance = detail ? (detail.paymentStatus === "Paid" || detail.paymentMethod === "Cod") : false;
    const nextStatus = detail ? STATUS_FLOW[detail.status] : null;

    return (
        <div className="fixed top-0 start-0 bg-gray-800/60 w-full h-screen flex items-center justify-center px-2 md:px-0 z-50">
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
                    <h1 className="text-lg font-semibold text-blue-700">Chi tiết đơn hàng</h1>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">×</button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {loading && !detail && (
                        <div className="py-10 text-center text-sm text-gray-400">Đang tải...</div>
                    )}
                    {detail && (
                        <>
                            {/* Status row */}
                            <div className="flex gap-2 flex-wrap">
                                <span className={`px-3 py-1 rounded text-xs font-medium ${statusClass[detail.status]}`}>
                                    {statusText[detail.status]}
                                </span>
                                <span className={`px-3 py-1 rounded text-xs font-medium ${payStatusClass[detail.paymentStatus]}`}>
                                    {payMethodText[detail.paymentMethod]} · {payStatusText[detail.paymentStatus]}
                                </span>
                            </div>

                            {/* Thông tin người nhận */}
                            <div>
                                <h2 className="text-sm font-semibold text-blue-700 mb-3">Thông tin người nhận</h2>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-gray-500">Người nhận</label>
                                        <div className={inputCls + " bg-gray-50"}>{detail.recipientName}</div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-gray-500">Số điện thoại</label>
                                        <div className={inputCls + " bg-gray-50"}>{detail.recipientPhone}</div>
                                    </div>
                                    <div className="col-span-2 flex flex-col gap-1">
                                        <label className="text-xs text-gray-500">Địa chỉ</label>
                                        <div className={inputCls + " bg-gray-50"}>
                                            {detail.recipientDetail}, {detail.recipientWard}, {detail.recipientProvince}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-gray-500">Tổng tiền</label>
                                        <div className={inputCls + " bg-gray-50 font-semibold text-gray-800"}>
                                            {detail.totalAmount.toLocaleString("vi-VN")} đ
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-gray-500">Ngày tạo</label>
                                        <div className={inputCls + " bg-gray-50"}>{formatDT(detail.createdAt)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Sản phẩm */}
                            <div>
                                <h2 className="text-sm font-semibold text-blue-700 mb-3">
                                    Danh sách sản phẩm ({detail.orderItems.length})
                                </h2>
                                <div className="ring-1 ring-gray-200 rounded-lg overflow-hidden">
                                    <div className="grid grid-cols-4 px-3 py-2 bg-gray-50 text-xs font-medium text-gray-500">
                                        <div className="col-span-2">Mã sản phẩm</div>
                                        <div className="text-right">Số lượng</div>
                                        <div className="text-right">Thành tiền</div>
                                    </div>
                                    {detail.orderItems.map((item, i) => (
                                        <div key={item.id}
                                            className={`grid grid-cols-4 px-3 py-2.5 text-sm ${i % 2 === 0 ? "" : "bg-gray-50/50"} border-t border-gray-100`}>
                                            <div className="col-span-2 truncate text-xs text-gray-600 font-mono">{item.productId}</div>
                                            <div className="text-right text-gray-700">x{item.quantity}</div>
                                            <div className="text-right font-medium">{item.amount.toLocaleString("vi-VN")} đ</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Lịch sử thanh toán */}
                            {detail.checkoutHistory && (
                                <div>
                                    <h2 className="text-sm font-semibold text-blue-700 mb-3">Lịch sử thanh toán</h2>
                                    <div className="ring-1 ring-gray-200 rounded-lg px-4 py-3 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Phương thức</span>
                                            <span className="font-medium">{detail.checkoutHistory.paymentType}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Số tiền</span>
                                            <span className="font-semibold text-gray-800">{detail.checkoutHistory.amount.toLocaleString("vi-VN")} đ</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Mã giao dịch</span>
                                            <span className="text-xs font-mono text-gray-600">{detail.checkoutHistory.requestId}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Cảnh báo chưa TT */}
                            {!canAdvance && nextStatus && (
                                <div className="flex items-center gap-2 px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
                                    <i className="fa-solid fa-triangle-exclamation" />
                                    <span>Đơn chưa thanh toán — không thể chuyển sang giai đoạn tiếp theo</span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-300 flex gap-3 justify-end bg-white">
                    <button onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white ring-1 ring-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
                        Đóng
                    </button>
                    {detail && detail.status !== "Cancled" && detail.status !== "Done" && (
                        <button
                            onClick={() => onCancel(detail.id).then(onClose)}
                            className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition">
                            Hủy đơn
                        </button>
                    )}
                    {detail && nextStatus && canAdvance && (
                        <button
                            onClick={() => onAdvance(detail.id).then(onClose)}
                            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                            Chuyển: {statusText[nextStatus as OrderStatus]}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ─────────────────── Pagination ─────────────────── */
const Pagination = ({
    page, totalPages, onPageChange, pageSize, onPageSizeChange,
}: {
    page: number; totalPages: number;
    onPageChange: (p: number) => void;
    pageSize: number; onPageSizeChange: (s: number) => void;
}) => {
    const [jump, setJump] = useState("");
    if (totalPages <= 1 && pageSize === PAGE_SIZES[0]) return null;

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
                        className={`w-8 h-8 rounded border text-xs font-medium ${p === page
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
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

/* ─────────────────── Main Page ─────────────────── */
const AdminOrder = () => {
    const { query, loading } = useExecute();
    const [orders, setOrders] = useState<OrderRep[]>([]);
    const [statusFilter, setStatusFilter] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    const { showToast, showErrorResponse } = useToastContext();
    const { waitConfirm } = useModalConfirmContext();

    const fetchOrders = useCallback(async (status?: string) => {
        const res = await query<OrderRep[]>(getOrder(status || undefined));
        if (res?.data) setOrders(Array.isArray(res.data) ? res.data : []);
    }, []);

    useEffect(() => { void fetchOrders(statusFilter); }, [statusFilter]);

    /* ── Stats ── */
    const stats = useMemo(() => ({
        total: orders.length,
        totalAmount: orders.reduce((s, o) => s + o.totalAmount, 0),
        pending: orders.filter(o => o.status === "Pending").length,
        done: orders.filter(o => o.status === "Done").length,
        paid: orders.filter(o => o.paymentStatus === "Paid").length,
    }), [orders]);

    /* ── Filter (client-side: search + date) ── */
    const filtered = useMemo(() => {
        return orders.filter(o => {
            const kw = searchInput.toLowerCase();
            const matchSearch = !kw || o.id.toLowerCase().includes(kw) ||
                o.recipientName.toLowerCase().includes(kw) ||
                o.recipientPhone.includes(kw) ||
                o.accountId.toLowerCase().includes(kw);

            const orderDate = new Date(o.createdAt);
            const matchFrom = !dateFrom || orderDate >= new Date(dateFrom);
            const matchTo = !dateTo || orderDate <= new Date(dateTo + "T23:59:59");

            return matchSearch && matchFrom && matchTo;
        });
    }, [orders, searchInput, dateFrom, dateTo]);

    /* ── Pagination ── */
    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    useEffect(() => { setPage(1); }, [searchInput, dateFrom, dateTo, statusFilter]);

    /* ── Actions ── */
    const handleAdvance = async (id: string) => {
        const ok = await waitConfirm();
        if (!ok) return;
        const res = await query(advanceOrderStatus(id));
        if (res?.data) {
            showToast("Success", "Đã chuyển trạng thái đơn hàng");
            fetchOrders(statusFilter);
        } else if (res?.errors) showErrorResponse(res.errors);
    };

    const handleCancel = async (id: string) => {
        const ok = await waitConfirm();
        if (!ok) return;
        const res = await query(cancelOrderAdmin(id));
        if (res?.data) {
            showToast("Success", "Đã hủy đơn hàng");
            fetchOrders(statusFilter);
        } else if (res?.errors) showErrorResponse(res.errors);
    };

    /* ── Table ── */
    const tableHead: TableHeader = [
        "# ID", "Khách hàng", "SĐT", "Tổng tiền",
        "Thanh toán", "Trạng thái", "Ngày tạo", "Thao tác",
    ];

    const tableBody: TableBody = paginated.map(order => ([
        { reactNode: <div className="max-w-36 truncate text-xs font-mono" title={order.id}>{order.id}</div>, clipboard: order.id },
        { reactNode: <div className="max-w-36 truncate" title={order.recipientName}>{order.recipientName}</div> },
        order.recipientPhone,
        { reactNode: <span className="font-semibold text-sm">{order.totalAmount.toLocaleString("vi-VN")} đ</span> },
        {
            reactNode: (
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-500">{payMethodText[order.paymentMethod]}</span>
                    <span className={`w-fit px-2 py-0.5 rounded text-xs ${payStatusClass[order.paymentStatus]}`}>
                        {payStatusText[order.paymentStatus]}
                    </span>
                </div>
            )
        },
        { reactNode: <span className={`px-2 py-1 rounded text-xs ${statusClass[order.status]}`}>{statusText[order.status]}</span> },
        formatDT(order.createdAt),
        {
            reactNode: (
                <div className="flex items-center gap-1.5">
                    <button onClick={() => setDetailOrderId(order.id)}
                        className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-50">
                        Xem
                    </button>
                    {order.status !== "Done" && order.status !== "Cancled" && (
                        <>
                            {(order.paymentStatus === "Paid" || order.paymentMethod === "Cod") && STATUS_FLOW[order.status] && (
                                <button onClick={() => handleAdvance(order.id)}
                                    className="px-2 py-1 text-xs rounded border border-blue-300 text-blue-600 hover:bg-blue-50">
                                    Tiếp theo
                                </button>
                            )}
                            <button onClick={() => handleCancel(order.id)}
                                className="px-2 py-1 text-xs rounded border border-red-300 text-red-600 hover:bg-red-50">
                                Hủy
                            </button>
                        </>
                    )}
                </div>
            )
        },
    ]));

    return (
        <div className="px-8 pt-5 space-y-5">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-blue-700 text-2xl font-semibold">Order management</h1>
                    <p className="text-gray-500 text-sm">Quản lý đơn hàng trong hệ thống</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-5">
                <Stats icon={<i className="fa-solid fa-receipt" />} title="Tổng đơn" des={`${stats.total} đơn`} />
                <Stats icon={<i className="fa-solid fa-wallet" />} title="Doanh thu" des={`${stats.totalAmount.toLocaleString("vi-VN")} đ`} />
                <Stats icon={<i className="fa-solid fa-hourglass-half" />} iconColor="text-yellow-700" iconBg="bg-yellow-100" title="Chờ xác nhận" des={`${stats.pending} đơn`} />
                <Stats icon={<i className="fa-solid fa-circle-check" />} iconColor="text-green-700" iconBg="bg-green-100" title="Hoàn thành" des={`${stats.done} đơn`} />
                <Stats icon={<i className="fa-solid fa-money-check-dollar" />} iconColor="text-emerald-700" iconBg="bg-emerald-100" title="Đã thanh toán" des={`${stats.paid} đơn`} />
            </div>

            {/* Status filter tabs */}
            <div className="flex gap-1.5 flex-wrap">
                {STATUS_TABS.map(opt => (
                    <button key={opt.value} onClick={() => setStatusFilter(opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${statusFilter === opt.value
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 text-gray-600 hover:border-blue-400"
                            }`}>
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Toolbar: search + date */}
            <div className="flex flex-wrap items-center gap-3">
                <InputSearch searchInput={searchInput} setSearchInput={setSearchInput} opts={{ width: "w-72" }} />

                <div className="flex items-center gap-2 text-sm">
                    <label className="text-gray-500 text-xs whitespace-nowrap">Từ ngày:</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                        className="ring-1 ring-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <label className="text-gray-500 text-xs whitespace-nowrap">Đến ngày:</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                        className="ring-1 ring-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
                {(dateFrom || dateTo) && (
                    <button onClick={() => { setDateFrom(""); setDateTo(""); }}
                        className="text-xs text-gray-400 hover:text-red-500 underline">
                        Xóa lọc ngày
                    </button>
                )}

                <span className="ml-auto text-xs text-gray-400">
                    {filtered.length} đơn hàng · Trang {page}/{Math.max(totalPages, 1)}
                </span>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-10 text-gray-400 text-sm">Đang tải dữ liệu...</div>
            ) : (
                <>
                    <Table tableHead={tableHead} tableBody={tableBody} />
                    <Pagination
                        page={page} totalPages={Math.max(totalPages, 1)}
                        onPageChange={setPage}
                        pageSize={pageSize} onPageSizeChange={s => { setPageSize(s); setPage(1); }}
                    />
                </>
            )}

            {/* Detail Modal */}
            {detailOrderId && (
                <OrderDetailModal
                    orderId={detailOrderId}
                    onClose={() => setDetailOrderId(null)}
                    onAdvance={handleAdvance}
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
};

export default AdminOrder;
