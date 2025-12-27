// Modern icon component using Lucide icons

import React from 'react';
import { SymbolWeight } from 'expo-symbols';
import { OpaqueColorValue, type StyleProp, type ViewStyle } from 'react-native';
import {
  Home,
  Send,
  Code,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  PieChart,
  PlusCircle,
  Plus,
  CreditCard,
  User,
  Calendar,
  Eye,
  EyeOff,
  ArrowDown,
  ArrowUp,
  Lock,
  Delete,
  ScanFace,
  Star,
  X,
  XCircle,
  Settings,
  Pencil,
  ShoppingCart,
  Banknote,
  HelpCircle,
  Heart,
  ExternalLink,
  Hammer,
  Trash2,
  Check,
  Utensils,
  Stethoscope,
  Gamepad2,
  TrendingUp,
  Gift,
  MoreHorizontal,
  Car,
  ShoppingBag,
  FileText,
  Building2,
  AtSign,
  Mail,
  Headphones,
  Wallet,
  Smartphone,
  Zap,
  Plane,
  BookOpen,
  Dumbbell,
  Coffee,
  Music,
  Film,
  Wifi,
  Droplets,
  Baby,
  PawPrint,
  Briefcase,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react-native';

type IconSymbolName = string;

/**
 * Mapping from SF Symbols / custom names to Lucide icons
 */
const ICON_MAP: Record<string, LucideIcon> = {
  // Navigation
  'house.fill': Home,
  'house': Home,
  'home': Home,
  'paperplane.fill': Send,
  'send': Send,
  'chevron.left.forwardslash.chevron.right': Code,
  'chevron.right': ChevronRight,
  'chevron.left': ChevronLeft,
  'chevron.up': ChevronUp,
  'chevron.down': ChevronDown,
  
  // Charts & Stats
  'chart.pie.fill': PieChart,
  'pie-chart': PieChart,
  'chart.line.uptrend.xyaxis': TrendingUp,
  'trending_up': TrendingUp,
  'trending-up': TrendingUp,
  
  // Actions
  'plus.circle.fill': PlusCircle,
  'plus': Plus,
  'add': Plus,
  'add-circle': PlusCircle,
  'xmark': X,
  'xmark.circle.fill': XCircle,
  'close': X,
  'checkmark': Check,
  'check': Check,
  'pencil': Pencil,
  'edit': Pencil,
  'trash': Trash2,
  'trash.fill': Trash2,
  'delete': Trash2,
  'delete.left.fill': Delete,
  'backspace': Delete,
  
  // Finance
  'creditcard.fill': CreditCard,
  'credit-card': CreditCard,
  'banknote': Banknote,
  'attach-money': Banknote,
  'wallet': Wallet,
  'account_balance_wallet': Wallet,
  
  // User
  'person.fill': User,
  'person': User,
  'user': User,
  'faceid': ScanFace,
  'face': ScanFace,
  
  // Date & Time
  'calendar': Calendar,
  'calendar-today': Calendar,
  
  // Visibility
  'eye': Eye,
  'visibility': Eye,
  'eye.slash': EyeOff,
  'visibility-off': EyeOff,
  
  // Arrows
  'arrow.down': ArrowDown,
  'arrow-downward': ArrowDown,
  'arrow.up': ArrowUp,
  'arrow-upward': ArrowUp,
  'arrow.up.right': ExternalLink,
  'open-in-new': ExternalLink,
  
  // Security
  'lock.fill': Lock,
  'lock': Lock,
  'lock-outline': Lock,
  
  // Settings
  'gear': Settings,
  'settings': Settings,
  
  // Categories
  'cart.fill': ShoppingCart,
  'shopping_cart': ShoppingCart,
  'shopping-cart': ShoppingCart,
  'bag.fill': ShoppingBag,
  'shopping-bag': ShoppingBag,
  'lunch_dining': Utensils,
  'fork.knife': Utensils,
  'restaurant': Utensils,
  'medical_services': Stethoscope,
  'cross.fill': Stethoscope,
  'local-hospital': Stethoscope,
  'sports_esports': Gamepad2,
  'gamecontroller.fill': Gamepad2,
  'sports-esports': Gamepad2,
  'card_giftcard': Gift,
  'gift.fill': Gift,
  'card-giftcard': Gift,
  'directions_car': Car,
  'car.fill': Car,
  'directions-car': Car,
  
  // UI Elements
  'star.fill': Star,
  'star': Star,
  'favorite': Heart,
  'heart.fill': Heart,
  'questionmark.circle': HelpCircle,
  'help-outline': HelpCircle,
  'hammer.fill': Hammer,
  'build': Hammer,
  'more_horiz': MoreHorizontal,
  'ellipsis': MoreHorizontal,
  'more-horiz': MoreHorizontal,
  'doc.text.fill': FileText,
  'description': FileText,
  'building.2.fill': Building2,
  'business': Building2,
  
  // Communication
  'at': AtSign,
  'alternate-email': AtSign,
  'envelope.fill': Mail,
  'email': Mail,
  'headphones': Headphones,
  'headset': Headphones,
  
  // Additional Categories
  'phone': Smartphone,
  'smartphone': Smartphone,
  'bolt': Zap,
  'zap': Zap,
  'airplane': Plane,
  'plane': Plane,
  'book': BookOpen,
  'book-open': BookOpen,
  'dumbbell': Dumbbell,
  'fitness': Dumbbell,
  'coffee': Coffee,
  'cafe': Coffee,
  'music': Music,
  'music-note': Music,
  'film': Film,
  'movie': Film,
  'wifi': Wifi,
  'internet': Wifi,
  'droplet': Droplets,
  'water': Droplets,
  'baby': Baby,
  'child': Baby,
  'paw': PawPrint,
  'pet': PawPrint,
  'briefcase': Briefcase,
  'work': Briefcase,
  'graduation-cap': GraduationCap,
  'education': GraduationCap,
};

/**
 * Modern icon component using Lucide icons
 * Uses SF Symbols names for compatibility, mapped to Lucide equivalents
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  const IconComponent = ICON_MAP[name] || Star;
  
  return (
    <IconComponent
      size={size}
      color={color as string}
      strokeWidth={2}
      style={style as any}
    />
  );
}
