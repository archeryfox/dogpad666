import express from 'express';
import adaro from 'adaro';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import session from 'express-session';
import methodOverride from 'method-override';
import swaggerUI from 'swagger-ui-express';
import swaggerDocument from './docs/swagger.json' assert { type: 'json' };
import * as dotenv from 'dotenv';
import morgan from 'morgan';
import { exec } from 'child_process';
import fs from 'fs';
import multer from 'multer';

import { register } from './metrics.js';
import logger, { sendLogFile } from './utils/logger.js';
import { metricsMiddleware } from './middleware/metrics.js';
import { sendDatabaseBackup } from './utils/backup.js';

import categoriesRoutes from './domain/routes/categories.js';
import eventsRoutes from './domain/routes/events.js';
import rolesRoutes from './domain/routes/roles.js';
import speakersRoutes from './domain/routes/speakers.js';
import subscriptionsRoutes from './domain/routes/subscriptions.js';
import transactionsRoutes from './domain/routes/transactionz.js';
import usersRoutes from './domain/routes/users.js';
import venuesRoutes from './domain/routes/venues.js';
import authRoutes from './domain/routes/auth.js';
import roleChangeRequestRoutes from './domain/routes/roleChangeRequestRoutes.js';

import UserService from './domain/_services/userService.js';
import EventService from './domain/_services/EventService.js';
import { authenticateToken } from './utils/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;
const upload = multer({ dest: 'uploads/' });

setInterval(sendLogFile, 60 * 60 * 1000); // 1 час
setInterval(sendDatabaseBackup, 12 * 60 * 60 * 1000); // 12 часов
sendLogFile();
sendDatabaseBackup();

// Middlewares
app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.text());
app.use(cookieParser());
app.use(session({ secret: 'cool beans', resave: false, saveUninitialized: true }));
app.use(methodOverride());
app.use(express.static('public'));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(metricsMiddleware);

// Swagger
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// CSP
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; connect-src 'self' http://localhost:8081"
    );
    next();
});

// Paths and View Engine
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.engine('dust', adaro.dust());
app.set('views engine', 'dust');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/db', (req, res) => {
    res.render('prisma.dust');
});

app.get('/prisma', (req, res) => {
    const prismaStudioPort = 5555;
    const studioProcess = exec(`npx prisma studio --port ${prismaStudioPort}`);

    studioProcess.stdout.on('data', (data) => console.log(`Prisma Studio: ${data}`));
    studioProcess.stderr.on('data', (error) => console.error(`Prisma Studio Error: ${error}`));

    res.redirect(`http://localhost:${prismaStudioPort}`);
});

app.post('/:entity/import-csv', upload.single('file'), async (req, res) => {
    const { entity } = req.params;
    if (!req.file) {
        return res.status(400).send('Файл не загружен');
    }

    try {
        const fileContent = fs.readFileSync(req.file.path, 'utf-8');

        switch (entity) {
            case 'users':
                await UserService.importUsersFromCSV(fileContent);
                break;
            case 'events':
                await EventService.importEventsFromCSV(fileContent);
                break;
            default:
                fs.unlinkSync(req.file.path);
                return res.status(400).send(`Импорт для ${entity} не поддерживается`);
        }

        fs.unlinkSync(req.file.path);
        res.status(200).send({ message: 'Данные успешно импортированы из CSV' });
    } catch (error) {
        logger.error('Ошибка при импорте данных:', error);
        res.status(500).send('Ошибка при обработке файла');
    }
});

app.post('/:entity/import-sql', async (req, res) => {
    const { entity } = req.params;
    const { sqlData } = req.body;

    if (!sqlData) {
        return res.status(400).send('SQL данные не предоставлены');
    }

    try {
        switch (entity) {
            case 'users':
                await UserService.importUsersFromSQL(sqlData);
                break;
            case 'events':
                await EventService.importEventsFromSQL(sqlData);
                break;
            default:
                return res.status(400).send(`Импорт для ${entity} не поддерживается`);
        }

        res.status(200).send({ message: 'SQL данные успешно импортированы' });
    } catch (error) {
        logger.error('Ошибка при импорте SQL данных:', error);
        res.status(500).send('Ошибка при обработке SQL данных');
    }
});

app.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await UserService.getUserById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        delete user.password;
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Main routes
app.use('/auth', authRoutes);
app.use('/role-change-requests', roleChangeRequestRoutes);
app.use('/categories', categoriesRoutes);
app.use('/events', eventsRoutes);
app.use('/roles', rolesRoutes);
app.use('/speakers', speakersRoutes);
app.use('/subscriptions', subscriptionsRoutes);
app.use('/transactions', transactionsRoutes);
app.use('/users', usersRoutes);
app.use('/venues', venuesRoutes);

// Prometheus endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Start server
app.listen(PORT, () => {
    logger.info(`Сервер запущен на порту ${PORT}`);
    console.log(`Listening on port ${PORT}...`);
});
