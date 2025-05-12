import express from 'express';
import adaro from 'adaro';
import path from 'path';
import {fileURLToPath} from 'url';
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import methodOverride from "method-override";
import swaggerUI from "swagger-ui-express";
import swaggerDocument from './docs/swagger.json' assert {type: "json"};
import * as dotenv from 'dotenv';
import { register } from './metrics.js';
import logger from "./utils/logger.js";
import morgan from 'morgan'
import { exec } from 'child_process';
import {sendLogFile} from './utils/logger.js';
import { metricsMiddleware } from './middleware/metrics.js';
dotenv.config(); // Загружаем переменные окружения
import {sendDatabaseBackup} from './utils/backup.js';

export const app = express();
const port = 8081;

setInterval(sendLogFile, 60 * 60 * 10); // Отправка логов каждый час
logger.info("Логирование запущено")
sendLogFile()
sendDatabaseBackup()
// Middleware
setInterval(sendDatabaseBackup, 12 * 60 * 60 * 1000);  // Отправка резервной копии каждые 12 часов
app.use(cors({credentials: true, origin: true}));
app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(metricsMiddleware); // Добавляем middleware для метрик

const allowedOrigins = ['http://localhost:5173', 'http://localhost:8082', 'exp://localhost:8081', 'exp://192.168.1.2:8081'];  // укажите нужные домены
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // если нужно передавать куки или заголовки авторизации
}));
app.use(express.text()); // Добавьте это для парсинга текстовых данных
app.use(cookieParser());
app.use(session({secret: 'cool beans', resave: false, saveUninitialized: true}));
app.use(methodOverride());
app.use(express.static('public'));
app.use(morgan('combined', {stream: {write: (message) => logger.info(message.trim())}}));

// Swagger setup
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// Content Security Policy
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy",
        "default-src 'self'; connect-src 'self' http://localhost:8081");
    next();
});

// Resolve paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set Dust.js as the views engine
app.engine('dust', adaro.dust());
app.set('views engine', 'dust');
app.set('views', path.join(__dirname, 'views'));

app.get('/db', (req, res) => {
    res.render('prisma.dust')
})
const upload = multer({dest: 'uploads/'}); // Папка для временного хранения

// Добавьте маршрут для запуска Prisma Studio
app.get('/prisma', (req, res) => {
    const prismaStudioPort = 5555; // Порт для Prisma Studio

    // Запускаем Prisma Studio
    const studioProcess = exec(`npx prisma studio --port ${prismaStudioPort}`);

    studioProcess.stdout.on('data', (data) => {
        console.log(`Prisma Studio: ${data}`);
    });

    studioProcess.stderr.on('data', (error) => {
        console.error(`Prisma Studio Error: ${error}`);
    });

    // Перенаправляем пользователя в Prisma Studio
    res.redirect(`http://localhost:${prismaStudioPort}`);
});


app.post('/:entity/import-csv', upload.single('file'), async (req, res) => {
    try {
        const {entity} = req.params;
        if (!req.file) {
            return res.status(400).send('Файл не загружен');
        }

        const fileContent = fs.readFileSync(req.file.path, 'utf-8');

        // Вызываем сервис импорта
        if (entity === 'users') {
            await UserService.importUsersFromCSV(fileContent);
        } else {
            return res.status(400).send(`Импорт для ${entity} не поддерживается`);
        }
        // Вызываем сервис импорта
        if (entity === 'events') {
            await EventService.importEventsFromCSV(fileContent);
        } else {
            return res.status(400).send(`Импорт для ${entity} не поддерживается`);
        }

        // Удаляем временный файл
        fs.unlinkSync(req.file.path);
        res.status(200).send({message: 'Данные успешно импортированы из CSV'});
    } catch (error) {
        logger.error('Ошибка при импорте данных:', error);
        res.status(500).send('Ошибка при обработке файла');
    }
});

app.post('/:entity/import-sql', async (req, res) => {
    try {
        const {entity} = req.params;
        const {sqlData} = req.body;
        if (!sqlData) {
            return res.status(400).send('SQL данные не предоставлены');
        }

        if (entity === 'users') {
            await UserService.importUsersFromSQL(sqlData);
        } else if (entity === 'events') {
            await EventService.importEventsFromSQL(sqlData);
        } else {
            return res.status(400).send(`Импорт для ${entity} не поддерживается`);
        }

        res.status(200).send({message: 'SQL данные успешно импортированы'});
    } catch (error) {
        logger.error('Ошибка при импорте SQL данных:', error);
        res.status(500).send('Ошибка при обработке SQL данных');
    }
});

// Import routes
import categoriesRoutes from './domain/routes/categories.js';
import eventsRoutes from './domain/routes/events.js';
import rolesRoutes from './domain/routes/roles.js';
import speakersRoutes from './domain/routes/speakers.js';
import subscriptionsRoutes from './domain/routes/subscriptions.js';
import transactionsRoutes from './domain/routes/transactionz.js';
import usersRoutes from './domain/routes/users.js';
import venuesRoutes from './domain/routes/venues.js';
import authRoutes from "./domain/routes/auth.js";
import {authenticateToken} from "./utils/authMiddleware.js";
import roleChangeRequestRoutes from "./domain/routes/roleChangeRequestRoutes.js";
import UserService from "./domain/_services/userService.js";
import multer from "multer";
import fs from "fs";
import EventService from "./domain/_services/EventService.js";

app.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;  // Получаем id пользователя из токена
        const user = await UserService.getUserById(userId);  // Ищем пользователя в базе
        delete user.password
        if (!user) {
            return res.status(404).json({error: 'User not found'});
        }

        res.json(user);  // Отправляем данные о пользователе
    } catch (err) {
        res.status(500).json({error: 'Server error'});
    }
});

// Добавьте маршрут авторизации
app.use('/auth', authRoutes);

/** Setup routes */
app.use('/role-change-requests', roleChangeRequestRoutes); // Подключаем маршруты для запросов на смену роли
app.use('/categories', categoriesRoutes);
app.use('/events', eventsRoutes);
app.use('/roles', rolesRoutes);
app.use('/speakers', speakersRoutes);
app.use('/subscriptions', subscriptionsRoutes);
app.use('/transactions', transactionsRoutes);
app.use('/users', usersRoutes);
app.use('/venues', venuesRoutes);

// Эндпоинт для Prometheus
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Start the server
app.listen(port, () => {
    logger.info("Сервер запущен на порту 8081");
    console.log(`Listening on port ${port}...`);
});
