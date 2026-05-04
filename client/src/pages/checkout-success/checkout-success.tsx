import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { useExecute } from "../../hooks/execute";
import { getOrderPaymentStatus } from "../../services/order/order.service";

type PaymentState = "loading" | "success" | "failed" | "pending" | "error";

const CheckoutSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { query } = useExecute();

    const [state, setState] = useState<PaymentState>("loading");
    const [orderInfo, setOrderInfo] = useState<{
        id: string;
        totalAmount: number;
        paymentMethod: string;
    } | null>(null);
    const [countdown, setCountdown] = useState(8);

    // Momo trả về query params: orderId, resultCode, message, ...
    const orderId = searchParams.get("orderId");
    const resultCode = searchParams.get("resultCode");
    const message = searchParams.get("message");

    useEffect(() => {
        if (!orderId) {
            setState("error");
            return;
        }

        const verify = async () => {
            // resultCode = 0 → Momo báo thành công, nhưng vẫn verify lại với server
            const result = await query(getOrderPaymentStatus(orderId));

            if (result?.data) {
                const { paymentStatus, totalAmount, paymentMethod, id } = result.data;
                setOrderInfo({ id, totalAmount, paymentMethod });

                if (paymentStatus === "Paid") {
                    setState("success");
                } else if (resultCode === "0") {
                    // IPN chưa kịp xử lý nhưng Momo báo thành công
                    setState("pending");
                } else {
                    setState("failed");
                }
            } else {
                setState("error");
            }
        };

        verify();
    }, [orderId]);

    // Đếm ngược tự động redirect sau khi thành công
    useEffect(() => {
        if (state !== "success" && state !== "pending") return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate("/page/orders");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [state]);

    const formatCurrency = (amount: number) =>
        amount.toLocaleString("vi-VN") + "₫";

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-lg">
                {state === "loading" && <LoadingCard />}
                {state === "success" && (
                    <ResultCard
                        type="success"
                        title="Thanh toán thành công!"
                        subtitle="Đơn hàng của bạn đã được xác nhận và đang được xử lý."
                        orderId={orderInfo?.id}
                        totalAmount={orderInfo ? formatCurrency(orderInfo.totalAmount) : undefined}
                        paymentMethod={orderInfo?.paymentMethod}
                        countdown={countdown}
                        message={message ?? undefined}
                    />
                )}
                {state === "pending" && (
                    <ResultCard
                        type="pending"
                        title="Đang xác nhận thanh toán"
                        subtitle="Hệ thống đang xử lý giao dịch. Vui lòng chờ trong giây lát — trạng thái sẽ được cập nhật tự động."
                        orderId={orderInfo?.id}
                        totalAmount={orderInfo ? formatCurrency(orderInfo.totalAmount) : undefined}
                        paymentMethod={orderInfo?.paymentMethod}
                        countdown={countdown}
                        message={message ?? undefined}
                    />
                )}
                {state === "failed" && (
                    <ResultCard
                        type="failed"
                        title="Thanh toán không thành công"
                        subtitle="Giao dịch không được hoàn tất. Đơn hàng của bạn vẫn được lưu, bạn có thể thử thanh toán lại."
                        orderId={orderInfo?.id}
                        totalAmount={orderInfo ? formatCurrency(orderInfo.totalAmount) : undefined}
                        paymentMethod={orderInfo?.paymentMethod}
                        message={message ?? undefined}
                    />
                )}
                {state === "error" && (
                    <ResultCard
                        type="error"
                        title="Không tìm thấy đơn hàng"
                        subtitle="Đường dẫn không hợp lệ hoặc đơn hàng không tồn tại."
                    />
                )}
            </div>
        </div>
    );
};

/* ─── Loading ─── */
const LoadingCard = () => (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-10 flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-[rgb(51,102,51)] animate-spin" />
        <p className="text-gray-500 text-sm">Đang xác nhận giao dịch...</p>
    </div>
);

/* ─── Result Card ─── */
type ResultType = "success" | "pending" | "failed" | "error";

