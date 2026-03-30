export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type Category = {
  id: string;
  user_id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon?: string;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  type: "income" | "expense";
  description?: string;
  date: string;
  created_at: string;
  category?: Category;
};

export type Budget = {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: string;
  created_at: string;
  category?: Category;
};

export type Wallet = {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  currency: string;
  created_at: string;
};

export type DashboardStats = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categorySummary: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
  }>;
  recentTransactions: Transaction[];
};
