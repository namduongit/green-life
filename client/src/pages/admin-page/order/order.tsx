import { useCallback, useEffect, useMemo, useState } from "react";
import InputSearch from "../../../components/input/input-search/input-search";
import Stats from "../../../components/stats/stats";
import Table from "../../../components/table/table";
import type { TableBody, TableHeader } from "../../../components/table/table";
import type {
    OrderPaymentMethod,
    OrderPaymentStatus,
    OrderStatus,
} from "../../../lib/types/enums.typs";
import type { OrderRep } from "../../../services/order/order.type";
import { useExecute } from "../../../hooks/execute";
import { getOrder } from "../../../services/order/order.service";

const statusText: Record<OrderStatus, string> = {
    Pending: "Chờ xác nhận",
    Confirm: "Đã xác nhận",
    InTransit: "Đang giao",
    Done: "Hoàn thành",
    Cancled: "Đã hủy",
};

const statusClass: Record<OrderStatus, string> = {
    Pending: "text-yellow-700 bg-yellow-100",
    Confirm: "text-blue-700 bg-blue-100",
    InTransit: "text-indigo-700 bg-indigo-100",
    Done: "text-green-700 bg-green-100",
    Cancled: "text-red-700 bg-red-100",
};

const paymentMethodText: Record<OrderPaymentMethod, string> = {
    Cod: "COD",
    Momo: "Momo",
    SePay: "SePay",
};

const paymentStatusText: Record<OrderPaymentStatus, string> = {
    UnPaid: "Chưa thanh toán",
    Paid: "Đã thanh toán",
};

const paymentStatusClass: Record<OrderPaymentStatus, string> = {
    UnPaid: "text-orange-700 bg-orange-100",
    Paid: "text-emerald-700 bg-emerald-100",
};

