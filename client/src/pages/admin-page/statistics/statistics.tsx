import { useCallback, useEffect, useMemo, useState } from "react";
import Stats from "../../../components/stats/stats";
import Table from "../../../components/table/table";
import type { TableBody, TableHeader } from "../../../components/table/table";
import AdminPagination, {
  PAGE_SIZES,
} from "../../../components/admin-pagination/admin-pagination";
import { useToastContext } from "../../../contexts/toast-message/toast-message";
import InputSearch from "../../../components/input/input-search/input-search";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  calculateCategoryStatistics,
  calculateOrderStatistics,
  calculateProductStatistics,
  getStatisticsData,
  type CategoryStatistics,
  type OrderStatistics,
  type ProductStatistics,
} from "../../../services/statistics/statistics";

const currency = new Intl.NumberFormat("vi-VN");
const dateFormat = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const wrapCls =
  "ring-1 ring-gray-300 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-600";

type SortBy =
  | "date_asc"
  | "date_desc"
  | "product_asc"
  | "product_desc"
  | "revenue_asc"
  | "revenue_desc"
  | "";
type ViewType = "overview" | "category" | "product";
type StatusFilter = "" | "active" | "deleted";

type CategoryChartItem = {
  name: string;
  revenue: number;
  totalProducts: number;
};

type ProductChartItem = {
  name: string;
  revenue: number;
  sold: number;
};

