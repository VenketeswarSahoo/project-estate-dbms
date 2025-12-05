export type MetricValue = number | string | boolean;

export interface BaseMetric {
  value: MetricValue;
  change?: number;
  trend?: "up" | "down" | "neutral";
  target?: number;
  threshold?: {
    low: number;
    high: number;
    excellent?: number;
  };
}

export interface OverviewStats {
  totalSpend: BaseMetric;
  totalRevenue: BaseMetric;
  overallROI: BaseMetric;
  bestPerformer: BaseMetric;
  worstPerformer: BaseMetric;
  revenueChange: BaseMetric;
  spendChange: BaseMetric;
}

export interface DashboardData {
  overviewStats: OverviewStats;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    status: "success" | "warning" | "error" | "info";
  }>;
  quickStats: {
    activeUsers: number;
    pendingTasks: number;
    notifications: number;
  };
}

export interface MarketingData {
  overviewStats: OverviewStats;
  campaigns: Array<{
    id: string;
    name: string;
    status: "active" | "paused" | "completed";
    budget: number;
    spent: number;
    performance: {
      impressions: number;
      clicks: number;
      conversions: number;
      ctr: number;
      cpc: number;
    };
  }>;
  channels: Record<
    string,
    {
      spend: number;
      revenue: number;
      roi: number;
      metrics: Record<string, BaseMetric>;
    }
  >;
  analytics: {
    traffic: Array<{
      date: string;
      visitors: number;
      pageviews: number;
      bounceRate: number;
    }>;
    demographics: Record<string, number>;
    devices: Record<string, number>;
  };
}

export interface InventoryData {
  overviewStats: OverviewStats;
  products: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    reorderPoint: number;
    status: "in_stock" | "low_stock" | "out_of_stock";
    value: number;
  }>;
  categories: Record<
    string,
    {
      totalItems: number;
      totalValue: number;
      lowStockItems: number;
    }
  >;
  movements: Array<{
    id: string;
    type: "in" | "out" | "adjustment";
    productId: string;
    quantity: number;
    timestamp: Date;
    reason: string;
  }>;
}

export interface SalesData {
  overviewStats: OverviewStats;
  orders: Array<{
    id: string;
    customerId: string;
    date: Date;
    total: number;
    status: "pending" | "processing" | "completed" | "cancelled";
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
  }>;
  customers: Record<
    string,
    {
      totalOrders: number;
      totalSpent: number;
      lastOrder: Date;
      segment: string;
    }
  >;
  revenue: {
    daily: Array<{
      date: string;
      amount: number;
      orders: number;
    }>;
    byProduct: Record<string, number>;
    byCategory: Record<string, number>;
  };
}

export interface AccountsData {
  overviewStats: OverviewStats;
  transactions: Array<{
    id: string;
    type: "income" | "expense";
    amount: number;
    date: Date;
    category: string;
    description: string;
    status: "pending" | "completed" | "failed";
  }>;
  balances: {
    current: number;
    pending: number;
    overdue: number;
  };
  invoices: Array<{
    id: string;
    customerId: string;
    amount: number;
    dueDate: Date;
    status: "draft" | "sent" | "paid" | "overdue";
  }>;
}

export interface StorefrontData {
  overviewStats: OverviewStats;
  products: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    status: "active" | "draft" | "archived";
    views: number;
    sales: number;
  }>;
  categories: Array<{
    id: string;
    name: string;
    productCount: number;
    totalSales: number;
  }>;
  analytics: {
    pageViews: Array<{
      date: string;
      views: number;
      uniqueVisitors: number;
    }>;
    popularProducts: Array<{
      id: string;
      views: number;
      sales: number;
    }>;
    searchTerms: Record<string, number>;
  };
}

export interface CustomData {
  dashboard?: DashboardData;
  marketing?: MarketingData;
  inventory?: InventoryData;
  sales?: SalesData;
  accounts?: AccountsData;
  storefront?: StorefrontData;
  [key: string]: any;
}

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export type Store = {
  id: string;
  name: string;
  location: string;
  status: "active" | "inactive" | "pending";
  owner: string;
  revenue: number;
  totalSpend: number;
  roi: string;
  orders: number;
  profit: number;
  registeredOn: string;
  agent: string;
};

export type Agent = {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  status: "active" | "inactive" | "pending";
  stores: string[];
  totalRevenue: number;
  totalSpend: number;
  roi: string;
  totalOrders: number;
  profit: number;
  performance: "excellent" | "good" | "average";
  joinedOn: string;
};
