"use client";
import {
  ShoppingBasket, UtensilsCrossed, Bus, CreditCard, Wallet, ShoppingBag,
  Home, Zap, Film, Heart, Plane, MoreHorizontal, Coffee, Dumbbell,
  Gamepad2, Bike, Briefcase, Gift, Music, BookOpen, Tag,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  ShoppingBasket, UtensilsCrossed, Bus, CreditCard, Wallet, ShoppingBag,
  Home, Zap, Film, Heart, Plane, MoreHorizontal, Coffee, Dumbbell,
  Gamepad2, Bike, Briefcase, Gift, Music, BookOpen, Tag,
};

export function CategoryIcon({ name, className = "w-5 h-5" }: { name: string; className?: string }) {
  const Icon = iconMap[name] || Tag;
  return <Icon className={className} />;
}