const AdminOrder = () => {
    const { query } = useExecute();
    const [orders, setOrders] = useState<OrderRep[]>([]);
    const [stats, setStats] = useState({
        totalAmount: 0,
        pendingCount: 0,
        doneCount: 0,
        paidCount: 0,
    });

    const fetchOrders = useCallback(async () => {
        const response = await query<OrderRep[]>(getOrder());
        if (response && response.data) {
            setOrders(response.data);
        }
    }, []);

    useEffect(() => {
        void fetchOrders();
    }, []);

    useEffect(() => {
        const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const pendingCount = orders.filter((order) => order.status === "Pending").length;
        const doneCount = orders.filter((order) => order.status === "Done").length;
        const paidCount = orders.filter((order) => order.paymentStatus === "Paid").length;

        setStats({
            totalAmount: totalAmount,
            pendingCount: pendingCount,
            doneCount: doneCount,
            paidCount: paidCount,
        });
    }, [orders]);

    const [searchInput, setSearchInput] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);

    const filteredOrders = useMemo(() => {
        const keyword = searchInput.toLowerCase().trim();
        if (!keyword) return orders;

        return orders.filter((order) => {
            const fullAddress = `${order.recipientDetail}, ${order.recipientWard}, ${order.recipientProvince}`;

            return (
                order.id.toLowerCase().includes(keyword) ||
                order.recipientName.toLowerCase().includes(keyword) ||
                order.recipientPhone.toLowerCase().includes(keyword) ||
                fullAddress.toLowerCase().includes(keyword) ||
                order.accountId.toLowerCase().includes(keyword)
            );
        });
    }, [searchInput, orders]);

    const formatDateTime = (value: Date | string) =>
        new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(value));

    const tableHead: TableHeader = [
        "# ID",
        "Khách hàng",
        "SĐT",
        "Địa chỉ giao",
        "SL",
        "Tổng tiền",
        "Thanh toán",
        "Trạng thái",
        "Ngày tạo",
    ];

    const tableBody: TableBody = orders.map((order) => [
        {
            reactNode: (
                <div className="max-w-42 truncate" title={order.id}>
                    {order.id}
                </div>
            ),
            clipboard: order.id,
        },
        {
            reactNode: (
                <div className="max-w-40 truncate" title={order.recipientName}>
                    {order.recipientName}
                </div>
            ),
        },
        order.recipientPhone,
        {
            reactNode: (
                <div
                    className="max-w-52 truncate"
                    title={`${order.recipientDetail}, ${order.recipientWard}, ${order.recipientProvince}`}
                >
                    {`${order.recipientDetail}, ${order.recipientWard}, ${order.recipientProvince}`}
                </div>
            ),
        },
        order.totalQuantity.toString(),
        `${order.totalAmount.toLocaleString("vi-VN")} đ`,
        {
            reactNode: (
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-600">{paymentMethodText[order.paymentMethod]}</span>
                    <span
                        className={`w-fit px-2 py-1 rounded text-xs ${paymentStatusClass[order.paymentStatus]}`}
                    >
                        {paymentStatusText[order.paymentStatus]}
                    </span>
                </div>
            ),
        },
        {
            reactNode: (
                <span className={`px-2 py-1 rounded text-xs ${statusClass[order.status]}`}>
                    {statusText[order.status]}
                </span>
            ),
        },
        formatDateTime(order.createdAt),
    ]);

    return (
        <div className="px-8 pt-5 space-y-5">
            <div className="flex justify-between">
                <div>
                    <h1 className="text-blue-700 text-2xl font-semibold">Order management</h1>
                    <p className="text-gray-500 text-sm">Quản lý đơn hàng trong hệ thống</p>
                </div>

                <button className="flex items-center gap-2 bg-white px-3 py-1 rounded ring-2 text-sm ring-gray-300">
                    <i className="fa-solid fa-arrow-up-from-bracket"></i>
                    <span>Xuất file</span>
                </button>
            </div>

            <div className="grid grid-cols-5 gap-5">
                <Stats
                    icon={<i className="fa-solid fa-receipt"></i>}
                    title="Tổng đơn hàng"
                    des={`${orders.length} đơn`}
                />

                <Stats
                    icon={<i className="fa-solid fa-wallet"></i>}
                    title="Tổng doanh thu"
                    des={`${stats.totalAmount.toLocaleString("vi-VN")} đ`}
                />

                <Stats
                    icon={<i className="fa-solid fa-hourglass-half"></i>}
                    iconColor="text-yellow-700"
                    iconBg="bg-yellow-100"
                    title="Chờ xác nhận"
                    des={`${stats.pendingCount} đơn`}
                />

                <Stats
                    icon={<i className="fa-solid fa-circle-check"></i>}
                    iconColor="text-green-700"
                    iconBg="bg-green-100"
                    title="Hoàn thành"
                    des={`${stats.doneCount} đơn`}
                />

                <Stats
                    icon={<i className="fa-solid fa-money-check-dollar"></i>}
                    iconColor="text-emerald-700"
                    iconBg="bg-emerald-100"
                    title="Đã thanh toán"
                    des={`${stats.paidCount} đơn`}
                />
            </div>

            <div className="flex justify-between items-center">
                <InputSearch
                    searchInput={searchInput}
                    setSearchInput={(value) => {
                        setSearchInput(value);
                        setCurrentPage(1);
                    }}
                    opts={{ width: "w-74" }}
                />

                <div className="text-sm text-gray-500">
                    Hiển thị {orders.length} / {filteredOrders.length} đơn hàng
                </div>
            </div>

            <div>
                <Table tableHead={tableHead} tableBody={tableBody} />

                <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500">
                        Trang {currentPage} / {Math.ceil(filteredOrders.length / 10) || 1}
                    </span>

                    <div className="flex gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                            className="px-3 py-1 text-sm rounded ring-1 ring-gray-300 disabled:opacity-50"
                        >
                            Previous
                        </button>

                        <button
                            disabled={currentPage >= Math.ceil(filteredOrders.length / 10) || filteredOrders.length === 0}
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            className="px-3 py-1 text-sm rounded ring-1 ring-gray-300 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrder;
