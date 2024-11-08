import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import * as dotenv from 'dotenv';
import logger from "./logger.js";
// TODO перенести на другой сервак запросы
dotenv.config();
// D:\WORK\kursTimeBunBackStage\prisma\timepad.db
const DB_PATH = process.env.DB_PATH || './prisma/timepad.db';  // Путь к основной БД
const BACKUP_DIR = process.env.BACKUP_DIR || './backups';   // Путь для хранения резервных копий

// Создаем папку для бэкапов, если не существует
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Функция для создания резервной копии
export const createBackup = () => {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupFileName = `backup-${timestamp}.db`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);

    fs.copyFile(DB_PATH, backupPath, (err) => {
        if (err) {
            logger.error(`Ошибка создания резервной копии: ${err}`)
            console.error('Ошибка создания резервной копии:', err);
        } else {
            logger.info(`Резервная копия создана: ${backupPath}`)
            console.log(`Резервная копия создана: ${backupPath}`);
        }
    });
};

// Функция для автоматического резервного копирования с интервалом
export const setupAutoBackup = (intervalInHours = 24) => {
    const interval = intervalInHours * 60 * 60 * 1000; // Интервал в миллисекундах
    setInterval(createBackup, interval);
    console.log(`Автоматическое резервное копирование установлено каждые ${intervalInHours} часов`);
};
