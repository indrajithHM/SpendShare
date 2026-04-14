export const DEFAULT_CATEGORIES = [
  { key: "Groceries", icon: "ShoppingBasket", color: "text-green-600" },
  { key: "Food", icon: "UtensilsCrossed", color: "text-amber-500" },
  { key: "Transport", icon: "Bus", color: "text-blue-500" },
  { key: "Card-Payment", icon: "CreditCard", color: "text-blue-600" },
  { key: "Salary", icon: "Wallet", color: "text-green-500" },
  { key: "Shopping", icon: "ShoppingBag", color: "text-purple-500" },
  { key: "Rent", icon: "Home", color: "text-red-500" },
  { key: "Utilities", icon: "Zap", color: "text-cyan-500" },
  { key: "Entertainment", icon: "Film", color: "text-pink-500" },
  { key: "Health", icon: "Heart", color: "text-red-400" },
  { key: "Travel", icon: "Plane", color: "text-indigo-500" },
  { key: "Others", icon: "MoreHorizontal", color: "text-gray-500" },
] as const;

export const CATEGORY_ICON_OPTIONS = [
  "ShoppingBasket", "UtensilsCrossed", "Bus", "CreditCard", "Wallet",
  "ShoppingBag", "Home", "Zap", "Film", "Heart", "Plane", "MoreHorizontal",
  "Coffee", "Dumbbell", "Gamepad2", "Bike", "Briefcase", "Gift", "Music", "BookOpen",
];

export type Category = {
  key: string;
  icon: string;
  color?: string;
  budget?: number | null;
  isDefault?: boolean;
};
