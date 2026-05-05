import { useCallback, useEffect, useMemo, useState } from "react";
import Stats from "../../../components/stats/stats";
import { useExecute } from "../../../hooks/execute";
import { getAllAccounts } from "../../../services/account/account.service";
import type { AccountRep } from "../../../services/account/account.type";
import { getAllCategories } from "../../../services/category/category";
import type { CategoryRep } from "../../../services/category/category.type";
import { getAllProducts } from "../../../services/product/product";
import type { ProductRep } from "../../../services/product/product.type";
import { getAllTags } from "../../../services/tag/tag";
import type { TagRep } from "../../../services/tag/tag.type";
import { getOrder } from "../../../services/order/order.service";
import type { OrderRep } from "../../../services/order/order.type";
import { useToastContext } from "../../../contexts/toast-message/toast-message";

const currency = new Intl.NumberFormat("vi-VN");

const formatDateTime = (value: string | Date) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const statusLabel: Record<string, string> = {
  Pending: "Chờ xác nhận",
  Confirm: "Đã xác nhận",
  InTransit: "Đang giao",
  Done: "Hoàn thành",
  Cancled: "Đã hủy",
};

const statusClass: Record<string, string> = {
  Pending: "text-yellow-700 bg-yellow-100",
  Confirm: "text-blue-700 bg-blue-100",
  InTransit: "text-indigo-700 bg-indigo-100",
  Done: "text-green-700 bg-green-100",
  Cancled: "text-red-700 bg-red-100",
};

const payClass: Record<string, string> = {
  UnPaid: "text-orange-700 bg-orange-100",
  Paid: "text-emerald-700 bg-emerald-100",
};

