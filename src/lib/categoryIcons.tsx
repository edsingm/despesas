import {
  Tag, Home, Car, ShoppingCart, Utensils, Coffee,
  Fuel, Heart, Book, Music, Gamepad2, Plane, Briefcase,
  CreditCard, Gift, Phone, Wifi, Zap, DollarSign, TrendingUp,
  ShoppingBag, Film, Dumbbell, Wrench, Shirt, Banana, Droplet
} from 'lucide-react';

// Mapeamento de ícones completo
export const iconMap: Record<string, any> = {
  'tag': Tag,
  'home': Home,
  'car': Car,
  'shopping-cart': ShoppingCart,
  'utensils': Utensils,
  'coffee': Coffee,
  'fuel': Fuel,
  'heart': Heart,
  'book': Book,
  'music': Music,
  'gamepad': Gamepad2,
  'plane': Plane,
  'briefcase': Briefcase,
  'credit-card': CreditCard,
  'gift': Gift,
  'phone': Phone,
  'wifi': Wifi,
  'zap': Zap,
  'dollar-sign': DollarSign,
  'trending-up': TrendingUp,
  'shopping-bag': ShoppingBag,
  'film': Film,
  'dumbbell': Dumbbell,
  'wrench': Wrench,
  'shirt': Shirt,
  'banana': Banana,
  'droplet': Droplet
};

// Lista de ícones disponíveis com labels
export const availableIcons = [
  { nome: 'tag', label: 'Tag' },
  { nome: 'home', label: 'Casa' },
  { nome: 'car', label: 'Carro' },
  { nome: 'shopping-cart', label: 'Compras' },
  { nome: 'utensils', label: 'Alimentação' },
  { nome: 'coffee', label: 'Café' },
  { nome: 'fuel', label: 'Combustível' },
  { nome: 'heart', label: 'Saúde' },
  { nome: 'book', label: 'Educação' },
  { nome: 'music', label: 'Música' },
  { nome: 'gamepad', label: 'Jogos' },
  { nome: 'plane', label: 'Viagem' },
  { nome: 'briefcase', label: 'Trabalho' },
  { nome: 'credit-card', label: 'Cartão' },
  { nome: 'gift', label: 'Presente' },
  { nome: 'phone', label: 'Telefone' },
  { nome: 'wifi', label: 'Internet' },
  { nome: 'zap', label: 'Energia' },
  { nome: 'dollar-sign', label: 'Dinheiro' },
  { nome: 'trending-up', label: 'Investimento' },
  { nome: 'shopping-bag', label: 'Loja' },
  { nome: 'film', label: 'Cinema' },
  { nome: 'dumbbell', label: 'Academia' },
  { nome: 'wrench', label: 'Manutenção' },
  { nome: 'shirt', label: 'Roupa' },
  { nome: 'banana', label: 'Mercado' },
  { nome: 'droplet', label: 'Água' }
];

// Função para renderizar ícone
export const renderCategoryIcon = (iconeName: string, className: string = 'w-5 h-5') => {
  try {
    const IconComponent = iconMap[iconeName];
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
    return <Tag className={className} />;
  } catch (error) {
    console.error(`Erro ao renderizar ícone ${iconeName}:`, error);
    return <Tag className={className} />;
  }
};

// Função para obter o label do ícone
export const getIconLabel = (iconeName: string): string => {
  return availableIcons.find(i => i.nome === iconeName)?.label || iconeName;
};

