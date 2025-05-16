// dogpad.backend/utils/backup.js
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';
import { prisma } from '../prisma/prisma.js';
import logger from './logger.js';

dotenv.config();

const execPromise = promisify(exec);

const apiClient = axios.create({
    baseURL: 'https://timapad666.onrender.com',
    headers: {
        'Accept-Encoding': 'gzip, deflate', // Отключаем Brotli
    },
});

const BACKUP_SERVER_URL = process.env.BACKUP_SERVER_URL || 'http://localhost:4000';
const DB_PATH = process.env.DB_PATH || './prisma/timepad.db';
const DATABASE_URL = process.env.DATABASE_URL;

// Парсинг DATABASE_URL для получения информации о подключении
const parseDbUrl = (url) => {
    try {
        const regex = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+):?(\d*)\/(.+)$/;
        const match = url.match(regex);
        
        if (!match) {
            throw new Error('Неверный формат URL базы данных');
        }
        
        return {
            user: match[1],
            password: match[2],
            host: match[3],
            port: match[4] || '5432',
            database: match[5].split('?')[0] // Убираем параметры запроса, если они есть
        };
    } catch (error) {
        logger.error('Ошибка при парсинге DATABASE_URL:', { error: error.message });
        return null;
    }
};

const getTimestampedFilename = (prefix = 'backup') => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Заменяем : и . на - для совместимости с файловой системой
    return `${prefix}_${timestamp}.sql`;
};

// Получение списка всех таблиц в базе данных через Prisma
const getAllTables = async () => {
    try {
        // Запрос к информационной схеме PostgreSQL для получения всех таблиц
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `;
        
        return tables.map(table => table.table_name);
    } catch (error) {
        logger.error('Ошибка при получении списка таблиц:', { error: error.message, stack: error.stack });
        return [];
    }
};

// Создание SQL дампа с помощью pg_dump
const createPgDump = async () => {
    try {
        const dbConfig = parseDbUrl(DATABASE_URL);
        if (!dbConfig) {
            throw new Error('Не удалось получить конфигурацию базы данных');
        }
        
        const backupDir = path.join(process.cwd(), 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        const backupFilePath = path.join(backupDir, getTimestampedFilename());
        
        // Создаем переменные окружения для pg_dump, чтобы не передавать пароль в командной строке
        const env = {
            ...process.env,
            PGPASSWORD: dbConfig.password
        };
        
        // Формируем команду pg_dump
        const command = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -F p -f "${backupFilePath}"`;
        
        logger.info('Запуск создания резервной копии базы данных...');
        await execPromise(command, { env });
        
        logger.info('Резервная копия базы данных успешно создана', { path: backupFilePath });
        return backupFilePath;
    } catch (error) {
        logger.error('Ошибка при создании резервной копии через pg_dump:', { 
            error: error.message, 
            stack: error.stack 
        });
        return null;
    }
};

// Создание SQL дампа с помощью Prisma
const createPrismaDump = async () => {
    try {
        const tables = await getAllTables();
        if (tables.length === 0) {
            throw new Error('Не удалось получить список таблиц');
        }
        
        const backupDir = path.join(process.cwd(), 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        const backupFilePath = path.join(backupDir, getTimestampedFilename());
        let sqlScript = `-- Резервная копия базы данных, создана: ${new Date().toISOString()}\n\n`;
        
        // Для каждой таблицы получаем данные и генерируем SQL-скрипты
        for (const tableName of tables) {
            logger.info(`Обработка таблицы: ${tableName}`);
            
            // Получаем структуру таблицы
            const tableStructure = await prisma.$queryRaw`
                SELECT column_name, data_type, character_maximum_length, is_nullable
                FROM information_schema.columns
                WHERE table_name = ${tableName}
                ORDER BY ordinal_position;
            `;
            
            // Получаем данные таблицы
            const tableData = await prisma.$queryRawUnsafe(`SELECT * FROM "${tableName}";`);
            
            // Добавляем комментарий для таблицы
            sqlScript += `-- Таблица: ${tableName}\n`;
            
            // Генерируем SQL для создания таблицы (если нужно пересоздать)
            sqlScript += `-- DROP TABLE IF EXISTS "${tableName}";\n\n`;
            
            // Генерируем SQL для вставки данных
            if (tableData.length > 0) {
                for (const row of tableData) {
                    const columns = Object.keys(row).filter(key => row[key] !== null);
                    const values = columns.map(col => {
                        const value = row[col];
                        if (value === null) return 'NULL';
                        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
                        if (value instanceof Date) return `'${value.toISOString()}'`;
                        return value;
                    });
                    
                    sqlScript += `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
                }
                sqlScript += '\n';
            }
        }
        
        // Записываем SQL-скрипт в файл
        fs.writeFileSync(backupFilePath, sqlScript, 'utf8');
        
        logger.info('Резервная копия базы данных успешно создана через Prisma', { path: backupFilePath });
        return backupFilePath;
    } catch (error) {
        logger.error('Ошибка при создании резервной копии через Prisma:', { 
            error: error.message, 
            stack: error.stack 
        });
        return null;
    }
};

export const sendDatabaseBackup = async () => {
    try {
        logger.info('Начало процесса резервного копирования базы данных...');
        
        // Сначала пробуем создать дамп через pg_dump
        let backupFilePath = await createPgDump();
        
        // Если pg_dump не сработал, используем Prisma
        if (!backupFilePath) {
            logger.info('pg_dump не удался, переключаемся на создание дампа через Prisma');
            backupFilePath = await createPrismaDump();
        }
        
        if (!backupFilePath) {
            throw new Error('Не удалось создать резервную копию базы данных');
        }
        
        // Отправляем резервную копию на сервер
        const form = new FormData();
        const timestampedFilename = path.basename(backupFilePath);
        
        form.append('database', fs.createReadStream(backupFilePath), timestampedFilename);
        
        logger.info('Отправка резервной копии на сервер...');
        const response = await apiClient.post(`${BACKUP_SERVER_URL}/upload-db`, form, {
            headers: form.getHeaders(),
        });
        
        logger.info('Резервная копия успешно отправлена на сервер', { 
            response: response.data,
            filename: timestampedFilename 
        });
        
        // Сохраняем только последние 5 резервных копий
        cleanupOldBackups();
        
        return { success: true, path: backupFilePath };
    } catch (error) {
        logger.error('Ошибка при создании или отправке резервной копии:', { 
            error: error.message, 
            stack: error.stack 
        });
        return { success: false, error: error.message };
    }
};

// Функция для очистки старых резервных копий (оставляем только 5 последних)
const cleanupOldBackups = () => {
    try {
        const backupDir = path.join(process.cwd(), 'backups');
        if (!fs.existsSync(backupDir)) return;
        
        const files = fs.readdirSync(backupDir)
            .filter(file => file.endsWith('.sql'))
            .map(file => ({
                name: file,
                path: path.join(backupDir, file),
                mtime: fs.statSync(path.join(backupDir, file)).mtime
            }))
            .sort((a, b) => b.mtime - a.mtime); // Сортировка по времени модификации (от новых к старым)
        
        // Удаляем все файлы, кроме 5 последних
        if (files.length > 5) {
            for (let i = 5; i < files.length; i++) {
                fs.unlinkSync(files[i].path);
                logger.info(`Удалена старая резервная копия: ${files[i].name}`);
            }
        }
    } catch (error) {
        logger.error('Ошибка при очистке старых резервных копий:', { 
            error: error.message, 
            stack: error.stack 
        });
    }
};