const AdminDashboard = () => {
  const { query, loading } = useExecute();
  const { showErrorResponse } = useToastContext();

  const [accounts, setAccounts] = useState<AccountRep[]>([]);
  const [products, setProducts] = useState<ProductRep[]>([]);
  const [orders, setOrders] = useState<OrderRep[]>([]);
  const [categories, setCategories] = useState<CategoryRep[]>([]);
  const [tags, setTags] = useState<TagRep[]>([]);

  const fetchDashboard = useCallback(async () => {
    const [accountsRes, productsRes, ordersRes, categoriesRes, tagsRes] =
      await Promise.all([
        query(getAllAccounts()),
        query(getAllProducts({ page: 1, pageSize: 999 })),
        query(getOrder()),
        query(getAllCategories()),
        query(getAllTags()),
      ]);

    if (accountsRes?.errors) showErrorResponse(accountsRes.errors);
    if (productsRes?.errors) showErrorResponse(productsRes.errors);
    if (ordersRes?.errors) showErrorResponse(ordersRes.errors);
    if (categoriesRes?.errors) showErrorResponse(categoriesRes.errors);
    if (tagsRes?.errors) showErrorResponse(tagsRes.errors);

    setAccounts(Array.isArray(accountsRes?.data) ? accountsRes.data : []);

    const productData = productsRes?.data as any;
    setProducts(
      Array.isArray(productData) ? productData : (productData?.data ?? []),
    );

    setOrders(Array.isArray(ordersRes?.data) ? ordersRes.data : []);
    setCategories(Array.isArray(categoriesRes?.data) ? categoriesRes.data : []);
    setTags(Array.isArray(tagsRes?.data) ? tagsRes.data : []);
  }, [query, showErrorResponse]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.status === "Done" ? order.totalAmount : 0),
      0,
    );
    const totalPaidOrders = orders.filter(
      (order) => order.paymentStatus === "Paid",
    ).length;
    const totalLockedAccounts = accounts.filter(
      (account) => account.isLock,
    ).length;
    const totalDeletedProducts = products.filter(
      (product) => product.isDelete,
    ).length;
    const totalDeletedCategories = categories.filter(
      (category) => category.isDelete,
    ).length;
    const totalDeletedTags = tags.filter((tag) => tag.isDelete).length;

    return {
      totalRevenue,
      totalPaidOrders,
      totalLockedAccounts,
      totalDeletedProducts,
      totalDeletedCategories,
      totalDeletedTags,
      totalProducts: products.length,
      totalOrders: orders.length,
      totalAccounts: accounts.length,
      totalCategories: categories.length,
      totalTags: tags.length,
    };
  }, [accounts, categories, orders, products, tags]);

  const orderStatusBreakdown = useMemo(() => {
    const groups = [
      "Pending",
      "Confirm",
      "InTransit",
      "Done",
      "Cancled",
    ] as const;
    return groups.map((status) => {
      const count = orders.filter((order) => order.status === status).length;
      return {
        status,
        label: statusLabel[status],
        count,
        percent: orders.length ? Math.round((count / orders.length) * 100) : 0,
      };
    });
  }, [orders]);

  const productStatusBreakdown = useMemo(() => {
    const active = products.filter((product) => !product.isDelete).length;
    const deleted = products.filter((product) => product.isDelete).length;
    return [
      {
        label: "Hoạt động",
        count: active,
        percent: products.length
          ? Math.round((active / products.length) * 100)
          : 0,
        color: "from-emerald-500 to-teal-500",
      },
      {
        label: "Đã xóa",
        count: deleted,
        percent: products.length
          ? Math.round((deleted / products.length) * 100)
          : 0,
        color: "from-rose-500 to-red-500",
      },
    ];
  }, [products]);

  const paymentBreakdown = useMemo(() => {
    const paid = orders.filter(
      (order) => order.paymentStatus === "Paid",
    ).length;
    const unpaid = orders.filter(
      (order) => order.paymentStatus === "UnPaid",
    ).length;
    return [
      {
        label: "Đã thanh toán",
        count: paid,
        percent: orders.length ? Math.round((paid / orders.length) * 100) : 0,
        color: "from-sky-500 to-blue-500",
      },
      {
        label: "Chưa thanh toán",
        count: unpaid,
        percent: orders.length ? Math.round((unpaid / orders.length) * 100) : 0,
        color: "from-amber-500 to-orange-500",
      },
    ];
  }, [orders]);

  const topCategories = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    products.forEach((product) => {
      if (!product.category?.id) return;
      const current = map.get(product.category.id);
      if (current) {
        current.count += 1;
      } else {
        map.set(product.category.id, { name: product.category.name, count: 1 });
      }
    });

    return Array.from(map.values())
      .sort((left, right) => right.count - left.count)
      .slice(0, 5);
  }, [products]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [orders]);

  const averageOrderValue = stats.totalOrders
    ? Math.round(stats.totalRevenue / stats.totalOrders)
    : 0;
  const productStock = products.reduce(
    (sum, product) => sum + (product.currentStock ?? 0),
    0,
  );

  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 md:px-8 md:py-6 space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-900 px-6 py-7 text-white shadow-xl md:px-8">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -top-16 -right-10 h-44 w-44 rounded-full bg-emerald-400/30 blur-3xl" />
          <div className="absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-cyan-400/20 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-100">
              Tổng quan admin
            </span>
            <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Thống kê vận hành cho cửa hàng
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
              Theo dõi doanh thu, đơn hàng, tồn kho và trạng thái dữ liệu quan
              trọng trong một màn hình.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/80">
                Doanh thu hoàn thành
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {currency.format(stats.totalRevenue)} đ
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/80">
                Đơn đã thanh toán
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {stats.totalPaidOrders}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Stats
          icon={<i className="fa-solid fa-box-archive" />}
          title="Sản phẩm"
          des={`${stats.totalProducts} sản phẩm, ${stats.totalDeletedProducts} đã xóa`}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <Stats
          icon={<i className="fa-solid fa-receipt" />}
          title="Đơn hàng"
          des={`${stats.totalOrders} đơn, ${stats.totalPaidOrders} đã thanh toán`}
          iconBg="bg-sky-100"
          iconColor="text-sky-600"
        />
        <Stats
          icon={<i className="fa-solid fa-users" />}
          title="Tài khoản"
          des={`${stats.totalAccounts} tài khoản, ${stats.totalLockedAccounts} đang bị khóa`}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
        />
        <Stats
          icon={<i className="fa-solid fa-folder-open" />}
          title="Danh mục"
          des={`${stats.totalCategories} danh mục, ${stats.totalDeletedCategories} đã xóa`}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
        <Stats
          icon={<i className="fa-solid fa-tags" />}
          title="Thẻ sản phẩm"
          des={`${stats.totalTags} thẻ, ${stats.totalDeletedTags} đã xóa`}
          iconBg="bg-rose-100"
          iconColor="text-rose-600"
        />
        <Stats
          icon={<i className="fa-solid fa-sack-dollar" />}
          title="Giá trị đơn"
          des={`TB ${currency.format(averageOrderValue)} đ / đơn`}
          iconBg="bg-cyan-100"
          iconColor="text-cyan-700"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Dữ liệu vận hành
              </h2>
              <p className="text-sm text-slate-500">
                Tổng hợp nhanh trạng thái hệ thống theo dữ liệu mới nhất.
              </p>
            </div>
            <button
              onClick={() => void fetchDashboard()}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              <i
                className={`fa-solid fa-rotate ${loading ? "animate-spin" : ""}`}
              />
              Tải lại
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">
                  Trạng thái đơn hàng
                </h3>
                <span className="text-xs text-slate-500">
                  {stats.totalOrders} đơn
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {orderStatusBreakdown.map((item) => (
                  <div key={item.status}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-slate-700">{item.label}</span>
                      <span className="font-medium text-slate-500">
                        {item.count} · {item.percent}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div
                        className={`h-2 rounded-full ${item.status === "Done" ? "bg-emerald-500" : item.status === "Cancled" ? "bg-rose-500" : item.status === "InTransit" ? "bg-indigo-500" : item.status === "Confirm" ? "bg-sky-500" : "bg-amber-500"}`}
                        style={{
                          width: `${Math.max(item.percent, item.count > 0 ? 6 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">
                  Trạng thái sản phẩm
                </h3>
                <span className="text-xs text-slate-500">
                  Tồn kho: {currency.format(productStock)}
                </span>
              </div>
              <div className="mt-4 space-y-4">
                {productStatusBreakdown.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-slate-700">{item.label}</span>
                      <span className="font-medium text-slate-500">
                        {item.count} · {item.percent}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${item.color}`}
                        style={{
                          width: `${Math.max(item.percent, item.count > 0 ? 6 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-gray-200">
                <h3 className="font-semibold text-slate-800">Thanh toán</h3>
                <div className="mt-4 space-y-4">
                  {paymentBreakdown.map((item) => (
                    <div key={item.label}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-slate-700">{item.label}</span>
                        <span className="font-medium text-slate-500">
                          {item.count} · {item.percent}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${item.color}`}
                          style={{
                            width: `${Math.max(item.percent, item.count > 0 ? 6 : 0)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-800">
                  Nhóm danh mục nổi bật
                </h3>
                <p className="text-sm text-slate-500">
                  Top danh mục theo số lượng sản phẩm đang có.
                </p>
              </div>
              <div className="text-sm text-slate-500">
                {topCategories.length
                  ? `${topCategories.length} nhóm`
                  : "Chưa có dữ liệu"}
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {topCategories.length ? (
                topCategories.map((category) => {
                  const percent = stats.totalProducts
                    ? Math.round((category.count / stats.totalProducts) * 100)
                    : 0;
                  return (
                    <div
                      key={category.name}
                      className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-800">
                            {category.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {category.count} sản phẩm
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                          {percent}%
                        </span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                          style={{
                            width: `${Math.max(percent, category.count > 0 ? 8 : 0)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500 ring-1 ring-slate-200">
                  Chưa có đủ sản phẩm để tạo biểu đồ danh mục.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Đơn hàng gần đây
                </h2>
                <p className="text-sm text-slate-500">
                  5 đơn hàng mới nhất trong hệ thống.
                </p>
              </div>
              <i className="fa-solid fa-clock text-slate-300" />
            </div>

            <div className="mt-4 space-y-3">
              {recentOrders.length ? (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-gray-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {order.recipientName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {order.recipientPhone}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">
                          {currency.format(order.totalAmount)} đ
                        </p>
                        <p className="text-xs text-slate-500">
                          {order.totalQuantity} sản phẩm
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass[order.status] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {statusLabel[order.status] ?? order.status}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${payClass[order.paymentStatus] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-slate-500">
                  Chưa có đơn hàng để hiển thị.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Chỉ số nhanh
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-gray-200">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Tồn kho
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {currency.format(productStock)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-gray-200">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Tỷ lệ khóa
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {stats.totalAccounts
                    ? Math.round(
                        (stats.totalLockedAccounts / stats.totalAccounts) * 100,
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-gray-200">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Danh mục
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {stats.totalCategories}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-gray-200">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Thẻ
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {stats.totalTags}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
