import { useMemo, useState, useEffect, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useAuthContext } from "../../contexts/auth/auth";
import { getOrders } from "../../services/order/order.service";
import type { OrderRep } from "../../services/order/order.type";
import {
    OrderPaymentStatus as OrderPaymentStatusEnum,
    OrderStatus as OrderStatusEnum,
} from "../../lib/types/enums.typs";
import type {
    OrderPaymentStatus as OrderPaymentStatusValue,
    OrderStatus as OrderStatusValue,
} from "../../lib/types/enums.typs";

type OrderTab = "tracking" | "history";

const orderTabs: { id: OrderTab; label: string; description: string }[] = [
    { id: "tracking", label: "Theo dõi đơn hàng", description: "Cập nhật trạng thái thực tế" },
    { id: "history", label: "Lịch sử mua hàng", description: "Tất cả đơn đã hoàn tất" }
];

const paymentMethodLabel: Record<OrderRep["paymentMethod"], string> = {
    Cod: "Thanh toán khi nhận hàng",
    Momo: "Ví MoMo",
    SePay: "SePay"
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

const formatDateTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "--/--/----";
    }
    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const getStatusLabel = (status: OrderStatusValue) => {
    switch (status) {
        case OrderStatusEnum.Pending:
            return "Chờ xác nhận";
        case OrderStatusEnum.Confirm:
            return "Đã xác nhận";
        case OrderStatusEnum.InTransit:
            return "Đang vận chuyển";
        case OrderStatusEnum.Done:
            return "Hoàn tất";
        case OrderStatusEnum.Cancled:
            return "Đã huỷ";
        default:
            return "Đang xử lý";
    }
};

const getStatusColor = (status: OrderStatusValue) => {
    switch (status) {
        case OrderStatusEnum.Done:
            return "text-green-700";
        case OrderStatusEnum.Pending:
            return "text-orange-600";
        case OrderStatusEnum.Confirm:
            return "text-blue-600";
        case OrderStatusEnum.InTransit:
            return "text-indigo-600";
        case OrderStatusEnum.Cancled:
            return "text-red-600";
        default:
            return "text-gray-600";
    }
};

const getPaymentStatusLabel = (status: OrderPaymentStatusValue) =>
    status === OrderPaymentStatusEnum.Paid ? "Đã thanh toán" : "Chưa thanh toán";

const getErrorMessage = (error: unknown) => {
    if (typeof error === "string") {
        return error;
    }
    if (error && typeof error === "object") {
        const { message, error: nested } = error as { message?: string; error?: string | string[] };
        if (typeof message === "string" && message.length) {
            return message;
        }
        if (Array.isArray(nested) && nested.length) {
            return nested.join(", ");
        }
        if (typeof nested === "string" && nested.length) {
            return nested;
        }
    }
    return "Không thể tải đơn hàng. Vui lòng thử lại.";
};