const AdminStatistics = () => {
  const { showErrorResponse } = useToastContext();

  const [categoryStats, setCategoryStats] = useState<CategoryStatistics[]>([]);
  const [productStats, setProductStats] = useState<ProductStatistics[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStatistics | null>(null);

  const [viewType, setViewType] = useState<ViewType>("overview");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const { products, orders } = await getStatisticsData();

        if (!isMounted) return;

        setCategoryStats(calculateCategoryStatistics(products || [], orders || []));
        setProductStats(calculateProductStatistics(products || [], orders || []));
        setOrderStats(calculateOrderStatistics(orders || []));
      } catch (error) {
        console.error("Error fetching statistics data:", error);
        if (isMounted) {
          showErrorResponse("Không thể tải dữ liệu thống kê");
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [showErrorResponse]);

  const categoryOptions = useMemo(
    () =>
      Array.from(new Set(productStats.map((product) => product.categoryName))),
    [productStats],
  );

  const stats = useMemo(() => {
    if (viewType === "category") {
      return {
        total: categoryStats.length,
        active: categoryStats.filter((category) => category.activeProducts > 0)
          .length,
        revenue: categoryStats.reduce(
          (sum, category) => sum + category.totalRevenue,
          0,
        ),
      };
    }

    return {
      total: productStats.length,
      active: productStats.filter((product) => !product.isDelete).length,
      revenue: productStats.reduce(
        (sum, product) => sum + product.totalRevenue,
        0,
      ),
    };
  }, [viewType, categoryStats, productStats]);

  const sortCategoryData = useCallback(
    (data: CategoryStatistics[]) => {
      const sorted = [...data];

      switch (sortBy) {
        case "date_asc":
        case "product_asc":
          return sorted.sort((a, b) =>
            a.categoryName.localeCompare(b.categoryName, "vi"),
          );
        case "date_desc":
        case "product_desc":
          return sorted.sort((a, b) =>
            b.categoryName.localeCompare(a.categoryName, "vi"),
          );
        case "revenue_asc":
          return sorted.sort((a, b) => a.totalRevenue - b.totalRevenue);
        case "revenue_desc":
          return sorted.sort((a, b) => b.totalRevenue - a.totalRevenue);
        default:
          return sorted;
      }
    },
    [sortBy],
  );

  const sortProductData = useCallback(
    (data: ProductStatistics[]) => {
      const sorted = [...data];

      switch (sortBy) {
        case "date_asc":
          return sorted.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
        case "date_desc":
          return sorted.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
        case "product_asc":
          return sorted.sort((a, b) => a.name.localeCompare(b.name, "vi"));
        case "product_desc":
          return sorted.sort((a, b) => b.name.localeCompare(a.name, "vi"));
        case "revenue_asc":
          return sorted.sort((a, b) => a.totalRevenue - b.totalRevenue);
        case "revenue_desc":
          return sorted.sort((a, b) => b.totalRevenue - a.totalRevenue);
        default:
          return sorted;
      }
    },
    [sortBy],
  );

  const filteredData = useMemo(() => {
    if (viewType === "category") {
      let data = [...categoryStats];

      if (searchInput) {
        const keyword = searchInput.toLowerCase();
        data = data.filter((item) =>
          item.categoryName.toLowerCase().includes(keyword),
        );
      }

      return sortCategoryData(data);
    }

    let data = [...productStats];

    if (searchInput) {
      const keyword = searchInput.toLowerCase();
      data = data.filter((item) => item.name.toLowerCase().includes(keyword));
    }

    if (statusFilter) {
      data = data.filter((item) =>
        statusFilter === "active" ? !item.isDelete : item.isDelete,
      );
    }

    if (categoryFilter) {
      data = data.filter((item) => item.categoryName === categoryFilter);
    }

    return sortProductData(data);
  }, [
    categoryStats,
    productStats,
    searchInput,
    statusFilter,
    categoryFilter,
    viewType,
    sortCategoryData,
    sortProductData,
  ]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  const totalPages = Math.max(Math.ceil(filteredData.length / pageSize), 1);

  const categoryChartData = useMemo<CategoryChartItem[]>(() => {
    return [...categoryStats]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 8)
      .map((item) => ({
        name: item.categoryName,
        revenue: item.totalRevenue,
        totalProducts: item.totalProducts,
      }));
  }, [categoryStats]);

  const productChartData = useMemo<ProductChartItem[]>(() => {
    return [...productStats]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 8)
      .map((item) => ({
        name: item.name,
        revenue: item.totalRevenue,
        sold: item.totalSold,
      }));
  }, [productStats]);

  const statusChartData = useMemo(
    () => [
      {
        name: "Hoạt động",
        value: productStats.filter((item) => !item.isDelete).length,
      },
      {
        name: "Đã xóa",
        value: productStats.filter((item) => item.isDelete).length,
      },
    ],
    [productStats],
  );

  const creationChartData = useMemo(() => {
    const map = new Map<string, number>();

    productStats.forEach((item) => {
      const key = new Date(item.createdAt).toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + 1);
    });

    return Array.from(map.entries())
      .map(([date, count]) => ({
        date,
        label: dateFormat.format(new Date(date)),
        count,
      }))
      .sort((a, b) => {
        return a.date.localeCompare(b.date);
      });
  }, [productStats]);

  const pieColors = ["#2563eb", "#16a34a"];

  const categoryHeaders: TableHeader = [
    "Danh mục",
    "Tổng sản phẩm",
    "Sản phẩm hoạt động",
    "Sản phẩm bị xóa",
    "Doanh thu",
  ];

  const productHeaders: TableHeader = [
    "Sản phẩm",
    "Danh mục",
    "Giá",
    "Kho",
    "Đã bán",
    "Ngày tạo",
    "Trạng thái",
  ];

  const tableBody: TableBody =
    viewType === "category"
      ? paginatedData.map((item) => {
          const categoryItem = item as CategoryStatistics;

          return [
            categoryItem.categoryName,
            categoryItem.totalProducts.toString(),
            categoryItem.activeProducts.toString(),
            categoryItem.deletedProducts.toString(),
            currency.format(categoryItem.totalRevenue),
          ];
        })
      : paginatedData.map((item) => {
          const productItem = item as ProductStatistics;

          return [
            {
              reactNode: (
                <span className="font-medium">{productItem.name}</span>
              ),
            },
            productItem.categoryName,
            currency.format(productItem.price),
            productItem.quantity.toString(),
            productItem.totalSold.toString(),
            dateFormat.format(new Date(productItem.createdAt)),
            {
              reactNode: (
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    productItem.isDelete
                      ? "text-red-700 bg-red-100"
                      : "text-green-700 bg-green-100"
                  }`}
                >
                  {productItem.isDelete ? "Đã xóa" : "Hoạt động"}
                </span>
              ),
            },
          ];
        });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Thống kê</h1>
        <p className="text-gray-500 mt-1">
          Xem thông tin tổng quan, danh mục và sản phẩm
        </p>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => {
            setViewType("overview");
            setPage(1);
          }}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            viewType === "overview"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Tổng quan
        </button>
        <button
          onClick={() => {
            setViewType("category");
            setPage(1);
          }}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            viewType === "category"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Theo danh mục
        </button>
        <button
          onClick={() => {
            setViewType("product");
            setPage(1);
          }}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            viewType === "product"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Theo sản phẩm
        </button>
      </div>

      {viewType === "overview" && orderStats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Stats
              icon={<i className="fa-solid fa-sack-dollar text-xl" />}
              title="Tổng doanh thu"
              des={currency.format(orderStats.totalRevenue)}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
            />
            <Stats
              icon={<i className="fa-solid fa-file-invoice text-xl" />}
              title="Tổng đơn hàng"
              des={String(orderStats.totalOrders)}
              iconBg="bg-indigo-100"
              iconColor="text-indigo-600"
            />
            <Stats
              icon={<i className="fa-solid fa-circle-check text-xl" />}
              title="Đơn hoàn thành"
              des={String(orderStats.completedOrders)}
              iconBg="bg-green-100"
              iconColor="text-green-600"
            />
            <Stats
              icon={<i className="fa-solid fa-circle-xmark text-xl" />}
              title="Đơn đã hủy"
              des={String(orderStats.cancelledOrders)}
              iconBg="bg-red-100"
              iconColor="text-red-600"
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Doanh thu theo thời gian
              </h2>
              <p className="text-sm text-gray-500">
                Xu hướng doanh thu từ các đơn hàng
              </p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={orderStats.revenueByDate}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(value) => currency.format(Number(value ?? 0))}
                  />
                  <Tooltip
                    formatter={(value) => currency.format(Number(value ?? 0))}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Trạng thái đơn hàng
                </h2>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStats.statusDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={62}
                      paddingAngle={2}
                      label
                    >
                      {orderStats.statusDistribution.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={
                            ["#eab308", "#3b82f6", "#a855f7", "#22c55e", "#ef4444"][
                              index % 5
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Phương thức thanh toán
                </h2>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStats.paymentDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={62}
                      paddingAngle={2}
                      label
                    >
                      {orderStats.paymentDistribution.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={["#06b6d4", "#f43f5e", "#10b981"][index % 3]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Đơn hàng gần đây</h2>
            <Table
              tableHead={[
                "Mã đơn",
                "Khách hàng",
                "Ngày đặt",
                "Tổng tiền",
                "Trạng thái",
                "Thanh toán",
              ]}
              tableBody={orderStats.recentOrders.map((order) => [
                { reactNode: <span className="text-xs">{order.id.slice(-6).toUpperCase()}</span> },
                order.recipientName,
                dateFormat.format(new Date(order.createdAt)),
                currency.format(order.totalAmount),
                {
                  reactNode: (
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        order.status === "Received"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  ),
                },
                order.paymentMethod || "Khác",
              ])}
            />
          </div>
        </div>
      )}

      {viewType !== "overview" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Stats
          icon={<i className="fa-solid fa-boxes-stacked text-xl" />}
          title={viewType === "category" ? "Danh mục" : "Tổng sản phẩm"}
          des={String(stats.total)}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <Stats
          icon={<i className="fa-solid fa-circle-check text-xl" />}
          title={
            viewType === "category"
              ? "Danh mục hoạt động"
              : "Sản phẩm hoạt động"
          }
          des={String(stats.active)}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <Stats
          icon={<i className="fa-solid fa-sack-dollar text-xl" />}
          title="Doanh thu"
          des={currency.format(stats.revenue)}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Doanh thu theo danh mục
            </h2>
            <p className="text-sm text-gray-500">
              Top 8 danh mục có doanh thu cao nhất
            </p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
                <YAxis
                  tickFormatter={(value) => currency.format(Number(value ?? 0))}
                />
                <Tooltip
                  formatter={(value) => currency.format(Number(value ?? 0))}
                />
                <Bar dataKey="revenue" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Trạng thái sản phẩm
            </h2>
            <p className="text-sm text-gray-500">
              Tỷ lệ sản phẩm đang hoạt động và đã xóa
            </p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={62}
                  paddingAngle={2}
                  label
                >
                  {statusChartData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={pieColors[index % pieColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Sản phẩm theo doanh thu
            </h2>
            <p className="text-sm text-gray-500">
              Top 8 sản phẩm có doanh thu cao nhất
            </p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(value) => currency.format(Number(value ?? 0))}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value, name) => {
                    const label = name === "revenue" ? "Doanh thu" : "Đã bán";
                    return [currency.format(Number(value ?? 0)), label] as [
                      string,
                      string,
                    ];
                  }}
                />
                <Bar dataKey="revenue" fill="#16a34a" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Xu hướng tạo sản phẩm
            </h2>
            <p className="text-sm text-gray-500">
              Số lượng sản phẩm được tạo theo ngày
            </p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={creationChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <InputSearch
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            opts={{
              title: viewType === "category" ? "Tìm danh mục" : "Tìm sản phẩm",
              width: "w-full",
            }}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Sắp xếp
          </label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as SortBy);
              setPage(1);
            }}
            className={wrapCls}
          >
            <option value="">-- Sắp xếp --</option>
            <option value="date_asc">Ngày cũ nhất</option>
            <option value="date_desc">Ngày mới nhất</option>
            <option value="product_asc">Tên (A-Z)</option>
            <option value="product_desc">Tên (Z-A)</option>
            <option value="revenue_asc">Doanh thu (thấp)</option>
            <option value="revenue_desc">Doanh thu (cao)</option>
          </select>
        </div>

        {viewType === "product" && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setPage(1);
              }}
              className={wrapCls}
            >
              <option value="">-- Tất cả --</option>
              <option value="active">Hoạt động</option>
              <option value="deleted">Đã xóa</option>
            </select>
          </div>
        )}

        {viewType === "product" && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Danh mục
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className={wrapCls}
            >
              <option value="">-- Tất cả danh mục --</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          tableHead={viewType === "category" ? categoryHeaders : productHeaders}
          tableBody={tableBody}
        />
      </div>

      <div className="flex justify-center">
        <AdminPagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          total={filteredData.length}
        />
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <i className="fa-solid fa-chart-pie text-4xl text-gray-300 mb-4 block"></i>
          <p className="text-gray-500">
            {viewType === "category"
              ? "Không có dữ liệu danh mục"
              : "Không có dữ liệu sản phẩm"}
          </p>
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default AdminStatistics;
