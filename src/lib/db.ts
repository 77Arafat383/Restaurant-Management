import fs from 'fs';
import path from 'path';
import { 
  INITIAL_USERS, 
  INITIAL_RESTAURANTS, 
  INITIAL_FOOD_ITEMS, 
  INITIAL_ORDERS, 
  INITIAL_FEEDBACKS 
} from './seed-data';
import { 
  User, 
  Restaurant, 
  FoodItem, 
  Order, 
  Feedback, 
  OrderStatus, 
  PaymentStatus 
} from './types';

// Persistent Database Storage File Path
const DB_DIR = path.join(process.cwd(), 'prisma');
const DB_FILE = path.join(DB_DIR, 'quickbite_db.json');

interface DatabaseSchema {
  users: User[];
  restaurants: Restaurant[];
  foodItems: FoodItem[];
  orders: Order[];
  feedbacks: Feedback[];
  config?: {
    vatRate: number;
    deliveryCharge: number;
  };
}

class PersistentStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      users: [...INITIAL_USERS],
      restaurants: [...INITIAL_RESTAURANTS],
      foodItems: [...INITIAL_FOOD_ITEMS],
      orders: [...INITIAL_ORDERS],
      feedbacks: [...INITIAL_FEEDBACKS],
      config: { vatRate: 0.05, deliveryCharge: 40 },
    };
    this.loadFromDisk();
  }

  private ensureDir() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
    } catch (e) {
      console.error('Error creating database directory:', e);
    }
  }

  private loadFromDisk() {
    try {
      this.ensureDir();
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          users: parsed.users || [...INITIAL_USERS],
          restaurants: parsed.restaurants || [...INITIAL_RESTAURANTS],
          foodItems: parsed.foodItems || [...INITIAL_FOOD_ITEMS],
          orders: parsed.orders || [...INITIAL_ORDERS],
          feedbacks: parsed.feedbacks || [...INITIAL_FEEDBACKS],
          config: parsed.config || { vatRate: 0.05, deliveryCharge: 40 },
        };
      } else {
        this.saveToDisk();
      }
    } catch (error) {
      console.error('Failed to load database from disk, using seed memory state:', error);
    }
  }

  private saveToDisk() {
    try {
      this.ensureDir();
      const content = JSON.stringify(this.data, null, 2);
      fs.writeFileSync(DB_FILE, content, 'utf-8');
    } catch (error) {
      console.error('Failed to persist database to disk:', error);
    }
  }

  // --- Users Operations ---
  getUsers(): User[] {
    this.loadFromDisk();
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    this.loadFromDisk();
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    this.loadFromDisk();
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User): User {
    this.loadFromDisk();
    const existing = this.data.users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (existing) {
      throw new Error('A user with this email address already exists.');
    }
    const newUser = { ...user };
    if (!newUser.id) {
      newUser.id = `user_${Date.now()}`;
    }
    this.data.users.push(newUser);
    this.saveToDisk();
    return newUser;
  }

  updateUserRole(id: string, role: User['role']): User | null {
    this.loadFromDisk();
    const u = this.data.users.find(user => user.id === id);
    if (u) {
      u.role = role;
      this.saveToDisk();
      return u;
    }
    return null;
  }

  updateUserApproval(id: string, isApproved: boolean): User | null {
    this.loadFromDisk();
    const u = this.data.users.find(user => user.id === id);
    if (u) {
      u.isApproved = isApproved;
      this.saveToDisk();
      return u;
    }
    return null;
  }

  // --- Restaurants Operations ---
  getRestaurants(): Restaurant[] {
    this.loadFromDisk();
    return this.data.restaurants.map(r => ({
      ...r,
      foodItems: this.data.foodItems.filter(f => f.restaurantId === r.id)
    }));
  }

  getRestaurantById(id: string): (Restaurant & { foodItems: FoodItem[] }) | null {
    this.loadFromDisk();
    const r = this.data.restaurants.find(item => item.id === id);
    if (!r) return null;
    return {
      ...r,
      foodItems: this.data.foodItems.filter(f => f.restaurantId === r.id)
    };
  }

  createRestaurant(restaurant: Restaurant): Restaurant {
    this.loadFromDisk();
    const newRestaurant = { ...restaurant };
    if (!newRestaurant.id) {
      newRestaurant.id = `rest_${Date.now()}`;
    }
    this.data.restaurants.push(newRestaurant);
    this.saveToDisk();
    return newRestaurant;
  }

  toggleRestaurantApproval(id: string): Restaurant | null {
    this.loadFromDisk();
    const r = this.data.restaurants.find(item => item.id === id);
    if (r) {
      r.isApproved = !r.isApproved;
      this.saveToDisk();
      return r;
    }
    return null;
  }

  // --- Food Items Operations ---
  getFoodItems(restaurantId?: string): FoodItem[] {
    this.loadFromDisk();
    if (restaurantId) {
      return this.data.foodItems.filter(f => f.restaurantId === restaurantId);
    }
    return this.data.foodItems;
  }

  getFoodItemById(id: string): FoodItem | undefined {
    this.loadFromDisk();
    return this.data.foodItems.find(f => f.id === id);
  }

  createFoodItem(item: FoodItem): FoodItem {
    this.loadFromDisk();
    const newItem = { ...item };
    if (!newItem.id) {
      newItem.id = `food_${Date.now()}`;
    }
    this.data.foodItems.push(newItem);
    this.saveToDisk();
    return newItem;
  }

  updateFoodItem(id: string, updates: Partial<FoodItem>): FoodItem | null {
    this.loadFromDisk();
    const idx = this.data.foodItems.findIndex(f => f.id === id);
    if (idx !== -1) {
      this.data.foodItems[idx] = { ...this.data.foodItems[idx], ...updates };
      this.saveToDisk();
      return this.data.foodItems[idx];
    }
    return null;
  }

  deleteFoodItem(id: string): FoodItem | null {
    this.loadFromDisk();
    const idx = this.data.foodItems.findIndex(f => f.id === id);
    if (idx !== -1) {
      const deleted = this.data.foodItems.splice(idx, 1)[0];
      this.saveToDisk();
      return deleted;
    }
    return null;
  }

  // --- Orders Operations ---
  getOrders(filter?: { customerId?: string; restaurantId?: string; deliveryPersonId?: string }): Order[] {
    this.loadFromDisk();
    let result = [...this.data.orders];
    if (filter?.customerId) {
      result = result.filter(o => o.customerId === filter.customerId);
    }
    if (filter?.restaurantId) {
      result = result.filter(o => o.restaurantId === filter.restaurantId);
    }
    if (filter?.deliveryPersonId) {
      result = result.filter(o => o.deliveryPersonId === filter.deliveryPersonId);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): Order | undefined {
    this.loadFromDisk();
    return this.data.orders.find(o => o.id === id || o.orderNumber === id);
  }

  createOrder(order: Order): Order {
    this.loadFromDisk();
    const newOrder = { ...order };
    if (!newOrder.id) {
      newOrder.id = `order_${Date.now()}`;
    }
    this.data.orders.unshift(newOrder);
    this.saveToDisk();
    return newOrder;
  }

  updateOrderStatus(
    orderId: string, 
    status: OrderStatus, 
    extra?: { 
      deliveryPersonId?: string; 
      deliveryPersonName?: string; 
      deliveryPersonPhone?: string; 
      paymentStatus?: PaymentStatus;
    }
  ): Order | null {
    this.loadFromDisk();
    const order = this.data.orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    order.status = status;
    order.updatedAt = new Date().toISOString();

    if (extra?.deliveryPersonId) {
      order.deliveryPersonId = extra.deliveryPersonId;
      order.deliveryPersonName = extra.deliveryPersonName || 'Rakibul Hasan';
      order.deliveryPersonPhone = extra.deliveryPersonPhone || '+880 1912-334455';
    }
    if (extra?.paymentStatus) {
      order.paymentStatus = extra.paymentStatus;
    }

    this.saveToDisk();
    return order;
  }

  deleteOrder(id: string): Order | null {
    this.loadFromDisk();
    const idx = this.data.orders.findIndex(o => o.id === id || o.orderNumber === id);
    if (idx !== -1) {
      const deleted = this.data.orders.splice(idx, 1)[0];
      this.saveToDisk();
      return deleted;
    }
    return null;
  }

  updateOrder(id: string, updates: Partial<Order>): Order | null {
    this.loadFromDisk();
    const idx = this.data.orders.findIndex(o => o.id === id || o.orderNumber === id);
    if (idx !== -1) {
      this.data.orders[idx] = { 
        ...this.data.orders[idx], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      this.saveToDisk();
      return this.data.orders[idx];
    }
    return null;
  }

  // --- Feedback Operations ---
  getFeedbacks(restaurantId?: string): Feedback[] {
    this.loadFromDisk();
    if (restaurantId) {
      return this.data.feedbacks.filter(f => f.restaurantId === restaurantId);
    }
    return this.data.feedbacks;
  }

  createFeedback(feedback: Feedback): Feedback {
    this.loadFromDisk();
    const newFeedback = { ...feedback };
    if (!newFeedback.id) {
      newFeedback.id = `fb_${Date.now()}`;
    }
    this.data.feedbacks.unshift(newFeedback);
    this.saveToDisk();
    return newFeedback;
  }

  deleteUser(id: string): User | null {
    this.loadFromDisk();
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      const deleted = this.data.users.splice(idx, 1)[0];
      this.saveToDisk();
      return deleted;
    }
    return null;
  }

  deleteRestaurant(id: string): Restaurant | null {
    this.loadFromDisk();
    const idx = this.data.restaurants.findIndex(r => r.id === id);
    if (idx !== -1) {
      const deleted = this.data.restaurants.splice(idx, 1)[0];
      this.data.foodItems = this.data.foodItems.filter(f => f.restaurantId !== id);
      this.saveToDisk();
      return deleted;
    }
    return null;
  }

  deleteFeedback(id: string): Feedback | null {
    this.loadFromDisk();
    const idx = this.data.feedbacks.findIndex(f => f.id === id);
    if (idx !== -1) {
      const deleted = this.data.feedbacks.splice(idx, 1)[0];
      this.saveToDisk();
      return deleted;
    }
    return null;
  }

  // --- Config Operations ---
  getConfig() {
    this.loadFromDisk();
    if (!this.data.config) {
      this.data.config = { vatRate: 0.05, deliveryCharge: 40 };
      this.saveToDisk();
    }
    return this.data.config;
  }

  updateConfig(updates: { vatRate?: number; deliveryCharge?: number }) {
    this.loadFromDisk();
    if (!this.data.config) {
      this.data.config = { vatRate: 0.05, deliveryCharge: 40 };
    }
    this.data.config = { ...this.data.config, ...updates };
    this.saveToDisk();
    return this.data.config;
  }
}

export const db = new PersistentStore();
export const localStore = db;
