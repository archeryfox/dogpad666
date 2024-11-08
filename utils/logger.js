import { createLogger, format, transports } from 'winston';
import path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';

// Определяем директорию для логов
const logDirectory = path.join('logs');
// TODO перенести на другой сервак запросы
// Конфигурация логгера
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new transports.Console(),
        new DailyRotateFile({
            dirname: logDirectory,                 // Папка для логов
            filename: 'app-%DATE%.log',            // Шаблон имени файла с датой
            datePattern: 'YYYY-MM-DD',             // Форматирование даты
            zippedArchive: true,                   // Сжатие старых логов
            maxSize: '20m',                        // Максимальный размер одного файла
            maxFiles: '14d'                        // Хранить файлы логов не более 14 дней
        })
    ]
});

export default logger;
