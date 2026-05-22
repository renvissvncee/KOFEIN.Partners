import { useState, useEffect } from "react";
import { User, Crown, Sun, Leaf } from "lucide-react";

import EmployeeOrders from "./components/EmployeeOrders";
import OwnerPanel from "./components/OwnerPanel";
import LoginForm from "./components/LoginForm";
import ShopSelector from "./components/ShopSelector";

const DEFAULT_COFFEE_SHOP_ID = import.meta.env.VITE_COFFEE_SHOP_ID ?? "fcdea897-826f-4bf8-8e9c-82d4a9e96aea";

function App() {
  const [mode, setMode] = useState("employee");
  const [isLoaded, setIsLoaded] = useState(false);
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    setIsLoaded(true);
    
    // Check for existing token on load
    const token = localStorage.getItem('authToken');
    const coffeeShopId = localStorage.getItem('authCoffeeShopId');
    const role = localStorage.getItem('authRole');
    
    if (token && coffeeShopId && role) {
      // Simple client-side expiry check (JWT payload)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp > now) {
          // Восстанавливаем selectedShop
          setAuth({ 
            token, 
            shops: [{ id: coffeeShopId, role }], 
            selectedShop: { id: coffeeShopId, role }
          });
        } else {
          localStorage.clear();
        }
      } catch {
        localStorage.clear();
      }
    }
  }, []);

  const handleLogin = (data) => {
    if (data.selectedShop) {
      // Одна кофейня, сразу используем её
      setAuth({ token: data.token, shops: data.shops, selectedShop: data.selectedShop });
    } else if (data.shops && data.shops.length > 1) {
      // Несколько кофеень, нужно выбрать
      setAuth({ token: data.token, shops: data.shops });
    } else if (data.shops && data.shops.length === 1) {
      // Одна кофейня
      const shop = data.shops[0];
      setAuth({ token: data.token, shops: data.shops, selectedShop: shop });
    }
  };

  const handleShopSelect = (shop) => {
    localStorage.setItem('authRole', shop.role);
    localStorage.setItem('authCoffeeShopId', shop.id);
    setAuth({ token: auth.token, shops: auth.shops, selectedShop: shop });
  };

  const handleLogout = () => {
    localStorage.clear();
    setAuth(null);
  };

  if (!auth) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <LoginForm onLogin={handleLogin} />
      </div>
    );
  }

  // Показываем выбор кофейни если ещё не выбрана и есть несколько кофеень
  if (auth.shops && auth.shops.length > 1 && !auth.selectedShop) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <ShopSelector shops={auth.shops} onSelect={handleShopSelect} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Soft ambient orbs — matte, almost invisible */}
      <div className="ambient-orb ambient-orb--primary" />
      <div className="ambient-orb ambient-orb--secondary" />
      <div className="ambient-orb ambient-orb--accent" />
      
      {/* Floating header — soft, matte, not glass-heavy */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="glass-strong rounded-2xl px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Logo — soft, organic */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-matcha to-matcha-dark flex items-center justify-center shadow">
                    <Leaf size={20} className="text-white/95" />
                  </div>
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-[#3d4d3d] tracking-tight">
                    КОФЕИН
                    <span className="text-matcha-dark">.ПАРТНЕРЫ</span>
                  </h1>
                </div>
              </div>

              {/* Controls — soft, minimal */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Role switcher — soft segmented */}
                <div className="glass-panel rounded-xl p-1">
                  <button
                    onClick={() => setMode("employee")}
                    className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all ${
                      mode === "employee"
                        ? "btn-primary"
                        : "text-zinc-500 hover:text-[#4a5a4a] hover:bg-white/40"
                    }`}
                  >
                    <User size={16} />
                    <span className="hidden sm:inline text-sm">Сотрудник</span>
                  </button>
                  {auth.selectedShop?.role === 'owner' && (
                    <button
                      onClick={() => setMode("owner")}
                      className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all ${
                        mode === "owner"
                          ? "btn-primary"
                          : "text-zinc-500 hover:text-[#4a5a4a] hover:bg-white/40"
                      }`}
                    >
                      <Crown size={16} />
                      <span className="hidden sm:inline text-sm">Владелец</span>
                    </button>
                  )}
                </div>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:text-[#4a5a4a] hover:bg-white/40 transition-all"
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content — more breathing room */}
      <main className="relative z-10 pt-48 sm:pt-36 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Auth info placeholder */}
          <div className="glass-strong rounded-2xl p-6 text-center mb-6">
            <p className="text-zinc-600">
              Вы вошли как <span className="font-semibold text-matcha-dark">{auth.selectedShop?.role}</span>
              {auth.selectedShop && (
                <span className="text-zinc-400 ml-2">
                  • {auth.selectedShop.name}
                </span>
              )}
            </p>
          </div>

          {mode === "employee" && (
            <EmployeeOrders coffeeShopId={auth.selectedShop?.id || DEFAULT_COFFEE_SHOP_ID} />
          )}
          {mode === "owner" && (
            <OwnerPanel coffeeShopId={auth.selectedShop?.id || DEFAULT_COFFEE_SHOP_ID} />
          )}
        </div>
      </main>

      {/* Footer — soft, minimal */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="glass-panel rounded-xl px-4 py-2.5">
            <p className="text-center text-xs text-zinc-500">
              КОФЕИН.ПАРТНЕРЫ <span className="text-zinc-400">•</span> Matcha Glass
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;