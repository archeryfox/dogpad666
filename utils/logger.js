import { createLogger, format, transports } from 'winston';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import crypto from 'crypto';
import zlib from 'zlib';

dotenv.config();

// URL сервера для загрузки лог-файлов
const LOG_SERVER_URL = process.env.LOG_SERVER_URL;

// Директория для хранения логов
const logDirectory = path.join('logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

// Функция для отправки лог-файлов на сервер
const sendLogFileToServer = async (logFilePath) => {
    const form = new FormData();
    form.append('logfile', fs.createReadStream(logFilePath));

    try {
        const response = await axios.post(LOG_SERVER_URL, form, {
            headers: form.getHeaders(),
        });
        console.log(`Лог-файл успешно отправлен на сервер: ${response.data}`);
    } catch (error) {
        console.error('Ошибка при отправке лог-файла на сервер:', error.message);
        if (error.response) {
            console.error('Детали ошибки:', error.response.data);
        }
    }
};

// Функция для генерации хэша файла
const generateFileHash = (filePath) => {
    const hash = crypto.createHash('sha256');
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('data', (chunk) => {
        hash.update(chunk);
    });
    return new Promise((resolve, reject) => {
        fileStream.on('end', () => {
            resolve(hash.digest('hex'));
        });
        fileStream.on('error', reject);
    });
};

// Функция для архивирования старых логов
const compressLogFile = (filePath) => {
    const fileStream = fs.createReadStream(filePath);
    const compressedStream = fs.createWriteStream(`${filePath}.gz`);
    const gzip = zlib.createGzip();
    fileStream.pipe(gzip).pipe(compressedStream);
};

// Создаём имя файла лога с текущей датой
const getLogFileName = () => {
    const currentDate = new Date();

    // Преобразуем время в Московское (UTC +3)
    const moscowOffset = 3 * 60; // Московское время - UTC+3 в минутах
    const moscowTime = new Date(currentDate.getTime() + moscowOffset * 60000); // Получаем время с учетом смещения

    // Форматируем дату в нужный формат YYYY-MM-DD
    const formattedDate = moscowTime.toISOString().split('T')[0];

    console.log(formattedDate); // Проверка времени
    return path.join(logDirectory, `app-${formattedDate}.log`);
};

// Настройка логгера для записи в файл с динамическим именем
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new transports.Console(), // Печать логов в консоль
        new transports.File({
            filename: getLogFileName(), // Динамическое имя файла лога
        }) // Запись в файл
    ]
});

const getLastLogFile = () => {
    const files = fs.readdirSync(logDirectory)
        .filter(file => file.startsWith('app-') && file.endsWith('.log'))
        .map(file => ({
            name: file,
            stats: fs.statSync(path.join(logDirectory, file))
        }))
        .sort((a, b) => b.stats.mtime - a.stats.mtime); // Сортировка по времени модификации

    return files.length > 0 ? path.join(logDirectory, files[0].name) : null;
};

// Пример функции для отправки лог-файла на сервер
export const sendLogFile = async () => {
    const lastLogFile = getLastLogFile();

    if (!lastLogFile) {
        console.error('Не найден файл для отправки');
        return;
    }

    // Сгенерировать хэш файла для аудита
    const fileHash = await generateFileHash(lastLogFile);

    // Архивируем лог-файл, если нужно
    compressLogFile(lastLogFile);

    // Формируем объект для аудита
    const auditLog = {
        date: Date.now(),
        name: lastLogFile,
        hash: fileHash,
    };

    // Сохранение информации в файл аудита
    const auditFilePath = path.join(logDirectory, `.e6832c70f68c05ded8581fa0ddde695fc63b61e3-audit.json`);
    let auditData = [];

    // Проверяем, существует ли файл аудита и корректен ли его формат
    if (fs.existsSync(auditFilePath)) {
        try {
            const fileContent = fs.readFileSync(auditFilePath, 'utf8');
            auditData = JSON.parse(fileContent);
            if (!Array.isArray(auditData)) {
                // Если данные не являются массивом, инициализируем его как пустой массив
                auditData = [];
            }
        } catch (error) {
            // Если произошла ошибка при чтении или парсинге файла, начинаем с пустого массива
            auditData = [];
            console.error('Ошибка при чтении файла аудита:', error.message);
        }
    }

    // Добавляем новый лог в данные аудита
    auditData.push(auditLog);

    // Ограничиваем количество записей в аудите
    if (auditData.length > 14) {
        auditData = auditData.slice(-14); // Оставляем только последние 14 записей
    }

    // Записываем обновленные данные в файл аудита
    fs.writeFileSync(auditFilePath, JSON.stringify({ auditLog: auditData }, null, 2));

    // Отправляем лог на сервер
    sendLogFileToServer(lastLogFile);
};


// Экспортируем logger для использования в других частях приложения
export default logger;
