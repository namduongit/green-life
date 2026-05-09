import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useAuthContext } from "../../contexts/auth/auth";
import { useToastContext } from "../../contexts/toast-message/toast-message";
import { getOrdersByAccountId, getOrderPaymentStatus, repayOrder } from "../../services/order/order.service";
import type { OrderRep } from "../../services/order/order.type";
import { useExecute } from "../../hooks/execute";

export const OrderStatus = {
    Pending: "Pending",
    Confirmed: "Confirmed",
    InTransit: "InTransit",
    Received: "Received",
    Cancelled: "Cancelled",
} as const;

type OrderStatusKey = keyof typeof OrderStatus | "All";

/* ─────────────── Config ─────────────── */
const STATUS_META: Record<string, {
    label: string; shortLabel: string;
    color: string; badgeBg: string; badgeText: string;
    dot: string; borderAccent: string;
    sidebarActive: string;
    icon: React.ReactNode;
}> = {
    All: {
        label: "Tất cả đơn hàng", shortLabel: "Tất cả",
        color: "text-gray-700", badgeBg: "bg-gray-100", badgeText: "text-gray-600",
        dot: "bg-gray-400", borderAccent: "bg-gray-300",
        sidebarActive: "bg-gray-800 text-white",
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
    },
    Pending: {
        label: "Chờ xác nhận", shortLabel: "Chờ xác nhận",
        color: "text-amber-700", badgeBg: "bg-amber-50", badgeText: "text-amber-700",
        dot: "bg-amber-400", borderAccent: "bg-amber-400",
        sidebarActive: "bg-amber-500 text-white",
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    },
    Confirmed: {
        label: "Đã xác nhận", shortLabel: "Đã xác nhận",
        color: "text-blue-700", badgeBg: "bg-blue-50", badgeText: "text-blue-700",
        dot: "bg-blue-500", borderAccent: "bg-blue-500",
        sidebarActive: "bg-blue-600 text-white",
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    InTransit: {
        label: "Đang vận chuyển", shortLabel: "Vận chuyển",
        color: "text-orange-700", badgeBg: "bg-orange-50", badgeText: "text-orange-700",
        dot: "bg-orange-500", borderAccent: "bg-orange-500",
        sidebarActive: "bg-orange-500 text-white",
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
    },
    Received: {
        label: "Đã nhận hàng", shortLabel: "Đã nhận",
        color: "text-green-700", badgeBg: "bg-green-50", badgeText: "text-green-700",
        dot: "bg-green-500", borderAccent: "bg-green-500",
        sidebarActive: "bg-[rgb(51,102,51)] text-white",
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
    },
    Cancelled: {
        label: "Đã huỷ", shortLabel: "Đã huỷ",
        color: "text-red-700", badgeBg: "bg-red-50", badgeText: "text-red-700",
        dot: "bg-red-400", borderAccent: "bg-red-400",
        sidebarActive: "bg-red-500 text-white",
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
    },
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
    Cod: "COD",
    Momo: "MoMo",
    SePay: "Sepay",
    Online: "Online",
    Transfer: "Chuyển khoản",
};

const PAYMENT_STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
    UnPaid: { label: "Chưa thanh toán", bg: "bg-red-50 border border-red-100", text: "text-red-600" },
    Paid:   { label: "Đã thanh toán",   bg: "bg-green-50 border border-green-100", text: "text-green-700" },
};

const SIDEBAR_ORDER: OrderStatusKey[] = ["All", "Pending", "Confirmed", "InTransit", "Received", "Cancelled"];

