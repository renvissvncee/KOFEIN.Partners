import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Clock, Coffee, Package, Settings, Check, X, Users } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function OwnerPanel({ coffeeShopId }) {
  const [activeTab, setActiveTab] = useState("menu");
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coffeeShop, setCoffeeShop] = useState(null);
  const [newStaffId, setNewStaffId] = useState('');

  async function loadCoffeeShop() {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/coffee-shops/${coffeeShopId}`);
      if (!response.ok) throw new Error('Failed to load coffee shop');
      const data = await response.json();
      setCoffeeShop(data);
    } catch (err) {
      console.error('Error loading coffee shop:', err);
      setError('Ошибка при загрузке информации о кофейне');
    }
  }

  async function saveCoffeeShop() {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/coffee-shops/${coffeeShopId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: coffeeShop.name, address: coffeeShop.address })
      });
      if (!response.ok) throw new Error('Failed to save coffee shop');
      const updated = await response.json();
      setCoffeeShop(updated);
    } catch (err) {
      console.error('Error saving coffee shop:', err);
      setError('Ошибка при сохранении информации о кофейне');
    }
  }

  async function loadMenu() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/menu?coffee_shop_id=${coffeeShopId}`);
      if (!response.ok) throw new Error('Failed to load menu');
      const data = await response.json();
      setMenuItems(data);
    } catch (err) {
      console.error('Error loading menu:', err);
      setError('Ошибка при загрузке меню');
    } finally {
      setLoading(false);
    }
  }

  async function loadOrders() {
    try {
      setOrdersLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/orders?coffee_shop_id=${coffeeShopId}`);
      if (!response.ok) throw new Error('Failed to load orders');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Ошибка при загрузке заказов');
    } finally {
      setOrdersLoading(false);
    }
  }

  async function loadStaff() {
    try {
      setStaffLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/coffee-shops/${coffeeShopId}/staff`);
      if (!response.ok) throw new Error('Failed to load staff');
      const data = await response.json();
      setStaff(data);
    } catch (err) {
      console.error('Error loading staff:', err);
      setError('Ошибка при загрузке сотрудников');
    } finally {
      setStaffLoading(false);
    }
  }

  async function addStaff() {
    if (!newStaffId.trim()) return;
    try {
      const response = await fetch(`${API_URL}/coffee-shops/${coffeeShopId}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: parseInt(newStaffId, 10) })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add staff');
      }
      setNewStaffId('');
      loadStaff();
    } catch (err) {
      console.error('Error adding staff:', err);
      alert(err.message);
    }
  }

  async function removeStaff(telegramId) {
    if (!confirm('Удалить этого сотрудника?')) return;
    try {
      const response = await fetch(`${API_URL}/coffee-shops/${coffeeShopId}/staff/${telegramId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to remove staff');
      loadStaff();
    } catch (err) {
      console.error('Error removing staff:', err);
      alert('Ошибка при удалении сотрудника');
    }
  }

  useEffect(() => { 
    loadMenu(); 
    loadStaff();
    loadOrders();
    loadCoffeeShop();
  }, []);
  useEffect(() => { if (activeTab === "orders") loadOrders(); }, [activeTab]);
  useEffect(() => { if (activeTab === "staff") loadStaff(); }, [activeTab]);
  useEffect(() => { if (activeTab === "settings") loadCoffeeShop(); }, [activeTab]);

  async function addItem() {
    try {
      const response = await fetch(`${API_URL}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coffee_shop_id: coffeeShopId,
          name: "Новый товар",
          description: "",
          price: 0,
          available: true
        })
      });
      if (!response.ok) throw new Error('Failed to add item');
      const newItem = await response.json();
      setMenuItems([...menuItems, newItem]);
    } catch (err) {
      console.error('Error adding item:', err);
      alert('Ошибка при добавлении товара');
    }
  }

  async function deleteItem(id) {
    try {
      const response = await fetch(`${API_URL}/menu/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete item');
      setMenuItems(menuItems.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Ошибка при удалении товара');
    }
  }

  async function toggleAvailable(id) {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;
    try {
      const response = await fetch(`${API_URL}/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          description: item.description,
          price: item.price,
          available: !item.available
        })
      });
      if (!response.ok) throw new Error('Failed to update item');
      const updated = await response.json();
      setMenuItems(menuItems.map(i => i.id === id ? updated : i));
    } catch (err) {
      console.error('Error updating item:', err);
      alert('Ошибка при изменении товара');
    }
  }

  function changeName(id, value) {
    setMenuItems(menuItems.map(item => item.id === id ? { ...item, name: value } : item));
  }

  function changeDescription(id, value) {
    setMenuItems(menuItems.map(item => item.id === id ? { ...item, description: value } : item));
  }

  function changePrice(id, value) {
    setMenuItems(menuItems.map(item => item.id === id ? { ...item, price: Number(value) } : item));
  }

  async function saveItem(id) {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;
    try {
      const response = await fetch(`${API_URL}/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          description: item.description,
          price: item.price,
          available: item.available
        })
      });
      if (!response.ok) throw new Error('Failed to save item');
      setEditingId(null);
    } catch (err) {
      console.error('Error saving item:', err);
      alert('Ошибка при сохранении товара');
    }
  }

  const tabs = [
    { key: "menu", label: "Меню", icon: Package, count: menuItems.length },
    { key: "orders", label: "Заказы", icon: Coffee, count: orders.length },
    { key: "staff", label: "Сотрудники", icon: Users, count: staff.length },
    { key: "settings", label: "Настройки", icon: Settings, count: null }
  ];

  // Normalize status to expected format (handle case-insensitivity)
  const normalizeStatus = (status) => {
    if (!status) return "New";
    const s = status.toString().trim();
    const normalized = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    const validStatuses = ["New", "Preparing", "Ready", "Closed"];
    return validStatuses.includes(normalized) ? normalized : "New";
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold text-[#3d4d3d] mb-2">Панель владельца</h1>
        <p className="text-zinc-600">
          {coffeeShop?.name || "Загрузка..."} <span className="text-zinc-500">•</span> Управление кофейней
        </p>
      </div>

      {/* Tab navigation — soft, matte */}
      <div className="glass-panel rounded-xl p-1.5 mb-8">
        <div className="flex flex-wrap gap-1">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 min-w-[80px] px-3 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-all text-sm ${
                activeTab === key
                  ? "btn-primary"
                  : "text-zinc-500 hover:text-[#4a5a4a] hover:bg-white/40"
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
              {count !== null && (
                <span className={`px-2 py-0.5 rounded-lg text-xs ${
                  activeTab === key ? "bg-white/30" : "bg-white/20"
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* MENU TAB */}
      {activeTab === "menu" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <p className="text-zinc-600 text-sm">
              Всего товаров: <span className="text-matcha-dark font-medium">{menuItems.length}</span>
            </p>
            <button
              onClick={addItem}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium btn-primary disabled:opacity-50"
            >
              <Plus size={18} />
              Добавить товар
            </button>
          </div>

          {error && <p className="mb-4 p-3 rounded-xl bg-red-50/50 border border-red-200 text-red-600 text-sm">{error}</p>}

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white/40 border border-zinc-200/50 p-5 animate-shimmer">
                  <div className="h-6 bg-zinc-200/50 rounded-lg mb-3 w-3/4" />
                  <div className="h-4 bg-zinc-200/30 rounded-lg mb-4 w-full" />
                  <div className="h-8 bg-zinc-200/30 rounded-lg w-24" />
                </div>
              ))}
            </div>
          )}

          {!loading && menuItems.length === 0 && (
            <div className="glass-strong rounded-2xl p-16 text-center border border-matcha/20">
              <Package size={48} className="mx-auto mb-4 text-zinc-400" />
              <p className="text-zinc-500 text-lg mb-1">Меню пусто</p>
              <button onClick={addItem} className="mt-4 btn-primary">
                Добавить первый товар
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map((item, index) => (
              <div 
                key={item.id} 
                className="glass-strong rounded-2xl p-5 border border-matcha/15 hover:border-matcha/30 transition-all animate-fade-in"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {editingId === item.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => changeName(item.id, e.target.value)}
                      className="input"
                      placeholder="Название"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => changeDescription(item.id, e.target.value)}
                      className="input"
                      placeholder="Описание"
                    />
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => changePrice(item.id, e.target.value)}
                      className="input"
                      placeholder="Цена"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveItem(item.id)}
                        className="flex-1 py-2.5 rounded-xl font-medium btn-primary"
                      >
                        <Check size={16} className="inline mr-1" /> Сохранить
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2.5 rounded-xl font-medium glass-panel text-zinc-500 hover:text-[#4a5a4a]"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#3d4d3d] mb-1">{item.name}</h3>
                        <p className="text-sm text-zinc-500 line-clamp-2">{item.description || "Нет описания"}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-2xl font-semibold text-matcha-dark">{item.price} ₽</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-matcha/10">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className={`relative w-10 h-6 rounded-full transition-colors ${item.available ? 'bg-matcha-dark' : 'bg-zinc-300'}`}>
                          <input
                            type="checkbox"
                            checked={item.available}
                            onChange={() => toggleAvailable(item.id)}
                            className="absolute opacity-0 w-0 h-0"
                          />
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${item.available ? 'left-5' : 'left-1'}`} />
                        </div>
                        <span className="text-xs text-zinc-500">{item.available ? "В наличии" : "Отсутствует"}</span>
                      </label>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingId(item.id)}
                          className="p-2 rounded-lg glass-panel text-zinc-500 hover:text-matcha-dark hover:border-matcha/30 transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-2 rounded-lg glass-panel text-zinc-500 hover:text-red-500 hover:border-red-200 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === "orders" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <p className="text-zinc-600 text-sm">
              Всего заказов: <span className="text-matcha-dark font-medium">{orders.length}</span>
            </p>
          </div>

          {error && <p className="mb-4 p-3 rounded-xl bg-red-50/50 border border-red-200 text-red-600 text-sm">{error}</p>}
          
          {ordersLoading && (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white/40 border border-zinc-200/50 p-5 animate-shimmer h-32" />
              ))}
            </div>
          )}

          {!ordersLoading && orders.length === 0 && (
            <div className="glass-strong rounded-2xl p-16 text-center border border-matcha/20">
              <Clock size={48} className="mx-auto mb-4 text-zinc-400" />
              <p className="text-zinc-500 text-lg">Заказов пока нет</p>
            </div>
          )}

          <div className="space-y-4">
            {orders.map((order, index) => (
              <div 
                key={order.id} 
                className="glass-strong rounded-2xl p-5 border border-matcha/15 hover:border-matcha/30 transition-all animate-fade-in"
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-lg text-[#3d4d3d]">#{order.id.slice(-8)}</span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        normalizeStatus(order.status) === "New" ? "badge badge--new" :
                        normalizeStatus(order.status) === "Preparing" ? "badge badge--preparing" :
                        normalizeStatus(order.status) === "Ready" ? "badge badge--ready" :
                        "badge badge--closed"
                      }`}>
                        {normalizeStatus(order.status) === "New" ? "Новый" :
                         normalizeStatus(order.status) === "Preparing" ? "Готовится" :
                         normalizeStatus(order.status) === "Ready" ? "Готов" : "Закрыт"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Clock size={14} />
                      <span className="text-xs">{order.time}</span>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-2xl font-semibold text-matcha-dark">{order.total_amount} ₽</p>
                  </div>
                  <div className="sm:col-span-1">
                    <p className="text-xs text-zinc-500 line-clamp-2">
                      {order.items.map(it => `${it.name} × ${it.quantity}`).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STAFF TAB */}
      {activeTab === "staff" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <p className="text-zinc-600 text-sm">
              Всего сотрудников: <span className="text-matcha-dark font-medium">{staff.length}</span>
            </p>
            <button
              onClick={() => setActiveTab("staff")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium btn-primary"
            >
              <Users size={18} />
              Добавить сотрудника
            </button>
          </div>

          {error && <p className="mb-4 p-3 rounded-xl bg-red-50/50 border border-red-200 text-red-600 text-sm">{error}</p>}

          {/* Add staff form */}
          <div className="glass-strong rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-[#3d4d3d] mb-4">Добавить сотрудника</h3>
            <div className="flex gap-3">
              <input
                type="number"
                value={newStaffId}
                onChange={(e) => setNewStaffId(e.target.value)}
                placeholder="Telegram ID"
                className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 focus:border-matcha focus:ring-2 focus:ring-matcha/20 outline-none"
              />
              <button
                onClick={addStaff}
                disabled={!newStaffId.trim()}
                className="px-6 py-3 rounded-xl font-medium btn-primary disabled:opacity-50"
              >
                Добавить
              </button>
            </div>
          </div>
          
          {staffLoading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white/40 border border-zinc-200/50 p-5 animate-shimmer h-20" />
              ))}
            </div>
          )}

          {!staffLoading && staff.length === 0 && (
            <div className="glass-strong rounded-2xl p-16 text-center border border-matcha/20">
              <Users size={48} className="mx-auto mb-4 text-zinc-400" />
              <p className="text-zinc-500 text-lg">Сотрудников пока нет</p>
            </div>
          )}

          <div className="space-y-3">
            {staff.map((emp, index) => (
              <div 
                key={emp.telegram_id} 
                className="glass-strong rounded-2xl p-5 border border-matcha/15 hover:border-matcha/30 transition-all animate-fade-in flex items-center justify-between"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div>
                  <p className="font-semibold text-[#3d4d3d]">Сотрудник #{emp.telegram_id}</p>
                  <p className="text-sm text-zinc-500">
                    {emp.phone || 'Телефон не указан'}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Добавлен: {emp.created_at ? new Date(emp.created_at).toLocaleDateString('ru-RU') : 'Неизвестно'}
                  </p>
                </div>
                <button
                  onClick={() => removeStaff(emp.telegram_id)}
                  className="p-2 rounded-lg glass-panel text-zinc-500 hover:text-red-500 hover:border-red-200 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="max-w-2xl">
          <div className="glass-strong rounded-2xl p-6 border border-matcha/20">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-2">Название кофейни</label>
                <input
                  type="text"
                  value={coffeeShop ? coffeeShop.name : ""}
                  onChange={(e) => setCoffeeShop({ ...coffeeShop, name: e.target.value })}
                  className="input"
                  placeholder="Введите название"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-2">Адрес</label>
                <input
                  type="text"
                  value={coffeeShop ? coffeeShop.address : ""}
                  onChange={(e) => setCoffeeShop({ ...coffeeShop, address: e.target.value })}
                  className="input"
                  placeholder="Введите адрес"
                />
              </div>
              {error && <p className="p-3 rounded-xl bg-red-50/50 border border-red-200 text-red-600 text-sm">{error}</p>}
              <button
                onClick={saveCoffeeShop}
                disabled={!coffeeShop}
                className="w-full py-3 rounded-xl font-medium btn-primary disabled:opacity-50"
              >
                Сохранить изменения
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerPanel;
