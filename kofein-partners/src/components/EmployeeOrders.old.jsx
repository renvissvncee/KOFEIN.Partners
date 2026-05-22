import { useEffect, useState } from "react";
import { Clock, ArrowLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function EmployeeOrders({ coffeeShopId }) {

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState("All");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchOrders() {
      setLoading(true);
      setError(null);

      if (!coffeeShopId) {
        setError("Не указан идентификатор кофейни");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/orders?coffee_shop_id=${coffeeShopId}`);
        if (!response.ok) {
          throw new Error(`Ошибка ${response.status}`);
        }

        const data = await response.json();
        if (isMounted) {
          setOrders(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Не удалось загрузить заказы");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [coffeeShopId]);

  // фильтрация заказов
  const filteredOrders = orders.filter((order) => {
    if (filter === "All") {
      return true;
    }

    return order.status === filter;
  });

  // изменение статуса
  async function updateStatus(newStatus) {
    try {
      const response = await fetch(`${API_URL}/orders/${selectedOrder.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}`);
      }

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

  // экран деталей заказа
  if (selectedOrder) {
    return (
      <div className="p-6">

        <button
          onClick={() => setSelectedOrder(null)}
          className="flex items-center gap-2 mb-6"
        >
          <ArrowLeft size={20} />
          Назад
        </button>

        <div className="border rounded-lg p-4 mb-4">
          <h2 className="text-2xl font-bold mb-2">
            {selectedOrder.id}
          </h2>

          <p className="text-gray-500">
            {selectedOrder.telegram_id}
          </p>
        </div>

        <div className="border rounded-lg mb-4">

          <div className="p-4 border-b font-bold">
            Состав заказа
          </div>

          {selectedOrder.items.map((item, index) => (
            <div
              key={index}
              className="p-4 border-b flex justify-between"
            >
              <div>
                <p className="font-bold">
                  {item.name}
                </p>

                <p className="text-sm text-gray-500">
                  {item.unit_price} ₽ × {item.quantity}
                </p>
              </div>

              <p className="font-bold">
                {item.unit_price * item.quantity} ₽
              </p>
            </div>
          ))}

          <div className="p-4 bg-gray-100 flex justify-between">
            <span className="font-bold">Итого</span>

            <span className="font-bold">
              {selectedOrder.total_amount} ₽
            </span>
          </div>
        </div>

        {selectedOrder.status === "New" && (
          <button
            onClick={() => updateStatus("Preparing")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            Принять заказ
          </button>
        )}

        {selectedOrder.status === "Preparing" && (
          <button
            onClick={() => updateStatus("Ready")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            Заказ готов
          </button>
        )}

        {selectedOrder.status === "Ready" && (
          <button
            onClick={() => updateStatus("Closed")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            Отдать заказ
          </button>
        )}

      </div>
    );
  }

  // список заказов
  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Заказы
      </h1>

      {loading && (
        <div className="mb-4 text-gray-600">Загрузка заказов...</div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button
        onClick={() => setFilter("All")}
        className={
            filter === "All"
            ? "bg-blue-600 text-white px-4 py-2 rounded-lg"
            : "border px-4 py-2 rounded-lg"
        }
        >
        Все
        </button>

        <button
        onClick={() => setFilter("New")}
        className={
            filter === "New"
            ? "bg-blue-600 text-white px-4 py-2 rounded-lg"
            : "border px-4 py-2 rounded-lg"
        }
        >
        Новые
        </button>

        <button
        onClick={() => setFilter("Preparing")}
        className={
            filter === "Preparing"
            ? "bg-blue-600 text-white px-4 py-2 rounded-lg"
            : "border px-4 py-2 rounded-lg"
        }
        >
        Готовятся
        </button>

        <button
        onClick={() => setFilter("Ready")}
        className={
            filter === "Ready"
            ? "bg-blue-600 text-white px-4 py-2 rounded-lg"
            : "border px-4 py-2 rounded-lg"
        }
        >
        Готовые
        </button>

        <button
        onClick={() => setFilter("Closed")}
        className={
            filter === "Closed"
            ? "bg-blue-600 text-white px-4 py-2 rounded-lg"
            : "border px-4 py-2 rounded-lg"
        }
        >
        Закрытые
        </button>

      </div>

      {!loading && filteredOrders.length === 0 && (
        <div className="text-gray-500">Заказы не найдены.</div>
      )}

      <div className="space-y-4">

        {filteredOrders.map((order) => (

          <div
            key={order.id}
            onClick={() => setSelectedOrder(order)}
            className="border rounded-lg p-4 cursor-pointer"
          >

            <div className="flex justify-between mb-3">

              <div>

                <div className="flex items-center gap-2 mb-2">

                  <span className="font-bold">
                    {order.id}
                  </span>

                  <span className="text-sm text-gray-500">
                    {order.status}
                  </span>

                </div>

                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Clock size={16} />
                  {order.time}
                </div>

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
  );
}

export default EmployeeOrders;