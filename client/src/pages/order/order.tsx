import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useAuthContext } from "../../contexts/auth/auth";
import { getOrdersByAccountId } from "../../services/order/order.service";
import type { OrderRep } from "../../services/order/order.type";
import { useExecute } from "../../hooks/execute";

export const OrderStatus = {
    Pending: "Pending",
    Confirm: "Confirm",
    InTransit: "InTransit",
    Done: "Done",
    Cancled: "Cancled",
} as const;

type OrderStatusKey = keyof typeof OrderStatus | "All";

/* ─────────────── Config ─────────────── */
const STATUS_META: Record<string, {
    label: string; shortLabel: string;
    color: string; badgeBg: string; badgeText: string;
    dot: string; borderAccent: string;
    sidebarActive: string; sidebarHover: string;
    icon: React.ReactNode;
}> = {
    All: {
        label: "Tất cả đơn hàng", shortLabel: "Tất cả",
        color: "text-gray-700", badgeBg: "bg-gray-100", badgeText: "text-gray-600",
        dot: "bg-gray-400", borderAccent: "bg-gray-300",
        sidebarActive: "bg-gray-800 text-white shadow-md",
        sidebarHover: "hover:bg-gray-50",
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
    },
    Pending: {
        label: "Chờ xác nhận", shortLabel: "Chờ xác nhận",
        color: "text-amber-700", badgeBg: "bg-amber-50", badgeText: "text-amber-700",
        dot: "bg-amber-400", borderAccent: "bg-amber-400",
        sidebarActive: "bg-amber-500 text-white shadow-md shadow-amber-200",
        sidebarHover: "hover:bg-amber-50",
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    },
    Confirm: {
        label: "Đã xác nhận", shortLabel: "Đã xác nhận",
        color: "text-blue-700", badgeBg: "bg-blue-50", badgeText: "text-blue-700",
        dot: "bg-blue-500", borderAccent: "bg-blue-500",
        sidebarActive: "bg-blue-600 text-white shadow-md shadow-blue-200",
        sidebarHover: "hover:bg-blue-50",
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    InTransit: {
        label: "Đang vận chuyển", shortLabel: "Vận chuyển",
        color: "text-orange-700", badgeBg: "bg-orange-50", badgeText: "text-orange-700",
        dot: "bg-orange-500", borderAccent: "bg-orange-500",
        sidebarActive: "bg-orange-500 text-white shadow-md shadow-orange-200",
        sidebarHover: "hover:bg-orange-50",
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
    },
    Done: {
        label: "Đã giao thành công", shortLabel: "Đã giao",
        color: "text-green-700", badgeBg: "bg-green-50", badgeText: "text-green-700",
        dot: "bg-green-500", borderAccent: "bg-green-500",
        sidebarActive: "bg-green-600 text-white shadow-md shadow-green-200",
        sidebarHover: "hover:bg-green-50",
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
    },
    Cancled: {
        label: "Đã huỷ", shortLabel: "Đã huỷ",
        color: "text-red-700", badgeBg: "bg-red-50", badgeText: "text-red-700",
        dot: "bg-red-400", borderAccent: "bg-red-400",
        sidebarActive: "bg-red-500 text-white shadow-md shadow-red-200",
        sidebarHover: "hover:bg-red-50",
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
    },
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
    Cod: "Thanh toán khi nhận hàng (COD)",
    Online: "Thanh toán online",
    Transfer: "Chuyển khoản ngân hàng",
};

const PAYMENT_STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
    UnPaid: { label: "Chưa thanh toán", bg: "bg-red-50 border border-red-100", text: "text-red-600" },
    Paid: { label: "Đã thanh toán", bg: "bg-green-50 border border-green-100", text: "text-green-700" },
};

const SIDEBAR_ORDER: OrderStatusKey[] = ["All", "Pending", "Confirm", "InTransit", "Done", "Cancled"];

