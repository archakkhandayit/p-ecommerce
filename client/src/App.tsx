import React, { useState, useEffect } from "react";
import { User, Product, CartItem } from "./types";
import { getApiUrl } from "./apiConfig";
import { Navbar } from "./components/Navbar";
import { StoreFront } from "./components/StoreFront";
import { AdminDashboard } from "./components/AdminDashboard";
import { AuthModal } from "./components/AuthModal";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export default function App() {
  const [currentView, setCurrentView] = useState<"store" | "admin">("store");
  
  // Auth state persisted in localStorage
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem("mern_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("mern_token") || null;
  });

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(true);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem("mern_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Auth Modal state
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Fetch published products
  const fetchProducts = async () => {
    setIsProductsLoading(true);
    try {
      const res = await fetch(getApiUrl("/products"));
      const data = await res.json();
      if (data.success) {
        console.log(data)
        setProducts(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setIsProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem("mern_cart", JSON.stringify(cart));
  }, [cart]);

  // Handle Login success
  const handleLoginSuccess = (usr: User, tok: string) => {
    setUser(usr);
    setToken(tok);
    localStorage.setItem("mern_user", JSON.stringify(usr));
    localStorage.setItem("mern_token", tok);
  };

  // Handle Logout
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("mern_user");
    localStorage.removeItem("mern_token");
    showToast("Logged out successfully", "info");
  };

  // Cart Operations
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added ${product.name} to cart`, "success");
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product._id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product._id !== productId));
    showToast("Item removed from cart", "info");
  };

  const handleClearCart = () => {
    setCart([]);
  };

  return (
    <div id="app-root" className="min-h-screen bg-slate-950 font-sans antialiased text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Dynamic View Mode */}
      <div id="app-body" className="flex-1">
        {currentView === "store" && (
          <StoreFront
            products={products}
            isLoading={isProductsLoading}
            onRefresh={fetchProducts}
            onAddToCart={handleAddToCart}
            cart={cart}
            isCartOpen={isCartOpen}
            onCloseCart={() => setIsCartOpen(false)}
            onUpdateCartQty={handleUpdateCartQty}
            onRemoveCartItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
          />
        )}

        {currentView === "admin" && (
          <AdminDashboard
            user={user}
            token={token}
            onOpenAuth={() => setIsAuthOpen(true)}
            onShowToast={showToast}
          />
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onShowToast={showToast}
      />

      {/* Toast Notification Container */}
      <div id="toast-notifications-container" className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-2xl backdrop-blur text-xs font-semibold animate-slide-up transition-all ${
              toast.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
                : toast.type === "error"
                ? "bg-rose-950/90 border-rose-500/40 text-rose-200"
                : "bg-slate-900/95 border-indigo-500/40 text-indigo-200"
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toast.type === "error" && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {toast.type === "info" && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-3 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
