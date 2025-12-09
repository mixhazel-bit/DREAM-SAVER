export interface Transaction {
  id: string;
  amount: number;
  date: string; // ISO String
  note?: string;
}

export interface Wishlist {
  id: string;
  title: string;
  targetAmount: number;
  targetDate: string; // ISO String YYYY-MM-DD
  image: string | null; // Base64 string
  savedAmount: number;
  transactions: Transaction[];
  createdAt: string;
}

export interface AdviceRequest {
  title: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string;
  daysRemaining: number;
}
