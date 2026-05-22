export default function ShopSelector({ shops, onSelect }) {
  if (!shops || shops.length === 0) {
    return (
      <div className="glass-strong rounded-2xl p-8 max-w-md mx-auto">
        <p className="text-zinc-600 text-center">Кофейни не найдены</p>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-[#3d4d3d] mb-6 text-center">
        Выберите кофейню
      </h2>
      
      <div className="space-y-3">
        {shops.map((shop) => (
          <button
            key={shop.id}
            onClick={() => onSelect(shop)}
            className="w-full glass-panel rounded-xl p-4 text-left hover:bg-white/60 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#3d4d3d]">{shop.name}</p>
                <p className="text-sm text-zinc-500">{shop.address}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                shop.role === 'owner' 
                  ? 'bg-amber-100 text-amber-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {shop.role === 'owner' ? 'Владелец' : 'Сотрудник'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
