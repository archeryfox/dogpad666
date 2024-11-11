import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const apiClient = axios.create({
    baseURL: 'https://timapad666.onrender.com',
    headers: {
        'Accept-Encoding': 'gzip, deflate', // Отключаем Brotli
    },
});


const BACKUP_SERVER_URL = process.env.BACKUP_SERVER_URL || 'http://localhost:4000';
const DB_PATH = process.env.DB_PATH || './prisma/timepad.db';

const getTimestampedFilename = (originalName) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Заменяем : и . на - для совместимости с файловой системой
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    return `${name}_${timestamp}${ext}`;
};

export const sendDatabaseBackup = async () => {
    const form = new FormData();
    const timestampedFilename = getTimestampedFilename(path.basename(DB_PATH));

    form.append('database', fs.createReadStream(DB_PATH), timestampedFilename);

    try {
        const response = await apiClient.post(`${BACKUP_SERVER_URL}/upload-db`, form, {
            headers: form.getHeaders(),
        });
        console.log('Резервная копия отправлена:', response.data);
    } catch (error) {
        console.error('Ошибка при отправке резервной копии:', error.message);
    }
};
