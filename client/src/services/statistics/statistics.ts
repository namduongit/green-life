import { api } from "../../lib/api/api";
import type { ProductRep } from "../product/product.type";
import type { CategoryRep } from "../category/category.type";
import type { OrderDetailRep } from "../order/order.type";

export const getStatisticsData = async () => {
  const [productsRes, categoriesRes, ordersRes] = await Promise.all([
    api.get<ProductRep[]>("/api/products", {
      params: {
        pageSize: 999,
      },
    }),
    api.get<CategoryRep[]>("/api/categories"),
    api.get<OrderDetailRep[]>("/api/orders"),
  ]);

  const productsData = Array.isArray(productsRes?.data.data)
    ? productsRes.data.data
    : ((productsRes?.data.data as { data: ProductRep[] })?.data ?? []);

  return {
    products: productsData,
    categories: categoriesRes?.data ?? [],
    orders: ordersRes?.data?.data ?? [],
  };
};

export interface CategoryStatistics {
  categoryId: string;
  categoryName: string;
  totalProducts: number;
  activeProducts: number;
  deletedProducts: number;
  totalSales: number;
  totalRevenue: number;
  totalOrders: number;
  products: ProductRep[];
}

export interface ProductStatistics {
  id: string;
  name: string;
  categoryName: string;
  price: number;
  quantity: number;
  isDelete: boolean;
  createdAt: string;
  totalSold: number;
  totalRevenue: number;
}

export const calculateCategoryStatistics = (
  products: ProductRep[],
  orders: OrderDetailRep[],
): CategoryStatistics[] => {
  const categoryMap = new Map<string, CategoryStatistics>();
  const categoryOrders = new Map<string, Set<string>>();

  // Initialize categories
  products.forEach((product) => {
    const categoryId = product.category?.id || "uncategorized";
    const categoryName = product.category?.name || "Không có danh mục";

    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, {
        categoryId,
        categoryName,
        totalProducts: 0,
        activeProducts: 0,
        deletedProducts: 0,
        totalSales: 0,
        totalRevenue: 0,
        totalOrders: 0,
        products: [],
      });
      categoryOrders.set(categoryId, new Set<string>());
    }

    const stats = categoryMap.get(categoryId)!;
    stats.totalProducts++;
    if (product.isDelete) {
      stats.deletedProducts++;
    } else {
      stats.activeProducts++;
    }
    stats.products.push(product);
  });
  console.log(orders);  

  // Calculate sales, revenue, and orders from non-cancelled orders
  orders.forEach((order) => {
    if (order.status !== "Cancled") {
      order.orderItems?.forEach((item) => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const categoryId = product.category?.id || "uncategorized";
          const stats = categoryMap.get(categoryId);
          if (stats) {
            stats.totalSales += item.quantity;
            stats.totalRevenue += item.amount;
            categoryOrders.get(categoryId)?.add(order.id);
          }
        }
      });
    }
  });

  // Update totalOrders for each category
  Array.from(categoryOrders.entries()).forEach(([categoryId, orderIds]) => {
    const stats = categoryMap.get(categoryId);
    if (stats) {
      stats.totalOrders = orderIds.size;
    }
  });

  return Array.from(categoryMap.values());
};

export const calculateProductStatistics = (
  products: ProductRep[],
  orders: OrderDetailRep[],
): ProductStatistics[] => {
  const productStatsMap = new Map<string, { sold: number; revenue: number }>();

  orders.forEach((order) => {
    if (order.status !== "Cancled") {
      order.orderItems?.forEach((item) => {
        const stats = productStatsMap.get(item.productId) || {
          sold: 0,
          revenue: 0,
        };
        stats.sold += item.quantity;
        stats.revenue += item.amount;
        productStatsMap.set(item.productId, stats);
      });
    }
  });

  return products.map((product) => {
    const stats = productStatsMap.get(product.id) || { sold: 0, revenue: 0 };
    return {
      id: product.id,
      name: product.property?.name || "Sản phẩm không có tên",
      categoryName: product.category?.name || "Không có danh mục",
      price: product.property?.price || 0,
      quantity: product.currentStock || 0,
      isDelete: product.isDelete,
      createdAt:
        product.property?.createdAt?.toString() || new Date().toISOString(),
      totalSold: stats.sold,
      totalRevenue: stats.revenue,
    };
  });
};

export interface OrderStatistics {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  revenueByDate: { date: string; label: string; revenue: number }[];
  statusDistribution: { name: string; value: number }[];
  paymentDistribution: { name: string; value: number }[];
  recentOrders: OrderDetailRep[];
}

export const calculateOrderStatistics = (
  orders: OrderDetailRep[]
): OrderStatistics => {
  let completedOrders = 0;
  let cancelledOrders = 0;
  let totalRevenue = 0;

  const statusMap = new Map<string, number>();
  const paymentMap = new Map<string, number>();
  const revenueByDateMap = new Map<string, number>();

  const dateFormat = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  orders.forEach((order) => {
    // Status
    const statusLabel = 
      order.status === "Pending" ? "Chờ xử lý" :
      order.status === "Confirm" ? "Đã xác nhận" :
      order.status === "InTransit" ? "Đang giao" :
      order.status === "Done" ? "Hoàn thành" :
      order.status === "Cancled" ? "Đã hủy" : order.status;

    statusMap.set(statusLabel, (statusMap.get(statusLabel) || 0) + 1);

    if (order.status === "Done") {
      completedOrders++;
    } else if (order.status === "Cancled") {
      cancelledOrders++;
    }

    // Payment method
    const paymentLabel = order.paymentMethod || "Khác";
    paymentMap.set(paymentLabel, (paymentMap.get(paymentLabel) || 0) + 1);

    // Revenue tracking (non-cancelled orders)
    if (order.status !== "Cancled") {
      totalRevenue += order.totalAmount;

      // Group revenue by date
      const dateKey = new Date(order.createdAt).toISOString().slice(0, 10);
      revenueByDateMap.set(dateKey, (revenueByDateMap.get(dateKey) || 0) + order.totalAmount);
    }
  });

  const revenueByDate = Array.from(revenueByDateMap.entries())
    .map(([date, revenue]) => ({
      date,
      label: dateFormat.format(new Date(date)),
      revenue,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const statusDistribution = Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }));
  const paymentDistribution = Array.from(paymentMap.entries()).map(([name, value]) => ({ name, value }));
  
  // Sort orders descending by createdAt to get top 10
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return {
    totalOrders: orders.length,
    completedOrders,
    cancelledOrders,
    totalRevenue,
    revenueByDate,
    statusDistribution,
    paymentDistribution,
    recentOrders,
  };
};
