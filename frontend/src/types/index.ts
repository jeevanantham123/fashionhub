export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
  addresses?: Address[];
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  _count?: { products: number };
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  stock: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  categoryId: string;
  category?: Category;
  tags: string[];
  featured: boolean;
  active: boolean;
  createdAt: string;
  variants: ProductVariant[];
  reviews?: Review[];
  avgRating?: number;
  reviewCount?: number;
  related?: Product[];
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: { id: string; name: string };
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: Pick<Product, 'id' | 'name' | 'slug' | 'images' | 'price'>;
  variant?: ProductVariant;
}

export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
}

export interface WishlistItem {
  id: string;
  wishlistId: string;
  productId: string;
  product: Product;
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  product?: Pick<Product, 'id' | 'name' | 'images' | 'slug'>;
  variant?: ProductVariant;
}

export interface Order {
  id: string;
  userId: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  shippingAddressId?: string;
  shippingAddress?: Address;
  couponId?: string;
  coupon?: { code: string; type: string; value: number };
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
}

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  minOrder: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  active: boolean;
  discount?: number;
}

export interface HomeSection {
  id: string;
  type: 'hero' | 'featured' | 'categories' | 'promo' | 'newsletter';
  title: string;
  subtitle: string;
  content?: any;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
  visible: boolean;
}

export interface ThemeSettings {
  'primary-color': string;
  'secondary-color': string;
  'background-color': string;
  'text-color': string;
  'accent-color': string;
  'heading-font': string;
  'body-font': string;
  'logo-text': string;
  tagline: string;
  [key: string]: string;
}
