import React, { useState, useEffect } from "react";
import { Product, CartItem } from "../types";
import { getApiUrl } from "../apiConfig";
import { Search, Filter, ShoppingCart, Eye, Check, RefreshCw, X, Plus, Minus, Trash2, ArrowRight } from "lucide-react";

interface StoreFrontProps {
  products: Product[];
  isLoading: boolean;
  onRefresh: () => void;
  onAddToCart: (product: Product) => void;
  cart: CartItem[];
  isCartOpen: boolean;
  onCloseCart: () => void;
  onUpdateCartQty: (productId: string, delta: number) => void;
  onRemoveCartItem: (productId: string) => void;
  onClearCart: () => void;
}

export const StoreFront: React.FC<StoreFrontProps> = ({
  products,
  isLoading,
  onRefresh,
  onAddToCart,
  cart,
  isCartOpen,
  onCloseCart,
  onUpdateCartQty,
  onRemoveCartItem,
  onClearCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState<boolean>(false);

  // Extract unique categories
  const categories: string[] = ["All", ...(Array.from(new Set(products.map((p) => p.category))) as string[])];

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: Product) => {
    onAddToCart(product);
    setAddedProductId(product._id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    setIsCheckoutSuccess(true);
    setTimeout(() => {
      onClearCart();
      setIsCheckoutSuccess(false);
      onCloseCart();
    }, 2500);
  };

  return (
    <div id="storefront-page" className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Banner / Hero */}
      <section id="storefront-hero" className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800/80 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div id="hero-grid-pattern" className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div id="hero-content" className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              E-Commerce Product Catalog
            </h1>
          
          </div>

          <div id="hero-quick-stats" className="flex items-center space-x-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur">
            <div className="text-center px-3">
              <p className="text-2xl font-black text-indigo-400">{products.length}</p>
              <p className="text-[11px] text-slate-400 font-medium">Published Items</p>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-center px-3">
              <p className="text-2xl font-black text-emerald-400">{categories.length - 1}</p>
              <p className="text-[11px] text-slate-400 font-medium font-mono">Categories</p>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <button
              id="btn-refresh-products"
              onClick={onRefresh}
              className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center justify-center"
              title="Refresh Products"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Main Catalog Container */}
      <main id="storefront-main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Search and Category Filter Bar */}
        <div id="filter-bar" className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          
          {/* Search Bar */}
          <div id="search-input-wrapper" className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="input-product-search"
              type="text"
              placeholder="Search products by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/80 text-white placeholder-slate-400 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 text-xs sm:text-sm transition-all"
            />
            {searchQuery && (
              <button
                id="btn-clear-search"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div id="category-chips-list" className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <span className="text-slate-400 text-xs font-semibold flex items-center gap-1 pl-1 pr-2">
              <Filter className="w-3.5 h-3.5" />
              <span>Category:</span>
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                id={`cat-chip-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30"
                    : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div id="products-loading-state" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-slate-900/60 rounded-2xl border border-slate-800 animate-pulse p-4 flex flex-col justify-between">
                <div className="w-full h-44 bg-slate-800 rounded-xl" />
                <div className="space-y-2 mt-4">
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                </div>
                <div className="h-8 bg-slate-800 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div id="no-products-found" className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/60">
            <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-300">No products found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== "All"
                ? "Try adjusting your search query or category filters."
                : "No published products available. Switch to Admin Dashboard to add or publish items!"}
            </p>
          </div>
        ) : (
          <div id="product-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const isAdded = addedProductId === product._id;
              return (
                <div
                  key={product._id}
                  id={`product-card-${product._id}`}
                  className="group bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 flex flex-col overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5"
                >
                  {/* Image & Quick View Badge */}
                  <div id={`product-img-container-${product._id}`} className="relative h-48 bg-slate-950 overflow-hidden">
                    <img
                      src={
                        typeof product.image === "object" && product.image?.url
                          ? product.image.url
                          : typeof product.image === "string" && product.image
                          ? product.image.startsWith("http")
                            ? product.image
                            : getApiUrl(product.image)
                          : "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800"
                      }
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full bg-slate-900/80 backdrop-blur text-indigo-300 border border-indigo-500/30">
                        {product.category}
                      </span>
                    </div>
                    <button
                      id={`btn-quick-view-${product._id}`}
                      onClick={() => setSelectedProduct(product)}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 backdrop-blur text-slate-300 hover:text-white hover:bg-slate-900 transition opacity-0 group-hover:opacity-100"
                      title="Quick View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div id={`product-details-${product._id}`} className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {product.desc || product.description || "No description provided."}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Price</span>
                        <span className="text-lg font-black text-indigo-400">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <button
                        id={`btn-add-cart-${product._id}`}
                        onClick={() => handleAddToCart(product)}
                        className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isAdded
                            ? "bg-emerald-600 text-white"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-95"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Product Quick View Modal */}
      {selectedProduct && (
        <div id="modal-product-detail" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div id="modal-product-card" className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative">
            <button
              id="btn-close-product-modal"
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-slate-950/60 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-64 bg-slate-950">
              <img
                src={
                  typeof selectedProduct.image === "object" && selectedProduct.image?.url
                    ? selectedProduct.image.url
                    : typeof selectedProduct.image === "string" && selectedProduct.image
                    ? selectedProduct.image.startsWith("http")
                      ? selectedProduct.image
                      : getApiUrl(selectedProduct.image)
                    : "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800"
                }
                alt={selectedProduct.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-indigo-600 text-white shadow-md">
                  {selectedProduct.category}
                </span>
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-xl font-bold text-white">{selectedProduct.name}</h2>
              <p className="text-xs text-slate-400 font-mono mt-1">ID: {selectedProduct._id}</p>
              
              <div className="mt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</h4>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                  {selectedProduct.desc || selectedProduct.description || "No description provided."}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Unit Price</span>
                  <span className="text-2xl font-black text-indigo-400">
                    ₹{selectedProduct.price.toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  id="btn-modal-add-to-cart"
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-Over Shopping Cart Drawer */}
      {isCartOpen && (
        <div id="drawer-cart-overlay" className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div id="drawer-cart-panel" className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between shadow-2xl">
            
            {/* Header */}
            <div id="drawer-cart-header" className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-indigo-400" />
                <h2 className="font-bold text-base text-white">Your Shopping Cart</h2>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                  {cart.length}
                </span>
              </div>
              <button
                id="btn-close-cart-drawer"
                onClick={onCloseCart}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div id="drawer-cart-body" className="flex-1 overflow-y-auto p-4 space-y-4">
              {isCheckoutSuccess ? (
                <div id="checkout-success-banner" className="text-center py-12 px-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Order Placed Successfully!</h3>
                  <p className="text-xs text-slate-300 mt-1">Thank you for testing the MERN E-Commerce store interface.</p>
                </div>
              ) : cart.length === 0 ? (
                <div id="cart-empty-message" className="text-center py-16 text-slate-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-700" />
                  <p className="text-sm font-semibold text-slate-400">Your cart is empty</p>
                  <p className="text-xs mt-1">Add items from the store catalog above.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product._id}
                    id={`cart-item-${item.product._id}`}
                    className="flex items-center space-x-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50"
                  >
                    <img
                      src={item.product.image || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800"}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 object-cover rounded-lg bg-slate-950"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{item.product.name}</h4>
                      <p className="text-xs text-indigo-400 font-semibold mt-0.5">
                        ₹{item.product.price.toLocaleString("en-IN")}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          id={`btn-qty-minus-${item.product._id}`}
                          onClick={() => onUpdateCartQty(item.product._id, -1)}
                          className="p-1 rounded bg-slate-700 text-slate-300 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-1 text-slate-200">{item.quantity}</span>
                        <button
                          id={`btn-qty-plus-${item.product._id}`}
                          onClick={() => onUpdateCartQty(item.product._id, 1)}
                          className="p-1 rounded bg-slate-700 text-slate-300 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <button
                      id={`btn-remove-item-${item.product._id}`}
                      onClick={() => onRemoveCartItem(item.product._id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer & Checkout */}
            {cart.length > 0 && !isCheckoutSuccess && (
              <div id="drawer-cart-footer" className="p-4 border-t border-slate-800 bg-slate-900/90 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 font-medium">Subtotal</span>
                  <span className="text-lg font-black text-indigo-400">
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <button
                  id="btn-checkout"
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition active:scale-95"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
