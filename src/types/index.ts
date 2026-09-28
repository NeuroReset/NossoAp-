export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  role: string;
  monthlyTarget: number;
}

export interface Apartment {
  id: string;
  name: string;
  address?: string | null;
  targetDate?: string | null;
  totalBudget: number;
  inviteCode: string;
}

export interface Goal {
  id: string;
  apartmentId: string;
  title: string;
  description?: string | null;
  category: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
  icon: string;
  deadline?: string | null;
  isCompleted: boolean;
  contributionsCount?: number;
}

export interface Contribution {
  id: string;
  apartmentId: string;
  userId: string;
  user: User;
  goalId?: string | null;
  goal?: Goal | null;
  amount: number;
  date: string;
  notes?: string | null;
  receiptUrl?: string | null;
}

export interface WishlistItem {
  id: string;
  apartmentId: string;
  room: string;
  name: string;
  category: string;
  estimatedPrice: number;
  actualPrice?: number | null;
  status: "DESEJO" | "COTADO" | "COMPRADO" | "ENTREGUE";
  priority: "ALTA" | "MEDIA" | "BAIXA";
  productUrl?: string | null;
  imageUrl?: string | null;
  boughtById?: string | null;
  boughtBy?: User | null;
  boughtDate?: string | null;
  notes?: string | null;
}

export interface Expense {
  id: string;
  apartmentId: string;
  paidById: string;
  paidBy: User;
  title: string;
  category: string;
  amount: number;
  dueDate: string;
  paidDate?: string | null;
  splitType: string;
  isPaid: boolean;
  notes?: string | null;
}

export interface Chore {
  id: string;
  apartmentId: string;
  title: string;
  assignedToId?: string | null;
  assignedTo?: User | null;
  frequency: string;
  isDone: boolean;
  lastDoneAt?: string | null;
}

export interface PartnerMonthlyStatus {
  user: User;
  target: number;
  currentMonthTotal: number;
  progressPercent: number;
  isCompleted: boolean;
  historicalTotal: number;
  historicalPercent: number;
}

export interface DashboardData {
  apartment: Apartment;
  users: User[];
  summary: {
    totalSaved: number;
    totalBudget: number;
    budgetProgressPercent: number;
    currentMonthTotal: number;
    currentMonthTarget: number;
    currentMonthProgressPercent: number;
    totalExpensesThisMonth: number;
    pendingExpensesThisMonth: number;
    wishlistTotalEstimated: number;
    wishlistTotalSpent: number;
    wishlistItemsPurchasedCount: number;
    wishlistItemsTotalCount: number;
    choresCompletedCount: number;
    choresTotalCount: number;
  };
  partners: PartnerMonthlyStatus[];
  goals: Goal[];
  monthlyHistory: {
    monthKey: string;
    monthLabel: string;
    total: number;
    [key: string]: any; // partner amounts
  }[];
  recentContributions: Contribution[];
  expenses: Expense[];
  wishlist: WishlistItem[];
  chores: Chore[];
  balances: {
    userA: User;
    userB: User;
    userAPaid: number;
    userBPaid: number;
    debtorName: string | null;
    creditorName: string | null;
    settlementAmount: number;
    isBalanced: boolean;
  };
}
