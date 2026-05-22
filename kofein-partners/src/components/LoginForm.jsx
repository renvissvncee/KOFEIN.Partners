import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function LoginForm({ onLogin }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [telegramId, setTelegramId] = useState(null);
  const [showDevIdInput, setShowDevIdInput] = useState(false);

  useEffect(() => {
    // Получаем telegramId из Telegram WebApp
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      setTelegramId(window.Telegram.WebApp.initDataUnsafe.user.id);
    } else {
      // Для разработки без Telegram - используем тестовый ID
      setTelegramId(123456789); // Владелец по умолчанию
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError('');

    try {
      const isTelegram = window.Telegram?.WebApp?.initData !== undefined;
      
      const body = { password };
      
      if (isTelegram) {
        body.initData = window.Telegram.WebApp.initData;
      } else {
        // Режим разработки: отправляем telegramId напрямую
        body.devTelegramId = telegramId;
      }

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await res.json();
      
      localStorage.setItem('authToken', data.token);
      
      // Если нет shops или только одна кофейня — сразу используем её
      if (!data.shops || data.shops.length === 1) {
        const shop = data.shops?.[0] || { id: data.coffeeShopId, role: data.role };
        if (shop) {
          localStorage.setItem('authRole', shop.role);
          localStorage.setItem('authCoffeeShopId', shop.id);
        }
        onLogin({ token: data.token, shops: data.shops || [], selectedShop: shop });
      } else {
        // Передаём shops для выбора
        onLogin({ token: data.token, shops: data.shops });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-strong rounded-2xl p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-[#3d4d3d] mb-6 text-center">
        Вход в систему
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Telegram ID - только для разработки */}
        {!window.Telegram?.WebApp?.initData && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-zinc-600">
                Telegram ID (для разработки)
              </label>
              <button
                type="button"
                onClick={() => setShowDevIdInput(!showDevIdInput)}
                className="text-xs text-matcha-dark hover:underline"
              >
                {showDevIdInput ? 'Скрыть' : 'Показать'}
              </button>
            </div>
            {showDevIdInput && (
              <input
                type="number"
                value={telegramId || ''}
                onChange={(e) => setTelegramId(parseInt(e.target.value, 10))}
                placeholder="123456789"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-matcha focus:ring-2 focus:ring-matcha/20 outline-none transition-all"
              />
            )}
            {!showDevIdInput && (
              <p className="text-sm text-zinc-400">
                ID: <span className="font-mono text-zinc-600">{telegramId}</span>
                {telegramId === 123456789 && ' (Владелец)'}
                {telegramId === 987654321 && ' (Сотрудник)'}
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-600 mb-2">
            Пароль
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-matcha focus:ring-2 focus:ring-matcha/20 outline-none transition-all"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !password.trim()}
          className="w-full btn-primary py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
