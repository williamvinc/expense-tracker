export interface CategoryItem {
    id: string;
    icon: string;
    label: string;
    type?: 'expense' | 'income';
}

export const DEFAULT_EXPENSE_CATEGORIES: CategoryItem[] = [
    { id: 'food', icon: 'lunch_dining', label: 'Food & Drink' },
    { id: 'housing', icon: 'home', label: 'Housing' },
    { id: 'transport', icon: 'directions_car', label: 'Transportation' },
    { id: 'groceries', icon: 'shopping_cart', label: 'Groceries' },
    { id: 'clothing', icon: 'checkroom', label: 'Clothing' },
    { id: 'health', icon: 'medical_services', label: 'Health' },
    { id: 'education', icon: 'school', label: 'Education' },
    { id: 'entertainment', icon: 'sports_esports', label: 'Entertainment' },
    { id: 'tech', icon: 'smartphone', label: 'Technology' },
    { id: 'financial', icon: 'account_balance', label: 'Financial' },
    { id: 'social', icon: 'volunteer_activism', label: 'Social' },
    { id: 'others', icon: 'more_horiz', label: 'Others' },
];

export const DEFAULT_INCOME_CATEGORIES: CategoryItem[] = [
    { id: 'salary', icon: 'payments', label: 'Salary' },
    { id: 'business', icon: 'work', label: 'Business' },
    { id: 'investment', icon: 'trending_up', label: 'Investment' },
    { id: 'property', icon: 'apartment', label: 'Property' },
    { id: 'gift', icon: 'card_giftcard', label: 'Gift' },
    { id: 'refund', icon: 'restore', label: 'Refund' },
    { id: 'others_in', icon: 'more_horiz', label: 'Others' },
];

export const CUSTOM_CATEGORY_ICONS = [
    'lunch_dining', 'home', 'directions_car', 'shopping_cart',
    'checkroom', 'medical_services', 'school', 'sports_esports',
    'smartphone', 'account_balance', 'volunteer_activism', 'more_horiz',
    'payments', 'work', 'trending_up', 'apartment', 'card_giftcard',
    'restore', 'pets', 'flight', 'wifi', 'fitness_center', 'local_cafe',
    'child_friendly', 'palette', 'music_note', 'local_florist'
];

export interface PlatformItem {
    id: string;
    label: string;
    type: 'icon' | 'image';
    icon?: string;
    src?: string;
    color: string;
}

export const PLATFORMS: PlatformItem[] = [
    { id: 'etc', label: 'Etc', type: 'icon', icon: 'more_horiz', color: 'bg-gray-100' },
    { id: 'gojek', label: 'Gojek', type: 'icon', icon: 'two_wheeler', color: 'bg-green-100' },
    { id: 'grab', label: 'Grab', type: 'icon', icon: 'local_taxi', color: 'bg-green-100' },
    // Simplified list for mobile
    { id: 'shopee', label: 'Shopee', type: 'icon', icon: 'shopping_bag', color: 'bg-orange-100' },
    { id: 'tokopedia', label: 'Tokopedia', type: 'icon', icon: 'storefront', color: 'bg-green-100' },
    { id: 'amazon', label: 'Amazon', type: 'icon', icon: 'public', color: 'bg-yellow-100' },
];

export const WALLET_COLORS = [
    { id: 'black', class: 'bg-gray-900', color: '#111827', label: 'Black' },
    { id: 'slate', class: 'bg-slate-700', color: '#334155', label: 'Slate' },
    { id: 'navy', class: 'bg-[#132440]', color: '#132440', label: 'Navy' },
    { id: 'deep-purple', class: 'bg-[#210F37]', color: '#210F37', label: 'Deep Purple' },
    { id: 'bright-orange', class: 'bg-[#FF6500]', color: '#FF6500', label: 'Bright Orange' },
    { id: 'gold', class: 'bg-[#FEC260]', color: '#FEC260', label: 'Gold' },
];

export const WALLET_ICONS = [
    'account_balance_wallet', 'savings', 'credit_card', 'payments',
    'work', 'domain', 'home', 'directions_car',
    'shopping_cart', 'flight', 'currency_bitcoin', 'trending_up',
    'diamond', 'volunteer_activism', 'school', 'pets',
    'child_care', 'sports_esports', 'restaurant', 'cake'
];

export const SUGGESTED_TYPES = ['Primary', 'Savings', 'Work', 'Travel', 'Crypto', 'Investment', 'Joint', 'Emergency'];
