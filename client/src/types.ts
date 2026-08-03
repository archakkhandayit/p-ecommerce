export interface User {
  _id: string;
  fname: string;
  phone: string;
  email: string;
  role: "admin" | "user" | "ADMIN" | "USER";
  createdAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  desc?: string;
  description?: string;
  price: number;
  stock?: number;
  category: string;
  publish?: boolean;
  image: string | { public_id: string; url: string };
  createdAt?: string;
}

export interface Post {
  _id: string;
  name: string;
  desc: string;
  category: string;
  image: { public_id?: string; url: string } | string;
  createdAt?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
