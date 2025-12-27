export interface Transaction {
  id: string;
  name: string;
  date: string;
  amount: number;
  type: 'expense' | 'income';
  icon: string;
  color?: string; // Tailwind color class for icon bg

  // New detailed fields
  category?: string;
  platform?: string; // New field for Tokopedia, Shopee, etc.
  status?: 'Successful' | 'Pending' | 'Failed';
  paymentMethod?: string;
  note?: string;
  walletId?: string; // Link transaction to a specific wallet
}

export interface Wallet {
  id: string;
  name: string;
  type: string; // Changed to string to allow custom types
  currency: string;
  themeColor?: string; // Tailwind color class (e.g., 'bg-blue-500')
  color?: string; // Hex color override
  icon?: string;
  cardNumber?: string;
  balance?: number; // Optional, usually calculated from transactions
}

export interface Recipient {
  id: string;
  name: string; // "W-1234" or real name
  avatar: string;
  verified: boolean;
}