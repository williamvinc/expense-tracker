// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = string;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chart.pie.fill': 'pie-chart',
  'plus.circle.fill': 'add-circle',
  'plus': 'add',
  'creditcard.fill': 'credit-card',
  'person.fill': 'person',
  'calendar': 'calendar-today',
  'chevron.up': 'expand-less',
  'chevron.down': 'expand-more',
  'eye': 'visibility',
  'eye.slash': 'visibility-off',
  'arrow.down': 'arrow-downward',
  'arrow.up': 'arrow-upward',
  'lock.fill': 'lock',
  'delete.left.fill': 'backspace',
  'faceid': 'face',
  'star.fill': 'star',
  'xmark': 'close',
  'gear': 'settings',
  'pencil': 'edit',
  'cart.fill': 'shopping-cart',
  'shopping_cart': 'shopping-cart',
  'banknote': 'attach-money',
  'lock': 'lock-outline',
  'questionmark.circle': 'help-outline',
  'heart.fill': 'favorite',
  'arrow.up.right': 'open-in-new',
  'hammer.fill': 'build',
  'chevron.left': 'chevron-left',
  'trash': 'delete',
  'trash.fill': 'delete',
  'checkmark': 'check',
  'lunch_dining': 'restaurant',
  'fork.knife': 'restaurant',
  'medical_services': 'local-hospital',
  'cross.fill': 'local-hospital',
  // Additional mappings
  'sports_esports': 'sports-esports',
  'gamecontroller.fill': 'sports-esports',
  'trending_up': 'trending-up',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'card_giftcard': 'card-giftcard',
  'gift.fill': 'card-giftcard',
  'more_horiz': 'more-horiz',
  'ellipsis': 'more-horiz',
  'directions_car': 'directions-car',
  'car.fill': 'directions-car',
  'bag.fill': 'shopping-bag',
  'doc.text.fill': 'description',
  'building.2.fill': 'business',
  'house': 'home',
  'at': 'alternate-email',
  'envelope.fill': 'email',
  'headphones': 'headset',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
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
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name] || name;
  return <MaterialIcons color={color} size={size} name={iconName as any} style={style} />;
}
