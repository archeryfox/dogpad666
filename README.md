# DogPad - Програмный комплекс для управления мероприятиями

Програмный комплекс «DogPad» предназначен для управления онлайн и оффлайн мероприятиями.

## Установка и настройка окружения

### 1. Установка Node.js

1. **Скачайте Node.js**
   - находится на носителе

2. **Установка Node.js**
   - Запустите скачанный установщик
   - Следуйте инструкциям мастера установки
   - Убедитесь, что опция "Add to PATH" включена

3. **Проверка установки**
   ```bash
   node --version
   npm --version
   ```

### 2. Установка Bun

1. **Установка Bun через PowerShell**
   ```bash
   powershell -c "iwr bun.sh/install.ps1 -useb | iex"
   ```
   или
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Проверка установки Bun**
   ```bash
   bun --version
   ```

## Запуск компонентов програмного комплекса

### 1. Бэкенд (dogpad.backend)

1. **Установка зависимостей**
   ```bash
   cd dogpad.backend
   bun install
   ```

2. **Настройка окружения**
   - Создайте файл `.env` в директории `dogpad.backend`
   - Добавьте следующие переменные окружения:
     ```
     PORT=8081
     DATABASE_URL=postgresql://user:7gYo80XlNOItaCltAWrqRuv2KXQcw50o@dpg-d0gu79h5pdvs73amc670-a.frankfurt-postgres.render.com/dogpad_g6a4
     JWT_SECRET=123
     JWT_EXPIRES_IN=1d
     ```

3. **Генерация Prisma клиента**
   ```bash
   npx prisma generate
   ```

4. **Запуск бэкенда**
   ```bash
   bun run start
   ```
   или
   ```bash
   node app.js
   ```

   Сервер будет доступен по адресу http://localhost:8081

### 2. Веб-клиент (dogpad.web)

1. **Установка зависимостей**
   ```bash
   cd dogpad.web
   bun install
   ```

2. **Настройка окружения**
   - Создайте файл `.env` в директории `dogpad.web`
   - Добавьте следующие переменные окружения:
     ```
     # Для локальной разработки
     VITE_API_URL=http://localhost:8081
     
     # Для использования публичного бэкенда
     # VITE_API_URL=https://timapad666.onrender.com
     ```

3. **Запуск веб-клиента**
   ```bash
   bun run dev
   ```

   Приложение будет доступно по адресу http://localhost:5173

### 3. Мобильное приложение (dogpad.mobile)

1. **Установка Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

2. **Установка зависимостей**
   ```bash
   cd dogpad.mobile
   bun install
   ```

3. **Настройка окружения**
   - Создайте файл `.env` в директории `dogpad.mobile`
   - Добавьте следующие переменные окружения:
     ```
     # Для локальной разработки
     API_URL=http://localhost:8081
     
     # Для использования публичного бэкенда
     # API_URL=https://timapad666.onrender.com
     ```

4. **Запуск в режиме разработки**
   ```bash
   bun run start
   ```

5. **Сборка APK (опционально)**
   ```bash
   npx expo start 
   ```
   - Установите [Expo Go](https://expo.dev/client) на мобильное устройство для тестирования

### 4. Сервис резервного копирования (dogpad-saver)

1. **Установка зависимостей**
   ```bash
   cd dogpad-saver
   bun install
   ```

2. **Настройка окружения**
   - Создайте файл `.env` в директории `dogpad-saver`
   - Добавьте необходимые переменные окружения:
     ```
     PORT=8083
     DATABASE_URL=postgresql://user:7gYo80XlNOItaCltAWrqRuv2KXQcw50o@dpg-d0gu79h5pdvs73amc670-a.frankfurt-postgres.render.com/dogpad_g6a4
     BACKUP_DIR=./backups
     ```

3. **Запуск сервиса резервного копирования**
   ```bash
   bun run start
   ```
   или
   ```bash
   node app.js
   ```

   Сервис будет доступен по адресу http://localhost:8083

## Публичные деплои

Програмный комплекс также доступен в публичном развертывании:

1. **Фронтенд (веб-интерфейс)**: [https://dogpad.onrender.com/](https://dogpad.onrender.com/)
2. **Бэкенд (API)**: [https://timapad666.onrender.com/](https://timapad666.onrender.com/)

Для подключения к публичному бэкенду необходимо указать соответствующий URL в `.env` файлах компонентов:

- Для веб-клиента: `VITE_API_URL=https://timapad666.onrender.com`
- Для мобильного приложения: `API_URL=https://timapad666.onrender.com`

## Подключение к базе данных PostgreSQL

### Через командную строку

```bash
PGPASSWORD=7gYo80XlNOItaCltAWrqRuv2KXQcw50o psql -h dpg-d0gu79h5pdvs73amc670-a.frankfurt-postgres.render.com -U user dogpad_g6a4
```

### Через pgAdmin

1. **Установка pgAdmin**
   - Скачайте и установите [pgAdmin](https://www.pgadmin.org/download/)
   - Запустите pgAdmin

2. **Добавление нового сервера**
   - Нажмите правой кнопкой на "Servers" в браузере объектов
   - Выберите "Create" > "Server..."
   - На вкладке "General" введите имя соединения (например, "DogPad DB")
   - На вкладке "Connection" введите:
     - Host: dpg-d0gu79h5pdvs73amc670-a.frankfurt-postgres.render.com
     - Port: 5432
     - Maintenance database: dogpad_g6a4
     - Username: user
     - Password: 7gYo80XlNOItaCltAWrqRuv2KXQcw50o
   - Нажмите "Save"

3. **Строка подключения**
   ```
   postgresql://user:7gYo80XlNOItaCltAWrqRuv2KXQcw50o@dpg-d0gu79h5pdvs73amc670-a.frankfurt-postgres.render.com/dogpad_g6a4
   ```

## Проверка работоспособности

1. **Бэкенд**
   - Локальный: http://localhost:8081/api/health
   - Публичный: https://timapad666.onrender.com/api/health
   - Должно отобразиться сообщение о статусе сервера

2. **Веб-клиент**
   - Локальный: http://localhost:5173
   - Публичный: https://dogpad.onrender.com/
   - Должна загрузиться главная страница приложения(авторизация)

3. **Мобильное приложение**
   - Отсканируйте QR-код в терминале с помощью приложения Expo Go
   - Приложение должно запуститься на вашем мобильном устройстве

4. **Сервис резервного копирования**
   - Откройте в браузере: http://localhost:8083/health
   - Должно отобразиться сообщение о статусе сервиса

## Возможные проблемы и их решение

1. **Ошибка подключения к базе данных**
   - Проверьте правильность строки подключения DATABASE_URL
   - Убедитесь, что IP вашего компьютера добавлен в белый список на сервере базы данных

2. **Ошибка при запуске бэкенда**
   - Проверьте, что порт 8081 не занят другим приложением
   - Убедитесь, что все зависимости установлены: `bun install`

3. **Ошибка при запуске веб-клиента**
   - Проверьте, что порт 5173 не занят другим приложением
   - Убедитесь, что переменная VITE_API_URL указывает на работающий бэкенд

4. **Ошибка при запуске мобильного приложения**
   - Убедитесь, что Expo CLI установлен глобально
   - Проверьте, что мобильное устройство и компьютер находятся в одной сети
