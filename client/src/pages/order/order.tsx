import { useMemo, useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useAuthContext } from "../../contexts/auth/auth";

type OrderTab = "tracking" | "history";

type TrackingOrder = {
    id: string;
    status: "packing" | "shipping" | "delivered";
    estimatedDelivery: string;
    items: string[];
    checkpoint: string;
};

type HistoryOrder = {
    id: string;
    summary: string;
    total: string;
    purchasedAt: string;
};

const trackingOrders: TrackingOrder[] = [
    {
        id: "GH-2303",
        status: "shipping",
        estimatedDelivery: "27/03/2026",
        items: ["Nho xanh không hạt", "Cải kale hữu cơ"],
        checkpoint: "Đơn hàng đang trên đường vận chuyển đến kho Hồ Chí Minh"
    },
    {
        id: "GH-2298",
        status: "packing",
        estimatedDelivery: "25/03/2026",
        items: ["Gạo lứt Nhật", "Hạnh nhân rang"],
        checkpoint: "Đang chuẩn bị đóng gói tại trung tâm GreenLife"
    }
];

const historyOrders: HistoryOrder[] = [
    {
        id: "GL-2201",
        summary: "Combo rau củ tuần",
        total: "480.000 đ",
        purchasedAt: "12/03/2026"
    },
    {
        id: "GL-2194",
        summary: "4 sản phẩm hữu cơ",
        total: "620.000 đ",
        purchasedAt: "03/03/2026"
    }
];

const orderTabs: { id: OrderTab; label: string; description: string }[] = [
    { id: "tracking", label: "Theo dõi đơn hàng", description: "Cập nhật trạng thái thực tế" },
    { id: "history", label: "Lịch sử mua hàng", description: "Tất cả đơn đã hoàn tất" }
];

const OrderPage = () => {
    const { state } = useAuthContext();
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<OrderTab>(() => {
        const params = new URLSearchParams(location.search);
        return params.get("tab") === "history" ? "history" : "tracking";
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tabFromUrl = params.get("tab") === "history" ? "history" : "tracking";
        setActiveTab(tabFromUrl);
    }, [location.search]);

    const handleTabChange = (tab: OrderTab) => {
        const params = new URLSearchParams(location.search);
        if (params.get("tab") === tab) {
            return;
        }
        params.set("tab", tab);
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    };

    const displayedTrackingOrders = useMemo(() => trackingOrders, []);
    const displayedHistoryOrders = useMemo(() => historyOrders, []);

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

    const renderTracking = () => (
        <div className="space-y-4">
            {displayedTrackingOrders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Mã đơn</p>
                            <h3 className="text-xl font-semibold text-gray-900">{order.id}</h3>
                        </div>
                        <div className="text-sm text-gray-500">
                            Dự kiến giao: <span className="font-semibold text-green-700">{order.estimatedDelivery}</span>
                        </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600">
                        {order.items.map((item) => (
                            <span key={`${order.id}-${item}`} className="rounded-full bg-gray-100 px-3 py-1">
                                {item}
                            </span>
                        ))}
                    </div>
                    <div className="mt-4">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Trạng thái</p>
                        <div className="mt-1 flex items-center gap-3">
                            <span className={`text-sm font-semibold ${order.status === "delivered" ? "text-green-700" : order.status === "shipping" ? "text-orange-600" : "text-blue-600"}`}>
                                {order.status === "packing" && "Đang chuẩn bị"}
                                {order.status === "shipping" && "Đang vận chuyển"}
                                {order.status === "delivered" && "Đã giao"}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">{order.checkpoint}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderHistory = () => (
        <div className="space-y-4">
            {displayedHistoryOrders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Mã đơn</p>
                            <h3 className="text-xl font-semibold text-gray-900">{order.id}</h3>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Thanh toán</p>
                            <p className="text-lg font-semibold text-green-700">{order.total}</p>
                        </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{order.summary}</p>
                    <p className="text-sm text-gray-400">Hoàn tất ngày {order.purchasedAt}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                        <button type="button" className="rounded-full border border-gray-200 px-3 py-1 text-gray-600 hover:border-green-600 hover:text-green-700">
                            Mua lại
                        </button>
                        <button type="button" className="rounded-full border border-gray-200 px-3 py-1 text-gray-600 hover:border-green-600 hover:text-green-700">
                            Xem hoá đơn
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );

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

                {activeTab === "tracking" && renderTracking()}
                {activeTab === "history" && renderHistory()}
            </div>
        </div>
    );
};

export default OrderPage;
