import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Clock } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function OwnerPanel({ coffeeShopId }) {

  const [activeTab, setActiveTab] = useState("menu");
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coffeeShop, setCoffeeShop] = useState(null);

  // Загрузить меню при загрузке компонента
  useEffect(() => {
    loadMenu();
  }, []);

  // Загрузить заказы когда открывается вкладка "Заказы"
  useEffect(() => {
    if (activeTab === "orders") {
      loadOrders();
    }
  }, [activeTab]);

  // Загрузить информацию о кофейне, когда открывается вкладка "Настройки"
  useEffect(() => {
    if (activeTab === "settings") {
      loadCoffeeShop();
    }
  }, [activeTab]);

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

// Измнение настроек кофейни
  async function saveCoffeeShop() {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/coffee-shops/${coffeeShopId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: coffeeShop.name,
          address: coffeeShop.address
        })
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

  // добавление товара
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

  // удаление товара
  async function deleteItem(id) {
    try {
      const response = await fetch(`${API_URL}/menu/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete item');
      setMenuItems(menuItems.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Ошибка при удалении товара');
    }
  }

  // изменение доступности
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

  // изменение названия
  function changeName(id, value) {
    const updated = menuItems.map(item => {
      if (item.id === id) {
        return { ...item, name: value };
      }
      return item;
    });
    setMenuItems(updated);
  }

  // изменение описания
  function changeDescription(id, value) {
    const updated = menuItems.map(item => {
      if (item.id === id) {
        return { ...item, description: value };
      }
      return item;
    });
    setMenuItems(updated);
  }

  // изменение цены
  function changePrice(id, value) {
    const updated = menuItems.map(item => {
      if (item.id === id) {
        return { ...item, price: value };
      }
      return item;
    });
    setMenuItems(updated);
  }

  // сохранение изменений товара
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

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Панель владельца
      </h1>

      {/* вкладки */}
      <div className="flex gap-2 mb-6">

        <button
        onClick={() => setActiveTab("menu")}
        className={
            activeTab === "menu"
            ? "bg-blue-600 text-white px-4 py-2 rounded-lg"
            : "border px-4 py-2 rounded-lg"
        }
        >
        Меню
        </button>

        <button
        onClick={() => setActiveTab("orders")}
        className={
            activeTab === "orders"
            ? "bg-blue-600 text-white px-4 py-2 rounded-lg"
            : "border px-4 py-2 rounded-lg"
        }
        >
        Заказы
        </button>

        <button
        onClick={() => setActiveTab("settings")}
        className={
            activeTab === "settings"
            ? "bg-blue-600 text-white px-4 py-2 rounded-lg"
            : "border px-4 py-2 rounded-lg"
        }
        >
        Настройки
        </button>

      </div>

      {/* ВКЛАДКА МЕНЮ */}
      {activeTab === "menu" && (

        <div>

          <button
            onClick={addItem}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg mb-4 disabled:opacity-50"
          >
            <Plus size={18} />
            Добавить товар
          </button>

          {error && <p className="text-red-600 mb-4">{error}</p>}
          {loading && <p className="text-gray-500">Загрузка...</p>}

          <div className="space-y-4">

            {menuItems.map((item) => (

              <div
                key={item.id}
                className="border rounded-lg p-4"
              >

                {editingId === item.id ? (

                  <div className="space-y-3">

                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        changeName(item.id, e.target.value)
                      }
                      className="w-full border px-3 py-2 rounded-lg"
                      placeholder="Название"
                    />

                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        changeDescription(item.id, e.target.value)
                      }
                      className="w-full border px-3 py-2 rounded-lg"
                      placeholder="Описание"
                    />

                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        changePrice(item.id, e.target.value)
                      }
                      className="w-full border px-3 py-2 rounded-lg"
                      placeholder="Цена"
                    />

                    <button
                      onClick={() => saveItem(item.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                      Сохранить
                    </button>

                  </div>

                ) : (

                  <div className="flex justify-between items-center">

                    <div>

                      <h2 className="font-bold text-lg">
                        {item.name}
                      </h2>

                      <p className="text-gray-500">
                        {item.description}
                      </p>

                      <p className="font-bold mt-2">
                        {item.price} ₽
                      </p>

                    </div>

                    <div className="flex items-center gap-3">

                      <label className="flex items-center gap-2">

                        <input
                          type="checkbox"
                          checked={item.available}
                          onChange={() => toggleAvailable(item.id)}
                        />

                        В наличии

                      </label>

                      <button
                        onClick={() => setEditingId(item.id)}
                        className="p-2 border rounded"
                      >
                        <Edit2 size={18} />
                      </button>

                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-2 border rounded text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>

                  </div>

                )}

              </div>

            ))}

          </div>

        </div>

      )}

      {/* ВКЛАДКА ЗАКАЗОВ */}
      {activeTab === "orders" && (

        <div>

          {error && <p className="text-red-600 mb-4">{error}</p>}
          {ordersLoading && <p className="text-gray-500">Загрузка заказов...</p>}

          {!ordersLoading && orders.length === 0 && (
            <p className="text-gray-500">Заказы не найдены.</p>
          )}

          <div className="space-y-4">

            {orders.map((order) => (

              <div
                key={order.id}
                className="border rounded-lg p-4"
              >

                <div className="flex justify-between mb-3">

                  <div>

                    <h2 className="font-bold">
                      {order.id}
                    </h2>

                    <div className="flex items-center gap-2 text-sm text-gray-500">

                      <Clock size={14} />

                      {order.time}

                    </div>

                    <p className="mt-1 text-sm">
                      {order.status}
                    </p>

                  </div>

                  <div className="font-bold text-xl">
                    {order.total_amount} ₽
                  </div>

                </div>

                <div className="text-sm text-gray-600">

                  {order.items.map((item, index) => (
                    <span key={index}>
                      {item.name} × {item.quantity}
                      {index !== order.items.length - 1 && ", "}
                    </span>
                  ))}

                </div>

              </div>

            ))}

          </div>

        </div>

      )}

      {/* ВКЛАДКА НАСТРОЕК */}
      {activeTab === "settings" && (

        <div className="border rounded-lg p-6 space-y-4">

          <div>

            <label className="block mb-2 font-bold">
              Название кофейни
            </label>
            {/* Измнение названия кофейни */}
            <input
              type="text"
              value={coffeeShop ? coffeeShop.name : ""}
              onChange={(e) => setCoffeeShop({ ...coffeeShop, name: e.target.value })}
              className="w-full border px-3 py-2 rounded-lg"
            />

          </div>

          <div>

            <label className="block mb-2 font-bold">
              Адрес
            </label>

            <input
              type="text"
              value={coffeeShop ? coffeeShop.address : ""}
              onChange={(e) => setCoffeeShop({ ...coffeeShop, address: e.target.value })}
              className="w-full border px-3 py-2 rounded-lg"
            />

          </div>
          {/* Динамическая кнопка сохранения */}
          <button
            onClick={saveCoffeeShop}
            disabled={!coffeeShop}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Сохранить
          </button>

        </div>

      )}

    </div>
  );
}

export default OwnerPanel;