/* ─────────────── Page ─────────────── */
const OrderPage = () => {
    const { state } = useAuthContext();
    const location = useLocation();
    const navigate = useNavigate();
    const { query, loading } = useExecute();

    const getStatusFromUrl = (): OrderStatusKey => {
        const p = new URLSearchParams(location.search).get("status");
        return p === "All" || (p && p in OrderStatus) ? (p as OrderStatusKey) : "All";
    };

    const [activeStatus, setActiveStatus] = useState<OrderStatusKey>(getStatusFromUrl);
    const [orders, setOrders] = useState<OrderRep[]>([]);

    useEffect(() => { setActiveStatus(getStatusFromUrl()); }, [location.search]);

    useEffect(() => {
        if (!state) return;
        query(getOrdersByAccountId(state.uid)).then(r => setOrders(r?.data || []));
    }, [state]);

    const handleStatusChange = (s: OrderStatusKey) => {
        const params = new URLSearchParams(location.search);
        params.set("status", s);
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    };

    /* ── Unauthenticated ── */
    if (!state) {
        return (
            <div className="sm-container mx-auto py-20">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 via-white to-emerald-50 p-12 text-center shadow-xl shadow-green-100">
                    <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-green-100 opacity-60 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-100 opacity-60 blur-3xl" />
                    <div className="relative z-10 space-y-5">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-700 shadow-lg shadow-green-300">
                            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Bạn chưa đăng nhập</h1>
                        <p className="text-gray-500">Đăng nhập để theo dõi đơn hàng và xem lịch sử mua sắm.</p>
                        <NavLink to="/auth/login" className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white shadow-md shadow-green-200 transition hover:bg-green-800 hover:-translate-y-0.5">
                            Đăng nhập ngay
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </NavLink>
                    </div>
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
        <>
            <style>{`
                @keyframes fadeUp {
                    from { opacity:0; transform:translateY(10px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                .fade-up { animation: fadeUp .4s ease both; }
            `}</style>

            <div className="pb-24 bg-gray-50/50 min-h-screen">
                <div className="sm-container mx-auto space-y-5 py-8">

                    <div className="fade-up relative overflow-hidden rounded-2xl bg-linear-to-r from-green-700 via-green-600 to-emerald-500 px-7 py-5 shadow-lg shadow-green-200/60">
                        <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white opacity-[0.06]" />
                        <div className="pointer-events-none absolute -bottom-8 left-1/3 h-28 w-28 rounded-full bg-white opacity-[0.06]" />
                        <div className="relative flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-widest text-green-200">GreenLife · Quản lý đơn hàng</p>
                                <h1 className="mt-0.5 text-xl font-bold text-white">{state.email}</h1>
                            </div>
                            <div className="flex gap-2.5">
                                {(["Pending", "InTransit", "Done"] as const).map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => handleStatusChange(s)}
                                        className="rounded-xl border border-white/20 bg-white/15 px-3.5 py-2 text-center backdrop-blur-sm transition hover:bg-white/25"
                                    >
                                        <p className="text-lg font-bold text-white leading-none">{countOf(s)}</p>
                                        <p className="mt-0.5 text-[10px] font-medium text-green-100">{STATUS_META[s].shortLabel}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-5 items-start">

                        <aside className="w-52 shrink-0 sticky top-6 space-y-3">
                            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                                <div className="border-b border-gray-50 px-4 py-3">
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
                                                className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${active ? meta.sidebarActive : `text-gray-600 ${meta.sidebarHover}`
                                                    }`}
                                            >
                                                <span className={`shrink-0 ${active ? "" : "opacity-50"}`}>{meta.icon}</span>
                                                <span className="flex-1 truncate text-[13px]">{meta.shortLabel}</span>
                                                <span className={`shrink-0 min-w-[20px] text-center rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none ${active ? "bg-white/25 text-white" : `${meta.badgeBg} ${meta.color}`
                                                    }`}>
                                                    {count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Chú thích</p>
                                <div className="space-y-2">
                                    {(["Pending", "Confirm", "InTransit", "Done", "Cancled"] as const).map(s => (
                                        <div key={s} className="flex items-center gap-2">
                                            <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_META[s].dot}`} />
                                            <span className="text-[12px] text-gray-500">{STATUS_META[s].shortLabel}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>

                        <div className="min-w-0 flex-1">
                            <div className="mb-4 flex items-center gap-3">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${activeMeta.badgeBg} ${activeMeta.color}`}>
                                    {activeMeta.icon}
                                </div>
                                <div>
                                    <h2 className="text-[15px] font-bold text-gray-800">{activeMeta.label}</h2>
                                    <p className="text-xs text-gray-400">{filteredOrders.length} đơn hàng</p>
                                </div>
                            </div>

                            {loading && (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-100" style={{ animationDelay: `${i * 80}ms` }} />
                                    ))}
                                </div>
                            )}

                            {!loading && filteredOrders.length === 0 && (
                                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center shadow-sm">
                                    <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${activeMeta.badgeBg} ${activeMeta.color}`}>
                                        {activeMeta.icon}
                                    </div>
                                    <p className="font-semibold text-gray-700">Không có đơn hàng</p>
                                    <p className="mt-1 text-sm text-gray-400">Chưa có đơn nào với trạng thái "{activeMeta.label}"</p>
                                </div>
                            )}

                            {!loading && filteredOrders.length > 0 && (
                                <div className="space-y-3">
                                    {filteredOrders.map((order, idx) => {
                                        const meta = STATUS_META[order.status] ?? STATUS_META.All;
                                        const payMeta = PAYMENT_STATUS_META[order.paymentStatus] ?? PAYMENT_STATUS_META.UnPaid;
                                        return (
                                            <div
                                                key={order.id}
                                                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-gray-200/80 hover:-translate-y-0.5"
                                                style={{ animation: `fadeUp 0.35s ${idx * 50}ms ease both` }}
                                            >
                                                <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${meta.borderAccent}`} />

                                                <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-green-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                                <div className="relative p-5 pl-6">

                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div className="space-y-0.5">
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

                                                    <div className="my-3.5 h-px bg-gray-50" />

                                                    {/* ─ Info grid ─ */}
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

                                                    <div className="my-3.5 h-px bg-gray-50" />

                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <div className="flex items-baseline gap-4">
                                                            <div>
                                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tổng tiền</p>
                                                                <p className="text-xl font-bold text-green-700">
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

                                                        {/* Detail CTA */}
                                                        <button
                                                            type="button"
                                                            onClick={() => navigate(`/page/orders/${order.id}`)}
                                                            className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-green-200 transition-all duration-200 hover:bg-green-800 hover:shadow-md hover:shadow-green-300 hover:-translate-y-0.5 active:translate-y-0"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                            </svg>
                                                            Xem chi tiết
                                                            <svg className="h-3.5 w-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </button>
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
        </>
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