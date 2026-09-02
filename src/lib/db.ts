import { PrismaClient } from '@prisma/client';
import {
  Feedback,
  FoodItem,
  Order,
  OrderStatus,
  PaymentStatus,
  Restaurant,
  User,
  DEFAULT_UNISEX_AVATAR,
} from './types';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

const dateToIso = (value: Date | string | null | undefined) => {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : value;
};

const stripUndefined = <T extends Record<string, unknown>>(value: T) =>
  Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T;

const mapUser = (user: any): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  password: user.password,
  role: user.role,
  phone: user.phone ?? undefined,
  address: user.address ?? undefined,
  avatar: user.avatar ?? undefined,
  restaurantId: user.restaurantId ?? user.restaurants?.[0]?.id ?? undefined,
  isApproved: user.isApproved,
});

const mapFoodItem = (item: any): FoodItem => ({
  id: item.id,
  restaurantId: item.restaurantId,
  name: item.name,
  description: item.description ?? '',
  price: item.price,
  category: item.category,
  isAvailable: item.isAvailable,
  image: item.image ?? '',
  isVeg: item.isVeg,
  isSpicy: item.isSpicy,
  rating: item.rating,
  preparationTime: item.preparationTime,
});

const mapOrder = (order: any): Order => ({
  id: order.id,
  orderNumber: order.orderNumber,
  customerId: order.customerId,
  customerName: order.customerName ?? '',
  customerEmail: order.customerEmail ?? '',
  customerPhone: order.customerPhone ?? '',
  deliveryAddress: order.deliveryAddress,
  restaurantId: order.restaurantId,
  restaurantName: order.restaurantName ?? '',
  restaurantAddress: order.restaurantAddress ?? undefined,
  deliveryPersonId: order.deliveryPersonId ?? undefined,
  deliveryPersonName: order.deliveryPersonName ?? undefined,
  deliveryPersonPhone: order.deliveryPersonPhone ?? undefined,
  items: (order.items ?? []).map((item: any) => ({
    id: item.id,
    orderId: item.orderId,
    foodItemId: item.foodItemId ?? '',
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    subtotal: item.subtotal,
    notes: item.notes ?? undefined,
  })),
  subtotal: order.subtotal,
  deliveryFee: order.deliveryFee,
  tax: order.tax,
  discount: order.discount,
  totalAmount: order.totalAmount,
  status: order.status,
  paymentMethod: order.paymentMethod,
  paymentStatus: order.paymentStatus,
  transactionId: order.transactionId ?? undefined,
  notes: order.notes ?? undefined,
  estimatedDeliveryTime: order.estimatedDeliveryTime ?? '35-45 mins',
  createdAt: dateToIso(order.createdAt) ?? new Date().toISOString(),
  updatedAt: dateToIso(order.updatedAt) ?? new Date().toISOString(),
  requestedDeliveryPersonId: order.requestedDeliveryPersonId ?? null,
  requestedDeliveryPersonName: order.requestedDeliveryPersonName ?? null,
  requestedDeliveryPersonPhone: order.requestedDeliveryPersonPhone ?? null,
  deliveryRequestStatus: order.deliveryRequestStatus ?? null,
});

const mapRestaurant = (restaurant: any): Restaurant & { foodItems?: FoodItem[] } => ({
  id: restaurant.id,
  name: restaurant.name,
  description: restaurant.description ?? '',
  email: restaurant.email,
  phone: restaurant.phone,
  address: restaurant.address,
  cuisine: restaurant.cuisine,
  rating: restaurant.rating,
  ratingCount: restaurant.ratingCount,
  deliveryTime: restaurant.deliveryTime,
  deliveryFee: restaurant.deliveryFee,
  minOrder: restaurant.minOrder,
  bannerImage: restaurant.bannerImage ?? '',
  logoImage: restaurant.logoImage ?? '',
  isApproved: restaurant.isApproved,
  isOpen: restaurant.isOpen,
  ownerId: restaurant.ownerId,
  foodItems: restaurant.foodItems?.map(mapFoodItem),
});

