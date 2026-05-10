import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { useExecute } from "../../hooks/execute";
import { getOrderPaymentStatus } from "../../services/order/order.service";

type PaymentState = "loading" | "success" | "pending" | "failed" | "error";

interface OrderInfo {
    id: string;
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
}

const PAYMENT_METHOD_LABEL: Record<string, string> = {
    Cod: "Thanh toán khi nhận hàng (COD)",
    Momo: "Ví điện tử MoMo",
    SePay: "Cổng thanh toán SePay",
};

const formatCurrency = (amount: number) =>
    amount.toLocaleString("vi-VN") + "₫";

/* ─────────────────────────────────────────────────────────────────── */

const CheckoutSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { query } = useExecute();

    const [state, setState] = useState<PaymentState>("loading");
    const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
    const [countdown, setCountdown] = useState(8);

    // MoMo trả về orderId có thể có suffix _N (retry) → strip về real orderId
    const rawOrderId = searchParams.get("orderId");
    const orderId = rawOrderId ? rawOrderId.replace(/_\d+$/, "") : null;
    const resultCode = searchParams.get("resultCode");
    const message = searchParams.get("message");

    useEffect(() => {
        if (!orderId) {
            setState("error");
            return;
        }

        const verify = async () => {
            const result = await query(getOrderPaymentStatus(orderId));

            if (result?.data) {
                const { paymentStatus, totalAmount, paymentMethod, id } = result.data;
                setOrderInfo({ id, totalAmount, paymentMethod, paymentStatus });

                if (paymentStatus === "Paid") {
                    setState("success");
                } else if (resultCode === "0") {
                    // IPN chưa kịp cập nhật nhưng MoMo báo thành công
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

    // Đếm ngược tự động redirect khi thành công / pending
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

    return (
        <div className="checkout-success-wrapper">
            <div className="checkout-success-container">
                {state === "loading" && <LoadingCard />}
                {state === "success" && (
                    <SuccessCard orderInfo={orderInfo!} countdown={countdown} />
                )}
                {state === "pending" && (
                    <PendingCard orderInfo={orderInfo} countdown={countdown} />
                )}
                {state === "failed" && (
                    <FailedCard orderInfo={orderInfo} message={message ?? undefined} />
                )}
                {state === "error" && <ErrorCard />}
            </div>

            <style>{styles}</style>
        </div>
    );
};

/* ─── Loading ─── */
const LoadingCard = () => (
    <div className="cs-card">
        <div className="cs-card__accent cs-card__accent--neutral" />
        <div className="cs-card__body cs-card__body--center">
            <div className="cs-spinner" />
            <p className="cs-muted">Đang xác nhận giao dịch...</p>
        </div>
    </div>
);

/* ─── Success ─── */
const SuccessCard = ({ orderInfo, countdown }: { orderInfo: OrderInfo; countdown: number }) => (
    <div className="cs-card">
        <div className="cs-card__accent cs-card__accent--success" />
        <div className="cs-card__body cs-card__body--center">
            <div className="cs-icon-ring cs-icon-ring--success">
                <svg className="cs-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>

            <div className="cs-text-group">
                <h1 className="cs-title cs-title--success">Thanh toán thành công!</h1>
                <p className="cs-subtitle">Đơn hàng của bạn đã được xác nhận và đang được xử lý.</p>
            </div>

            <OrderInfoBox orderInfo={orderInfo} />

            <p className="cs-countdown">
                Tự động chuyển về lịch sử đơn hàng sau{" "}
                <span className="cs-countdown__num">{countdown}s</span>
            </p>

            <div className="cs-actions">
                <Link to={`/page/orders/${orderInfo.id}`} className="cs-btn cs-btn--primary">
                    Xem chi tiết đơn hàng
                </Link>
                <Link to="/page/product" className="cs-btn cs-btn--ghost">
                    Tiếp tục mua hàng
                </Link>
            </div>
        </div>
    </div>
);

/* ─── Pending ─── */
const PendingCard = ({ orderInfo, countdown }: { orderInfo: OrderInfo | null; countdown: number }) => (
    <div className="cs-card">
        <div className="cs-card__accent cs-card__accent--warning" />
        <div className="cs-card__body cs-card__body--center">
            <div className="cs-icon-ring cs-icon-ring--warning">
                <svg className="cs-icon cs-icon--spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>

            <div className="cs-text-group">
                <h1 className="cs-title cs-title--warning">Đang xác nhận thanh toán</h1>
                <p className="cs-subtitle">
                    Giao dịch đã được ghi nhận. Hệ thống đang xử lý — trạng thái sẽ cập nhật trong giây lát.
                </p>
            </div>

            {orderInfo && <OrderInfoBox orderInfo={orderInfo} />}

            <p className="cs-countdown">
                Tự động chuyển về lịch sử đơn hàng sau{" "}
                <span className="cs-countdown__num">{countdown}s</span>
            </p>

            <div className="cs-actions">
                <Link to="/page/orders" className="cs-btn cs-btn--primary">
                    Xem lịch sử đơn hàng
                </Link>
            </div>
        </div>
    </div>
);

/* ─── Failed ─── */
const FailedCard = ({ orderInfo, message }: { orderInfo: OrderInfo | null; message?: string }) => (
    <div className="cs-card">
        <div className="cs-card__accent cs-card__accent--danger" />
        <div className="cs-card__body cs-card__body--center">
            <div className="cs-icon-ring cs-icon-ring--danger">
                <svg className="cs-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>

            <div className="cs-text-group">
                <h1 className="cs-title cs-title--danger">Thanh toán không thành công</h1>
                <p className="cs-subtitle">
                    Giao dịch chưa hoàn tất. Đơn hàng của bạn vẫn được lưu — bạn có thể thử thanh toán lại.
                </p>
                {message && <p className="cs-error-note">Lý do: {message}</p>}
            </div>

            {orderInfo && <OrderInfoBox orderInfo={orderInfo} />}

            <div className="cs-note-box">
                <svg className="cs-note-box__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>
                    Đơn hàng của bạn vẫn ở trạng thái <strong>chưa thanh toán</strong>. Vào trang lịch sử đơn hàng để thanh toán lại hoặc liên hệ hỗ trợ nếu cần.
                </p>
            </div>

            <div className="cs-actions">
                <Link to="/page/orders" className="cs-btn cs-btn--primary">
                    Lịch sử đơn hàng
                </Link>
                <a
                    href="mailto:support@greenlife.vn"
                    className="cs-btn cs-btn--ghost"
                >
                    Liên hệ hỗ trợ
                </a>
            </div>
        </div>
    </div>
);

/* ─── Error ─── */
const ErrorCard = () => (
    <div className="cs-card">
        <div className="cs-card__accent cs-card__accent--neutral" />
        <div className="cs-card__body cs-card__body--center">
            <div className="cs-icon-ring cs-icon-ring--neutral">
                <svg className="cs-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
            </div>

            <div className="cs-text-group">
                <h1 className="cs-title cs-title--neutral">Không tìm thấy đơn hàng</h1>
                <p className="cs-subtitle">Đường dẫn không hợp lệ hoặc đơn hàng không tồn tại.</p>
            </div>

            <div className="cs-actions">
                <Link to="/page/orders" className="cs-btn cs-btn--primary">
                    Lịch sử đơn hàng
                </Link>
                <Link to="/" className="cs-btn cs-btn--ghost">
                    Về trang chủ
                </Link>
            </div>
        </div>
    </div>
);

/* ─── Order Info Box ─── */
const OrderInfoBox = ({ orderInfo }: { orderInfo: OrderInfo }) => (
    <div className="cs-info-box">
        <div className="cs-info-row">
            <span className="cs-info-label">Mã đơn hàng</span>
            <span className="cs-info-value cs-info-value--mono">{orderInfo.id}</span>
        </div>
        <div className="cs-info-row">
            <span className="cs-info-label">Tổng tiền</span>
            <span className="cs-info-value cs-info-value--green">{formatCurrency(orderInfo.totalAmount)}</span>
        </div>
        <div className="cs-info-row">
            <span className="cs-info-label">Phương thức</span>
            <span className="cs-info-value">{PAYMENT_METHOD_LABEL[orderInfo.paymentMethod] ?? orderInfo.paymentMethod}</span>
        </div>
        <div className="cs-info-row">
            <span className="cs-info-label">Trạng thái</span>
            <span className={`cs-badge ${orderInfo.paymentStatus === "Paid" ? "cs-badge--success" : "cs-badge--warning"}`}>
                {orderInfo.paymentStatus === "Paid" ? "Đã thanh toán" : "Chưa thanh toán"}
            </span>
        </div>
    </div>
);

/* ─── Styles ─── */
const styles = `
.checkout-success-wrapper {
    min-height: 100vh;
    background: linear-gradient(135deg, #f0f7f0 0%, #e8f5e9 50%, #f5f5f5 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    font-family: 'Inter', -apple-system, sans-serif;
}

.checkout-success-container {
    width: 100%;
    max-width: 480px;
}

/* Card */
.cs-card {
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.10);
    overflow: hidden;
    animation: cs-fade-up 0.4s ease both;
}

@keyframes cs-fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
}

.cs-card__accent {
    height: 5px;
    width: 100%;
}
.cs-card__accent--success { background: linear-gradient(90deg, #22c55e, #16a34a); }
.cs-card__accent--warning { background: linear-gradient(90deg, #f59e0b, #d97706); }
.cs-card__accent--danger  { background: linear-gradient(90deg, #ef4444, #dc2626); }
.cs-card__accent--neutral { background: linear-gradient(90deg, #9ca3af, #6b7280); }

.cs-card__body {
    padding: 2.5rem 2rem;
}
.cs-card__body--center {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    text-align: center;
}

/* Icon ring */
.cs-icon-ring {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.cs-icon-ring--success { background: #dcfce7; color: #16a34a; }
.cs-icon-ring--warning { background: #fef3c7; color: #d97706; }
.cs-icon-ring--danger  { background: #fee2e2; color: #dc2626; }
.cs-icon-ring--neutral { background: #f3f4f6; color: #6b7280; }

.cs-icon {
    width: 2.25rem;
    height: 2.25rem;
}
.cs-icon--spin-slow {
    animation: cs-spin 2s linear infinite;
}
@keyframes cs-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
}

/* Spinner */
.cs-spinner {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 4px solid #e5e7eb;
    border-top-color: #16a34a;
    animation: cs-spin 0.8s linear infinite;
}

/* Text */
.cs-text-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
.cs-title {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.3;
    margin: 0;
}
.cs-title--success { color: #15803d; }
.cs-title--warning { color: #b45309; }
.cs-title--danger  { color: #b91c1c; }
.cs-title--neutral { color: #374151; }

.cs-subtitle {
    font-size: 0.9rem;
    color: #6b7280;
    line-height: 1.6;
    margin: 0;
    max-width: 360px;
}
.cs-muted {
    color: #9ca3af;
    font-size: 0.875rem;
    margin: 0;
}
.cs-error-note {
    font-size: 0.8rem;
    color: #ef4444;
    font-style: italic;
    margin: 0.25rem 0 0;
}

/* Info box */
.cs-info-box {
    width: 100%;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    text-align: left;
}
.cs-info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f3f4f6;
    gap: 1rem;
}
.cs-info-row:last-child { border-bottom: none; }
.cs-info-label {
    font-size: 0.8rem;
    color: #9ca3af;
    font-weight: 500;
    white-space: nowrap;
}
.cs-info-value {
    font-size: 0.85rem;
    color: #374151;
    font-weight: 600;
    text-align: right;
    word-break: break-all;
}
.cs-info-value--mono {
    font-family: 'Courier New', monospace;
    font-size: 0.75rem;
}
.cs-info-value--green { color: #15803d; }

/* Badge */
.cs-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.65rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
}
.cs-badge--success { background: #dcfce7; color: #15803d; }
.cs-badge--warning { background: #fef3c7; color: #92400e; }

/* Note box */
.cs-note-box {
    width: 100%;
    display: flex;
    gap: 0.75rem;
    background: #fefce8;
    border: 1px solid #fde68a;
    border-radius: 12px;
    padding: 1rem;
    text-align: left;
    font-size: 0.85rem;
    color: #78350f;
    line-height: 1.6;
}
.cs-note-box__icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
    color: #d97706;
    margin-top: 1px;
}

/* Countdown */
.cs-countdown {
    font-size: 0.8rem;
    color: #9ca3af;
    margin: -0.5rem 0;
}
.cs-countdown__num {
    font-weight: 700;
    color: #16a34a;
}

/* Actions */
.cs-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
}
@media (min-width: 420px) {
    .cs-actions { flex-direction: row; }
}

.cs-btn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.25rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.15s ease;
    cursor: pointer;
    border: none;
}
.cs-btn--primary {
    background: #16a34a;
    color: #fff;
}
.cs-btn--primary:hover {
    background: #15803d;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(22,163,74,0.25);
}
.cs-btn--ghost {
    background: transparent;
    color: #374151;
    border: 1.5px solid #e5e7eb;
}
.cs-btn--ghost:hover {
    border-color: #16a34a;
    color: #15803d;
}
`;

export default CheckoutSuccessPage;
