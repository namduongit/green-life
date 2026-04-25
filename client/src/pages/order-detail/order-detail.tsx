import { useEffect, useState } from "react";
import { useNavigate, useParams, NavLink } from "react-router";
import { useExecute } from "../../hooks/execute";
import type { OrderDetailRep, OrderRep } from "../../services/order/order.type";
import { useAuthContext } from "../../contexts/auth/auth";
import { getOrderDetailById, getOrdersByAccountId } from "../../services/order/order.service";

/* ─────────────── Status / meta config (mirror OrderPage) ─────────────── */
const STATUS_META: Record<string, {
    label: string; color: string; badgeBg: string;
    dot: string; borderAccent: string; icon: React.ReactNode;
}> = {
    Pending: {
        label: "Chờ xác nhận",
        color: "text-amber-700", badgeBg: "bg-amber-50 border border-amber-100",
        dot: "bg-amber-400", borderAccent: "from-amber-400 to-amber-500",
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    },
    Confirm: {
        label: "Đã xác nhận",
        color: "text-blue-700", badgeBg: "bg-blue-50 border border-blue-100",
        dot: "bg-blue-500", borderAccent: "from-blue-500 to-blue-600",
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    },
    InTransit: {
        label: "Đang vận chuyển",
        color: "text-orange-700", badgeBg: "bg-orange-50 border border-orange-100",
        dot: "bg-orange-500", borderAccent: "from-orange-400 to-orange-500",
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    },
    Done: {
        label: "Đã giao thành công",
        color: "text-green-700", badgeBg: "bg-green-50 border border-green-100",
        dot: "bg-green-500", borderAccent: "from-green-500 to-green-600",
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>,
    },
    Cancled: {
        label: "Đã huỷ",
        color: "text-red-700", badgeBg: "bg-red-50 border border-red-100",
        dot: "bg-red-400", borderAccent: "from-red-400 to-red-500",
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
    },
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
    Cod:      "Thanh toán khi nhận hàng (COD)",
    Online:   "Thanh toán online",
    Transfer: "Chuyển khoản ngân hàng",
};

const PAYMENT_STATUS_META: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    UnPaid: { label: "Chưa thanh toán", bg: "bg-red-50 border border-red-100",     text: "text-red-600",   dot: "bg-red-400" },
    Paid:   { label: "Đã thanh toán",   bg: "bg-green-50 border border-green-100", text: "text-green-700", dot: "bg-green-500" },
};

/* ─── Timeline steps ─── */
const TIMELINE_STEPS = ["Pending", "Confirm", "InTransit", "Done"] as const;

