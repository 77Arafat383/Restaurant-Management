export type UserRole = 'CUSTOMER' | 'RESTAURANT_MANAGER' | 'DELIVERY_PERSON' | 'ADMIN';

export type OrderStatus = 
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'REJECTED'
  | 'CANCELLED';

export type PaymentMethod = 'CARD' | 'BKASH' | 'NAGAD' | 'COD';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type DeliveryStatus = 'ASSIGNED' | 'PICKED_UP' | 'ON_THE_WAY' | 'DELIVERED' | 'FAILED';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  address?: string;
  avatar?: string;
  restaurantId?: string; // If manager
  isApproved?: boolean;
}

export interface FoodItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  image: string;
  isVeg: boolean;
  isSpicy: boolean;
  rating?: number;
  preparationTime?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  cuisine: string;
  rating: number;
  ratingCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  bannerImage: string;
  logoImage: string;
  isApproved: boolean;
  isOpen: boolean;
  ownerId: string;
  foodItems?: FoodItem[];
}

export interface OrderItem {
  id: string;
  orderId?: string;
  foodItemId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  image?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  paidAt?: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  deliveryPersonPhone?: string;
  status: DeliveryStatus;
  pickupTime?: string;
  deliveredTime?: string;
  notes?: string;
}

export interface Feedback {
  id: string;
  orderId: string;
  customerId: string;
  customerName?: string;
  customerAvatar?: string;
  restaurantId: string;
  restaurantName?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress?: string;
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  deliveryPersonPhone?: string;
  
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  
  notes?: string;
  estimatedDeliveryTime: string;
  createdAt: string;
  updatedAt: string;
  
  feedback?: Feedback;
  requestedDeliveryPersonId?: string | null;
  requestedDeliveryPersonName?: string | null;
  requestedDeliveryPersonPhone?: string | null;
  deliveryRequestStatus?: 'PENDING' | 'APPROVED' | 'DENIED' | null;
}

export interface CartItem {
  foodItem: FoodItem;
  restaurantId: string;
  restaurantName: string;
  quantity: number;
  selectedOptions?: string[];
  specialInstructions?: string;
}