const mapFeedback = (feedback: any): Feedback => ({
  id: feedback.id,
  orderId: feedback.orderId,
  customerId: feedback.customerId,
  customerName: feedback.customerName ?? undefined,
  customerAvatar: feedback.customerAvatar ?? undefined,
  restaurantId: feedback.restaurantId,
  restaurantName: feedback.restaurantName ?? undefined,
  rating: feedback.rating,
  comment: feedback.comment ?? '',
  createdAt: dateToIso(feedback.createdAt) ?? new Date().toISOString(),
});

class PostgresStore {
  async getUsers(): Promise<User[]> {
    const users = await prisma.user.findMany({ include: { restaurants: true }, orderBy: { createdAt: 'asc' } });
    return users.map(mapUser);
  }

  async getUserById(id: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({ where: { id }, include: { restaurants: true } });
    return user ? mapUser(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() }, include: { restaurants: true } });
    return user ? mapUser(user) : undefined;
  }

  async createUser(user: User): Promise<User> {
    const created = await prisma.user.create({
      data: {
        id: user.id || `user_${Date.now()}`,
        name: user.name,
        email: user.email.toLowerCase(),
        password: user.password || '',
        phone: user.phone,
        address: user.address,
        role: user.role,
        avatar: user.avatar || DEFAULT_UNISEX_AVATAR,
        restaurantId: user.restaurantId,
        isApproved: user.isApproved ?? true,
      },
      include: { restaurants: true },
    });
    return mapUser(created);
  }

  async updateUserRole(id: string, role: User['role']): Promise<User | null> {
    try {
      const user = await prisma.user.update({ where: { id }, data: { role }, include: { restaurants: true } });
      return mapUser(user);
    } catch {
      return null;
    }
  }

  async updateUserApproval(id: string, isApproved: boolean): Promise<User | null> {
    try {
      const user = await prisma.user.update({ where: { id }, data: { isApproved }, include: { restaurants: true } });
      return mapUser(user);
    } catch {
      return null;
    }
  }

  async updateUserPassword(email: string, password: string): Promise<User | null> {
    try {
      const user = await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { password },
        include: { restaurants: true },
      });
      return mapUser(user);
    } catch {
      return null;
    }
  }

  async updateUserProfile(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const data: Record<string, any> = {};
      if (updates.name !== undefined) data.name = updates.name.trim();
      if (updates.phone !== undefined) data.phone = updates.phone.trim();
      if (updates.address !== undefined) data.address = updates.address.trim();
      if (updates.avatar !== undefined) data.avatar = updates.avatar;

      const user = await prisma.user.update({
        where: { id },
        data,
        include: { restaurants: true },
      });
      return mapUser(user);
    } catch {
      return null;
    }
  }

  async getRestaurants(): Promise<(Restaurant & { foodItems?: FoodItem[] })[]> {
    const restaurants = await prisma.restaurant.findMany({ include: { foodItems: true }, orderBy: { createdAt: 'asc' } });
    return restaurants.map(mapRestaurant);
  }

  async getRestaurantById(id: string): Promise<(Restaurant & { foodItems: FoodItem[] }) | null> {
    const restaurant = await prisma.restaurant.findUnique({ where: { id }, include: { foodItems: true } });
    return restaurant ? (mapRestaurant(restaurant) as Restaurant & { foodItems: FoodItem[] }) : null;
  }

  async createRestaurant(restaurant: Restaurant): Promise<Restaurant> {
    const created = await prisma.restaurant.create({
      data: {
        id: restaurant.id || `rest_${Date.now()}`,
        name: restaurant.name,
        description: restaurant.description,
        email: restaurant.email,
        phone: restaurant.phone,
        address: restaurant.address,
        cuisine: restaurant.cuisine,
        rating: restaurant.rating,
        ratingCount: restaurant.ratingCount,
        deliveryTime: restaurant.deliveryTime,
        deliveryFee: restaurant.deliveryFee,
        minOrder: restaurant.minOrder,
        bannerImage: restaurant.bannerImage,
        logoImage: restaurant.logoImage,
        isApproved: restaurant.isApproved,
        isOpen: restaurant.isOpen,
        owner: { connect: { id: restaurant.ownerId } },
      },
    });
    await prisma.user.update({ where: { id: restaurant.ownerId }, data: { restaurantId: created.id } }).catch(() => undefined);
    return mapRestaurant(created);
  }

  async toggleRestaurantApproval(id: string): Promise<Restaurant | null> {
    const restaurant = await prisma.restaurant.findUnique({ where: { id } });
    if (!restaurant) return null;
    const updated = await prisma.restaurant.update({ where: { id }, data: { isApproved: !restaurant.isApproved } });
    return mapRestaurant(updated);
  }

  async getFoodItems(restaurantId?: string): Promise<FoodItem[]> {
    const items = await prisma.foodItem.findMany({
      where: restaurantId ? { restaurantId } : undefined,
      orderBy: { createdAt: 'asc' },
    });
    return items.map(mapFoodItem);
  }

  async getFoodItemById(id: string): Promise<FoodItem | undefined> {
    const item = await prisma.foodItem.findUnique({ where: { id } });
    return item ? mapFoodItem(item) : undefined;
  }

  async createFoodItem(item: FoodItem): Promise<FoodItem> {
    const created = await prisma.foodItem.create({
      data: {
        id: item.id || `food_${Date.now()}`,
        restaurant: { connect: { id: item.restaurantId } },
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        isAvailable: item.isAvailable,
        image: item.image,
        isVeg: item.isVeg,
        isSpicy: item.isSpicy,
        rating: item.rating ?? 5,
        preparationTime: item.preparationTime ?? '15-20 min',
      },
    });
    return mapFoodItem(created);
  }

  async updateFoodItem(id: string, updates: Partial<FoodItem>): Promise<FoodItem | null> {
    try {
      const data = stripUndefined({
        name: updates.name,
        description: updates.description,
        price: updates.price,
        category: updates.category,
        isAvailable: updates.isAvailable,
        image: updates.image,
        isVeg: updates.isVeg,
        isSpicy: updates.isSpicy,
        rating: updates.rating,
        preparationTime: updates.preparationTime,
      });
      const updated = await prisma.foodItem.update({ where: { id }, data });
      return mapFoodItem(updated);
    } catch {
      return null;
    }
  }

  async deleteFoodItem(id: string): Promise<FoodItem | null> {
    try {
      const deleted = await prisma.foodItem.delete({ where: { id } });
      return mapFoodItem(deleted);
    } catch {
      return null;
    }
  }

  async getOrders(filter?: { customerId?: string; restaurantId?: string; deliveryPersonId?: string }): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      where: stripUndefined({
        customerId: filter?.customerId,
        restaurantId: filter?.restaurantId,
        deliveryPersonId: filter?.deliveryPersonId,
      }),
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map(mapOrder);
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: { items: true },
    });
    return order ? mapOrder(order) : undefined;
  }

  async createOrder(order: Order): Promise<Order> {
    const created = await prisma.order.create({
      data: {
        id: order.id || `order_${Date.now()}`,
        orderNumber: order.orderNumber,
        customer: { connect: { id: order.customerId } },
        restaurant: { connect: { id: order.restaurantId } },
        deliveryPerson: order.deliveryPersonId ? { connect: { id: order.deliveryPersonId } } : undefined,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        restaurantName: order.restaurantName,
        restaurantAddress: order.restaurantAddress,
        deliveryPersonName: order.deliveryPersonName,
        deliveryPersonPhone: order.deliveryPersonPhone,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        tax: order.tax,
        discount: order.discount,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        transactionId: order.transactionId,
        deliveryAddress: order.deliveryAddress,
        notes: order.notes,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        items: {
          create: order.items.map((item) => ({
            id: item.id || `oi_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            foodItem: item.foodItemId ? { connect: { id: item.foodItemId } } : undefined,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.subtotal,
            notes: item.notes,
          })),
        },
      },
      include: { items: true },
    });
    return mapOrder(created);
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    extra?: {
      deliveryPersonId?: string;
      deliveryPersonName?: string;
      deliveryPersonPhone?: string;
      paymentStatus?: PaymentStatus;
    }
  ): Promise<Order | null> {
    return this.updateOrder(orderId, { status, ...extra });
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const order = await prisma.order.findFirst({ where: { OR: [{ id }, { orderNumber: id }] } });
    if (!order) return null;

    const data = stripUndefined({
      customerName: updates.customerName,
      customerEmail: updates.customerEmail,
      customerPhone: updates.customerPhone,
      restaurantName: updates.restaurantName,
      restaurantAddress: updates.restaurantAddress,
      deliveryPersonName: updates.deliveryPersonName,
      deliveryPersonPhone: updates.deliveryPersonPhone,
      subtotal: updates.subtotal,
      deliveryFee: updates.deliveryFee,
      tax: updates.tax,
      discount: updates.discount,
      totalAmount: updates.totalAmount,
      status: updates.status,
      paymentMethod: updates.paymentMethod,
      paymentStatus: updates.paymentStatus,
      transactionId: updates.transactionId,
      deliveryAddress: updates.deliveryAddress,
      notes: updates.notes,
      estimatedDeliveryTime: updates.estimatedDeliveryTime,
      requestedDeliveryPersonId: updates.requestedDeliveryPersonId,
      requestedDeliveryPersonName: updates.requestedDeliveryPersonName,
      requestedDeliveryPersonPhone: updates.requestedDeliveryPersonPhone,
      deliveryRequestStatus: updates.deliveryRequestStatus,
    });

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        ...data,
        deliveryPerson: updates.deliveryPersonId ? { connect: { id: updates.deliveryPersonId } } : undefined,
      },
      include: { items: true },
    });
    return mapOrder(updated);
  }

  async deleteOrder(id: string): Promise<Order | null> {
    const order = await prisma.order.findFirst({ where: { OR: [{ id }, { orderNumber: id }] }, include: { items: true } });
    if (!order) return null;
    await prisma.order.delete({ where: { id: order.id } });
    return mapOrder(order);
  }

  async getFeedbacks(restaurantId?: string): Promise<Feedback[]> {
    const feedbacks = await prisma.feedback.findMany({
      where: restaurantId ? { restaurantId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return feedbacks.map(mapFeedback);
  }

  async createFeedback(feedback: Feedback): Promise<Feedback> {
    const created = await prisma.feedback.create({
      data: {
        id: feedback.id || `fb_${Date.now()}`,
        order: { connect: { id: feedback.orderId } },
        customer: { connect: { id: feedback.customerId } },
        restaurant: { connect: { id: feedback.restaurantId } },
        customerName: feedback.customerName,
        customerAvatar: feedback.customerAvatar,
        restaurantName: feedback.restaurantName,
        rating: feedback.rating,
        comment: feedback.comment,
      },
    });
    return mapFeedback(created);
  }

  async deleteUser(id: string): Promise<User | null> {
    try {
      const deleted = await prisma.user.delete({ where: { id }, include: { restaurants: true } });
      return mapUser(deleted);
    } catch {
      return null;
    }
  }

  async deleteRestaurant(id: string): Promise<Restaurant | null> {
    try {
      const deleted = await prisma.restaurant.delete({ where: { id }, include: { foodItems: true } });
      return mapRestaurant(deleted);
    } catch {
      return null;
    }
  }

  async deleteFeedback(id: string): Promise<Feedback | null> {
    try {
      const deleted = await prisma.feedback.delete({ where: { id } });
      return mapFeedback(deleted);
    } catch {
      return null;
    }
  }

  async getConfig() {
    const config = await prisma.appConfig.upsert({
      where: { id: 'default' },
      update: {},
      create: { id: 'default', vatRate: 0.05, deliveryCharge: 40 },
    });
    return { vatRate: config.vatRate, deliveryCharge: config.deliveryCharge };
  }

  async updateConfig(updates: { vatRate?: number; deliveryCharge?: number }) {
    const config = await prisma.appConfig.upsert({
      where: { id: 'default' },
      update: stripUndefined(updates),
      create: { id: 'default', vatRate: updates.vatRate ?? 0.05, deliveryCharge: updates.deliveryCharge ?? 40 },
    });
    return { vatRate: config.vatRate, deliveryCharge: config.deliveryCharge };
  }
}

export const db = new PostgresStore();
export const localStore = db;
