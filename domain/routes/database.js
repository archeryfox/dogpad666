// dogpad.backend/domain/routes/database.js
// D:\WORK\dogpad\dogpad.backend\domain\routes\database.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { asyncErrorHandler } from '../../middleware/errorHandler.js';
import logger from '../../utils/logger.js';
import { sendDatabaseBackup } from '../../utils/backup.js';

const router = express.Router();

/**
 * @route GET /database/backup
 * @desc Создает резервную копию базы данных и отправляет ее клиенту
 * @access Private
 */
router.get('/backup', asyncErrorHandler(async (req, res) => {
    logger.info('Запрос на создание резервной копии базы данных');
    
    // Создаем резервную копию базы данных
    const result = await sendDatabaseBackup();
    
    if (!result.success) {
        logger.error('Не удалось создать резервную копию базы данных', { error: result.error });
        return res.status(500).json({ 
            error: 'Не удалось создать резервную копию базы данных',
            details: result.error
        });
    }
    
    // Проверяем, существует ли файл резервной копии
    if (!fs.existsSync(result.path)) {
        logger.error('Файл резервной копии не найден', { path: result.path });
        return res.status(404).json({ error: 'Файл резервной копии не найден' });
    }
    
    // Отправляем файл клиенту
    const filename = path.basename(result.path);
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    const fileStream = fs.createReadStream(result.path);
    fileStream.pipe(res);
    
    logger.info('Резервная копия базы данных успешно отправлена клиенту', { filename });
}));

export default router;