const OrderTimeline = ({ status }: { status: string }) => {
    if (status === "Cancled") {
        return (
            <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-400 text-white">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </div>
                <div>
                    <p className="text-sm font-semibold text-red-700">Đơn hàng đã bị huỷ</p>
                    <p className="text-xs text-red-400">Đơn hàng này đã bị huỷ và không thể tiếp tục xử lý.</p>
                </div>
            </div>
        );
    }

    const currentIdx = TIMELINE_STEPS.indexOf(status as typeof TIMELINE_STEPS[number]);

    return (
        <div className="relative">
            {/* connecting track */}
            <div className="absolute left-4 top-4 h-[calc(100%-32px)] w-0.5 bg-gray-100" />
            <div
                className="absolute left-4 top-4 w-0.5 bg-gradient-to-b from-green-400 to-green-600 transition-all duration-700"
                style={{ height: `${(currentIdx / (TIMELINE_STEPS.length - 1)) * 100}%` }}
            />

            <div className="space-y-3">
                {TIMELINE_STEPS.map((step, i) => {
                    const meta = STATUS_META[step];
                    const done    = i <= currentIdx;
                    const current = i === currentIdx;
                    return (
                        <div key={step} className="relative flex items-start gap-4 pl-0">
                            {/* circle */}
                            <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                                done
                                    ? "border-green-500 bg-green-500 shadow-md shadow-green-200"
                                    : "border-gray-200 bg-white"
                            }`}>
                                {done ? (
                                    current ? (
                                        <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                                    ) : (
                                        <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                                    )
                                ) : (
                                    <span className="h-2 w-2 rounded-full bg-gray-200" />
                                )}
                            </div>
                            {/* label */}
                            <div className="pb-3 pt-0.5">
                                <p className={`text-sm font-semibold ${done ? (current ? "text-green-700" : "text-gray-800") : "text-gray-300"}`}>
                                    {meta.label}
                                </p>
                                {current && (
                                    <p className="mt-0.5 text-xs text-green-600">Trạng thái hiện tại</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ─────────────── Main Page ─────────────── */
const OrderDetailPage = () => {
    const { uuid }   = useParams<{ uuid: string }>();
    const navigate   = useNavigate();
    const { query, loading } = useExecute();
    const { state }  = useAuthContext();

    const [orderDetail, setOrderDetail] = useState<OrderDetailRep | null>(null);
    const [order, setOrder]             = useState<OrderRep | null>(null);

    useEffect(() => {
        if (!uuid || !state) return;

        // fetch detail (items + checkout history)
        query(getOrderDetailById(state.uid, uuid)).then(r => {
            if (r?.data) setOrderDetail(r.data);
        });

        // fetch base order info (status, recipient, amounts…)
        query(getOrdersByAccountId(state.uid)).then(r => {
            const found = (r?.data as OrderRep[] | undefined)?.find(o => o.id === uuid);
            if (found) setOrder(found);
        });
    }, [uuid, state]);

    if (!uuid) {
        navigate("/page/orders");
        return null;
    }

    const statusMeta    = order ? (STATUS_META[order.status] ?? STATUS_META.Pending) : null;
    const payStatusMeta = order ? (PAYMENT_STATUS_META[order.paymentStatus] ?? PAYMENT_STATUS_META.UnPaid) : null;

    return (
        <>
            <style>{`
                @keyframes fadeUp {
                    from { opacity:0; transform:translateY(10px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                .fade-up  { animation: fadeUp .4s ease both; }
                .fade-up-1{ animation: fadeUp .4s .06s ease both; }
                .fade-up-2{ animation: fadeUp .4s .12s ease both; }
                .fade-up-3{ animation: fadeUp .4s .18s ease both; }
            `}</style>

            <div className="min-h-screen bg-gray-50/50 pb-24">
                <div className="sm-container mx-auto space-y-5 py-8">

                    <div className="fade-up flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <NavLink to="/" className="flex items-center gap-1 transition hover:text-green-700">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                            Trang chủ
                        </NavLink>
                        <svg className="h-3.5 w-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                        <button type="button" onClick={() => navigate("/page/orders")} className="transition hover:text-green-700">
                            Đơn hàng của tôi
                        </button>
                        <svg className="h-3.5 w-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                        <span className="font-mono text-xs font-semibold text-gray-700 truncate max-w-[160px]">{uuid}</span>
                    </div>

                    <div className="fade-up relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-700 via-green-600 to-emerald-500 px-7 py-5 shadow-lg shadow-green-200/60">
                        <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white opacity-[0.06]" />
                        <div className="pointer-events-none absolute -bottom-8 left-1/3 h-28 w-28 rounded-full bg-white opacity-[0.06]" />
                        <div className="relative flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate("/page/orders")}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                                </button>
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-widest text-green-200">Chi tiết đơn hàng</p>
                                    <h1 className="mt-0.5 font-mono text-lg font-bold text-white leading-snug">{uuid}</h1>
                                </div>
                            </div>
                            {order && statusMeta && (
                                <span className={`inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm`}>
                                    <span className={`h-2 w-2 rounded-full ${statusMeta.dot}`} />
                                    {statusMeta.label}
                                </span>
                            )}
                        </div>
                    </div>

                    {loading && (
                        <div className="fade-up-1 grid gap-5 lg:grid-cols-3">
                            <div className="space-y-4 lg:col-span-2">
                                {[1,2].map(i => <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-100" style={{animationDelay:`${i*80}ms`}} />)}
                            </div>
                            <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
                        </div>
                    )}

                    {!loading && (
                        <div className="fade-up-1 grid gap-5 lg:grid-cols-3">

                            <div className="space-y-5 lg:col-span-2">

                                {order && (
                                    <Section
                                        icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
                                        title="Thông tin giao hàng"
                                        accentClass={statusMeta?.borderAccent ?? "from-green-500 to-green-600"}
                                    >
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <DetailField
                                                label="Người nhận"
                                                value={order.recipientName}
                                                icon={<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
                                            />
                                            <DetailField
                                                label="Số điện thoại"
                                                value={order.recipientPhone}
                                                icon={<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>}
                                            />
                                            <DetailField
                                                label="Tỉnh / Thành phố"
                                                value={order.recipientProvince}
                                                icon={<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>}
                                            />
                                            <DetailField
                                                label="Phường / Xã"
                                                value={order.recipientWard}
                                                icon={<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>}
                                            />
                                            <DetailField
                                                label="Địa chỉ chi tiết"
                                                value={order.recipientDetail}
                                                icon={<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>}
                                                wide
                                            />
                                        </div>
                                    </Section>
                                )}

                                <Section
                                    icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>}
                                    title="Sản phẩm trong đơn"
                                    accentClass="from-green-500 to-emerald-500"
                                    action={
                                        <NavLink
                                            to="/page/products"
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-100"
                                        >
                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.96 1.61h9.72a2 2 0 001.96-1.61L23 6H6"/></svg>
                                            Tiếp tục mua hàng
                                        </NavLink>
                                    }
                                >
                                    {!orderDetail || orderDetail.orderItems.length === 0 ? (
                                        <div className="py-8 text-center text-sm text-gray-400">Không có sản phẩm nào.</div>
                                    ) : (
                                        <div className="divide-y divide-gray-50">
                                            {orderDetail.orderItems.map((item, idx) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                                                    style={{ animation: `fadeUp .3s ${idx * 50}ms ease both` }}
                                                >
                                                    <div className="flex items-center gap-3.5 min-w-0">
                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50">
                                                            <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                                                            </svg>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Mã SP</p>
                                                            <p className="truncate font-mono text-sm font-semibold text-gray-700">{item.productId}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-5 text-right">
                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Đơn giá</p>
                                                            <p className="text-sm font-semibold text-gray-700">{item.price.toLocaleString("vi-VN")}đ</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">SL</p>
                                                            <p className="text-sm font-semibold text-gray-700">×{item.quantity}</p>
                                                        </div>
                                                        <div className="min-w-[80px]">
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Thành tiền</p>
                                                            <p className="text-sm font-bold text-green-700">{item.amount.toLocaleString("vi-VN")}đ</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {order && (
                                                <div className="flex items-center justify-between pt-4">
                                                    <p className="text-sm font-semibold text-gray-500">
                                                        Tổng cộng ({order.totalQuantity} sản phẩm)
                                                    </p>
                                                    <p className="text-xl font-bold text-green-700">
                                                        {order.totalAmount.toLocaleString("vi-VN")}
                                                        <span className="ml-0.5 text-sm font-semibold">đ</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Section>

                                {orderDetail?.checkoutHistory && (
                                    <Section
                                        icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
                                        title="Lịch sử thanh toán"
                                        accentClass="from-blue-400 to-blue-500"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-50 bg-blue-50/50 p-4">
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Mã giao dịch</p>
                                                <p className="font-mono text-sm font-semibold text-gray-700">{orderDetail.checkoutHistory.requestId}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Phương thức</p>
                                                <p className="text-sm font-semibold text-gray-700">{PAYMENT_METHOD_LABEL[orderDetail.checkoutHistory.paymentType] ?? orderDetail.checkoutHistory.paymentType}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Số tiền</p>
                                                <p className="text-lg font-bold text-blue-700">{orderDetail.checkoutHistory.amount.toLocaleString("vi-VN")}đ</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Thời gian</p>
                                                <p className="text-sm font-semibold text-gray-700">
                                                    {new Date(orderDetail.checkoutHistory.createdAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                                                </p>
                                            </div>
                                        </div>
                                    </Section>
                                )}
                            </div>

                            <div className="space-y-4">
                                <Section
                                    icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                                    title="Trạng thái đơn hàng"
                                    accentClass="from-green-500 to-green-600"
                                >
                                    {order
                                        ? <OrderTimeline status={order.status} />
                                        : <div className="py-4 text-center text-sm text-gray-400">Đang tải...</div>
                                    }
                                </Section>

                                {/* ─ Payment info ─ */}
                                {order && payStatusMeta && (
                                    <Section
                                        icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
                                        title="Thanh toán"
                                        accentClass="from-emerald-400 to-emerald-500"
                                    >
                                        <div className="space-y-3">
                                            <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${payStatusMeta.bg}`}>
                                                <span className={`h-2 w-2 shrink-0 rounded-full ${payStatusMeta.dot}`} />
                                                <span className={`text-sm font-semibold ${payStatusMeta.text}`}>{payStatusMeta.label}</span>
                                            </div>
                                            <DetailField
                                                label="Phương thức"
                                                value={PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}
                                                icon={<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
                                            />
                                            <DetailField
                                                label="Ngày đặt hàng"
                                                value={new Date(order.createdAt).toLocaleString("vi-VN", { dateStyle: "long", timeStyle: "short" })}
                                                icon={<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                                            />
                                            <DetailField
                                                label="Cập nhật lần cuối"
                                                value={new Date(order.updatedAt).toLocaleString("vi-VN", { dateStyle: "long", timeStyle: "short" })}
                                                icon={<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>}
                                            />
                                        </div>
                                    </Section>
                                )}

                                {orderDetail?.account && (
                                    <Section
                                        icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
                                        title="Tài khoản đặt hàng"
                                        accentClass="from-gray-400 to-gray-500"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 text-sm font-bold uppercase">
                                                {orderDetail.account.email.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-gray-700">{orderDetail.account.email}</p>
                                                <p className="font-mono text-[10px] text-gray-400">{orderDetail.account.id}</p>
                                            </div>
                                        </div>
                                    </Section>
                                )}

                                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                                    <div className="border-b border-gray-50 px-4 py-3">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Hành động nhanh</p>
                                    </div>
                                    <div className="p-3 space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => navigate("/page/orders")}
                                            className="flex w-full items-center gap-3 rounded-xl border border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                                        >
                                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                                            Về danh sách đơn hàng
                                        </button>
                                        <NavLink
                                            to="/page/products"
                                            className="flex w-full items-center gap-3 rounded-xl border border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                                        >
                                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.96 1.61h9.72a2 2 0 001.96-1.61L23 6H6"/></svg>
                                            Tiếp tục mua hàng
                                        </NavLink>
                                        <NavLink
                                            to="/"
                                            className="flex w-full items-center gap-3 rounded-xl border border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                                        >
                                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                                            Về trang chủ
                                        </NavLink>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

const Section = ({
    icon, title, accentClass, action, children,
}: {
    icon: React.ReactNode;
    title: string;
    accentClass: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}) => (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* top accent strip */}
        <div className={`h-0.5 w-full bg-linear-to-r ${accentClass}`} />
        <div className="border-b border-gray-50 px-5 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-gray-700">
                <span className="text-green-600">{icon}</span>
                <h3 className="text-sm font-bold">{title}</h3>
            </div>
            {action}
        </div>
        <div className="p-5">{children}</div>
    </div>
);

const DetailField = ({
    label, value, icon, wide,
}: {
    label: string; value: string; icon: React.ReactNode; wide?: boolean;
}) => (
    <div className={wide ? "sm:col-span-2" : ""}>
        <p className="mb-0.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <span className="text-gray-300">{icon}</span>
            {label}
        </p>
        <p className="text-sm font-medium text-gray-700 leading-snug">{value}</p>
    </div>
);

export default OrderDetailPage;