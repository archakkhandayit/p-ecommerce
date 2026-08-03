import React, { useState, useEffect } from "react";
import { User, Product, DashboardStats } from "../types";
import { getApiUrl } from "../apiConfig";
import {
  Users,
  Package,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit2,
  Search,
  Upload,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Lock,
  CheckCircle,
  X,
  FileText
} from "lucide-react";

interface AdminDashboardProps {
  user: User | null;
  token: string | null;
  onOpenAuth: () => void;
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  token,
  onOpenAuth,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<"products" | "users">("products");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  console.log(products)
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filters
  const [productSearch, setProductSearch] = useState<string>("");
  const [userSearch, setUserSearch] = useState<string>("");

  // Product Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Electronics",
    price: "",
    publish: true,
    image: "",
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");

  const isAdmin = user?.role?.toLowerCase() === "admin";

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    if (!token || !isAdmin) return;
    try {
      const res = await fetch(getApiUrl("/admin/dashboard"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data || data.stats || { totalUsers: 0, totalProducts: 0 });
      }
    } catch (err) {
      console.error("Fetch stats error:", err);
    }
  };

  // Fetch All Products
  const fetchAllProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl("/products"));
      const data = await res.json();
      if (data.success) {
        setProducts(data.data || data.products || []);
      }
    } catch (err) {
      console.error("Fetch products error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch All Users
  const fetchUsers = async () => {
    if (!token || !isAdmin) return;
    try {
      const res = await fetch(getApiUrl("/users"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(data.data || data.users || []);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  const refreshAll = () => {
    fetchStats();
    fetchAllProducts();
    fetchUsers();
  };

  useEffect(() => {
    if (isAdmin) {
      refreshAll();
    } else {
      fetchAllProducts();
    }
  }, [isAdmin, token]);

  // Open modal for new product
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      category: "Electronics",
      price: "",
      publish: true,
      image: "",
    });
    setSelectedImageFile(null);
    setImagePreviewUrl("");
    setIsProductModalOpen(true);
  };

  // Open modal for edit product
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    const imgStr = typeof prod.image === "object" && prod.image?.url ? prod.image.url : (typeof prod.image === "string" ? prod.image : "");
    setFormData({
      name: prod.name,
      description: prod.desc || prod.description || "",
      category: prod.category || "Electronics",
      price: String(prod.price || 0),
      publish: true,
      image: imgStr,
    });
    setSelectedImageFile(null);
    setImagePreviewUrl(imgStr);
    setIsProductModalOpen(true);
  };

  // Save product (POST or PUT)
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !isAdmin) {
      onShowToast("Admin authentication required", "error");
      return;
    }

    if (!formData.name.trim()) {
      onShowToast("Product name is required", "error");
      return;
    }

    if (!selectedImageFile && !formData.image.trim()) {
      onShowToast("Please upload an image or provide an image URL", "error");
      return;
    }

    const formPayload = new FormData();
    formPayload.append("name", formData.name.trim());
    formPayload.append("desc", (formData.description || "").trim());
    formPayload.append("description", (formData.description || "").trim());
    formPayload.append("category", formData.category.trim());
    formPayload.append("price", formData.price || "0");
    formPayload.append("stock", "50"); // Default stock count

    if (selectedImageFile) {
      formPayload.append("image", selectedImageFile);
    } else if (typeof formData.image === "string" && formData.image) {
      formPayload.append("image", formData.image.trim());
    }

    try {
      const url = editingProduct ? getApiUrl(`/products/${editingProduct._id}`) : getApiUrl("/products");
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formPayload,
      });

      const data = await res.json();
      if (data.success) {
        onShowToast(data.message || (editingProduct ? "Product updated" : "Product created"), "success");
        setIsProductModalOpen(false);
        refreshAll();
      } else {
        onShowToast(data.message || "Failed to save product", "error");
      }
    } catch (err) {
      console.error("Product save error:", err);
      onShowToast("Server error saving product", "error");
    }
  };

  // Toggle publish status quickly
  const handleTogglePublish = async (product: Product) => {
    if (!token || !isAdmin) return;
    try {
      const res = await fetch(getApiUrl(`/products/${product._id}`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publish: !product.publish,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(`Product ${!product.publish ? "published" : "unpublished"}`, "info");
        refreshAll();
      }
    } catch (err) {
      console.error("Toggle publish error:", err);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!token || !isAdmin) return;
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(getApiUrl(`/products/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        onShowToast("Product deleted successfully", "success");
        refreshAll();
      } else {
        onShowToast(data.message || "Delete failed", "error");
      }
    } catch (err) {
      console.error("Delete product error:", err);
    }
  };

  // Delete user
  const handleDeleteUser = async (id: string) => {
    if (!token || !isAdmin) return;
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(getApiUrl(`/users/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        onShowToast("User deleted successfully", "success");
        refreshAll();
      } else {
        onShowToast(data.message || "Delete failed", "error");
      }
    } catch (err) {
      console.error("Delete user error:", err);
    }
  };

  // Image file select handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  // Filtered lists
  const filteredProductsList = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
      p._id.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredUsersList = usersList.filter(
    (u) =>
      u.fname.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch) ||
      u._id.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div id="admin-dashboard-page" className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div id="admin-dashboard-container" className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div id="admin-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
              <h1 className="text-2xl font-black text-white tracking-tight">Admin Management Dashboard</h1>
            </div>
            
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="btn-admin-refresh"
              onClick={refreshAll}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {isAdmin && (
              <button
                id="btn-create-product-header"
                onClick={handleOpenNewProduct}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Create Product</span>
              </button>
            )}
          </div>
        </div>

        {/* Non-Admin Alert Banner */}
        {!isAdmin && (
          <div id="non-admin-warning-banner" className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <Lock className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-300">Admin Role Required for Management Actions</h3>
                <p className="text-xs text-slate-400 mt-1">
                  You are currently unauthenticated or logged in as a standard USER. Login with the demo ADMIN account (`admin@test.com`) to manage products, users, and stats.
                </p>
              </div>
            </div>
            <button
              id="btn-login-admin-quick"
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap shadow-md transition"
            >
              Login as Admin
            </button>
          </div>
        )}

        {/* Dashboard Stats Overview Grid */}
        {isAdmin && stats && (
          <div id="admin-stats-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div id="stat-card-users" className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{stats.totalUsers}</p>
                <p className="text-xs text-slate-400 font-medium">Total Users</p>
              </div>
            </div>

            <div id="stat-card-products" className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{stats.totalProducts}</p>
                <p className="text-xs text-slate-400 font-medium">Total Products</p>
              </div>
            </div>

            <div id="stat-card-published" className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-400">{stats.publishedProducts}</p>
                <p className="text-xs text-slate-400 font-medium">Published Items</p>
              </div>
            </div>

            <div id="stat-card-unpublished" className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <EyeOff className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-rose-400">{stats.unpublishedProducts}</p>
                <p className="text-xs text-slate-400 font-medium">Unpublished Items</p>
              </div>
            </div>
          </div>
        )}

        {/* Section Tabs */}
        <div id="admin-tabs" className="flex border-b border-slate-800 space-x-4 pt-2">
          <button
            id="tab-btn-products"
            onClick={() => setActiveTab("products")}
            className={`flex items-center space-x-2 pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === "products"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Management ({products.length})</span>
          </button>

          {isAdmin && (
            <button
              id="tab-btn-users"
              onClick={() => setActiveTab("users")}
              className={`flex items-center space-x-2 pb-3 text-sm font-bold border-b-2 transition-all ${
                activeTab === "users"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Management ({usersList.length})</span>
            </button>
          )}
        </div>

        {/* Tab 1: Product Management Table */}
        {activeTab === "products" && (
          <div id="products-management-panel" className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            {/* Table Search & Filter */}
            <div id="products-table-toolbar" className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="input-product-table-search"
                  type="text"
                  placeholder="Filter products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-800/80 text-white placeholder-slate-400 rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {isAdmin && (
                <button
                  id="btn-add-product-table"
                  onClick={handleOpenNewProduct}
                  className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
              )}
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table id="products-table" className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProductsList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No products found matching query.
                      </td>
                    </tr>
                  ) : (
                    filteredProductsList.map((product) => (
                      <tr key={product._id} id={`row-product-${product._id}`} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.image.url || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800"}
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-lg object-cover bg-slate-950 border border-slate-800"
                            />
                            <div>
                              <p className="font-bold text-white line-clamp-1">{product.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">ID: {product._id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-indigo-400">
                          ₹{product.price.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4">
                          {product.publish ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle className="w-3 h-3" />
                              <span>Published</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              <EyeOff className="w-3 h-3" />
                              <span>Draft / Unpublished</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {isAdmin && (
                              <>
                                <button
                                  id={`btn-toggle-pub-${product._id}`}
                                  onClick={() => handleTogglePublish(product)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                  title={product.publish ? "Unpublish" : "Publish"}
                                >
                                  {product.publish ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                                </button>
                                <button
                                  id={`btn-edit-product-${product._id}`}
                                  onClick={() => handleOpenEditProduct(product)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 transition"
                                  title="Edit Product"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  id={`btn-delete-product-${product._id}`}
                                  onClick={() => handleDeleteProduct(product._id)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 transition"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: User Management Table */}
        {activeTab === "users" && isAdmin && (
          <div id="users-management-panel" className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            {/* Search */}
            <div id="users-table-toolbar" className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="input-user-table-search"
                  type="text"
                  placeholder="Search user name, email, phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-800/80 text-white placeholder-slate-400 rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table id="users-table" className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsersList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No users registered.
                      </td>
                    </tr>
                  ) : (
                    filteredUsersList.map((usr) => (
                      <tr key={usr._id} id={`row-user-${usr._id}`} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-bold text-white">{usr.fname}</p>
                            <p className="text-[10px] text-slate-400 font-mono">ID: {usr._id}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono">{usr.email}</td>
                        <td className="py-3 px-4 text-slate-300 font-mono">{usr.phone}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              usr.role === "ADMIN"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                            }`}
                          >
                            {usr.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {usr._id !== user._id ? (
                            <button
                              id={`btn-delete-user-${usr._id}`}
                              onClick={() => handleDeleteUser(usr._id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 transition"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-semibold italic">Current Admin</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Product Create / Edit Modal */}
      {isProductModalOpen && (
        <div id="modal-product-form-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div id="modal-product-form-panel" className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              id="btn-close-product-form-modal"
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 id="modal-product-form-title" className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Package className="w-5 h-5 text-indigo-400" />
              <span>{editingProduct ? "Edit Product" : "Create New Product"}</span>
            </h2>

            <form id="form-product-save" onSubmit={handleSubmitProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name *</label>
                <input
                  id="input-product-name"
                  type="text"
                  required
                  placeholder="e.g. MacBook Air M3"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 text-white text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <input
                    id="input-product-category"
                    type="text"
                    required
                    placeholder="e.g. Electronics"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-white text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price (₹) *</label>
                  <input
                    id="input-product-price"
                    type="number"
                    step="0.01"
                    required
                    placeholder="999"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-white text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  id="input-product-description"
                  rows={3}
                  placeholder="Enter detailed description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 text-white text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Image Upload / URL Section */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Image (File Upload or URL)</label>
                
                <div className="flex flex-col gap-2">
                  <input
                    id="input-product-image-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-400 text-center uppercase font-bold tracking-wider">OR Image URL</div>
                  <input
                    id="input-product-image-url"
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image}
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.value });
                      if (e.target.value) setImagePreviewUrl(e.target.value);
                    }}
                    className="w-full px-3 py-1.5 bg-slate-800 text-white text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {imagePreviewUrl && (
                  <div className="mt-2 h-24 w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                    <img src={imagePreviewUrl} alt="Preview" className="h-full object-contain" />
                  </div>
                )}
              </div>

              {/* Publish Checkbox */}
              <div className="flex items-center space-x-2 pt-2">
                {/* <input
                  id="checkbox-product-publish"
                  type="checkbox"
                  checked={formData.publish}
                  onChange={(e) => setFormData({ ...formData, publish: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700"
                /> */}
                {/* <label htmlFor="checkbox-product-publish" className="text-xs font-semibold text-slate-200">
                  Publish product immediately to public storefront
                </label> */}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  id="btn-cancel-product-form"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-submit-product-form"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                >
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