const OrderPage = () => {
    const { state } = useAuthContext();
    const location = useLocation();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<OrderRep[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<OrderTab>(() => {
        const params = new URLSearchParams(location.search);
        return params.get("tab") === "history" ? "history" : "tracking";
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tabFromUrl = params.get("tab") === "history" ? "history" : "tracking";
        setActiveTab(tabFromUrl);
    }, [location.search]);

    const fetchOrders = useCallback(async () => {
        if (!state?.uid) {
            setOrders([]);
            setFetchError(null);
            return;
        }

        setIsLoading(true);
        setFetchError(null);

        try {
            const response = await getOrders(state.uid);
            setOrders(response.data ?? []);
        } catch (error) {
            setFetchError(getErrorMessage(error));
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    }, [state?.uid]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleTabChange = (tab: OrderTab) => {
        const params = new URLSearchParams(location.search);
        if (params.get("tab") === tab) {
            return;
        }
        params.set("tab", tab);
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    };

    const sortedOrders = useMemo(() => {
        return [...orders].sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return timeB - timeA;
        });
    }, [orders]);

    const trackingOrders = useMemo(() => {
        return sortedOrders.filter(
            (order) => order.status !== OrderStatusEnum.Done && order.status !== OrderStatusEnum.Cancled
        );
    }, [sortedOrders]);

    const historyOrders = useMemo(() => {
        return sortedOrders.filter(
            (order) => order.status === OrderStatusEnum.Done || order.status === OrderStatusEnum.Cancled
        );
    }, [sortedOrders]);

    if (!state) {
        return (
            <div className="sm-container mx-auto py-16">
                <div className="rounded-xl border border-dashed border-green-600 px-6 py-10 text-center space-y-4">
                    <h1 className="text-2xl font-semibold text-green-700">Bạn chưa đăng nhập</h1>
                    <p className="text-gray-600">Đăng nhập để theo dõi đơn hàng và xem lịch sử mua sắm.</p>
                    <NavLink to="/auth/login" className="inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800">
                        Đăng nhập ngay
                    </NavLink>
                </div>
            </div>
        );
    }

    const renderEmptyState = (title: string, description: string) => (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="mt-2 text-sm text-gray-500">{description}</p>
        </div>
    );

    const renderLoadingState = () => (
        <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
                <div key={`order-skeleton-${index}`} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="h-6 w-32 rounded bg-gray-200" />
                        <div className="h-4 w-48 rounded bg-gray-200" />
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div className="h-16 rounded bg-gray-200" />
                        <div className="h-16 rounded bg-gray-200" />
                        <div className="h-16 rounded bg-gray-200" />
                    </div>
                </div>
            ))}
        </div>
    );

    const renderErrorState = () => (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
            <p className="text-sm font-semibold text-red-700">{fetchError}</p>
            <p className="mt-1 text-sm text-red-600">Vui lòng thử tải lại đơn hàng.</p>
            <button
                type="button"
                onClick={fetchOrders}
                className="mt-4 inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:border-red-300"
            >
                Thử lại
            </button>
        </div>
    );

    const renderTracking = () => {
        if (!trackingOrders.length) {
            return renderEmptyState("Chưa có đơn hàng nào đang xử lý", "Khi bạn đặt mua, trạng thái vận chuyển sẽ hiển thị tại đây.");
        }

        return (
            <div className="space-y-4">
                {trackingOrders.map((order) => (
                    <div key={order.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">Mã đơn</p>
                                <h3 className="text-xl font-semibold text-gray-900">{order.id}</h3>
                                <p className="text-sm text-gray-500">Tạo ngày {formatDateTime(order.createdAt)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Trạng thái</p>
                                <p className={`text-base font-semibold ${getStatusColor(order.status)}`}>
                                    {getStatusLabel(order.status)}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Thanh toán: <span className="font-medium text-gray-700">{getPaymentStatusLabel(order.paymentStatus)}</span>
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">Người nhận</p>
                                <p className="text-sm font-medium text-gray-900">{order.recipientName}</p>
                                <p className="text-sm text-gray-500">{order.recipientPhone}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">Địa chỉ</p>
                                <p className="text-sm text-gray-700">{order.recipientDetail}</p>
                                <p className="text-sm text-gray-500">{order.recipientWard}, {order.recipientProvince}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">Tổng cộng</p>
                                <p className="text-lg font-semibold text-green-700">{formatCurrency(order.totalAmount)}</p>
                                <p className="text-sm text-gray-500">{order.totalQuantity} sản phẩm • {paymentMethodLabel[order.paymentMethod] ?? order.paymentMethod}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderHistory = () => {
        if (!historyOrders.length) {
            return renderEmptyState("Chưa có đơn đã hoàn tất", "Những đơn hàng hoàn thành hoặc huỷ sẽ xuất hiện tại đây.");
        }

        return (
            <div className="space-y-4">
                {historyOrders.map((order) => (
                    <div key={order.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">Mã đơn</p>
                                <h3 className="text-xl font-semibold text-gray-900">{order.id}</h3>
                                <p className="text-sm text-gray-500">Cập nhật lần cuối {formatDateTime(order.updatedAt)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Thanh toán</p>
                                <p className="text-lg font-semibold text-green-700">{formatCurrency(order.totalAmount)}</p>
                                <p className="text-sm text-gray-500">{order.totalQuantity} sản phẩm</p>
                            </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-sm">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">{paymentMethodLabel[order.paymentMethod] ?? order.paymentMethod}</span>
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">{getPaymentStatusLabel(order.paymentStatus)}</span>
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">{getStatusLabel(order.status)}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderOrdersSection = () => {
        if (isLoading) {
            return renderLoadingState();
        }
        if (fetchError) {
            return renderErrorState();
        }
        if (activeTab === "tracking") {
            return renderTracking();
        }
        return renderHistory();
    };

    return (
        <div className="pb-20">
            <div className="sm-container mx-auto py-10 space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Tài khoản</p>
                            <h1 className="text-2xl font-semibold text-green-700">Đơn hàng của {state.email}</h1>
                        </div>
                        <p className="text-sm text-gray-500">Cập nhật theo thời gian thực từ hệ thống GreenLife.</p>
                    </div>
                    <div className="mt-6 grid gap-3 md:grid-cols-2">
                        {orderTabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => handleTabChange(tab.id)}
                                className={`rounded-xl border px-4 py-3 text-left transition ${activeTab === tab.id ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-green-600"}`}
                            >
                                <p className="text-sm font-semibold text-gray-800">{tab.label}</p>
                                <p className="text-xs text-gray-500">{tab.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {renderOrdersSection()}
            </div>
        </div>
    );
};

export default OrderPage;
