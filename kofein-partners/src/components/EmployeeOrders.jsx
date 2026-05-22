import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Coffee, Tag, ChevronDown, Flame, Zap, CheckCircle2, Bell, User } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
const POLLING_INTERVAL = 3000; // 3 seconds

function EmployeeOrders({ coffeeShopId }) {
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newOrderIds, setNewOrderIds] = useState(new Set());
  const [toast, setToast] = useState(null);

  const previousOrderIdsRef = useRef(new Set());
  const pollingRef = useRef(null);
  const expandedRef = useRef(null);

  const fetchOrders = useCallback(async () => {
    if (!coffeeShopId) return;

    try {
      const response = await fetch(`${API_URL}/orders?coffee_shop_id=${coffeeShopId}`);
      if (!response.ok) throw new Error(`Ошибка ${response.status}`);
      const data = await response.json();
      
      // Detect new orders
      const currentIds = new Set(data.map(o => o.id));
      const previousIds = previousOrderIdsRef.current;
      
      const addedOrderIds = [...currentIds].filter(id => !previousIds.has(id));
      
      if (addedOrderIds.length > 0 && orders.length > 0) {
        // New orders arrived
        const newOrders = data.filter(o => addedOrderIds.includes(o.id));
        setNewOrderIds(new Set(addedOrderIds));
        
        // Show toast for newest order
        const newestOrder = newOrders[0];
        setToast({
          id: Date.now(),
          orderId: newestOrder.id.slice(-8),
          message: `Новый заказ #${newestOrder.id.slice(-8)}`
        });
        
        // Auto-dismiss toast after 4 seconds
        setTimeout(() => setToast(null), 4000);
        
        // Clear new order highlights after 5 seconds
        setTimeout(() => setNewOrderIds(new Set()), 5000);
      }
      
      previousOrderIdsRef.current = currentIds;
      setOrders(data);
      setLoading(false);
    } catch (err) {
      if (orders.length === 0) {
        setError(err.message || "Не удалось загрузить заказы");
      }
      setLoading(false);
    }
  }, [coffeeShopId, orders.length]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Polling interval
  useEffect(() => {
    pollingRef.current = setInterval(() => {
      fetchOrders();
    }, POLLING_INTERVAL);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [fetchOrders]);

  // Click outside to close expanded panel
  useEffect(() => {
    function handleClickOutside(event) {
      if (expandedRef.current && !expandedRef.current.contains(event.target)) {
        setExpandedOrderId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset expanded on coffeeShopId change
  useEffect(() => {
    setExpandedOrderId(null);
  }, [coffeeShopId]);

  const normalizeStatus = (status) => {
    if (!status) return "New";
    const s = status.toString().trim();
    const normalized = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    const validStatuses = ["New", "Preparing", "Ready", "Closed"];
    return validStatuses.includes(normalized) ? normalized : "New";
  };

  const filteredOrders = orders.filter((order) => {
    const normalizedStatus = normalizeStatus(order.status);
    if (filter === "All") return true;
    return normalizedStatus === filter;
  });

  async function updateStatus(newStatus) {
    try {
      const response = await fetch(`${API_URL}/orders/${selectedOrder.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error(`Ошибка ${response.status}`);
      const updatedOrder = await response.json();
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === updatedOrder.id ? { ...order, status: updatedOrder.status } : order
        )
      );
      setSelectedOrder((prevOrder) =>
        prevOrder ? { ...prevOrder, status: updatedOrder.status } : null
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Не удалось обновить статус заказа");
    }
  }

  const getStatusConfig = (status) => {
    const configs = {
      "New": { 
        label: "Новый", 
        icon: Zap,
        bg: "bg-matcha-light/30",
        border: "border-matcha-light",
        text: "text-matcha-dark"
      },
      "Preparing": { 
        label: "Готовится", 
        icon: Flame,
        bg: "bg-mint/30",
        border: "border-mint",
        text: "text-matcha-deep"
      },
      "Ready": { 
        label: "Готов", 
        icon: CheckCircle2,
        bg: "bg-matcha/35",
        border: "border-matcha",
        text: "text-matcha-deep"
      },
      "Closed": { 
        label: "Закрыт", 
        icon: CheckCircle2,
        bg: "bg-zinc-200/50",
        border: "border-zinc-300",
        text: "text-zinc-500"
      }
    };
    return configs[status] || configs["New"];
  };

  // Animation variants for expansion
  const expansionVariants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0
    },
    expanded: {
      height: "auto",
      opacity: 1,
      marginTop: "1rem",
      marginBottom: "1rem",
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2 },
        marginTop: { duration: 0.3 },
        marginBottom: { duration: 0.3 }
      }
    }
  };

  // Order card detail panel component
  const OrderDetailPanel = ({ order }) => {
    const normalizedStatus = normalizeStatus(order.status);
    const statusConfig = getStatusConfig(normalizedStatus);
    const StatusIcon = statusConfig.icon;
    
    async function handleStatusUpdate(newStatus) {
      try {
        const response = await fetch(`${API_URL}/orders/${order.id}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) throw new Error(`Ошибка ${response.status}`);
        const updatedOrder = await response.json();
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.id === updatedOrder.id ? { ...o, status: updatedOrder.status } : o
          )
        );
      } catch (err) {
        console.error(err);
        setError(err.message || "Не удалось обновить статус заказа");
      }
    }

    return (
      <div className="overflow-hidden mt-4 mb-4 animate-slide-down">
        <div className="glass-strong rounded-xl p-5 border border-matcha/25 shadow-lg">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5 pb-4 border-b border-matcha/15">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-matcha-light/20">
                <User size={20} className="text-matcha-dark" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-0.5">Клиент</p>
                <p className="font-semibold text-[#3d4d3d] text-base">{order.telegram_id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500">Заказ #{order.id.slice(-8)}</span>
              <div className={`px-2.5 py-1 rounded-lg ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} flex items-center gap-1.5`}>
                <StatusIcon size={14} />
                <span className="text-xs font-medium">{statusConfig.label}</span>
              </div>
            </div>
          </div>

          {/* Order items section */}
          <div className="mb-5">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Состав заказа</p>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center py-2.5 px-3 rounded-lg hover:bg-matcha-light/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-zinc-100/50">
                      <Tag size={14} className="text-zinc-500" />
                    </div>
                    <div>
                      <p className="font-medium text-[#4a5a4a] text-sm">{item.name}</p>
                      <p className="text-xs text-zinc-500">{item.quantity} × {item.unit_price} ₽</p>
                    </div>
                  </div>
                  <p className="font-semibold text-matcha-dark text-sm">{item.unit_price * item.quantity} ₽</p>
                </div>
              ))}
            </div>
          </div>
                  
          {/* Footer section */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-matcha/15">
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <Clock size={14} />
              <span>{order.time}</span>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-zinc-500">Итого</p>
              <p className="text-2xl font-semibold text-matcha-dark">{order.total_amount} ₽</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-5 pt-4 border-t border-matcha/15 space-y-2">
            {normalizedStatus === "New" && (
              <button 
                onClick={() => handleStatusUpdate("Preparing")} 
                className="w-full py-3 rounded-lg font-medium text-sm btn-accent"
              >
                Принять заказ
              </button>
            )}
            {normalizedStatus === "Preparing" && (
              <button 
                onClick={() => handleStatusUpdate("Ready")} 
                className="w-full py-3 rounded-lg font-medium text-sm btn-primary"
              >
                Заказ готов
              </button>
            )}
            {normalizedStatus === "Ready" && (
              <button 
                onClick={() => handleStatusUpdate("Closed")} 
                className="w-full py-3 rounded-lg font-medium text-sm btn-primary"
              >
                Отдать заказ
              </button>
            )}
            {normalizedStatus === "Closed" && (
              <p className="text-center text-xs text-zinc-500 py-2">Заказ закрыт</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render main list view (no separate detail view)
  const filters = [
    { key: "All", label: "Все", count: orders.length, icon: Coffee },
    { key: "New", label: "Новые", count: orders.filter(o => normalizeStatus(o.status) === "New").length, icon: Zap },
    { key: "Preparing", label: "Готовятся", count: orders.filter(o => normalizeStatus(o.status) === "Preparing").length, icon: Flame },
    { key: "Ready", label: "Готовые", count: orders.filter(o => normalizeStatus(o.status) === "Ready").length, icon: CheckCircle2 },
    { key: "Closed", label: "Закрытые", count: orders.filter(o => normalizeStatus(o.status) === "Closed").length, icon: CheckCircle2 }
  ];

  // Sort orders: New first, then by creation time
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const statusPriority = { "New": 0, "Preparing": 1, "Ready": 2, "Closed": 3 };
    const priorityA = statusPriority[normalizeStatus(a.status)] ?? 99;
    const priorityB = statusPriority[normalizeStatus(b.status)] ?? 99;
    
    if (priorityA !== priorityB) return priorityA - priorityB;
    
    // Within same status, sort by ID (newest first)
    return b.id.localeCompare(a.id);
  });

  return (
    <div className="animate-fade-in relative">
      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-20 left-1/2 z-50"
          >
            <div className="glass-strong rounded-xl px-4 py-3 flex items-center gap-3 border border-matcha/30 shadow-lg">
              <Bell size={18} className="text-matcha-dark" />
              <span className="text-sm font-medium text-[#3d4d3d]">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold text-[#3d4d3d] mb-2">Заказы</h1>
        <p className="text-zinc-600">
          Всего: <span className="text-matcha-dark font-medium">{orders.length}</span>
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white/40 border border-zinc-200/50 p-5 animate-shimmer">
              <div className="h-5 bg-zinc-200/50 rounded-lg mb-4 w-2/3" />
              <div className="h-4 bg-zinc-200/30 rounded-lg mb-2 w-1/3" />
              <div className="h-4 bg-zinc-200/30 rounded-lg w-full mt-4" />
            </div>
          ))}
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50/50 border border-red-200 text-red-600 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Filter tabs - soft segmented control */}
      {!loading && (
        <div className="glass-panel rounded-xl p-1.5 mb-6 inline-flex flex-wrap gap-1">
          {filters.map(({ key, label, count, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all ${
                filter === key
                  ? "btn-primary"
                  : "text-zinc-500 hover:text-[#4a5a4a] hover:bg-white/40"
              }`}
            >
              <Icon size={16} />
              <span className="text-sm font-medium">{label}</span>
              <span className={`px-2 py-0.5 rounded-lg text-xs ${
                filter === key ? "bg-white/30" : "bg-white/20"
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && sortedOrders.length === 0 && (
        <div className="glass-strong rounded-2xl p-16 text-center border border-matcha/20">
          <Coffee size={48} className="mx-auto mb-4 text-zinc-400" />
          <p className="text-zinc-500 text-lg mb-1">Заказов не найдено</p>
          <p className="text-zinc-500 text-sm">Попробуйте изменить фильтр</p>
        </div>
      )}

      {/* Orders list with expandable panels */}
      {!loading && sortedOrders.length > 0 && (
        <div className="space-y-0 max-w-4xl mx-auto" ref={expandedRef}>
          {sortedOrders.map((order, index) => {
            const normalizedStatus = normalizeStatus(order.status);
            const statusConfig = getStatusConfig(normalizedStatus);
            const StatusIcon = statusConfig.icon;
            const isNew = newOrderIds.has(order.id);
            const isExpanded = expandedOrderId === order.id;
            
            return (
              <div key={order.id} className="relative">
                {/* Order card */}
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 24,
                    delay: index * 0.03
                  }}
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className={`group relative rounded-2xl p-5 cursor-pointer border transition-all ${
                    isExpanded
                      ? "glass-strong border-matcha/40 shadow-xl"
                      : isNew
                      ? "glass-strong border-matcha/40 shadow-lg shadow-matcha/20" 
                      : "glass-strong border-matcha/15 hover:border-matcha/30 hover:shadow-lg"
                  }`}
                >
                  {isNew && !isExpanded && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-2 right-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-matcha-dark" />
                    </motion.div>
                  )}
                  
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-semibold ${isExpanded ? "text-matcha-dark" : "text-[#3d4d3d]"}`}>
                        #{order.id.slice(-8)}
                      </span>
                      <div className={`px-2 py-1 rounded-lg ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} flex items-center gap-1`}>
                        <StatusIcon size={12} />
                      </div>
                    </div>
                    <div className="text-xl font-semibold text-matcha-dark">
                      {order.total_amount} ₽
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2 text-zinc-500">
                    <Clock size={14} />
                    <span className="text-xs">{order.time}</span>
                  </div>
                  
                  <div className="text-xs text-zinc-500 line-clamp-2 mb-3">
                    {order.items.map((item, idx) => (
                      <span key={idx}>
                        {item.name} × {item.quantity}
                        {idx !== order.items.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-matcha/10">
                    <span className="text-xs text-zinc-500">Нажмите для деталей</span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={16} className="text-zinc-400" />
                    </motion.div>
                  </div>

                  {/* Expandable detail panel */}
                  {isExpanded && (
                    <OrderDetailPanel order={order} />
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default EmployeeOrders;
