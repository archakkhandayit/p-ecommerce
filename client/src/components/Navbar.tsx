import React from "react";
import { User, CartItem } from "../types";
import { ShoppingBag, LayoutDashboard, Terminal, ShieldAlert, LogOut, User as UserIcon, ShoppingCart } from "lucide-react";

interface NavbarProps {
  currentView: "store" | "admin";
  setCurrentView: (view: "store" | "admin") => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  cart: CartItem[];
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  user,
  onOpenAuth,
  onLogout,
  cart,
  onOpenCart,
}) => {
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header id="app-navbar" className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 shadow-md">
      <div id="navbar-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div id="brand-logo-section" className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView("store")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                SHOPIFY
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Online Marketplace</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav id="view-mode-nav" className="hidden md:flex items-center space-x-1 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
          <button
            id="nav-btn-store"
            onClick={() => setCurrentView("store")}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentView === "store"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>

          <button
            id="nav-btn-admin"
            onClick={() => setCurrentView("admin")}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentView === "admin"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
            {user?.role === "ADMIN" && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </nav>

        {/* Right Actions: Cart & Auth */}
        <div id="navbar-actions" className="flex items-center space-x-3">
          {/* Cart Button */}
          <button
            id="btn-cart-toggle"
            onClick={onOpenCart}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition border border-transparent hover:border-slate-700"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span id="cart-count-badge" className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-sm animate-scale-in">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Auth Info or Login Button */}
          {user ? (
            <div id="user-profile-badge" className="flex items-center space-x-2 bg-slate-800/90 pl-3 pr-2 py-1.5 rounded-xl border border-slate-700/80">
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200 leading-tight">{user.fname}</span>
                <span className={`text-[10px] font-medium leading-tight ${user.role === "ADMIN" ? "text-amber-400" : "text-emerald-400"}`}>
                  {user.role}
                </span>
              </div>
              <button
                id="btn-logout"
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700/60 transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-open-login"
              onClick={onOpenAuth}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
            >
              <UserIcon className="w-4 h-4" />
              <span>Login / Register</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Nav */}
      <div id="mobile-subnav" className="md:hidden flex items-center justify-around bg-slate-950/60 border-t border-slate-800 px-2 py-1 text-xs">
        <button
          id="mobile-nav-store"
          onClick={() => setCurrentView("store")}
          className={`px-3 py-1.5 rounded-md ${currentView === "store" ? "text-indigo-400 font-bold" : "text-slate-400"}`}
        >
          Store
        </button>
        <button
          id="mobile-nav-admin"
          onClick={() => setCurrentView("admin")}
          className={`px-3 py-1.5 rounded-md ${currentView === "admin" ? "text-indigo-400 font-bold" : "text-slate-400"}`}
        >
          Admin
        </button>
      </div>
    </header>
  );
};
