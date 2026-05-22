# Kofein Partners

Платформа для управления кофейнями: заказы, меню, сотрудники.

## Структура проекта

- `backend/` - серверная часть (Express + PostgreSQL)
- `kofein-partners/` - фронтенд (React + Vite)

## Требования

- Node.js 18+
- PostgreSQL 14+

## Запуск проекта

### 1. База данных

Создайте базу данных и выполните миграции:

```bash
psql -U postgres -c "CREATE DATABASE kofein;"
psql -U postgres -d kofein -f schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Отредактируйте .env: укажите DATABASE_URL и JWT_SECRET
npm install
npm run dev
```

Сервер запустится на http://localhost:3001

### 3. Frontend

```bash
cd kofein-partners
npm install
npm run dev
```

Приложение откроется в браузере (обычно http://localhost:5173)

## Учётные записи для тестирования

### Владелец кофейни

- **Telegram ID**: 123456789
- **Пароль**: owner123
- **Доступы**: кофейня "Central Park"

### Сотрудник

- **Telegram ID**: 987654321
- **Пароль**: staff123
- **Доступы**: только заказы

### Тестовые данные в БД

```sql
-- Пользователи
INSERT INTO users (telegram_id, phone, password_hash) VALUES
  (123456789, '+79001234567', '$2b$10$...'), -- owner123
  (987654321, '+79007654321', '$2b$10$...'); -- staff123

-- Кофейня
INSERT INTO coffee_shops (id, name, address, owners, staff) VALUES
  ('fcdea897-826f-4bf8-8e9c-82d4a9e96aea', 'Central Park', 'ул. Ленина 1', ARRAY[123456789], ARRAY[987654321]);
```

## API Endpoints

### Аутентификация

#### POST /api/auth/login

Логин пользователя.

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "devTelegramId": 123456789,
    "password": "owner123"
  }'
```

Ответ:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "shops": [
    {
      "id": "fcdea897-826f-4bf8-8e9c-82d4a9e96aea",
      "name": "Central Park",
      "address": "ул. Ленина 1"
    }
  ]
}
```

#### GET /api/auth/me

Получить данные текущего пользователя (требуется токен).

```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Заказы

#### GET /orders

Список заказов.

```bash
# Все заказы
curl http://localhost:3001/orders

# Заказы конкретной кофейни
curl "http://localhost:3001/orders?coffee_shop_id=fcdea897-826f-4bf8-8e9c-82d4a9e96aea"

# Заказы со статусом
curl "http://localhost:3001/orders?status=New"
```

#### PUT /orders/:id/status

Обновить статус заказа.

```bash
curl -X PUT http://localhost:3001/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Preparing"}'
```

Статусы: `New`, `Preparing`, `Ready`, `Closed`

### Меню

#### GET /menu

Получить меню кофейни.

```bash
curl "http://localhost:3001/menu?coffee_shop_id=fcdea897-826f-4bf8-8e9c-82d4a9e96aea"
```

#### POST /menu

Добавить товар.

```bash
curl -X POST http://localhost:3001/menu \
  -H "Content-Type: application/json" \
  -d '{
    "coffee_shop_id": "fcdea897-826f-4bf8-8e9c-82d4a9e96aea",
    "name": "Капучино",
    "description": "200 мл",
    "price": 250,
    "available": true
  }'
```

#### PUT /menu/:id

Обновить товар.

```bash
curl -X PUT http://localhost:3001/menu/ITEM_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Капучино Большой",
    "price": 300,
    "available": true
  }'
```

#### DELETE /menu/:id

Удалить товар.

```bash
curl -X DELETE http://localhost:3001/menu/ITEM_ID
```

### Кофейни

#### GET /coffee-shops/:id

Получить информацию о кофейне.

```bash
curl http://localhost:3001/coffee-shops/fcdea897-826f-4bf8-8e9c-82d4a9e96aea
```

#### PUT /coffee-shops/:id

Обновить кофейню.

```bash
curl -X PUT http://localhost:3001/coffee-shops/COFFEE_SHOP_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Central Park Updated",
    "address": "ул. Ленина 1, корпус 2"
  }'
```

### Сотрудники

#### GET /coffee-shops/:id/staff

Список сотрудников кофейни.

```bash
curl http://localhost:3001/coffee-shops/COFFEE_SHOP_ID/staff
```

#### POST /coffee-shops/:id/staff

Добавить сотрудника.

```bash
curl -X POST http://localhost:3001/coffee-shops/COFFEE_SHOP_ID/staff \
  -H "Content-Type: application/json" \
  -d '{"telegramId": 555666777}'
```

#### DELETE /coffee-shops/:id/staff/:telegramId

Удалить сотрудника.

```bash
curl -X DELETE http://localhost:3001/coffee-shops/COFFEE_SHOP_ID/staff/TELEGRAM_ID
```

## Тестирование

### Запуск тестов

```bash
cd backend
npm test
```

### Покрытие тестами

Текущее покрытие: **70.61%**

Подробная информация в `backend/README_TESTS.md`

## Переменные окружения

### backend/.env

```env
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/kofein
JWT_SECRET=your-secret-key-change-this
NODE_ENV=development
```

## Зависимости

### Backend

- express - веб-фреймворк
- pg - работа с PostgreSQL
- jsonwebtoken - JWT аутентификация
- bcryptjs - хеширование паролей
- cors - CORS заголовки
- dotenv - переменные окружения

### Frontend

- React
- Vite
- axios - HTTP запросы
