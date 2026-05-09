import { useEffect, useState } from "react";
import { useExecute } from "../../hooks/execute";
import { getCheckoutHistory } from "../../services/order/order.service";
import { useAuthContext } from "../../contexts/auth/auth";
import { useNavigate } from "react-router";

type TransactionItem = {
    id: string;
    paymentType: string;
    amount: number;
    requestId: string;
    createdAt: string;
    orderId: string;
    order: {
        id: string;
        totalAmount: number;
        status: string;
        paymentMethod: string;
        paymentStatus: string;
        createdAt: string;
        recipientName: string;
    } | null;
};

const payTypeLabel: Record<string, string> = {
    Cod: "COD", Momo: "Momo", SePay: "SePay",
};

const orderStatusLabel: Record<string, string> = {
    Pending: "Chờ xác nhận", Confirmed: "Đã xác nhận",
    InTransit: "Đang giao", Received: "Đã nhận", Cancelled: "Đã hủy",
};

const orderStatusClass: Record<string, string> = {
    Pending: "text-yellow-700 bg-yellow-100", Confirmed: "text-blue-700 bg-blue-100",
    InTransit: "text-indigo-700 bg-indigo-100", Received: "text-emerald-700 bg-emerald-100", Cancelled: "text-red-700 bg-red-100",
};

const formatDT = (v: string) =>
    new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    }).format(new Date(v));

const TransactionPage = () => {
    const { state: user } = useAuthContext();
    const navigate = useNavigate();
    const { query, loading } = useExecute();
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.uid) return;
        query(getCheckoutHistory(user.uid)).then(res => {
            if (res?.data) {
                const data = Array.isArray(res.data) ? res.data : [];
                setTransactions(data as TransactionItem[]);
            } else if (res?.errors) {
                const err = Array.isArray(res.errors) ? res.errors.join(", ") : res.errors;
                setError(err ?? "Không thể tải lịch sử giao dịch");
            }
        });
    }, [user?.uid]);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <p className="text-gray-500">Vui lòng đăng nhập để xem lịch sử giao dịch</p>
                <button onClick={() => navigate("/auth/login")}
                    className="px-5 py-2 rounded-xl bg-[rgb(51,102,51)] text-white text-sm hover:bg-[#2d7a2d]">
                    Đăng nhập
                </button>
            </div>
        );
    }

    const totalPaid = transactions.reduce((s, t) => s + (t.amount ?? 0), 0);

    return (
        <div className="pb-16">
            {/* Hero */}
            <div className="bg-gray-900 text-white flex flex-col items-center py-10 lg:py-12 gap-2">
                <h1 className="text-2xl lg:text-4xl font-semibold">Lịch sử giao dịch</h1>
                <p className="text-sm text-gray-400">Tất cả giao dịch thanh toán của bạn</p>
            </div>

            <div className="container mx-auto px-5 lg:px-20 py-8 space-y-6">
                {/* Breadcrumb */}
                <div className="text-sm space-x-2">
                    <a href="/" className="text-gray-400 hover:text-[rgb(51,102,51)]">Trang chủ</a>
                    <span className="text-gray-300">/</span>
                    <span className="font-semibold text-[rgb(51,102,51)]">Lịch sử giao dịch</span>
                </div>

                {/* Summary */}
                {transactions.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="rounded-2xl border border-gray-100 p-5 space-y-1">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Tổng giao dịch</p>
                            <p className="text-2xl font-bold text-gray-800">{transactions.length}</p>
                        </div>
                        <div className="rounded-2xl border border-gray-100 p-5 space-y-1">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Tổng đã thanh toán</p>
                            <p className="text-2xl font-bold text-[rgb(51,102,51)]">{totalPaid.toLocaleString("vi-VN")} đ</p>
                        </div>
                        <div className="rounded-2xl border border-gray-100 p-5 space-y-1">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Giao dịch gần nhất</p>
                            <p className="text-sm font-medium text-gray-700">
                                {transactions[0] ? formatDT(transactions[0].createdAt) : "—"}
                            </p>
                        </div>
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="py-16 text-center text-red-500 text-sm">{error}</div>
                ) : transactions.length === 0 ? (
                    <div className="py-24 text-center space-y-3">
                        <div className="text-4xl">💳</div>
                        <p className="text-gray-500">Bạn chưa có giao dịch nào</p>
                        <button onClick={() => navigate("/page/product")}
                            className="px-5 py-2 rounded-xl bg-[rgb(51,102,51)] text-white text-sm hover:bg-[#2d7a2d]">
                            Mua sắm ngay
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {transactions.map(tx => (
                            <div key={tx.id}
                                className="rounded-2xl border border-gray-100 p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4 hover:border-gray-200">
                                {/* Left: transaction info */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                            💳 {payTypeLabel[tx.paymentType] ?? tx.paymentType}
                                        </span>
                                        {tx.order && (
                                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${orderStatusClass[tx.order.status] ?? "bg-gray-100 text-gray-600"}`}>
                                                {orderStatusLabel[tx.order.status] ?? tx.order.status}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 font-mono">Mã GD: {tx.requestId}</p>
                                    {tx.order && (
                                        <p className="text-sm text-gray-600">
                                            Người nhận: <span className="font-medium text-gray-800">{tx.order.recipientName}</span>
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400">{formatDT(tx.createdAt)}</p>
                                </div>

                                {/* Right: amount + link */}
                                <div className="flex flex-col items-start md:items-end gap-2">
                                    <p className="text-xl font-bold text-gray-800">
                                        {tx.amount.toLocaleString("vi-VN")} đ
                                    </p>
                                    {tx.orderId && (
                                        <button
                                            onClick={() => navigate(`/page/orders/${tx.orderId}`)}
                                            className="text-xs text-[rgb(51,102,51)] underline underline-offset-2 hover:text-[#2d7a2d]">
                                            Xem đơn hàng →
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionPage;