const RESULT_CONFIG: Record<ResultType, {
    iconBg: string;
    iconColor: string;
    titleColor: string;
    borderColor: string;
    icon: React.ReactNode;
}> = {
    success: {
        iconBg: "bg-green-50",
        iconColor: "text-green-600",
        titleColor: "text-green-700",
        borderColor: "border-green-100",
        icon: (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    pending: {
        iconBg: "bg-amber-50",
        iconColor: "text-amber-500",
        titleColor: "text-amber-700",
        borderColor: "border-amber-100",
        icon: (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
    },
    failed: {
        iconBg: "bg-red-50",
        iconColor: "text-red-500",
        titleColor: "text-red-700",
        borderColor: "border-red-100",
        icon: (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
        ),
    },
    error: {
        iconBg: "bg-gray-50",
        iconColor: "text-gray-400",
        titleColor: "text-gray-700",
        borderColor: "border-gray-100",
        icon: (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
        ),
    },
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
    Cod: "Thanh toán khi nhận hàng (COD)",
    Momo: "Ví điện tử MoMo",
    SePay: "Cổng thanh toán Sepay",
};

const ResultCard = ({
    type,
    title,
    subtitle,
    orderId,
    totalAmount,
    paymentMethod,
    countdown,
    message,
}: {
    type: ResultType;
    title: string;
    subtitle: string;
    orderId?: string;
    totalAmount?: string;
    paymentMethod?: string;
    countdown?: number;
    message?: string;
}) => {
    const cfg = RESULT_CONFIG[type];

    return (
        <div className={`rounded-2xl border ${cfg.borderColor} bg-white shadow-sm overflow-hidden`}>
            {/* Top accent */}
            <div className={`h-1 w-full ${
                type === "success" ? "bg-green-500" :
                type === "pending" ? "bg-amber-400" :
                type === "failed"  ? "bg-red-400"   : "bg-gray-300"
            }`} />

            <div className="p-8 flex flex-col items-center text-center gap-5">
                {/* Icon */}
                <div className={`flex h-20 w-20 items-center justify-center rounded-full ${cfg.iconBg} ${cfg.iconColor}`}>
                    {cfg.icon}
                </div>

                {/* Title */}
                <div>
                    <h1 className={`text-2xl font-bold ${cfg.titleColor}`}>{title}</h1>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">{subtitle}</p>
                    {message && type === "failed" && (
                        <p className="mt-2 text-xs text-red-400 italic">{message}</p>
                    )}
                </div>

                {/* Order info */}
                {(orderId || totalAmount) && (
                    <div className="w-full rounded-xl border border-gray-100 bg-gray-50 divide-y divide-gray-100 text-sm">
                        {orderId && (
                            <div className="flex items-center justify-between px-4 py-3">
                                <span className="text-gray-400 font-medium">Mã đơn hàng</span>
                                <span className="font-mono font-semibold text-gray-700 text-xs truncate max-w-[200px]">{orderId}</span>
                            </div>
                        )}
                        {totalAmount && (
                            <div className="flex items-center justify-between px-4 py-3">
                                <span className="text-gray-400 font-medium">Tổng tiền</span>
                                <span className="font-bold text-[rgb(51,102,51)]">{totalAmount}</span>
                            </div>
                        )}
                        {paymentMethod && (
                            <div className="flex items-center justify-between px-4 py-3">
                                <span className="text-gray-400 font-medium">Phương thức</span>
                                <span className="font-semibold text-gray-700">{PAYMENT_METHOD_LABEL[paymentMethod] ?? paymentMethod}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Countdown */}
                {countdown !== undefined && countdown > 0 && (
                    <p className="text-xs text-gray-400">
                        Tự động chuyển về lịch sử đơn hàng sau{" "}
                        <span className="font-bold text-[rgb(51,102,51)]">{countdown}s</span>
                    </p>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 w-full mt-1">
                    <Link
                        to="/page/orders"
                        className="flex-1 rounded-xl bg-[rgb(51,102,51)] px-5 py-3 text-sm font-semibold text-white text-center hover:bg-[#2d7a2d]"
                    >
                        Xem lịch sử đơn hàng
                    </Link>
                    <Link
                        to="/page/product"
                        className="flex-1 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 text-center hover:border-[rgb(51,102,51)] hover:text-[rgb(51,102,51)]"
                    >
                        Tiếp tục mua hàng
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSuccessPage;
