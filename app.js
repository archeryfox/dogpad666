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
import logger from "./utils/logger.js";
import morgan from 'morgan'
dotenv.config(); // Загружаем переменные окружения
import { sendDatabaseBackup } from './utils/backup.js';
import { sendLogFile } from './utils/logger.js';

export const app = express();
const port = 8081;

setInterval(sendLogFile, 60 * 60 * 10); // Отправка логов каждый час
logger.info("Логирование запущено")
sendLogFile()
sendDatabaseBackup()
// Middleware
setInterval(sendDatabaseBackup, 12 * 60 * 60 * 1000);  // Отправка резервной копии каждые 12 часов
app.use(cors({credentials: true, origin: true}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({secret: 'cool beans', resave: false, saveUninitialized: true}));
app.use(methodOverride());
app.use(express.static('public'));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

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

// Set Dust.js as the view engine
app.engine('dust', adaro.dust());
app.set('view engine', 'dust');
app.set('views', path.join(__dirname, 'views'));

// Import routes
import categoriesRoutes from './domain/routes/categories.js';
import eventsRoutes from './domain/routes/events.js';
import rolesRoutes from './domain/routes/roles.js';
import speakersRoutes from './domain/routes/speakers.js';
import subscriptionsRoutes from './domain/routes/subscriptions.js';
import transactionsRoutes from './domain/routes/transactionz.js';
import usersRoutes from './domain/routes/users.js';
import venuesRoutes from './domain/routes/venues.js';
// D:\WORK\kursTimeBunBackStage\app.js
import authRoutes from "./domain/routes/auth.js";
import {authenticateToken} from "./utils/authMiddleware.js";

app.get('/profile', authenticateToken, (req, res) => {
    res.json({ message: 'Welcome to your profile', user: req.user });
});

// Добавьте маршрут авторизации
app.use('/auth', authRoutes);

// Setup routes
app.use('/categories', categoriesRoutes);
app.use('/events', eventsRoutes);
app.use('/roles', rolesRoutes);
app.use('/speakers', speakersRoutes);
app.use('/subscriptions', subscriptionsRoutes);
app.use('/transactions', transactionsRoutes);
app.use('/users', usersRoutes);
app.use('/venues', venuesRoutes);

// Start the server
app.listen(port, () => {
    logger.info("Сервер запущен на порту 8081");
    console.log(`Listening on port ${port}...`);
});