/* ─────────────── Page ─────────────── */
const OrderPage = () => {
    const { state } = useAuthContext();
    const { showToast } = useToastContext();
    const location = useLocation();
    const navigate = useNavigate();
    const { query, loading } = useExecute();

    const getStatusFromUrl = (): OrderStatusKey => {
        const p = new URLSearchParams(location.search).get("status");
        return p === "All" || (p && p in OrderStatus) ? (p as OrderStatusKey) : "All";
    };

    const [activeStatus, setActiveStatus] = useState<OrderStatusKey>(getStatusFromUrl);
    const [orders, setOrders] = useState<OrderRep[]>([]);
    const [repayingId, setRepayingId] = useState<string | null>(null);
    const [repayQrUrl, setRepayQrUrl] = useState<string | null>(null);
    const [repayOrderId, setRepayOrderId] = useState<string | null>(null);
    const repayPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Polling 5s khi modal QR repay đang mở
    useEffect(() => {
        if (repayOrderId && repayQrUrl) {
            repayPollRef.current = setInterval(async () => {
                try {
                    const res = await getOrderPaymentStatus(repayOrderId);
                    // res.data là envelope: { statusCode, message, data: { paymentStatus }, error }
                    const paymentStatus = (res?.data as any)?.data?.paymentStatus ?? (res?.data as any)?.paymentStatus;
                    if (paymentStatus === "Paid") {
                        clearInterval(repayPollRef.current!);
                        repayPollRef.current = null;
                        setRepayQrUrl(null);
                        setRepayOrderId(null);
                        showToast("Success", "🎉 Thanh toán thành công! Đơn hàng đang được xử lý.");
                        // Reload lại danh sách đơn
                        if (state) {
                            query(getOrdersByAccountId(state.uid)).then(r => setOrders(r?.data || []));
                        }
                    }
                } catch (_) { /* ignore */ }
            }, 5000);
        }
        return () => {
            if (repayPollRef.current) {
                clearInterval(repayPollRef.current);
                repayPollRef.current = null;
            }
        };
    }, [repayOrderId, repayQrUrl]);

    const handleRepay = async (order: OrderRep) => {
        if (!state) return;
        setRepayingId(order.id);
        try {
            const res = await repayOrder(order.id, state.uid, state.email);
            // Server wraps: { statusCode, message, data: { paymentUrl }, error }
            // axios response: res.data = server envelope → res.data.data.paymentUrl
            const paymentUrl: string | undefined =
                (res?.data as any)?.data?.paymentUrl ?? (res?.data as any)?.paymentUrl;
            if (paymentUrl) {
                if (order.paymentMethod === "Momo") {
                    window.location.href = paymentUrl;
                } else {
                    // SePay → hiển thị modal QR
                    setRepayQrUrl(paymentUrl);
                    setRepayOrderId(order.id);
                }
            }
        } catch (_) { /* ignore */ }
        setRepayingId(null);
    };

    const handleStatusChange = (s: OrderStatusKey) => {
        const params = new URLSearchParams(location.search);
        params.set("status", s);
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    };

    useEffect(() => { setActiveStatus(getStatusFromUrl()); }, [location.search]);

    useEffect(() => {
        if (!state) return;
        query(getOrdersByAccountId(state.uid)).then(r => setOrders(r?.data || []));
    }, [state]);

    /* ── Unauthenticated ── */
    if (!state) {
        return (
            <div className="sm-container mx-auto py-20">
                <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[rgb(51,102,51)]">
                        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">Bạn chưa đăng nhập</h1>
                    <p className="mt-2 text-sm text-gray-500">Đăng nhập để theo dõi đơn hàng và xem lịch sử mua sắm.</p>
                    <NavLink
                        to="/auth/login"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[rgb(51,102,51)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2d7a2d]"
                    >
                        Đăng nhập ngay
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </NavLink>
                </div>
            </div>
        );
    }

    const countOf = (s: OrderStatusKey) =>
        s === "All" ? orders.length : orders.filter(o => o.status === s).length;

    const filteredOrders = activeStatus === "All"
        ? orders
        : orders.filter(o => o.status === activeStatus);

    const activeMeta = STATUS_META[activeStatus];

    return (
        <div className="pb-24 min-h-screen bg-gray-50">

            {/* ── SePay QR Repay Modal ── */}
            {repayQrUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
                        <button
                            onClick={() => { setRepayQrUrl(null); setRepayOrderId(null); }}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl leading-none"
                        >
                            ×
                        </button>
                        <div className="mb-1 text-green-600">
                            <i className="fa-solid fa-qrcode text-4xl" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800 mb-1">Thanh toán lại qua SePay</h2>
                        <p className="text-xs text-gray-500 mb-3">
                            Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử
                        </p>
                        <div className="flex justify-center mb-3">
                            <img
                                src={repayQrUrl}
                                alt="SePay QR Code"
                                className="w-56 h-56 object-contain border-2 border-green-200 rounded-xl p-1"
                            />
                        </div>
                        {repayOrderId && (
                            <p className="text-xs text-gray-400 mb-3">
                                Mã đơn hàng: <span className="font-mono text-gray-600">{repayOrderId}</span>
                            </p>
                        )}
                        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-3">
                            ⚠️ Đơn hàng sẽ tự động hủy sau 30 phút nếu chưa thanh toán
                        </p>
                        <div className="flex items-center justify-center gap-2 mb-3 text-xs text-green-600">
                            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                            Đang chờ xác nhận thanh toán...
                        </div>
                        <button
                            onClick={() => { setRepayQrUrl(null); setRepayOrderId(null); }}
                            className="w-full rounded-lg bg-green-700 px-4 py-2.5 text-white text-sm font-semibold hover:bg-green-800 transition"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            <div className="sm-container mx-auto space-y-5 py-8">

                {/* ── Header ── */}
                <div className="rounded-xl border border-gray-200 bg-white px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">GreenLife · Quản lý đơn hàng</p>
                            <h1 className="mt-0.5 text-base font-bold text-gray-800">{state.email}</h1>
                        </div>
                        <div className="flex gap-2">
                            {(["Pending", "InTransit", "Received"] as const).map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => handleStatusChange(s)}
                                    className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-center hover:border-[rgb(51,102,51)] hover:bg-green-50"
                                >
                                    <p className="text-base font-bold text-gray-800 leading-none">{countOf(s)}</p>
                                    <p className="mt-0.5 text-[10px] text-gray-500">{STATUS_META[s].shortLabel}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-5 items-start">

                    {/* ── Sidebar ── */}
                    <aside className="w-52 shrink-0 sticky top-6 space-y-3">
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                            <div className="border-b border-gray-100 px-4 py-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Trạng thái</p>
                            </div>
                            <nav className="p-2 space-y-0.5">
                                {SIDEBAR_ORDER.map(s => {
                                    const meta = STATUS_META[s];
                                    const count = countOf(s);
                                    const active = activeStatus === s;
                                    return (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => handleStatusChange(s)}
                                            className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                                                active
                                                    ? meta.sidebarActive
                                                    : "text-gray-600 hover:bg-gray-50"
                                            }`}
                                        >
                                            <span className={`shrink-0 ${active ? "" : "opacity-50"}`}>{meta.icon}</span>
                                            <span className="flex-1 truncate text-[13px]">{meta.shortLabel}</span>
                                            <span className={`shrink-0 min-w-[20px] text-center rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none ${
                                                active ? "bg-white/25 text-white" : `${meta.badgeBg} ${meta.color}`
                                            }`}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Legend */}
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Chú thích</p>
                            <div className="space-y-2">
                                {(["Pending", "Confirmed", "InTransit", "Received", "Cancelled"] as const).map(s => (
                                    <div key={s} className="flex items-center gap-2">
                                        <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_META[s].dot}`} />
                                        <span className="text-[12px] text-gray-500">{STATUS_META[s].shortLabel}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* ── Order list ── */}
                    <div className="min-w-0 flex-1">
                        {/* Section header */}
                        <div className="mb-4 flex items-center gap-3">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${activeMeta.badgeBg} ${activeMeta.color}`}>
                                {activeMeta.icon}
                            </div>
                            <div>
                                <h2 className="text-[15px] font-bold text-gray-800">{activeMeta.label}</h2>
                                <p className="text-xs text-gray-400">{filteredOrders.length} đơn hàng</p>
                            </div>
                        </div>

                        {/* Loading skeleton */}
                        {loading && (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-44 animate-pulse rounded-xl bg-gray-100" />
                                ))}
                            </div>
                        )}

                        {/* Empty state */}
                        {!loading && filteredOrders.length === 0 && (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
                                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${activeMeta.badgeBg} ${activeMeta.color}`}>
                                    {activeMeta.icon}
                                </div>
                                <p className="font-semibold text-gray-700">Không có đơn hàng</p>
                                <p className="mt-1 text-sm text-gray-400">Chưa có đơn nào với trạng thái "{activeMeta.label}"</p>
                            </div>
                        )}

                        {/* Order cards */}
                        {!loading && filteredOrders.length > 0 && (
                            <div className="space-y-3">
                                {filteredOrders.map(order => {
                                    const meta = STATUS_META[order.status] ?? STATUS_META.All;
                                    const payMeta = PAYMENT_STATUS_META[order.paymentStatus] ?? PAYMENT_STATUS_META.UnPaid;
                                    return (
                                        <div
                                            key={order.id}
                                            className="relative overflow-hidden rounded-xl border border-gray-200 bg-white"
                                        >
                                            {/* Left accent bar */}
                                            <div className={`absolute left-0 top-0 h-full w-1 ${meta.borderAccent}`} />

                                            <div className="p-5 pl-6">
                                                {/* Top row: ID + badges */}
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Mã đơn hàng</p>
                                                        <p className="font-mono text-sm font-bold text-gray-700 break-all">{order.id}</p>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.badgeBg} ${meta.color}`}>
                                                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                                                            {meta.label}
                                                        </span>
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${payMeta.bg} ${payMeta.text}`}>
                                                            {payMeta.label}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="my-3.5 h-px bg-gray-100" />

                                                {/* Info grid */}
                                                <div className="grid grid-cols-2 gap-x-5 gap-y-3 xl:grid-cols-3">
                                                    <InfoField
                                                        label="Người nhận"
                                                        value={order.recipientName}
                                                        icon={<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                                                    />
                                                    <InfoField
                                                        label="Số điện thoại"
                                                        value={order.recipientPhone}
                                                        icon={<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                                                    />
                                                    <InfoField
                                                        label="Phương thức TT"
                                                        value={PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}
                                                        icon={<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>}
                                                    />
                                                    <InfoField
                                                        label="Địa chỉ giao hàng"
                                                        value={`${order.recipientDetail}, ${order.recipientWard}, ${order.recipientProvince}`}
                                                        icon={<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                                                        wide
                                                    />
                                                    <InfoField
                                                        label="Ngày đặt"
                                                        value={new Date(order.createdAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                                                        icon={<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
                                                    />
                                                </div>

                                                <div className="my-3.5 h-px bg-gray-100" />

                                                {/* Footer: amount + CTA */}
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <div className="flex items-baseline gap-4">
                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tổng tiền</p>
                                                            <p className="text-xl font-bold text-[rgb(51,102,51)]">
                                                                {order.totalAmount.toLocaleString("vi-VN")}
                                                                <span className="ml-0.5 text-sm font-semibold">đ</span>
                                                            </p>
                                                        </div>
                                                        <div className="h-8 w-px bg-gray-100" />
                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Số lượng</p>
                                                            <p className="text-lg font-bold text-gray-700">
                                                                {order.totalQuantity}
                                                                <span className="ml-1 text-sm font-normal text-gray-400">sản phẩm</span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {/* Nút thanh toán lại cho SePay/Momo chưa TT */}
                                                        {order.paymentStatus === "UnPaid" &&
                                                            (order.paymentMethod === "SePay" || order.paymentMethod === "Momo") &&
                                                            order.status === "Pending" && (
                                                            <button
                                                                type="button"
                                                                disabled={repayingId === order.id}
                                                                onClick={() => handleRepay(order)}
                                                                className="inline-flex items-center gap-2 rounded-lg border border-amber-500 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60"
                                                            >
                                                                {repayingId === order.id ? (
                                                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                                                ) : (
                                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                                                                )}
                                                                Thanh toán lại
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => navigate(`/page/orders/${order.id}`)}
                                                            className="inline-flex items-center gap-2 rounded-lg border border-[rgb(51,102,51)] bg-[rgb(51,102,51)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2d7a2d]"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                            </svg>
                                                            Xem chi tiết
                                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoField = ({
    label, value, icon, wide,
}: {
    label: string; value: string; icon: React.ReactNode; wide?: boolean;
}) => (
    <div className={wide ? "col-span-2 xl:col-span-1" : ""}>
        <p className="mb-0.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <span className="text-gray-300">{icon}</span>
            {label}
        </p>
        <p className="text-sm font-medium text-gray-700 leading-snug">{value}</p>
    </div>
);

export default OrderPage;